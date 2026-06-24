import { OdooCompany, OdooProduct, OdooSaleOrder, OdooSaleOrderLine, CommissionRule, ExpiryAlert, PosDailyReport, PosSession, PosTransactionDetail } from "./types";

export const MOCK_COMPANIES: OdooCompany[] = [
  { id: 1, name: "Corporación Tecnológica del Perú S.A.C." },
  { id: 2, name: "Distribuidora Andina de Alimentos S.A." },
  { id: 3, name: "Servicios Integrales de Consultoría" }
];

export const MOCK_PRODUCTS: OdooProduct[] = [
  { id: 101, display_name: "[PROD001] Laptop UltraSlim 15\" Intel Core i7", default_code: "PROD001", list_price: 1250.00 },
  { id: 102, display_name: "[PROD002] Monitor Curvo Gamer 34\" QuadHD", default_code: "PROD002", list_price: 480.00 },
  { id: 103, display_name: "[PROD003] Teclado Mecánico RGB Switch Blue", default_code: "PROD003", list_price: 85.00 },
  { id: 104, display_name: "[PROD004] Mouse Ergonómico Inalámbrico Silent", default_code: "PROD004", list_price: 45.00 },
  { id: 105, display_name: "[PROD005] Licencia Anual ERP Custom Premium", default_code: "PROD005", list_price: 2500.00 },
  { id: 106, display_name: "[PROD006] Servicio de Instalación y Soporte Técnico", default_code: "PROD006", list_price: 150.00 },
  { id: 107, display_name: "[PROD007] Auriculares Premium Noise Cancelling", default_code: "PROD007", list_price: 220.00 },
  { id: 108, display_name: "[PROD008] Disco Duro Externo SSD NVMe 2TB", default_code: "PROD008", list_price: 180.00 },
  { id: 109, display_name: "[PROD009] Cámara Web 4K Pro Ultra Streaming", default_code: "PROD009", list_price: 120.00 }
];

