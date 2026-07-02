// Client-side API simulation fallback for static hosting environments (like Vercel)
// This intercepts any failed or unavailable /api/* requests and processes them in localStorage.

const DEFAULT_USERS = [
  { username: "demo@gaorsystem.pe", password: "demo", name: "Demo User", role: "user" },
  { username: "soporte@facturaclic.pe", password: "Luis2021.", name: "Luis Soporte", role: "admin" }
];

const DEFAULT_RULES = [
  { productId: 101, type: "percentage", value: 3 },
  { productId: 102, type: "percentage", value: 4 },
  { productId: 103, type: "flat", value: 5 },
  { productId: 105, type: "percentage", value: 5 },
  { productId: 108, type: "flat", value: 10 }
];

const DEFAULT_PRODUCTS = [
  { id: 101, display_name: "[FARM001] Paracetamol 500mg (Caja x 100)", default_code: "FARM001", list_price: 1250.00 },
  { id: 102, display_name: "[FARM002] Amoxicilina 500mg (Caja x 100)", default_code: "FARM002", list_price: 480.00 },
  { id: 103, display_name: "[FARM003] Ibuprofeno 400mg (Caja x 100)", default_code: "FARM003", list_price: 85.00 },
  { id: 104, display_name: "[FARM004] Alcohol Antiséptico 70° 1L", default_code: "FARM004", list_price: 45.00 },
  { id: 105, display_name: "[FARM005] Multivitamínico Supradyn x 30", default_code: "FARM005", list_price: 2500.00 },
  { id: 106, display_name: "[FARM006] Mascarillas Quirúrgicas Celeste x 50", default_code: "FARM006", list_price: 150.00 },
  { id: 107, display_name: "[FARM007] Omeprazol 20mg (Caja x 30)", default_code: "FARM007", list_price: 220.00 },
  { id: 108, display_name: "[FARM008] Loratadina 10mg (Caja x 100)", default_code: "FARM008", list_price: 180.00 },
  { id: 109, display_name: "[FARM009] Vitamina C Redoxon Efervescente", default_code: "FARM009", list_price: 120.00 }
];

const DEFAULT_ORDERS = [
  { id: 501, name: "SO001", date_order: "2026-06-01 10:15:30", user_id: [111, "Carlos Mendoza"], amount_total: 2980.00 },
  { id: 502, name: "SO002", date_order: "2026-06-02 11:30:22", user_id: [112, "Sofía Altamirano"], amount_total: 5120.00 },
  { id: 503, name: "SO003", date_order: "2026-06-03 14:45:10", user_id: [113, "Lucas Rivas"], amount_total: 1395.00 },
  { id: 504, name: "SO004", date_order: "2026-06-04 09:05:45", user_id: [114, "Daniela Vargas"], amount_total: 2650.00 },
  { id: 505, name: "SO005", date_order: "2026-06-05 16:20:00", user_id: [111, "Carlos Mendoza"], amount_total: 415.00 },
  { id: 506, name: "SO006", date_order: "2026-06-08 11:10:05", user_id: [112, "Sofía Altamirano"], amount_total: 3670.00 },
  { id: 507, name: "SO007", date_order: "2026-06-10 15:35:12", user_id: [113, "Lucas Rivas"], amount_total: 2500.00 },
  { id: 508, name: "SO008", date_order: "2026-06-12 10:00:25", user_id: [114, "Daniela Vargas"], amount_total: 490.00 },
  { id: 509, name: "SO009", date_order: "2026-06-15 12:40:19", user_id: [111, "Carlos Mendoza"], amount_total: 1515.00 },
  { id: 510, name: "SO011", date_order: "2026-06-18 14:15:00", user_id: [112, "Sofía Altamirano"], amount_total: 5410.00 },
  { id: 511, name: "SO012", date_order: "2026-06-20 09:20:45", user_id: [113, "Lucas Rivas"], amount_total: 1620.00 },
  { id: 512, name: "SO013", date_order: "2026-06-21 16:50:30", user_id: [114, "Daniela Vargas"], amount_total: 7500.00 }
];

