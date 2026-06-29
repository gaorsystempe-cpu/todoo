import React, { useState, useEffect } from "react";
import { OdooConnection, OdooCompany } from "../types";
import { Key, Database, Globe, User, CheckCircle2, AlertTriangle, Play, RefreshCw, Layers } from "lucide-react";
import { motion } from "motion/react";

interface OdooConnectionFormProps {
  connection: OdooConnection;
  onChangeConnection: (conn: OdooConnection) => void;
  onDataLoaded: (
    products: any[],
    orders: any[],
    orderLines: any[],
    expiryAlerts?: any[],
    posReports?: any[],
    posSessions?: any[],
    posTransactions?: any[],
    users?: any[]
  ) => void;
}

export default function OdooConnectionForm({
  connection,
  onChangeConnection,
  onDataLoaded
}: OdooConnectionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<OdooCompany[]>([]);
  const [formValues, setFormValues] = useState({
    url: connection.url || "",
    db: connection.db || "",
    username: connection.username || "",
    password: connection.password || ""
  });

  // Keep form fields synced with saved credentials from localStorage
  useEffect(() => {
    setFormValues({
      url: connection.url || "",
      db: connection.db || "",
      username: connection.username || "",
      password: connection.password || ""
    });
  }, [connection.url, connection.db, connection.username, connection.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value
    });
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Format URL automatically to have https:// if protocol is missing
    let targetUrl = formValues.url.trim();
    if (targetUrl && targetUrl !== "demo" && !targetUrl.includes("example.com") && !/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    const payload = {
      ...formValues,
      url: targetUrl
    };

    try {
      let data: any = null;
      let response: Response;
      const maxAttempts = 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        response = await fetch("/api/odoo/authenticate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        data = await response.json();

        // If the backend was booting up or warming up, retry after a short delay
        if (!data.success && data.message && (data.message.includes("espere un momento") || data.message.includes("inicie completamente"))) {
          if (attempt < maxAttempts) {
            console.log(`[Odoo Connection] Servidor backend en preparación. Reintentando en 2s (Intento ${attempt}/${maxAttempts})...`);
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
        }
        break;
      }

      if (data && data.success) {
        setCompanies(data.companies);
        onChangeConnection({
          ...connection,
          url: targetUrl,
          db: formValues.db,
          username: formValues.username,
          password: formValues.password,
          uid: data.uid,
          isConnected: false, // Wait until company is selected
          isDemoMode: false
        });
        if (data.companies.length > 0) {
          // Auto select first company if none is set
          handleSelectCompany(data.companies[0].id, data.companies[0].name, data.uid, formValues.password, targetUrl);
        }
      } else {
        setError(data?.message || "Error al conectar con Odoo. Revise las credenciales.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "No se pudo comunicar con el servidor Express o el servidor Odoo está inaccesible.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompany = async (companyId: number, companyName: string, activeUid?: number, activePassword?: string, activeUrl?: string) => {
    setLoading(true);
    setError(null);
    const pwd = activePassword || connection.password || "";
    const uid = activeUid || connection.uid;
    const targetUrl = activeUrl || connection.url || formValues.url;

    try {
      let data: any = null;
      let response: Response;
      const maxAttempts = 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        response = await fetch("/api/odoo/fetch-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: targetUrl,
            db: connection.db || formValues.db,
            username: connection.username || formValues.username,
            password: pwd,
            uid: uid,
            companyId: companyId,
            companyName: companyName
          })
        });

        data = await response.json();

        // If the backend was booting up or warming up, retry after a short delay
        if (!data.success && data.message && (data.message.includes("espere un momento") || data.message.includes("inicie completamente"))) {
          if (attempt < maxAttempts) {
            console.log(`[Odoo Fetch] Servidor backend en preparación. Reintentando en 2s (Intento ${attempt}/${maxAttempts})...`);
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
        }
        break;
      }

      if (data && data.success) {
        onChangeConnection({
          ...connection,
          url: targetUrl,
          db: connection.db || formValues.db,
          username: connection.username || formValues.username,
          password: pwd,
          uid: uid,
          companyId,
          companyName,
          isConnected: true,
          isDemoMode: false
        });
        onDataLoaded(
          data.products,
          data.orders,
          data.orderLines,
          data.expiryAlerts,
          data.posReports,
          data.posSessions,
          data.posTransactions,
          data.users
        );
      } else {
        setError(data?.message || `No se pudieron cargar datos para la empresa ${companyName}.`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al descargar productos y pedidos desde Odoo.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateDemoMode = () => {
    onChangeConnection({
      ...connection,
      isDemoMode: true,
      isConnected: false,
      companyName: "Corporación Tecnológica del Perú S.A.C.",
      companyId: 1
    });
    setError(null);
  };

  const isStaticDeploy = typeof window !== "undefined" && 
                         !window.location.hostname.includes("localhost") && 
                         !window.location.hostname.includes("127.0.0.1") && 
                         !window.location.hostname.includes("run.app") &&
                         !window.location.hostname.includes("google.com") &&
                         !window.location.hostname.includes("aistudio");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 id="connection-title" className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600" />
            Configuración de Conexión todoo ERP
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Conéctese a su servidor todoo mediante XML-RPC o pruebe el simulador con datos pre-cargados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleActivateDemoMode}
            className={`px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              connection.isDemoMode
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
            }`}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Activar Modo Demo / Pruebas
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <form onSubmit={handleConnect} className="lg:col-span-7 space-y-4">
          {isStaticDeploy && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800 text-xs flex gap-3 leading-relaxed mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Servidor estático (Vercel) detectado</p>
                <p className="mt-0.5">
                  Las solicitudes de conexión se redireccionarán automáticamente a través de su servidor seguro de <strong>Google Cloud Run</strong> para evitar el bloqueo de CORS del navegador. Esto le permitirá conectar su servidor real sin inconvenientes.
                </p>
              </div>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
            <h3 className="text-sm font-medium text-slate-700 mb-1">Información de Multicompañía</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              La conexión autenticará con su servidor todoo y le permitirá elegir la compañía en la que desea registrar las ventas de los empleados y liquidar comisiones de productos específicos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">URL del Servidor todoo *</label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  name="url"
                  required
                  value={formValues.url}
                  onChange={handleInputChange}
                  placeholder="https://su-todoo.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Base de Datos (DB) *</label>
              <div className="relative">
                <Database className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="db"
                  required
                  value={formValues.db}
                  onChange={handleInputChange}
                  placeholder="nombre_db"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email / Usuario *</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  required
                  value={formValues.username}
                  onChange={handleInputChange}
                  placeholder="usuario@dominio.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Contraseña o API Key *</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formValues.password}
                  onChange={handleInputChange}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-150 rounded-lg text-xs text-red-600 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 hover:bg-emerald-700 bg-emerald-600 border border-emerald-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all font-sans cursor-pointer flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {loading ? "Conectando..." : "Conectar API todoo"}
            </button>
          </div>
        </form>

        <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8 pt-6 lg:pt-0">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-3">
              <Layers className="h-4 w-4" />
              Especial Multicompañía todoo
            </h3>
            {companies.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Hemos listado exitosamente las compañías de su todoo ERP. Seleccione cuál se consultará para reporte de ventas y comisiones:
                </p>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {companies.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => handleSelectCompany(comp.id, comp.name)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                        connection.companyId === comp.id && !connection.isDemoMode
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="truncate">{comp.name}</span>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                        ID: {comp.id}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <Database className="h-10 w-10 text-slate-400 mb-3" />
                <h4 className="text-xs font-medium text-slate-600 mb-1">Sin Conexión Activa</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-[220px]">
                  Ingrese las credenciales de su todoo a la izquierda y presione conectar para listar sus empresas disponibles.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <h4 className="text-xs font-medium text-emerald-800 mb-1 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Estado Actual de Conexión
            </h4>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Origen de Datos:</span>
                <span className={`font-semibold ${connection.isDemoMode ? "text-amber-600" : "text-emerald-600"}`}>
                  {connection.isDemoMode ? "Modo Demo Activo" : connection.isConnected ? "todoo Real Conectado" : "Desconectado"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Empresa Seleccionada:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                  {connection.companyName || "Ninguna"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