// Odoo orders have a user_id: [id, name] which is the salesperson
export const MOCK_ORDERS: OdooSaleOrder[] = [
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

export const MOCK_ORDER_LINES: OdooSaleOrderLine[] = [
  // SO001 - Carlos Mendoza: Total 2980
  { id: 2001, order_id: [501, "SO001"], product_id: [101, "Laptop UltraSlim 15\" Intel Core i7"], product_uom_qty: 2, price_unit: 1250.00, price_subtotal: 2500.00 },
  { id: 2002, order_id: [501, "SO001"], product_id: [102, "Monitor Curvo Gamer 34\" QuadHD"], product_uom_qty: 1, price_unit: 480.00, price_subtotal: 480.00 },

  // SO002 - Sofía Altamirano: Total 5120
  { id: 2003, order_id: [502, "SO002"], product_id: [101, "Laptop UltraSlim 15\" Intel Core i7"], product_uom_qty: 3, price_unit: 1250.00, price_subtotal: 3750.00 },
  { id: 2004, order_id: [502, "SO002"], product_id: [102, "Monitor Curvo Gamer 34\" QuadHD"], product_uom_qty: 2, price_unit: 480.00, price_subtotal: 960.00 },
  { id: 2005, order_id: [502, "SO002"], product_id: [103, "Teclado Mecánico RGB Switch Blue"], product_uom_qty: 3, price_unit: 85.00, price_subtotal: 255.00 },
  { id: 2006, order_id: [502, "SO002"], product_id: [104, "Mouse Ergonómico Inalámbrico Silent"], product_uom_qty: 3, price_unit: 45.00, price_subtotal: 155.00 },

  // SO003 - Lucas Rivas: Total 1395
  { id: 2007, order_id: [503, "SO003"], product_id: [102, "Monitor Curvo Gamer 34\" QuadHD"], product_uom_qty: 2, price_unit: 480.00, price_subtotal: 960.00 },
  { id: 2008, order_id: [503, "SO003"], product_id: [103, "Teclado Mecánico RGB Switch Blue"], product_uom_qty: 3, price_unit: 85.00, price_subtotal: 255.00 },
  { id: 2009, order_id: [503, "SO003"], product_id: [108, "Disco Duro Externo SSD NVMe 2TB"], product_uom_qty: 1, price_unit: 180.00, price_subtotal: 180.00 },

  // SO004 - Daniela Vargas: Total 2650
  { id: 2010, order_id: [504, "SO004"], product_id: [101, "Laptop UltraSlim 15\" Intel Core i7"], product_uom_qty: 2, price_unit: 1250.00, price_subtotal: 2500.00 },
  { id: 2011, order_id: [504, "SO004"], product_id: [106, "Servicio de Instalación y Soporte Técnico"], product_uom_qty: 1, price_unit: 150.00, price_subtotal: 150.00 },

  // SO005 - Carlos Mendoza: Total 415
  { id: 2012, order_id: [505, "SO005"], product_id: [103, "Teclado Mecánico RGB Switch Blue"], product_uom_qty: 2, price_unit: 85.00, price_subtotal: 170.00 },
  { id: 2013, order_id: [505, "SO005"], product_id: [104, "Mouse Ergonómico Inalámbrico Silent"], product_uom_qty: 3, price_unit: 45.00, price_subtotal: 135.00 },
  { id: 2014, order_id: [505, "SO005"], product_id: [109, "Cámara Web 4K Pro Ultra Streaming"], product_uom_qty: 1, price_unit: 110.00, price_subtotal: 110.00 },

  // SO006 - Sofía Altamirano: Total 3670
  { id: 2015, order_id: [506, "SO006"], product_id: [101, "Laptop UltraSlim 15\" Intel Core i7"], product_uom_qty: 2, price_unit: 1250.00, price_subtotal: 2500.00 },
  { id: 2016, order_id: [506, "SO006"], product_id: [102, "Monitor Curvo Gamer 34\" QuadHD"], product_uom_qty: 2, price_unit: 480.00, price_subtotal: 960.00 },
  { id: 2017, order_id: [506, "SO006"], product_id: [107, "Auriculares Premium Noise Cancelling"], product_uom_qty: 1, price_unit: 210.00, price_subtotal: 210.00 },

  // SO007 - Lucas Rivas: Total 2500
  { id: 2018, order_id: [507, "SO007"], product_id: [105, "Licencia Anual ERP Custom Premium"], product_uom_qty: 1, price_unit: 2500.00, price_subtotal: 2500.00 },

  // SO008 - Daniela Vargas: Total 490
  { id: 2019, order_id: [508, "SO008"], product_id: [107, "Auriculares Premium Noise Cancelling"], product_uom_qty: 2, price_unit: 220.00, price_subtotal: 440.00 },
  { id: 2020, order_id: [508, "SO008"], product_id: [106, "Servicio de Instalación y Soporte Técnico"], product_uom_qty: 1, price_unit: 50.00, price_subtotal: 50.00 },

  // SO009 - Carlos Mendoza: Total 1515
  { id: 2021, order_id: [509, "SO009"], product_id: [101, "Laptop UltraSlim 15\" Intel Core i7"], product_uom_qty: 1, price_unit: 1250.00, price_subtotal: 1250.00 },
  { id: 2022, order_id: [509, "SO009"], product_id: [107, "Auriculares Premium Noise Cancelling"], product_uom_qty: 1, price_unit: 220.00, price_subtotal: 220.00 },
  { id: 2023, order_id: [509, "SO009"], product_id: [104, "Mouse Ergonómico Inalámbrico Silent"], product_uom_qty: 1, price_unit: 45.00, price_subtotal: 45.00 },

  // SO011 - Sofía Altamirano: Total 5410
  { id: 2024, order_id: [510, "SO011"], product_id: [105, "Licencia Anual ERP Custom Premium"], product_uom_qty: 2, price_unit: 2500.00, price_subtotal: 5000.00 },
  { id: 2025, order_id: [510, "SO011"], product_id: [108, "Disco Duro Externo SSD NVMe 2TB"], product_uom_qty: 2, price_unit: 180.00, price_subtotal: 360.00 },
  { id: 2026, order_id: [510, "SO011"], product_id: [106, "Servicio de Instalación y Soporte Técnico"], product_uom_qty: 1, price_unit: 50.00, price_subtotal: 50.00 },

  // SO012 - Lucas Rivas: Total 1620
  { id: 2027, order_id: [511, "SO012"], product_id: [101, "Laptop UltraSlim 15\" Intel Core i7"], product_uom_qty: 1, price_unit: 1250.00, price_subtotal: 1250.00 },
  { id: 2028, order_id: [511, "SO012"], product_id: [102, "Monitor Curvo Gamer 34\" QuadHD"], product_uom_qty: 1, price_unit: 370.00, price_subtotal: 370.00 },

  // SO013 - Daniela Vargas: Total 7500
  { id: 2029, order_id: [512, "SO013"], product_id: [105, "Licencia Anual ERP Custom Premium"], product_uom_qty: 3, price_unit: 2500.00, price_subtotal: 7500.00 }
];

export const INITIAL_MOCK_RULES: CommissionRule[] = [
  { productId: 101, type: "percentage", value: 3 }, // 3% commission on Core i7 laptop
  { productId: 102, type: "percentage", value: 4 }, // 4% commission on curved monitor
  { productId: 103, type: "flat", value: 5 }, // $5 flat per keyboard
  { productId: 105, type: "percentage", value: 5 }, // 5% on ERP Licences
  { productId: 108, type: "flat", value: 10 } // $10 flat per external SSD
];

export const MOCK_EXPIRY_ALERTS: ExpiryAlert[] = [
  {
    id: 1,
    productName: "Laptop UltraSlim 15\" Intel Core i7",
    defaultCode: "PROD001",
    lotNumber: "LOTE-LP-2026A",
    expiryDate: "2026-06-15",
    daysRemaining: -7,
    stockQty: 3,
    location: "Almacén Principal A-12",
    status: "expired"
  },
  {
    id: 2,
    productName: "Monitor Curvo Gamer 34\" QuadHD",
    defaultCode: "PROD002",
    lotNumber: "LOTE-MN-34Y2",
    expiryDate: "2026-07-15",
    daysRemaining: 23,
    stockQty: 8,
    location: "Almacén de Exhibición",
    status: "soon"
  },
  {
    id: 3,
    productName: "Teclado Mecánico RGB Switch Blue",
    defaultCode: "PROD003",
    lotNumber: "LOTE-KB-BLUE8",
    expiryDate: "2026-07-02",
    daysRemaining: 10,
    stockQty: 25,
    location: "Estante Pasadizo 4",
    status: "soon"
  },
  {
    id: 4,
    productName: "Mouse Ergonómico Inalámbrico Silent",
    defaultCode: "PROD004",
    lotNumber: "LOTE-MS-SIL03",
    expiryDate: "2026-07-20",
    daysRemaining: 28,
    stockQty: 40,
    location: "Caja de Reserva B",
    status: "soon"
  },
  {
    id: 5,
    productName: "Auriculares Premium Noise Cancelling",
    defaultCode: "PROD007",
    lotNumber: "LOTE-AUD-NC09",
    expiryDate: "2026-07-05",
    daysRemaining: 13,
    stockQty: 15,
    location: "Almacén Principal A-15",
    status: "soon"
  },
  {
    id: 6,
    productName: "Disco Duro Externo SSD NVMe 2TB",
    defaultCode: "PROD008",
    lotNumber: "LOTE-SSD-2TBX",
    expiryDate: "2026-09-12",
    daysRemaining: 82,
    stockQty: 12,
    location: "Estante Seguridad",
    status: "ok"
  },
  {
    id: 7,
    productName: "Cámara Web 4K Pro Ultra Streaming",
    defaultCode: "PROD009",
    lotNumber: "LOTE-CAM-4KPRO",
    expiryDate: "2026-10-30",
    daysRemaining: 130,
    stockQty: 20,
    location: "Almacén Principal B-2",
    status: "ok"
  }
];

export const MOCK_POS_DAILY_REPORTS: PosDailyReport[] = [
  {
    date: "2026-06-22",
    totalSales: 4520.00,
    payments: [
      { method: "Efectivo", amount: 1200.00 },
      { method: "Yape / Plin", amount: 1850.00 },
      { method: "Tarjeta de Crédito/Débito", amount: 1470.00 }
    ],
    products: [
      { id: 101, name: "Laptop UltraSlim 15\" Intel Core i7", code: "PROD001", qty: 2, amount: 2500.00 },
      { id: 102, name: "Monitor Curvo Gamer 34\" QuadHD", code: "PROD002", qty: 3, amount: 1440.00 },
      { id: 103, name: "Teclado Mecánico RGB Switch Blue", code: "PROD003", qty: 5, amount: 425.00 },
      { id: 104, name: "Mouse Ergonómico Inalámbrico Silent", code: "PROD004", qty: 3, amount: 135.00 },
      { id: 106, name: "Servicio de Instalación y Soporte Técnico", code: "PROD006", qty: 1, amount: 20.00 }
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
      { id: 102, name: "Monitor Curvo Gamer 34\" QuadHD", code: "PROD002", qty: 4, amount: 1920.00 },
      { id: 107, name: "Auriculares Premium Noise Cancelling", code: "PROD007", qty: 5, amount: 1100.00 },
      { id: 103, name: "Teclado Mecánico RGB Switch Blue", code: "PROD003", qty: 10, amount: 850.00 }
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
      { id: 105, name: "Licencia Anual ERP Custom Premium", code: "PROD005", qty: 2, amount: 5000.00 },
      { id: 108, name: "Disco Duro Externo SSD NVMe 2TB", code: "PROD008", qty: 2, amount: 360.00 },
      { id: 106, name: "Servicio de Instalación y Soporte Técnico", code: "PROD006", qty: 1, amount: 50.00 }
    ],
    documents: [
      { type: "Boleta de Venta Electrónica", count: 8, amount: 410.00 },
      { type: "Factura Electrónica", count: 2, amount: 5000.00 }
    ]
  }
];

export const MOCK_POS_SESSIONS: PosSession[] = [
  {
    id: 1,
    name: "POS/2026/06/22-01",
    cashier: "Ana Ramos (Turno Mañana)",
    openingDate: "2026-06-22 08:00:00",
    closingDate: "2026-06-22 14:00:00",
    openingBalance: 200.00,
    closedAmount: 2620.00, // S/. 200 + S/. 2420 sales
    totalRevenue: 2420.00,
    state: "Cerrado"
  },
  {
    id: 2,
    name: "POS/2026/06/22-02",
    cashier: "Pedro Solano (Turno Tarde)",
    openingDate: "2026-06-22 14:00:00",
    closingDate: "2026-06-22 21:00:00",
    openingBalance: 200.00,
    closedAmount: 2300.00, // S/. 200 + S/. 2100 sales
    totalRevenue: 2100.00,
    state: "Cerrado"
  },
  {
    id: 3,
    name: "POS/2026/06/21-01",
    cashier: "Ana Ramos (Turno Mañana)",
    openingDate: "2026-06-21 08:00:00",
    closingDate: "2026-06-21 14:00:00",
    openingBalance: 150.00,
    closedAmount: 1950.00, // S/. 150 + S/. 1800 sales
    totalRevenue: 1800.00,
    state: "Cerrado"
  },
  {
    id: 4,
    name: "POS/2026/06/21-02",
    cashier: "Pedro Solano (Turno Tarde)",
    openingDate: "2026-06-21 14:00:00",
    closingDate: "2026-06-21 21:00:00",
    openingBalance: 150.00,
    closedAmount: 2220.00, // S/. 150 + S/. 2070 sales
    totalRevenue: 2070.00,
    state: "Cerrado"
  },
  {
    id: 5,
    name: "POS/2026/06/23-01",
    cashier: "Elena Castro (Turno Mañana)",
    openingDate: "2026-06-23 08:00:00",
    closingDate: "N/A",
    openingBalance: 200.00,
    closedAmount: 0.00, // Todavía abierta
    totalRevenue: 1450.00,
    state: "Abierto"
  }
];

export const MOCK_POS_TRANSACTIONS: PosTransactionDetail[] = [
  // 2026-06-22 morning session (POS/2026/06/22-01)
  {
    id: 8001,
    sessionName: "POS/2026/06/22-01",
    invoiceName: "B001-000452",
    client: "Carlos Villacorta Prado",
    date: "2026-06-22 09:15:22",
    productName: "Laptop UltraSlim 15\" Intel Core i7",
    qty: 1,
    priceUnit: 1250.00,
    subtotal: 1250.00,
    paymentMethod: "Yape / Plin"
  },
  {
    id: 8002,
    sessionName: "POS/2026/06/22-01",
    invoiceName: "B001-000453",
    client: "María de la Cruz Rojas",
    date: "2026-06-22 10:24:05",
    productName: "Teclado Mecánico RGB Switch Blue",
    qty: 2,
    priceUnit: 85.00,
    subtotal: 170.00,
    paymentMethod: "Efectivo"
  },
  {
    id: 8003,
    sessionName: "POS/2026/06/22-01",
    invoiceName: "F001-000189",
    client: "Inversiones San José S.A.C.",
    date: "2026-06-22 11:42:18",
    productName: "Monitor Curvo Gamer 34\" QuadHD",
    qty: 2,
    priceUnit: 480.00,
    subtotal: 960.00,
    paymentMethod: "Tarjeta de Crédito/Débito"
  },
  {
    id: 8004,
    sessionName: "POS/2026/06/22-01",
    invoiceName: "B001-000454",
    client: "José Luis Neyra",
    date: "2026-06-22 13:10:50",
    productName: "Mouse Ergonómico Inalámbrico Silent",
    qty: 1,
    priceUnit: 40.00,
    subtotal: 40.00,
    paymentMethod: "Yape / Plin"
  },

  // 2026-06-22 afternoon session (POS/2026/06/22-02)
  {
    id: 8005,
    sessionName: "POS/2026/06/22-02",
    invoiceName: "B001-000455",
    client: "Alejandra Gómez Reyna",
    date: "2026-06-22 15:05:11",
    productName: "Laptop UltraSlim 15\" Intel Core i7",
    qty: 1,
    priceUnit: 1250.00,
    subtotal: 1250.00,
    paymentMethod: "Tarjeta de Crédito/Débito"
  },
  {
    id: 8006,
    sessionName: "POS/2026/06/22-02",
    invoiceName: "B001-000456",
    client: "Piero Alarcón Sifuentes",
    date: "2026-06-22 16:40:55",
    productName: "Monitor Curvo Gamer 34\" QuadHD",
    qty: 1,
    priceUnit: 480.00,
    subtotal: 480.00,
    paymentMethod: "Yape / Plin"
  },
  {
    id: 8007,
    sessionName: "POS/2026/06/22-02",
    invoiceName: "B001-000457",
    client: "Clientes Varios",
    date: "2026-06-22 18:20:30",
    productName: "Teclado Mecánico RGB Switch Blue",
    qty: 3,
    priceUnit: 85.00,
    subtotal: 255.00,
    paymentMethod: "Efectivo"
  },
  {
    id: 8008,
    sessionName: "POS/2026/06/22-02",
    invoiceName: "B001-000458",
    client: "Raúl Benavente",
    date: "2026-06-22 19:45:12",
    productName: "Mouse Ergonómico Inalámbrico Silent",
    qty: 2,
    priceUnit: 45.00,
    subtotal: 90.00,
    paymentMethod: "Efectivo"
  },
  {
    id: 8009,
    sessionName: "POS/2026/06/22-02",
    invoiceName: "B001-000459",
    client: "Clientes Varios",
    date: "2026-06-22 20:30:11",
    productName: "Servicio de Instalación y Soporte Técnico",
    qty: 1,
    priceUnit: 25.00,
    subtotal: 25.00,
    paymentMethod: "Yape / Plin"
  },

  // 2026-06-21 sessions (POS/2026/06/21-01 and POS/2026/06/21-02)
  {
    id: 8010,
    sessionName: "POS/2026/06/21-01",
    invoiceName: "B001-000430",
    client: "Diana Cáceres Wong",
    date: "2026-06-21 09:40:22",
    productName: "Monitor Curvo Gamer 34\" QuadHD",
    qty: 2,
    priceUnit: 480.00,
    subtotal: 960.00,
    paymentMethod: "Yape / Plin"
  },
  {
    id: 8011,
    sessionName: "POS/2026/06/21-01",
    invoiceName: "B001-000431",
    client: "Marcos Sandoval Ruiz",
    date: "2026-06-21 11:15:10",
    productName: "Auriculares Premium Noise Cancelling",
    qty: 3,
    priceUnit: 220.00,
    subtotal: 660.00,
    paymentMethod: "Tarjeta de Crédito/Débito"
  },
  {
    id: 8012,
    sessionName: "POS/2026/06/21-01",
    invoiceName: "B001-000432",
    client: "Clientes Varios",
    date: "2026-06-21 13:20:00",
    productName: "Teclado Mecánico RGB Switch Blue",
    qty: 2,
    priceUnit: 85.00,
    subtotal: 170.00,
    paymentMethod: "Efectivo"
  },
  {
    id: 8013,
    sessionName: "POS/2026/06/21-02",
    invoiceName: "F001-000175",
    client: "Tecnologías del Pacífico S.A.C.",
    date: "2026-06-21 15:10:45",
    productName: "Monitor Curvo Gamer 34\" QuadHD",
    qty: 2,
    priceUnit: 480.00,
    subtotal: 960.00,
    paymentMethod: "Tarjeta de Crédito/Débito"
  },
  {
    id: 8014,
    sessionName: "POS/2026/06/21-02",
    invoiceName: "B001-000433",
    client: "Gisela Ponce Ortiz",
    date: "2026-06-21 17:35:19",
    productName: "Auriculares Premium Noise Cancelling",
    qty: 2,
    priceUnit: 220.00,
    subtotal: 440.00,
    paymentMethod: "Yape / Plin"
  },
  {
    id: 8015,
    sessionName: "POS/2026/06/21-02",
    invoiceName: "B001-000434",
    client: "Clientes Varios",
    date: "2026-06-21 19:12:00",
    productName: "Teclado Mecánico RGB Switch Blue",
    qty: 8,
    priceUnit: 85.00,
    subtotal: 680.00,
    paymentMethod: "Efectivo"
  }
];

