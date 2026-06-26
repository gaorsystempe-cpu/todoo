import { IncomingMessage, ServerResponse } from "http";
import * as xmlrpcModule from "xmlrpc";

const xmlrpc: any = (xmlrpcModule as any).default || xmlrpcModule;

// Helper function to parse JSON body from incoming Node.js request
async function getRequestBody(req: any): Promise<any> {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (e) {}
  }
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk: any) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Promisified XML-RPC call helper
function makeXmlRpcCall(url: string, path: string, method: string, params: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      let baseUrl = url.trim();
      if (!/^https?:\/\//i.test(baseUrl)) {
        baseUrl = "https://" + baseUrl;
      }
      if (baseUrl.endsWith("/")) {
        baseUrl = baseUrl.slice(0, -1);
      }

      let cleanPath = path;
      if (!cleanPath.startsWith("/")) {
        cleanPath = "/" + cleanPath;
      }

      const fullTargetUrl = `${baseUrl}${cleanPath}`;
      const isHttps = fullTargetUrl.startsWith("https://");

      console.log(`[Odoo Proxy XML-RPC] Creando cliente para: ${fullTargetUrl}`);

      const createClient = isHttps ? xmlrpc.createSecureClient : xmlrpc.createClient;
      if (typeof createClient !== "function") {
        throw new Error(`xmlrpc.createSecureClient/createClient no es una función. Tipo de xmlrpc detectado: ${typeof xmlrpc}.`);
      }

      const client = createClient({
        url: fullTargetUrl,
        rejectUnauthorized: false
      } as any);

      console.log("Tipo de cliente xmlrpc:", typeof client, Object.keys(client || {}));

      if (!client || typeof client.methodCall !== "function") {
        throw new Error("El cliente XML-RPC no se pudo inicializar correctamente o no contiene la función methodCall.");
      }

      client.methodCall(method, params, (err: any, value: any) => {
        if (err) {
          console.error(`[Odoo Proxy XML-RPC Method Error] ${method}:`, err);
          return reject(err);
        }
        resolve(value);
      });
    } catch (err: any) {
      reject(err);
    }
  });
}

// Vercel Serverless Function entrypoint
export default async function handler(req: any, res: any) {
  // Set CORS headers so it can be called from Vercel static frontends securely
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Método no permitido. Use POST para consultas al proxy de Odoo."
    });
  }

  try {
    const body = await getRequestBody(req);
    const { url, db, username, password, method, model, args, kwargs, path, params, uid } = body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "La URL del servidor Odoo es obligatoria."
      });
    }

    // A. Handle direct low-level XML-RPC routing
    if (path && method && params) {
      console.log(`[Odoo Proxy XML-RPC] Ruta directa - Path: ${path}, Method: ${method}`);
      const result = await Promise.race([
        makeXmlRpcCall(url, path, method, params),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout en la conexión con Odoo (30s).")), 30000))
      ]);
      return res.status(200).json({ success: true, result });
    }

    // B. Handle high-level authenticate flow
    if (method === "authenticate") {
      if (!db || !username || !password) {
        return res.status(400).json({
          success: false,
          message: "Los parámetros db, username y password son obligatorios para la autenticación."
        });
      }

      console.log(`[Odoo Proxy Auth] Intentando autenticar DB: ${db}, Usuario: ${username} en Odoo: ${url}`);
      
      const resolvedUid = await Promise.race([
        makeXmlRpcCall(url, "/xmlrpc/2/common", "authenticate", [db, username, password, {}]),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout de autenticación (30s).")), 30000))
      ]);

      if (!resolvedUid) {
        return res.status(401).json({
          success: false,
          message: "Credenciales de Odoo incorrectas o base de datos no encontrada."
        });
      }

      console.log(`[Odoo Proxy Auth] Éxito. UID: ${resolvedUid}. Obteniendo compañías...`);

      // Automatically fetch companies list to match front-end expectancies
      let companies: any[] = [];
      try {
        const result = await makeXmlRpcCall(url, "/xmlrpc/2/object", "execute_kw", [
          db,
          resolvedUid,
          password,
          "res.company",
          "search_read",
          [[]],
          { fields: ["id", "name"] }
        ]);
        if (Array.isArray(result)) {
          companies = result;
        } else {
          companies = [{ id: 1, name: "Compañía Principal (Odoo)" }];
        }
      } catch (cErr: any) {
        console.warn("[Odoo Proxy] Falló la obtención de compañías, usando valor por defecto:", cErr.message || cErr);
        companies = [{ id: 1, name: "Compañía Principal (Auto-detectada)" }];
      }

      return res.status(200).json({
        success: true,
        uid: resolvedUid,
        companies
      });
    }

    // C. Handle high-level execute_kw object query flow
    if (method && model) {
      if (!db || !password) {
        return res.status(400).json({
          success: false,
          message: "La base de datos (db) y la contraseña son requeridas para ejecutar consultas."
        });
      }

      let resolvedUid = uid;
      if (!resolvedUid && username) {
        // Authenticate on-the-fly if uid is missing
        try {
          resolvedUid = await makeXmlRpcCall(url, "/xmlrpc/2/common", "authenticate", [db, username, password, {}]);
        } catch (authErr: any) {
          return res.status(401).json({
            success: false,
            message: `Autenticación automática falló en el proxy: ${authErr.message || authErr}`
          });
        }
      }

      if (!resolvedUid) {
        return res.status(401).json({
          success: false,
          message: "Se requiere un UID de Odoo válido o credenciales de usuario para ejecutar esta llamada."
        });
      }

      console.log(`[Odoo Proxy Execute] Modelo: ${model}, Método: ${method}, UID: ${resolvedUid}`);

      const result = await Promise.race([
        makeXmlRpcCall(url, "/xmlrpc/2/object", "execute_kw", [
          db,
          resolvedUid,
          password,
          model,
          method,
          args || [],
          kwargs || {}
        ]),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout en la ejecución de la consulta (30s).")), 30000))
      ]);

      return res.status(200).json({
        success: true,
        result
      });
    }

    return res.status(400).json({
      success: false,
      message: "Formato de petición inválido. Especifique 'path', 'method' y 'params' o use el flujo de alto nivel de Odoo."
    });

  } catch (error: any) {
    console.error("[Odoo Proxy Global Error]:", error);
    let errMsg = error.message || String(error);
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      errMsg = `No se pudo conectar al servidor Odoo (${error.code}). Verifique que la URL '${req.body?.url}' sea correcta y accesible públicamente.`;
    }
    return res.status(500).json({
      success: false,
      message: errMsg
    });
  }
}