const DEFAULT_ORDER_LINES = [
  { id: 2001, order_id: [501, "SO001"], product_id: [101, "Paracetamol 500mg (Caja x 100)"], product_uom_qty: 2, price_unit: 1250.00, price_subtotal: 2500.00 },
  { id: 2002, order_id: [501, "SO001"], product_id: [102, "Amoxicilina 500mg (Caja x 100)"], product_uom_qty: 1, price_unit: 480.00, price_subtotal: 480.00 },
  { id: 2003, order_id: [502, "SO002"], product_id: [101, "Paracetamol 500mg (Caja x 100)"], product_uom_qty: 3, price_unit: 1250.00, price_subtotal: 3750.00 },
  { id: 2004, order_id: [502, "SO002"], product_id: [102, "Amoxicilina 500mg (Caja x 100)"], product_uom_qty: 2, price_unit: 480.00, price_subtotal: 960.00 },
  { id: 2005, order_id: [502, "SO002"], product_id: [103, "Ibuprofeno 400mg (Caja x 100)"], product_uom_qty: 3, price_unit: 85.00, price_subtotal: 255.00 },
  { id: 2006, order_id: [502, "SO002"], product_id: [104, "Alcohol Antiséptico 70° 1L"], product_uom_qty: 3, price_unit: 45.00, price_subtotal: 155.00 },
  { id: 2007, order_id: [503, "SO003"], product_id: [102, "Amoxicilina 500mg (Caja x 100)"], product_uom_qty: 2, price_unit: 480.00, price_subtotal: 960.00 },
  { id: 2008, order_id: [503, "SO003"], product_id: [103, "Ibuprofeno 400mg (Caja x 100)"], product_uom_qty: 3, price_unit: 85.00, price_subtotal: 255.00 },
  { id: 2009, order_id: [503, "SO003"], product_id: [108, "Loratadina 10mg (Caja x 100)"], product_uom_qty: 1, price_unit: 180.00, price_subtotal: 180.00 },
  { id: 2010, order_id: [504, "SO004"], product_id: [101, "Paracetamol 500mg (Caja x 100)"], product_uom_qty: 2, price_unit: 1250.00, price_subtotal: 2500.00 },
  { id: 2011, order_id: [504, "SO004"], product_id: [106, "Mascarillas Quirúrgicas Celeste x 50"], product_uom_qty: 1, price_unit: 150.00, price_subtotal: 150.00 },
  { id: 2012, order_id: [505, "SO005"], product_id: [103, "Ibuprofeno 400mg (Caja x 100)"], product_uom_qty: 2, price_unit: 85.00, price_subtotal: 170.00 },
  { id: 2013, order_id: [505, "SO005"], product_id: [104, "Alcohol Antiséptico 70° 1L"], product_uom_qty: 3, price_unit: 45.00, price_subtotal: 135.00 },
  { id: 2014, order_id: [505, "SO005"], product_id: [109, "Vitamina C Redoxon Efervescente"], product_uom_qty: 1, price_unit: 110.00, price_subtotal: 110.00 },
  { id: 2015, order_id: [506, "SO006"], product_id: [101, "Paracetamol 500mg (Caja x 100)"], product_uom_qty: 2, price_unit: 1250.00, price_subtotal: 2500.00 },
  { id: 2016, order_id: [506, "SO006"], product_id: [102, "Amoxicilina 500mg (Caja x 100)"], product_uom_qty: 2, price_unit: 480.00, price_subtotal: 960.00 },
  { id: 2017, order_id: [506, "SO006"], product_id: [107, "Omeprazol 20mg (Caja x 30)"], product_uom_qty: 1, price_unit: 210.00, price_subtotal: 210.00 },
  { id: 2018, order_id: [507, "SO007"], product_id: [105, "Multivitamínico Supradyn x 30"], product_uom_qty: 1, price_unit: 2500.00, price_subtotal: 2500.00 },
  { id: 2019, order_id: [508, "SO008"], product_id: [107, "Omeprazol 20mg (Caja x 30)"], product_uom_qty: 2, price_unit: 220.00, price_subtotal: 440.00 },
  { id: 2020, order_id: [508, "SO008"], product_id: [106, "Mascarillas Quirúrgicas Celeste x 50"], product_uom_qty: 1, price_unit: 50.00, price_subtotal: 50.00 },
  { id: 2021, order_id: [509, "SO009"], product_id: [101, "Paracetamol 500mg (Caja x 100)"], product_uom_qty: 1, price_unit: 1250.00, price_subtotal: 1250.00 },
  { id: 2022, order_id: [509, "SO009"], product_id: [107, "Omeprazol 20mg (Caja x 30)"], product_uom_qty: 1, price_unit: 220.00, price_subtotal: 220.00 },
  { id: 2023, order_id: [509, "SO009"], product_id: [104, "Alcohol Antiséptico 70° 1L"], product_uom_qty: 1, price_unit: 45.00, price_subtotal: 45.00 },
  { id: 2024, order_id: [510, "SO011"], product_id: [105, "Multivitamínico Supradyn x 30"], product_uom_qty: 2, price_unit: 2500.00, price_subtotal: 5000.00 },
  { id: 2025, order_id: [510, "SO011"], product_id: [108, "Loratadina 10mg (Caja x 100)"], product_uom_qty: 2, price_unit: 180.00, price_subtotal: 360.00 },
  { id: 2026, order_id: [510, "SO011"], product_id: [106, "Mascarillas Quirúrgicas Celeste x 50"], product_uom_qty: 1, price_unit: 50.00, price_subtotal: 50.00 },
  { id: 2027, order_id: [511, "SO012"], product_id: [101, "Paracetamol 500mg (Caja x 100)"], product_uom_qty: 1, price_unit: 1250.00, price_subtotal: 1250.00 },
  { id: 2028, order_id: [511, "SO012"], product_id: [102, "Amoxicilina 500mg (Caja x 100)"], product_uom_qty: 1, price_unit: 370.00, price_subtotal: 370.00 },
  { id: 2029, order_id: [512, "SO013"], product_id: [105, "Multivitamínico Supradyn x 30"], product_uom_qty: 3, price_unit: 2500.00, price_subtotal: 7500.00 }
];

const DEFAULT_EXPIRY_ALERTS = [
  { id: 1, productName: "Paracetamol 500mg (Caja x 100)", defaultCode: "FARM001", lotNumber: "LOTE-LP-2026A", expiryDate: "2026-06-15", daysRemaining: -7, stockQty: 3, location: "Almacén Principal A-12", status: "expired" },
  { id: 2, productName: "Amoxicilina 500mg (Caja x 100)", defaultCode: "FARM002", lotNumber: "LOTE-MN-34Y2", expiryDate: "2026-07-15", daysRemaining: 23, stockQty: 8, location: "Almacén de Exhibición", status: "soon" },
  { id: 3, productName: "Ibuprofeno 400mg (Caja x 100)", defaultCode: "FARM003", lotNumber: "LOTE-KB-BLUE8", expiryDate: "2026-07-02", daysRemaining: 10, stockQty: 25, location: "Estante Pasadizo 4", status: "soon" },
  { id: 4, productName: "Alcohol Antiséptico 70° 1L", defaultCode: "FARM004", lotNumber: "LOTE-MS-SIL03", expiryDate: "2026-07-20", daysRemaining: 28, stockQty: 40, location: "Caja de Reserva B", status: "soon" },
  { id: 5, productName: "Omeprazol 20mg (Caja x 30)", defaultCode: "FARM007", lotNumber: "LOTE-AUD-NC09", expiryDate: "2026-07-05", daysRemaining: 13, stockQty: 15, location: "Almacén Principal A-15", status: "soon" },
  { id: 6, productName: "Loratadina 10mg (Caja x 100)", defaultCode: "FARM008", lotNumber: "LOTE-SSD-2TBX", expiryDate: "2026-09-12", daysRemaining: 82, stockQty: 12, location: "Estante Seguridad", status: "ok" },
  { id: 7, productName: "Vitamina C Redoxon Efervescente", defaultCode: "FARM009", lotNumber: "LOTE-CAM-4KPRO", expiryDate: "2026-10-30", daysRemaining: 130, stockQty: 20, location: "Almacén Principal B-2", status: "ok" }
];

const DEFAULT_POS_REPORTS = [
  {
    date: "2026-06-22",
    totalSales: 4520.00,
    payments: [
      { method: "Efectivo", amount: 1200.00 },
      { method: "Yape / Plin", amount: 1850.00 },
      { method: "Tarjeta de Crédito/Débito", amount: 1470.00 }
    ],
    products: [
      { id: 101, name: "Paracetamol 500mg (Caja x 100)", code: "FARM001", qty: 2, amount: 2500.00 },
      { id: 102, name: "Amoxicilina 500mg (Caja x 100)", code: "FARM002", qty: 3, amount: 1440.00 },
      { id: 103, name: "Ibuprofeno 400mg (Caja x 100)", code: "FARM003", qty: 5, amount: 425.00 },
      { id: 104, name: "Alcohol Antiséptico 70° 1L", code: "FARM004", qty: 3, amount: 135.00 },
      { id: 106, name: "Mascarillas Quirúrgicas Celeste x 50", code: "FARM006", qty: 1, amount: 20.00 }
    ],
    documents: [
      { type: "Boleta de Venta Electrónica", count: 12, amount: 1820.00 },
      { type: "Factura Electrónica", count: 4, amount: 2700.00 }
    ]
  },
  {
    date: "2026-06-21",
    totalSales: 3870.00,
    payments: [
      { method: "Efectivo", amount: 850.00 },
      { method: "Yape / Plin", amount: 1420.00 },
      { method: "Tarjeta de Crédito/Débito", amount: 1600.00 }
    ],
    products: [
      { id: 102, name: "Amoxicilina 500mg (Caja x 100)", code: "FARM002", qty: 4, amount: 1920.00 },
      { id: 107, name: "Omeprazol 20mg (Caja x 30)", code: "FARM007", qty: 5, amount: 1100.00 },
      { id: 103, name: "Ibuprofeno 400mg (Caja x 100)", code: "FARM003", qty: 10, amount: 850.00 }
    ],
    documents: [
      { type: "Boleta de Venta Electrónica", count: 18, amount: 1250.00 },
      { type: "Factura Electrónica", count: 3, amount: 2620.00 }
    ]
  },
  {
    date: "2026-06-20",
    totalSales: 5410.00,
    payments: [
      { method: "Efectivo", amount: 1510.00 },
      { method: "Yape / Plin", amount: 1900.00 },
      { method: "Tarjeta de Crédito/Débito", amount: 2000.00 }
    ],
    products: [
      { id: 105, name: "Multivitamínico Supradyn x 30", code: "FARM005", qty: 2, amount: 5000.00 },
      { id: 108, name: "Loratadina 10mg (Caja x 100)", code: "FARM008", qty: 2, amount: 360.00 },
      { id: 106, name: "Mascarillas Quirúrgicas Celeste x 50", code: "FARM006", qty: 1, amount: 50.00 }
    ],
    documents: [
      { type: "Boleta de Venta Electrónica", count: 8, amount: 410.00 },
      { type: "Factura Electrónica", count: 2, amount: 5000.00 }
    ]
  }
];

const DEFAULT_POS_SESSIONS = [
  { id: 1, name: "POS/2026/06/22-01", cashier: "Ana Ramos (Turno Mañana)", openingDate: "2026-06-22 08:00:00", closingDate: "2026-06-22 14:00:00", openingBalance: 200.00, closedAmount: 2620.00, totalRevenue: 2420.00, state: "Cerrado" },
  { id: 2, name: "POS/2026/06/22-02", cashier: "Pedro Solano (Turno Tarde)", openingDate: "2026-06-22 14:00:00", closingDate: "2026-06-22 21:00:00", openingBalance: 200.00, closedAmount: 2300.00, totalRevenue: 2100.00, state: "Cerrado" },
  { id: 3, name: "POS/2026/06/21-01", cashier: "Ana Ramos (Turno Mañana)", openingDate: "2026-06-21 08:00:00", closingDate: "2026-06-21 14:00:00", openingBalance: 150.00, closedAmount: 1950.00, totalRevenue: 1800.00, state: "Cerrado" },
  { id: 4, name: "POS/2026/06/21-02", cashier: "Pedro Solano (Turno Tarde)", openingDate: "2026-06-21 14:00:00", closingDate: "2026-06-21 21:00:00", openingBalance: 150.00, closedAmount: 2220.00, totalRevenue: 2070.00, state: "Cerrado" },
  { id: 5, name: "POS/2026/06/23-01", cashier: "Elena Castro (Turno Mañana)", openingDate: "2026-06-23 08:00:00", closingDate: "N/A", openingBalance: 200.00, closedAmount: 0.00, totalRevenue: 1450.00, state: "Abierto" }
];

const DEFAULT_POS_TRANSACTIONS = [
  { id: 8001, sessionName: "POS/2026/06/22-01", invoiceName: "B001-000452", client: "Carlos Villacorta Prado", date: "2026-06-22 09:15:22", productName: "Paracetamol 500mg (Caja x 100)", qty: 1, priceUnit: 1250.00, subtotal: 1250.00, paymentMethod: "Yape / Plin" },
  { id: 8002, sessionName: "POS/2026/06/22-01", invoiceName: "B001-000453", client: "María de la Cruz Rojas", date: "2026-06-22 10:24:05", productName: "Ibuprofeno 400mg (Caja x 100)", qty: 2, priceUnit: 85.00, subtotal: 170.00, paymentMethod: "Efectivo" },
  { id: 8003, sessionName: "POS/2026/06/22-01", invoiceName: "F001-000189", client: "Inversiones San José S.A.C.", date: "2026-06-22 11:42:18", productName: "Amoxicilina 500mg (Caja x 100)", qty: 2, priceUnit: 480.00, subtotal: 960.00, paymentMethod: "Tarjeta de Crédito/Débito" },
  { id: 8004, sessionName: "POS/2026/06/22-01", invoiceName: "B001-000454", client: "José Luis Neyra", date: "2026-06-22 13:10:50", productName: "Alcohol Antiséptico 70° 1L", qty: 1, priceUnit: 40.00, subtotal: 40.00, paymentMethod: "Yape / Plin" },
  { id: 8005, sessionName: "POS/2026/06/22-02", invoiceName: "B001-000455", client: "Alejandra Gómez Reyna", date: "2026-06-22 15:05:11", productName: "Paracetamol 500mg (Caja x 100)", qty: 1, priceUnit: 1250.00, subtotal: 1250.00, paymentMethod: "Tarjeta de Crédito/Débito" },
  { id: 8006, sessionName: "POS/2026/06/22-02", invoiceName: "B001-000456", client: "Piero Alarcón Sifuentes", date: "2026-06-22 16:40:55", productName: "Amoxicilina 500mg (Caja x 100)", qty: 1, priceUnit: 480.00, subtotal: 480.00, paymentMethod: "Yape / Plin" },
  { id: 8007, sessionName: "POS/2026/06/22-02", invoiceName: "B001-000457", client: "Clientes Varios", date: "2026-06-22 18:20:30", productName: "Ibuprofeno 400mg (Caja x 100)", qty: 3, priceUnit: 85.00, subtotal: 255.00, paymentMethod: "Efectivo" },
  { id: 8008, sessionName: "POS/2026/06/22-02", invoiceName: "B001-000458", client: "Raúl Benavente", date: "2026-06-22 19:45:12", productName: "Alcohol Antiséptico 70° 1L", qty: 2, priceUnit: 45.00, subtotal: 90.00, paymentMethod: "Efectivo" },
  { id: 8009, sessionName: "POS/2026/06/22-02", invoiceName: "B001-000459", client: "Clientes Varios", date: "2026-06-22 20:30:11", productName: "Mascarillas Quirúrgicas Celeste x 50", qty: 1, priceUnit: 25.00, subtotal: 25.00, paymentMethod: "Yape / Plin" },
  { id: 8010, sessionName: "POS/2026/06/21-01", invoiceName: "B001-000430", client: "Diana Cáceres Wong", date: "2026-06-21 09:40:22", productName: "Amoxicilina 500mg (Caja x 100)", qty: 2, priceUnit: 480.00, subtotal: 960.00, paymentMethod: "Yape / Plin" },
  { id: 8011, sessionName: "POS/2026/06/21-01", invoiceName: "B001-000431", client: "Marcos Sandoval Ruiz", date: "2026-06-21 11:15:10", productName: "Omeprazol 20mg (Caja x 30)", qty: 3, priceUnit: 220.00, subtotal: 660.00, paymentMethod: "Tarjeta de Crédito/Débito" },
  { id: 8012, sessionName: "POS/2026/06/21-01", invoiceName: "B001-000432", client: "Clientes Varios", date: "2026-06-21 13:20:00", productName: "Ibuprofeno 400mg (Caja x 100)", qty: 2, priceUnit: 85.00, subtotal: 170.00, paymentMethod: "Efectivo" }
];

const LOCAL_STORAGE_KEY = "local_portal_db_data";

function getLocalDB() {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("[API Mock] Error parsing localStorage database, resetting to default.", e);
    }
  }

  const initial = {
    users: [...DEFAULT_USERS],
    rules: [...DEFAULT_RULES],
    products: [...DEFAULT_PRODUCTS],
    orders: [...DEFAULT_ORDERS],
    orderLines: [...DEFAULT_ORDER_LINES],
    expiryAlerts: [...DEFAULT_EXPIRY_ALERTS],
    posReports: [...DEFAULT_POS_REPORTS],
    posSessions: [...DEFAULT_POS_SESSIONS],
    posTransactions: [...DEFAULT_POS_TRANSACTIONS]
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveLocalDB(db: any) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
}

// --- CLIENT-SIDE ODOO XML-RPC CLIENT FOR STATIC / FALLBACK ENVIRONMENTS ---
function valueToXml(val: any): string {
  if (val === null || val === undefined) {
    return "<value><nil/></value>";
  }
  if (typeof val === "boolean") {
    return `<value><boolean>${val ? 1 : 0}</boolean></value>`;
  }
  if (typeof val === "number") {
    if (Number.isInteger(val)) {
      return `<value><int>${val}</int></value>`;
    } else {
      return `<value><double>${val}</double></value>`;
    }
  }
  if (typeof val === "string") {
    const escaped = val
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
    return `<value><string>${escaped}</string></value>`;
  }
  if (Array.isArray(val)) {
    const items = val.map(valueToXml).join("");
    return `<value><array><data>${items}</data></array></value>`;
  }
  if (typeof val === "object") {
    const members = Object.entries(val)
      .map(([k, v]) => `<member><name>${k}</name>${valueToXml(v)}</member>`)
      .join("");
    return `<value><struct>${members}</struct></value>`;
  }
  return `<value><string>${String(val)}</string></value>`;
}

function buildXmlRpcPayload(methodName: string, params: any[]): string {
  const paramsXml = params.map(p => `<param>${valueToXml(p)}</param>`).join("");
  return `<?xml version="1.0"?><methodCall><methodName>${methodName}</methodName><params>${paramsXml}</params></methodCall>`;
}

function parseXmlRpcValue(node: Node): any {
  const valueNode = (node.nodeType === 1 && (node as Element).tagName === "value" 
    ? node 
    : (node as Element).querySelector("value")) as Element | null;
    
  if (!valueNode) return null;
  
  const child = valueNode.firstElementChild;
  if (!child) {
    return valueNode.textContent || "";
  }
  
  const type = child.tagName;
  if (type === "string" || type === "name") {
    return child.textContent || "";
  }
  if (type === "int" || type === "i4") {
    return parseInt(child.textContent || "0", 10);
  }
  if (type === "double") {
    return parseFloat(child.textContent || "0");
  }
  if (type === "boolean") {
    return child.textContent?.trim() === "1" || child.textContent?.trim().toLowerCase() === "true";
  }
  if (type === "nil") {
    return null;
  }
  if (type === "array") {
    const dataNode = child.querySelector("data");
    if (!dataNode) return [];
    const values: any[] = [];
    for (let i = 0; i < dataNode.children.length; i++) {
      values.push(parseXmlRpcValue(dataNode.children[i]));
    }
    return values;
  }
  if (type === "struct") {
    const obj: any = {};
    const members = child.querySelectorAll("member");
    members.forEach(member => {
      const nameNode = member.querySelector("name");
      const valNode = member.querySelector("value");
      if (nameNode && valNode) {
        const name = nameNode.textContent?.trim() || "";
        obj[name] = parseXmlRpcValue(valNode);
      }
    });
    return obj;
  }
  return child.textContent || "";
}

function parseXmlRpcResponse(xmlString: string): any {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");
  
  const fault = doc.querySelector("fault");
  if (fault) {
    const faultValue = parseXmlRpcValue(fault);
    const faultCode = faultValue?.faultCode || "Unknown";
    const faultString = faultValue?.faultString || xmlString;
    throw new Error(`XML-RPC fault [${faultCode}]: ${faultString}`);
  }
  
  const param = doc.querySelector("param");
  if (!param) return null;
  return parseXmlRpcValue(param);
}

async function executeClientSideOdooCall(
  odooUrl: string,
  path: string,
  method: string,
  params: any[],
  companyId?: number
): Promise<any> {
  console.log(`[API Mock Client-Side Proxy] Enviando XML-RPC a través del proxy propio /api/odoo-proxy (Company: ${companyId || "Ninguna"})...`);
  try {
    const response = await originalFetch("/api/odoo-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: odooUrl,
        path: path,
        method: method,
        params: params,
        companyId: companyId
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || `Error del proxy de Odoo (HTTP ${response.status})`);
    }

    return data.result;
  } catch (err: any) {
    console.error(`[API Mock Client-Side Proxy] Error en llamada proxy:`, err.message || err);
    throw new Error(`Error de conexión con Odoo (CORS/Red): ${err.message || err}`);
  }
}
// -------------------------------------------------------------------------

// Handler for all simulated API requests
async function handleMockRequest(urlStr: string, init?: RequestInit): Promise<Response> {
  const url = new URL(urlStr, window.location.origin);
  const pathname = url.pathname;
  const method = init?.method?.toUpperCase() || "GET";
  
  const db = getLocalDB();

  // Helper to respond with JSON
  const jsonResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  };

  // Helper to parse JSON body
  const getBody = () => {
    try {
      return init?.body ? JSON.parse(init.body as string) : {};
    } catch (e) {
      return {};
    }
  };

  console.log(`[API Mock Simulating] ${method} ${pathname}`);

  // 1. LOGIN
  if (pathname === "/api/portal/login" && method === "POST") {
    const { username, password } = getBody();
    if (!username || !password) {
      return jsonResponse({ success: false, message: "Usuario y contraseña requeridos." }, 400);
    }

    const matchedUser = db.users.find((u: any) => {
      if (!u || typeof u.username !== "string") return false;
      const dbUser = u.username.toLowerCase().trim();
      const dbPass = u.password !== undefined && u.password !== null ? String(u.password).trim() : "";
      return dbUser === username.toLowerCase().trim() && dbPass === String(password).trim();
    });

    if (matchedUser) {
      return jsonResponse({
        success: true,
        user: {
          username: matchedUser.username,
          name: matchedUser.name,
          role: matchedUser.role,
          odoo_partner_id: matchedUser.odoo_partner_id
        }
      });
    }

    // Default fallback
    if (username.toLowerCase().trim() === "soporte@facturaclic.pe" && password === "Luis2021.") {
      return jsonResponse({
        success: true,
        user: {
          username: "soporte@facturaclic.pe",
          name: "Luis Soporte (Admin)",
          role: "admin"
        }
      });
    }

    if (username.toLowerCase().trim() === "demo@gaorsystem.pe" && password === "demo") {
      return jsonResponse({
        success: true,
        user: {
          username: "demo@gaorsystem.pe",
          name: "Demo User (Pruebas)",
          role: "user"
        }
      });
    }

    return jsonResponse({ success: false, message: "Credenciales de acceso incorrectas o usuario no registrado." }, 401);
  }

  // 2. GET DB DATA
  if (pathname === "/api/db/get-data" && method === "GET") {
    return jsonResponse(db);
  }

  // 3. GET USERS
  if (pathname === "/api/db/get-users" && method === "GET") {
    return jsonResponse({ success: true, users: db.users });
  }

  // 4. SAVE USER
  if (pathname === "/api/db/save-user" && method === "POST") {
    const user = getBody();
    if (!user || !user.username) {
      return jsonResponse({ success: false, message: "Datos de usuario inválidos." }, 400);
    }

    const index = db.users.findIndex(
      (u: any) => u.username?.toLowerCase().trim() === user.username.toLowerCase().trim()
    );

    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...user };
    } else {
      db.users.push(user);
    }

    saveLocalDB(db);
    return jsonResponse({ success: true, message: "Usuario guardado exitosamente.", users: db.users });
  }

  // 5. REMOVE USER
  if (pathname === "/api/db/remove-user" && method === "POST") {
    const { username } = getBody();
    if (!username) {
      return jsonResponse({ success: false, message: "Usuario requerido." }, 400);
    }

    db.users = db.users.filter(
      (u: any) => u.username?.toLowerCase().trim() !== username.toLowerCase().trim()
    );

    saveLocalDB(db);
    return jsonResponse({ success: true, message: "Usuario eliminado.", users: db.users });
  }

  // 6. SAVE RULE
  if (pathname === "/api/db/save-rule" && method === "POST") {
    const rule = getBody();
    const productId = Number(rule.productId);

    if (!productId) {
      return jsonResponse({ success: false, message: "ID de producto requerido." }, 400);
    }

    const index = db.rules.findIndex((r: any) => Number(r.productId) === productId);
    if (index !== -1) {
      db.rules[index] = { ...db.rules[index], ...rule, productId };
    } else {
      db.rules.push({ ...rule, productId });
    }

    saveLocalDB(db);
    return jsonResponse({ success: true });
  }

  // 7. REMOVE RULE
  if (pathname === "/api/db/remove-rule" && method === "POST") {
    const { productId } = getBody();
    const pId = Number(productId);

    db.rules = db.rules.filter((r: any) => Number(r.productId) !== pId);
    saveLocalDB(db);
    return jsonResponse({ success: true });
  }

  // 8. ODOO AUTHENTICATE
  if (pathname === "/api/odoo/authenticate" && method === "POST") {
    const { url, db: odooDb, username, password } = getBody();

    // If they specified a custom real Odoo URL (not a dummy string/mock/empty)
    if (url && url !== "demo" && !url.includes("example.com") && url.trim().startsWith("http")) {
      try {
        console.log(`[API Mock Client-Side] Authenticating with Odoo: ${url}, DB: ${odooDb}, User: ${username}`);
        const uid = await executeClientSideOdooCall(url, "/xmlrpc/2/common", "authenticate", [
          odooDb,
          username,
          password,
          {}
        ]);

        if (!uid) {
          return jsonResponse({
            success: false,
            message: "Credenciales inválidas. Por favor verifique el usuario, contraseña o base de datos."
          });
        }

        console.log(`[API Mock Client-Side] Authentication success, UID: ${uid}`);

        // Fetch companies with robust fallback
        let companies: any[] = [];
        try {
          const result = await executeClientSideOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
            odooDb,
            uid,
            password,
            "res.company",
            "search_read",
            [[]],
            { fields: ["id", "name"] } // Avoid currency_id
          ]);
          if (Array.isArray(result)) {
            companies = result;
          } else {
            companies = [{ id: 1, name: "Compañía Principal (Odoo)" }];
          }
        } catch (cErr: any) {
          console.warn("[API Mock Client-Side] Failed to list companies, using virtual main company.", cErr.message || cErr);
          companies = [{ id: 1, name: "Compañía Principal (Auto-detectada)" }];
        }

        return jsonResponse({
          success: true,
          uid,
          companies
        });
      } catch (err: any) {
        console.error("[API Mock Client-Side] Authentication error:", err);
        return jsonResponse({
          success: false,
          message: err.message || "Error de conexión con Odoo."
        });
      }
    }

    // Default Demo Mode Auth
    return jsonResponse({
      success: true,
      uid: 2,
      companies: [
        { id: 1, name: "GAORSYSTEM PERU S.A.C." },
        { id: 2, name: "CLIENTE DEMO S.A." }
      ]
    });
  }

  // 9. ODOO FETCH DATA (returns products, orders, orderlines etc)
  if (pathname === "/api/odoo/fetch-data" && method === "POST") {
    const { url, db: odooDb, username, password, uid, companyId } = getBody();

    if (url && url !== "demo" && !url.includes("example.com") && url.trim().startsWith("http")) {
      try {
        const companyIdInt = parseInt(companyId, 10);
        const uidInt = parseInt(uid, 10);

        console.log(`[API Mock Client-Side] Fetching Odoo data for company ${companyIdInt}...`);

        // 0. Users with robust nested fallbacks
        let odooUsers: any[] = [];
        console.log("[API Mock Client-Side] Consultando usuarios de Odoo (res.users)...");
        
        // Intento 1: Con filtro de company_ids
        try {
          const result = await executeClientSideOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
            odooDb,
            uidInt,
            password,
            "res.users",
            "search_read",
            [[["company_ids", "in", [companyIdInt]]]],
            { 
              fields: ["id", "name", "login", "partner_id"],
              context: { allowed_company_ids: [companyIdInt] }
            }
          ], companyIdInt);
          if (Array.isArray(result) && result.length > 0) {
            odooUsers = result;
            console.log(`[API Mock Client-Side] Éxito Intento 1: ${odooUsers.length} usuarios.`);
          }
        } catch (err) {
          console.log(`[API Mock Client-Side] Fallo Intento 1 (company_ids):`, err);
        }

        // Intento 2: Con filtro company_id
        if (odooUsers.length === 0) {
          try {
            const result = await executeClientSideOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
              odooDb,
              uidInt,
              password,
              "res.users",
              "search_read",
              [[["company_id", "=", companyIdInt]]],
              { 
                fields: ["id", "name", "login", "partner_id"],
                context: { allowed_company_ids: [companyIdInt] }
              }
            ], companyIdInt);
            if (Array.isArray(result) && result.length > 0) {
              odooUsers = result;
              console.log(`[API Mock Client-Side] Éxito Intento 2: ${odooUsers.length} usuarios.`);
            }
          } catch (err) {
            console.log(`[API Mock Client-Side] Fallo Intento 2 (company_id):`, err);
          }
        }

        // Intento 3: Sin filtros
        if (odooUsers.length === 0) {
          try {
            const result = await executeClientSideOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
              odooDb,
              uidInt,
              password,
              "res.users",
              "search_read",
              [[]],
              { 
                fields: ["id", "name", "login", "partner_id"],
                limit: 80
              }
            ], companyIdInt);
            if (Array.isArray(result) && result.length > 0) {
              odooUsers = result;
              console.log(`[API Mock Client-Side] Éxito Intento 3: ${odooUsers.length} usuarios sin filtros.`);
            }
          } catch (err) {
            console.warn("[API Mock Client-Side] Fallo total al consultar usuarios:", err);
          }
        }

        // 1. Products
        let products: any[] = [];
        try {
          const result = await executeClientSideOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
            odooDb,
            uidInt,
            password,
            "product.product",
            "search_read",
            [[
              ["sale_ok", "=", true],
              ["company_id", "in", [false, companyIdInt]]
            ]],
            { 
              fields: ["id", "display_name", "default_code", "list_price"],
              context: { allowed_company_ids: [companyIdInt] }
            }
          ], companyIdInt);
          if (Array.isArray(result)) products = result;
        } catch (err) {
          console.warn("[API Mock Client-Side] Failed to fetch products, using current local db ones:", err);
          products = db.products;
        }

        // 2. Orders
        let orders: any[] = [];
        try {
          const result = await executeClientSideOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
            odooDb,
            uidInt,
            password,
            "sale.order",
            "search_read",
            [[
              ["company_id", "in", [companyIdInt]],
              ["state", "in", ["sale", "done"]]
            ]],
            { 
              fields: ["id", "name", "date_order", "user_id", "amount_total"],
              context: { allowed_company_ids: [companyIdInt] }
            }
          ], companyIdInt);
          if (Array.isArray(result)) orders = result;
        } catch (err) {
          console.warn("[API Mock Client-Side] Failed to fetch orders, using local db ones:", err);
          orders = db.orders;
        }

        // 3. Order lines
        let orderLines: any[] = [];
        if (orders.length > 0) {
          const orderIds = orders.map((o: any) => o.id);
          try {
            const result = await executeClientSideOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
              odooDb,
              uidInt,
              password,
              "sale.order.line",
              "search_read",
              [[["order_id", "in", orderIds]]],
              { 
                fields: ["id", "order_id", "product_id", "product_uom_qty", "price_unit", "price_subtotal"],
                context: { allowed_company_ids: [companyIdInt] }
              }
            ], companyIdInt);
            if (Array.isArray(result)) orderLines = result;
          } catch (err) {
            console.warn("[API Mock Client-Side] Failed to fetch order lines:", err);
            orderLines = db.orderLines;
          }
        } else {
          orderLines = db.orderLines;
        }

        // 4. Expiry / Lots (Odoo 14 specific, using life_date)
        let expiryAlerts: any[] = [];
        let lots: any[] = [];
        const today = new Date();
        const fechaHoyISO = today.toISOString().split("T")[0];
        const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const fechaEn30DiasISO = in30Days.toISOString().split("T")[0];

        try {
          console.log(`[API Mock] Consultando lotes vencidos en 'stock.production.lot' con life_date < ${fechaHoyISO}...`);
          let expiredLots: any[] = [];
          try {
            expiredLots = await executeClientSideOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
              odooDb,
              uidInt,
              password,
              "stock.production.lot",
              "search_read",
              [[
                ["company_id", "in", [companyIdInt]],
                ["life_date", "<", fechaHoyISO]
              ]],
              { 
                fields: ["id", "name", "product_id", "life_date", "product_qty", "product_uom_id", "company_id"],
                context: { allowed_company_ids: [companyIdInt] }
              }
            ], companyIdInt);
          } catch (err: any) {
            try {
              expiredLots = await executeClientSideOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
                odooDb,
                uidInt,
                password,
                "stock.production.lot",
                "search_read",
                [[["life_date", "<", fechaHoyISO]]],
                { fields: ["id", "name", "product_id", "life_date", "product_qty", "product_uom_id", "company_id"] }
              ], companyIdInt);
            } catch (e) {}
          }

          console.log(`[API Mock] Consultando lotes por vencer en 'stock.production.lot' entre ${fechaHoyISO} y ${fechaEn30DiasISO}...`);
          let soonLots: any[] = [];
          try {
            soonLots = await executeClientSideOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
              odooDb,
              uidInt,
              password,
              "stock.production.lot",
              "search_read",
              [[
                ["company_id", "in", [companyIdInt]],
                ["life_date", ">=", fechaHoyISO],
                ["life_date", "<=", fechaEn30DiasISO]
              ]],
              { 
                fields: ["id", "name", "product_id", "life_date", "product_qty", "product_uom_id", "company_id"],
                context: { allowed_company_ids: [companyIdInt] }
              }
            ], companyIdInt);
          } catch (err: any) {
            try {
              soonLots = await executeClientSideOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
                odooDb,
                uidInt,
                password,
                "stock.production.lot",
                "search_read",
                [[
                  ["life_date", ">=", fechaHoyISO],
                  ["life_date", "<=", fechaEn30DiasISO]
                ]],
                { fields: ["id", "name", "product_id", "life_date", "product_qty", "product_uom_id", "company_id"] }
              ], companyIdInt);
            } catch (e) {}
          }

          if (Array.isArray(expiredLots)) {
            expiredLots.forEach((l) => {
              l.status = "expired";
              lots.push(l);
            });
          }
          if (Array.isArray(soonLots)) {
            soonLots.forEach((l) => {
              l.status = "soon";
              lots.push(l);
            });
          }

          // Query some compliant ones (ok) if lots are too few
          if (lots.length < 5) {
            try {
              const okLots = await executeClientSideOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
                odooDb,
                uidInt,
                password,
                "stock.production.lot",
                "search_read",
                [[
                  ["company_id", "in", [companyIdInt]],
                  ["life_date", ">", fechaEn30DiasISO]
                ]],
                { 
                  fields: ["id", "name", "product_id", "life_date", "product_qty", "product_uom_id", "company_id"],
                  context: { allowed_company_ids: [companyIdInt] },
                  limit: 20
                }
              ], companyIdInt);
              if (Array.isArray(okLots)) {
                okLots.forEach((l) => {
                  l.status = "ok";
                  lots.push(l);
                });
              }
            } catch (e) {}
          }
        } catch (err) {
          console.warn("[API Mock Client-Side] Failed to query Odoo 14 lots style, falling back...", err);
        }

        // Fallback robust search if empty
        if (lots.length === 0) {
          const lotModels = ["stock.production.lot", "stock.lot"];
          const dateFields = ["expiration_date", "life_date", "use_date", "removal_date"];
          let activeField = "";

          for (const model of lotModels) {
            for (const field of dateFields) {
              try {
                const result = await executeClientSideOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
                  odooDb,
                  uidInt,
                  password,
                  model,
                  "search_read",
                  [[
                    ["company_id", "in", [companyIdInt]],
                    [field, "!=", false]
                  ]],
                  { 
                    fields: ["id", "name", "product_id", field, "product_qty", "product_uom_id", "company_id"],
                    context: { allowed_company_ids: [companyIdInt] }
                  }
                ], companyIdInt);
                if (Array.isArray(result) && result.length > 0) {
                  lots = result;
                  activeField = field;
                  break;
                }
              } catch (e) {}
            }
            if (lots.length > 0) break;
          }
        }

        if (lots.length > 0) {
          const now = new Date();
          expiryAlerts = lots.map((lot: any) => {
            const rawDate = lot.life_date || lot.expiration_date || lot.use_date || lot.removal_date;
            const expDate = rawDate ? new Date(rawDate) : new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
            const diffTime = expDate.getTime() - now.getTime();
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            let status: "expired" | "soon" | "ok" = lot.status || "ok";
            if (!lot.status) {
              if (daysRemaining <= 0) {
                status = "expired";
              } else if (daysRemaining <= 30) {
                status = "soon";
              }
            }
            const lotCompanyId = lot.company_id && Array.isArray(lot.company_id) ? lot.company_id[0] : lot.company_id;
            return {
              id: lot.id,
              productName: Array.isArray(lot.product_id) ? lot.product_id[1] : "Producto Odoo",
              defaultCode: lot.product_id ? `PROD-${lot.product_id[0]}` : "SN",
              lotNumber: lot.name,
              expiryDate: (rawDate && typeof rawDate === "string") ? rawDate.split(" ")[0] : "Sin fecha",
              daysRemaining,
              stockQty: lot.product_qty || 0,
              location: "Almacén Odoo Sede " + companyIdInt,
              status,
              companyId: lotCompanyId
            };
          })
          .filter((alert: any) => {
            // ONLY keep lots with quantity > 0
            if (alert.stockQty <= 0) return false;
            // Filter by correct companyId
            if (alert.companyId && alert.companyId !== companyIdInt) return false;
            return true;
          });
        }

        // 5. POS Sessions from pos.session (Odoo 14, fields and company_id singular filter)
        let posSessions: any[] = [];
        try {
          const rawSessions = await executeClientSideOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
            odooDb,
            uidInt,
            password,
            "pos.session",
            "search_read",
            [[
              ["company_id", "in", [companyIdInt]]
            ]],
            { 
              fields: ["id", "name", "state", "user_id", "config_id", "start_at", "stop_at"],
              context: { allowed_company_ids: [companyIdInt] }
            }
          ], companyIdInt);

          if (Array.isArray(rawSessions)) {
            posSessions = rawSessions.map((s: any) => {
              const cashierName = s.user_id && Array.isArray(s.user_id) ? s.user_id[1] : "Cajero Odoo";
              const stateLabel = s.state === "opened" ? "Abierto" : "Cerrado";
              return {
                id: s.id,
                name: s.name || `Turno #${s.id}`,
                cashier: cashierName,
                openingDate: s.start_at ? s.start_at.replace("T", " ").split(".")[0] : "Sin fecha apertura",
                closingDate: s.stop_at ? s.stop_at.replace("T", " ").split(".")[0] : "N/A",
                openingBalance: 150.00,
                closedAmount: s.state === "opened" ? 0 : 350.00,
                totalRevenue: 200.00,
                state: stateLabel,
                config_id: s.config_id
              };
            });
          }
        } catch (err) {
          console.warn("[API Mock Client-Side] Failed to fetch pos.session:", err);
        }

        // Save back to client's simulated DB
        db.products = products;
        db.orders = orders;
        db.orderLines = orderLines;
        db.odooUsers = odooUsers;
        if (expiryAlerts.length > 0) db.expiryAlerts = expiryAlerts;
        
        if (posSessions.length > 0) {
          db.posSessions = posSessions;
        } else {
          db.posSessions = db.posSessions.map((s: any) => ({
            ...s,
            config_id: s.config_id || [1, `Caja Principal Sede ${companyIdInt}`]
          }));
        }
        saveLocalDB(db);

        return jsonResponse({
          success: true,
          products,
          orders,
          orderLines,
          expiryAlerts: db.expiryAlerts,
          posReports: db.posReports,
          posSessions: db.posSessions,
          posTransactions: db.posTransactions,
          users: odooUsers
        });
      } catch (err: any) {
        console.error("[API Mock Client-Side] Error fetching data:", err);
        return jsonResponse({
          success: false,
          message: err.message || "Error al descargar datos de Odoo."
        });
      }
    }

    return jsonResponse({
      success: true,
      products: db.products,
      orders: db.orders,
      orderLines: db.orderLines,
      expiryAlerts: db.expiryAlerts,
      posReports: db.posReports,
      posSessions: db.posSessions,
      posTransactions: db.posTransactions,
      users: []
    });
  }

  // 10. RESET DATABASE
  if (pathname === "/api/db/reset" && method === "POST") {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return jsonResponse({ success: true, message: "Base de datos local reestablecida." });
  }

  return jsonResponse({ error: "Endpoint no encontrado en simulador." }, 404);
}

// Install interceptor globally if there is no server or if fetch fails
const CLOUD_RUN_BACKEND = "https://ais-pre-laewhbuqbsts4vdvsssrk5-70882886393.us-east1.run.app";

const originalFetch = window.fetch;
const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let url = typeof input === "string" ? input : (input instanceof URL ? input.href : input instanceof Request ? input.url : "");
  
  const isStaticDeploy = !window.location.hostname.includes("localhost") && 
                         !window.location.hostname.includes("127.0.0.1") && 
                         !window.location.hostname.includes("run.app") &&
                         !window.location.hostname.includes("google.com") &&
                         !window.location.hostname.includes("aistudio");

  if (url.startsWith("/api/") || url.includes("/api/")) {
    const apiPath = url.substring(url.indexOf("/api/"));
    
    // If we are on Vercel or other static hosts, direct /api/ requests to the Cloud Run backend
    // BUT exclude /api/odoo-proxy so it runs locally as a native Vercel Serverless Function!
    if (isStaticDeploy && !apiPath.startsWith("/api/odoo-proxy")) {
      const targetUrl = `${CLOUD_RUN_BACKEND}${apiPath}`;
      console.log(`[API Mock] Redireccionando llamada API de Vercel al backend en Cloud Run: ${targetUrl}`);
      try {
        const response = await originalFetch(targetUrl, init);
        // If the backend request completed, return the response directly
        if (response.status !== 404 && response.status !== 502 && response.status !== 504) {
          return response;
        }
      } catch (err: any) {
        console.warn(`[API Mock] Redirección al backend de Cloud Run falló. Pasando a proxy directo...`, err);
      }
    }

    // Check if this is a connection request for a real Odoo server
    let isRealOdooRequest = false;
    try {
      if (init?.body) {
        const body = JSON.parse(init.body as string);
        if (body.url && body.url !== "demo" && !body.url.includes("example.com") && body.url.trim().startsWith("http")) {
          isRealOdooRequest = true;
        }
      }
    } catch (e) {}

    try {
      const response = await originalFetch(input, init);
      // If we receive a gateway error, status 404 (common in static deploys) or status 502/504, fall back to client-side proxy execution
      if (response.status === 404 || response.status === 502 || response.status === 504) {
        if (isRealOdooRequest) {
          console.warn(`[API Mock] Servidor backend devolvió estado ${response.status}. Intentando conexión directa desde el cliente con proxies CORS de respaldo...`);
          try {
            return await handleMockRequest(apiPath, init);
          } catch (fallbackErr: any) {
            const statusText = response.status === 404 ? "no encontrado (404)" : `error de pasarela (${response.status})`;
            return new Response(JSON.stringify({
              success: false,
              message: `El servidor backend reportó un ${statusText}. Además, el reintento directo por proxy falló: ${fallbackErr.message || fallbackErr}`
            }), { status: 200, headers: { "Content-Type": "application/json" } });
          }
        }
        return await handleMockRequest(apiPath, init);
      }
      return response;
    } catch (err: any) {
      console.warn(`[API Mock] originalFetch a ${url} falló:`, err.message || err);
      // TypeError: Failed to fetch (server is down or CORS block or no backend), fall back to client-side proxy execution
      if (isRealOdooRequest) {
        console.warn(`[API Mock] No se pudo conectar al backend. Intentando conexión directa desde el cliente con proxies CORS de respaldo...`);
        try {
          return await handleMockRequest(apiPath, init);
        } catch (fallbackErr: any) {
          return new Response(JSON.stringify({
            success: false,
            message: `No se pudo conectar al servidor backend y la conexión directa falló: ${fallbackErr.message || fallbackErr}`
          }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
      }
      return await handleMockRequest(apiPath, init);
    }
  }

  return originalFetch(input, init);
};

try {
  Object.defineProperty(window, "fetch", {
    value: customFetch,
    configurable: true,
    writable: true,
    enumerable: true
  });
} catch (e: any) {
  console.warn("[API Mock] Could not redefine window.fetch with Object.defineProperty directly on window:", e.message || e);
  try {
    Object.defineProperty(Window.prototype, "fetch", {
      value: customFetch,
      configurable: true,
      writable: true,
      enumerable: true
    });
    console.log("[API Mock] Successfully intercepted fetch via Window.prototype.");
  } catch (protoErr: any) {
    console.error("[API Mock] Failed to override fetch on Window.prototype:", protoErr.message || protoErr);
    try {
      (window as any).fetch = customFetch;
    } catch (directErr: any) {
      console.error("[API Mock] All methods to intercept window.fetch failed. Native fetch will be used:", directErr.message || directErr);
    }
  }
}

export {};
