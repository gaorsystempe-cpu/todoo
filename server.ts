import express from "express";
import path from "path";
import xmlrpc from "xmlrpc";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import odooProxyHandler from "./api/odoo-proxy";

dotenv.config();


const DB_FILE = path.join(process.cwd(), "local_supabase_db.json");

function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to local database:", err);
  }
}

function getDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      if (!data.users) {
        data.users = [
          { username: "demo@gaorsystem.pe", password: "demo", name: "Demo User", role: "user" },
          { username: "soporte@facturaclic.pe", password: "Luis2021.", name: "Luis Soporte", role: "admin" }
        ];
        saveDB(data);
      } else {
        // Also update existing user in memory if they have the old email
        const oldIndex = data.users.findIndex((u: any) => u.username === "lsoporte@facturaclic.pe");
        if (oldIndex !== -1) {
          data.users[oldIndex].username = "soporte@facturaclic.pe";
          saveDB(data);
        }
      }
      return data;
    } catch (e) {
      console.error("Error parsing DB, recreating:", e);
    }
  }

  const initialData = {
    users: [
      { username: "demo@gaorsystem.pe", password: "demo", name: "Demo User", role: "user" },
      { username: "soporte@facturaclic.pe", password: "Luis2021.", name: "Luis Soporte", role: "admin" }
    ],
    rules: [
      { productId: 101, type: "percentage", value: 3 },
      { productId: 102, type: "percentage", value: 4 },
      { productId: 103, type: "flat", value: 5 },
      { productId: 105, type: "percentage", value: 5 },
      { productId: 108, type: "flat", value: 10 }
    ],
    products: [
      { id: 101, display_name: "[PROD001] Laptop UltraSlim 15\" Intel Core i7", default_code: "PROD001", list_price: 1250.00 },
      { id: 102, display_name: "[PROD002] Monitor Curvo Gamer 34\" QuadHD", default_code: "PROD002", list_price: 480.00 },
      { id: 103, display_name: "[PROD003] Teclado Mecánico RGB Switch Blue", default_code: "PROD003", list_price: 85.00 },
      { id: 104, display_name: "[PROD004] Mouse Ergonómico Inalámbrico Silent", default_code: "PROD004", list_price: 45.00 },
      { id: 105, display_name: "[PROD005] Licencia Anual ERP Custom Premium", default_code: "PROD005", list_price: 2500.00 },
      { id: 106, display_name: "[PROD006] Servicio de Instalación y Soporte Técnico", default_code: "PROD006", list_price: 150.00 },
      { id: 107, display_name: "[PROD007] Auriculares Premium Noise Cancelling", default_code: "PROD007", list_price: 220.00 },
      { id: 108, display_name: "[PROD008] Disco Duro Externo SSD NVMe 2TB", default_code: "PROD008", list_price: 180.00 },
      { id: 109, display_name: "[PROD009] Cámara Web 4K Pro Ultra Streaming", default_code: "PROD009", list_price: 120.00 }
    ],
    orders: [
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
    ],
    orderLines: [
      { id: 2001, order_id: [501, "SO001"], product_id: [101, "Laptop UltraSlim 15\" Intel Core i7"], product_uom_qty: 2, price_unit: 1250.00, price_subtotal: 2500.00 },
      { id: 2002, order_id: [501, "SO001"], product_id: [102, "Monitor Curvo Gamer 34\" QuadHD"], product_uom_qty: 1, price_unit: 480.00, price_subtotal: 480.00 },
      { id: 2003, order_id: [502, "SO002"], product_id: [101, "Laptop UltraSlim 15\" Intel Core i7"], product_uom_qty: 3, price_unit: 1250.00, price_subtotal: 3750.00 },
      { id: 2004, order_id: [502, "SO002"], product_id: [102, "Monitor Curvo Gamer 34\" QuadHD"], product_uom_qty: 2, price_unit: 480.00, price_subtotal: 960.00 },
      { id: 2005, order_id: [502, "SO002"], product_id: [103, "Teclado Mecánico RGB Switch Blue"], product_uom_qty: 3, price_unit: 85.00, price_subtotal: 255.00 },
      { id: 2006, order_id: [502, "SO002"], product_id: [104, "Mouse Ergonómico Inalámbrico Silent"], product_uom_qty: 3, price_unit: 45.00, price_subtotal: 155.00 },
      { id: 2007, order_id: [503, "SO003"], product_id: [102, "Monitor Curvo Gamer 34\" QuadHD"], product_uom_qty: 2, price_unit: 480.00, price_subtotal: 960.00 },
      { id: 2008, order_id: [503, "SO003"], product_id: [103, "Teclado Mecánico RGB Switch Blue"], product_uom_qty: 3, price_unit: 85.00, price_subtotal: 255.00 },
      { id: 2009, order_id: [503, "SO003"], product_id: [108, "Disco Duro Externo SSD NVMe 2TB"], product_uom_qty: 1, price_unit: 180.00, price_subtotal: 180.00 },
      { id: 2010, order_id: [504, "SO004"], product_id: [101, "Laptop UltraSlim 15\" Intel Core i7"], product_uom_qty: 2, price_unit: 1250.00, price_subtotal: 2500.00 },
      { id: 2011, order_id: [504, "SO004"], product_id: [106, "Servicio de Instalación y Soporte Técnico"], product_uom_qty: 1, price_unit: 150.00, price_subtotal: 150.00 },
      { id: 2012, order_id: [505, "SO005"], product_id: [103, "Teclado Mecánico RGB Switch Blue"], product_uom_qty: 2, price_unit: 85.00, price_subtotal: 170.00 },
      { id: 2013, order_id: [505, "SO005"], product_id: [104, "Mouse Ergonómico Inalámbrico Silent"], product_uom_qty: 3, price_unit: 45.00, price_subtotal: 135.00 },
      { id: 2014, order_id: [505, "SO005"], product_id: [109, "Cámara Web 4K Pro Ultra Streaming"], product_uom_qty: 1, price_unit: 110.00, price_subtotal: 110.00 },
      { id: 2015, order_id: [506, "SO006"], product_id: [101, "Laptop UltraSlim 15\" Intel Core i7"], product_uom_qty: 2, price_unit: 1250.00, price_subtotal: 2500.00 },
      { id: 2016, order_id: [506, "SO006"], product_id: [102, "Monitor Curvo Gamer 34\" QuadHD"], product_uom_qty: 2, price_unit: 480.00, price_subtotal: 960.00 },
      { id: 2017, order_id: [506, "SO006"], product_id: [107, "Auriculares Premium Noise Cancelling"], product_uom_qty: 1, price_unit: 210.00, price_subtotal: 210.00 },
      { id: 2018, order_id: [507, "SO007"], product_id: [105, "Licencia Anual ERP Custom Premium"], product_uom_qty: 1, price_unit: 2500.00, price_subtotal: 2500.00 },
      { id: 2019, order_id: [508, "SO008"], product_id: [107, "Auriculares Premium Noise Cancelling"], product_uom_qty: 2, price_unit: 220.00, price_subtotal: 440.00 },
      { id: 2020, order_id: [508, "SO008"], product_id: [106, "Servicio de Instalación y Soporte Técnico"], product_uom_qty: 1, price_unit: 50.00, price_subtotal: 50.00 },
      { id: 2021, order_id: [509, "SO009"], product_id: [101, "Laptop UltraSlim 15\" Intel Core i7"], product_uom_qty: 1, price_unit: 1250.00, price_subtotal: 1250.00 },
      { id: 2022, order_id: [509, "SO009"], product_id: [107, "Auriculares Premium Noise Cancelling"], product_uom_qty: 1, price_unit: 220.00, price_subtotal: 220.00 },
      { id: 2023, order_id: [509, "SO009"], product_id: [104, "Mouse Ergonómico Inalámbrico Silent"], product_uom_qty: 1, price_unit: 45.00, price_subtotal: 45.00 },
      { id: 2024, order_id: [510, "SO011"], product_id: [105, "Licencia Anual ERP Custom Premium"], product_uom_qty: 2, price_unit: 2500.00, price_subtotal: 5000.00 },
      { id: 2025, order_id: [510, "SO011"], product_id: [108, "Disco Duro Externo SSD NVMe 2TB"], product_uom_qty: 2, price_unit: 180.00, price_subtotal: 360.00 },
      { id: 2026, order_id: [510, "SO011"], product_id: [106, "Servicio de Instalación y Soporte Técnico"], product_uom_qty: 1, price_unit: 50.00, price_subtotal: 50.00 },
      { id: 2027, order_id: [511, "SO012"], product_id: [101, "Laptop UltraSlim 15\" Intel Core i7"], product_uom_qty: 1, price_unit: 1250.00, price_subtotal: 1250.00 },
      { id: 2028, order_id: [511, "SO012"], product_id: [102, "Monitor Curvo Gamer 34\" QuadHD"], product_uom_qty: 1, price_unit: 370.00, price_subtotal: 370.00 },
      { id: 2029, order_id: [512, "SO013"], product_id: [105, "Licencia Anual ERP Custom Premium"], product_uom_qty: 3, price_unit: 2500.00, price_subtotal: 7500.00 }
    ],
    expiryAlerts: [
      { id: 1, productName: "Laptop UltraSlim 15\" Intel Core i7", defaultCode: "PROD001", lotNumber: "LOTE-LP-2026A", expiryDate: "2026-06-15", daysRemaining: -7, stockQty: 3, location: "Almacén Principal A-12", status: "expired" },
      { id: 2, productName: "Monitor Curvo Gamer 34\" QuadHD", defaultCode: "PROD002", lotNumber: "LOTE-MN-34Y2", expiryDate: "2026-07-15", daysRemaining: 23, stockQty: 8, location: "Almacén de Exhibición", status: "soon" },
      { id: 3, productName: "Teclado Mecánico RGB Switch Blue", defaultCode: "PROD003", lotNumber: "LOTE-KB-BLUE8", expiryDate: "2026-07-02", daysRemaining: 10, stockQty: 25, location: "Estante Pasadizo 4", status: "soon" },
      { id: 4, productName: "Mouse Ergonómico Inalámbrico Silent", defaultCode: "PROD004", lotNumber: "LOTE-MS-SIL03", expiryDate: "2026-07-20", daysRemaining: 28, stockQty: 40, location: "Caja de Reserva B", status: "soon" },
      { id: 5, productName: "Auriculares Premium Noise Cancelling", defaultCode: "PROD007", lotNumber: "LOTE-AUD-NC09", expiryDate: "2026-07-05", daysRemaining: 13, stockQty: 15, location: "Almacén Principal A-15", status: "soon" },
      { id: 6, productName: "Disco Duro Externo SSD NVMe 2TB", defaultCode: "PROD008", lotNumber: "LOTE-SSD-2TBX", expiryDate: "2026-09-12", daysRemaining: 82, stockQty: 12, location: "Estante Seguridad", status: "ok" },
      { id: 7, productName: "Cámara Web 4K Pro Ultra Streaming", defaultCode: "PROD009", lotNumber: "LOTE-CAM-4KPRO", expiryDate: "2026-10-30", daysRemaining: 130, stockQty: 20, location: "Almacén Principal B-2", status: "ok" }
    ],
    posReports: [
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
    ],
    posSessions: [
      { id: 1, name: "POS/2026/06/22-01", cashier: "Ana Ramos (Turno Mañana)", openingDate: "2026-06-22 08:00:00", closingDate: "2026-06-22 14:00:00", openingBalance: 200.00, closedAmount: 2620.00, totalRevenue: 2420.00, state: "Cerrado" },
      { id: 2, name: "POS/2026/06/22-02", cashier: "Pedro Solano (Turno Tarde)", openingDate: "2026-06-22 14:00:00", closingDate: "2026-06-22 21:00:00", openingBalance: 200.00, closedAmount: 2300.00, totalRevenue: 2100.00, state: "Cerrado" },
      { id: 3, name: "POS/2026/06/21-01", cashier: "Ana Ramos (Turno Mañana)", openingDate: "2026-06-21 08:00:00", closingDate: "2026-06-21 14:00:00", openingBalance: 150.00, closedAmount: 1950.00, totalRevenue: 1800.00, state: "Cerrado" },
      { id: 4, name: "POS/2026/06/21-02", cashier: "Pedro Solano (Turno Tarde)", openingDate: "2026-06-21 14:00:00", closingDate: "2026-06-21 21:00:00", openingBalance: 150.00, closedAmount: 2220.00, totalRevenue: 2070.00, state: "Cerrado" },
      { id: 5, name: "POS/2026/06/23-01", cashier: "Elena Castro (Turno Mañana)", openingDate: "2026-06-23 08:00:00", closingDate: "N/A", openingBalance: 200.00, closedAmount: 0.00, totalRevenue: 1450.00, state: "Abierto" }
    ],
    posTransactions: [
      { id: 8001, sessionName: "POS/2026/06/22-01", invoiceName: "B001-000452", client: "Carlos Villacorta Prado", date: "2026-06-22 09:15:22", productName: "Laptop UltraSlim 15\" Intel Core i7", qty: 1, priceUnit: 1250.00, subtotal: 1250.00, paymentMethod: "Yape / Plin" },
      { id: 8002, sessionName: "POS/2026/06/22-01", invoiceName: "B001-000453", client: "María de la Cruz Rojas", date: "2026-06-22 10:24:05", productName: "Teclado Mecánico RGB Switch Blue", qty: 2, priceUnit: 85.00, subtotal: 170.00, paymentMethod: "Efectivo" },
      { id: 8003, sessionName: "POS/2026/06/22-01", invoiceName: "F001-000189", client: "Inversiones San José S.A.C.", date: "2026-06-22 11:42:18", productName: "Monitor Curvo Gamer 34\" QuadHD", qty: 2, priceUnit: 480.00, subtotal: 960.00, paymentMethod: "Tarjeta de Crédito/Débito" },
      { id: 8004, sessionName: "POS/2026/06/22-01", invoiceName: "B001-000454", client: "José Luis Neyra", date: "2026-06-22 13:10:50", productName: "Mouse Ergonómico Inalámbrico Silent", qty: 1, priceUnit: 40.00, subtotal: 40.00, paymentMethod: "Yape / Plin" },
      { id: 8005, sessionName: "POS/2026/06/22-02", invoiceName: "B001-000455", client: "Alejandra Gómez Reyna", date: "2026-06-22 15:05:11", productName: "Laptop UltraSlim 15\" Intel Core i7", qty: 1, priceUnit: 1250.00, subtotal: 1250.00, paymentMethod: "Tarjeta de Crédito/Débito" },
      { id: 8006, sessionName: "POS/2026/06/22-02", invoiceName: "B001-000456", client: "Piero Alarcón Sifuentes", date: "2026-06-22 16:40:55", productName: "Monitor Curvo Gamer 34\" QuadHD", qty: 1, priceUnit: 480.00, subtotal: 480.00, paymentMethod: "Yape / Plin" },
      { id: 8007, sessionName: "POS/2026/06/22-02", invoiceName: "B001-000457", client: "Clientes Varios", date: "2026-06-22 18:20:30", productName: "Teclado Mecánico RGB Switch Blue", qty: 3, priceUnit: 85.00, subtotal: 255.00, paymentMethod: "Efectivo" },
      { id: 8008, sessionName: "POS/2026/06/22-02", invoiceName: "B001-000458", client: "Raúl Benavente", date: "2026-06-22 19:45:12", productName: "Mouse Ergonómico Inalámbrico Silent", qty: 2, priceUnit: 45.00, subtotal: 90.00, paymentMethod: "Efectivo" },
      { id: 8009, sessionName: "POS/2026/06/22-02", invoiceName: "B001-000459", client: "Clientes Varios", date: "2026-06-22 20:30:11", productName: "Servicio de Instalación y Soporte Técnico", qty: 1, priceUnit: 25.00, subtotal: 25.00, paymentMethod: "Yape / Plin" },
      { id: 8010, sessionName: "POS/2026/06/21-01", invoiceName: "B001-000430", client: "Diana Cáceres Wong", date: "2026-06-21 09:40:22", productName: "Monitor Curvo Gamer 34\" QuadHD", qty: 2, priceUnit: 480.00, subtotal: 960.00, paymentMethod: "Yape / Plin" },
      { id: 8011, sessionName: "POS/2026/06/21-01", invoiceName: "B001-000431", client: "Marcos Sandoval Ruiz", date: "2026-06-21 11:15:10", productName: "Auriculares Premium Noise Cancelling", qty: 3, priceUnit: 220.00, subtotal: 660.00, paymentMethod: "Tarjeta de Crédito/Débito" },
      { id: 8012, sessionName: "POS/2026/06/21-01", invoiceName: "B001-000432", client: "Clientes Varios", date: "2026-06-21 13:20:00", productName: "Teclado Mecánico RGB Switch Blue", qty: 2, priceUnit: 85.00, subtotal: 170.00, paymentMethod: "Efectivo" },
      { id: 8013, sessionName: "POS/2026/06/21-02", invoiceName: "F001-000175", client: "Tecnologías del Pacífico S.A.C.", date: "2026-06-21 15:10:45", productName: "Monitor Curvo Gamer 34\" QuadHD", qty: 2, priceUnit: 480.00, subtotal: 960.00, paymentMethod: "Tarjeta de Crédito/Débito" },
      { id: 8014, sessionName: "POS/2026/06/21-02", invoiceName: "B001-000433", client: "Gisela Ponce Ortiz", date: "2026-06-21 17:35:19", productName: "Auriculares Premium Noise Cancelling", qty: 2, priceUnit: 220.00, subtotal: 440.00, paymentMethod: "Yape / Plin" },
      { id: 8015, sessionName: "POS/2026/06/21-02", invoiceName: "B001-000434", client: "Clientes Varios", date: "2026-06-21 19:12:00", productName: "Teclado Mecánico RGB Switch Blue", qty: 8, priceUnit: 85.00, subtotal: 680.00, paymentMethod: "Efectivo" }
    ]
  };

  saveDB(initialData);
  return initialData;
}

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseSchema = process.env.SUPABASE_SCHEMA || "todoo_control";

let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      db: {
        schema: supabaseSchema
      }
    });
    console.log(`[Supabase] Inicializado exitosamente para URL: ${supabaseUrl}, esquema: ${supabaseSchema}`);
  } catch (err) {
    console.error("[Supabase] Error al inicializar cliente:", err);
  }
} else {
  console.log("[Supabase] Credenciales no detectadas. Usando almacenamiento JSON local.");
}

async function getDBAsync(): Promise<any> {
  const localData = getDB();

  if (!supabase) {
    return localData;
  }

  try {
    const [
      rRules,
      rProducts,
      rOrders,
      rOrderLines,
      rExpiryAlerts,
      rPosReports,
      rPosSessions,
      rPosTransactions
    ] = await Promise.all([
      supabase.from("commission_rules").select("*"),
      supabase.from("cached_products").select("*"),
      supabase.from("cached_sale_orders").select("*"),
      supabase.from("cached_sale_order_lines").select("*"),
      supabase.from("cached_expiry_alerts").select("*"),
      supabase.from("cached_pos_daily_reports").select("*"),
      supabase.from("cached_pos_sessions").select("*"),
      supabase.from("cached_pos_transactions").select("*")
    ]);

    const hasAuthError = [
      rRules, rProducts, rOrders, rOrderLines, rExpiryAlerts, rPosReports, rPosSessions, rPosTransactions
    ].some(res => res.error && (
      res.error.message?.includes("Invalid authentication credentials") || 
      res.error.message?.includes("invalid_cors") ||
      res.error.message?.includes("JWT") ||
      res.error.message?.includes("apiKey") ||
      res.error.status === 401 ||
      res.error.status === 403
    ));

    if (hasAuthError) {
      console.warn("[Supabase] Credenciales de autenticación inválidas o expiradas detectadas. Desactivando cliente de Supabase para evitar fallas e interrupciones. Se utilizará base de datos local.");
      supabase = null;
      return localData;
    }

    if (
      rRules.error ||
      rProducts.error ||
      rOrders.error ||
      rOrderLines.error ||
      rExpiryAlerts.error ||
      rPosReports.error ||
      rPosSessions.error ||
      rPosTransactions.error
    ) {
      console.warn(
        `[Supabase] Advertencia al consultar tablas en esquema "${supabaseSchema}". ¿Están creadas? Usando respaldo local. Detalles:`,
        {
          commission_rules: rRules.error?.message,
          cached_products: rProducts.error?.message,
          cached_sale_orders: rOrders.error?.message,
          cached_sale_order_lines: rOrderLines.error?.message,
          cached_expiry_alerts: rExpiryAlerts.error?.message,
          cached_pos_daily_reports: rPosReports.error?.message,
          cached_pos_sessions: rPosSessions.error?.message,
          cached_pos_transactions: rPosTransactions.error?.message
        }
      );
      return localData;
    }

    // Try fetching users separately so it doesn't break if table doesn't exist
    let remoteUsers = localData.users || [];
    try {
      const rUsers = await supabase.from("portal_users").select("*");
      if (!rUsers.error && rUsers.data) {
        remoteUsers = rUsers.data;
      }
    } catch (e) {
      console.log("[Supabase] Tabla portal_users no disponible remota, usando local.");
    }

    // Seeding if database schema exists but is empty
    if (rRules.data.length === 0 && rProducts.data.length === 0) {
      console.log("[Supabase] Tablas del esquema vacías. Sembrando datos locales...");
      await saveDBAsync(localData);
      return localData;
    }

    return {
      users: remoteUsers,
      rules: rRules.data || [],
      products: rProducts.data || [],
      orders: rOrders.data || [],
      orderLines: rOrderLines.data || [],
      expiryAlerts: rExpiryAlerts.data || [],
      posReports: rPosReports.data || [],
      posSessions: rPosSessions.data || [],
      posTransactions: rPosTransactions.data || []
    };
  } catch (err) {
    console.error("[Supabase] Error de consulta. Usando respaldo local:", err);
    return localData;
  }
}

async function saveDBAsync(data: any): Promise<void> {
  // Always save locally to ensure consistency
  saveDB(data);

  if (!supabase) {
    return;
  }

  try {
    if (!supabase) return;
    console.log("[Supabase] Guardando y sincronizando con la base de datos remota...");

    const checkErrorAndDisableIfNeeded = (error: any, context: string) => {
      if (!error) return;
      console.error(`[Supabase] Error en ${context}:`, error.message);
      if (
        error.message?.includes("Invalid authentication credentials") ||
        error.message?.includes("invalid_cors") ||
        error.message?.includes("JWT") ||
        error.message?.includes("apiKey") ||
        error.status === 401 ||
        error.status === 403
      ) {
        console.warn("[Supabase] Credenciales de autenticación inválidas detectadas durante sincronización. Desconectando Supabase.");
        supabase = null;
      }
    };

    const syncTable = async (tableName: string, rows: any[]) => {
      if (!supabase || !Array.isArray(rows)) return;
      if (rows.length === 0) {
        try {
          const { error } = await supabase.from(tableName).delete().neq("id", -9999);
          checkErrorAndDisableIfNeeded(error, `borrado tabla ${tableName}`);
        } catch (e: any) {
          console.warn(`[Supabase] Error al borrar en tabla ${tableName}:`, e.message || e);
        }
        return;
      }
      const { error } = await supabase.from(tableName).upsert(rows);
      checkErrorAndDisableIfNeeded(error, `tabla ${tableName}`);
    };

    const syncRules = async (rows: any[]) => {
      if (!supabase || !Array.isArray(rows)) return;
      if (rows.length === 0) {
        try {
          const { error } = await supabase.from("commission_rules").delete().neq("productId", -9999);
          checkErrorAndDisableIfNeeded(error, "borrado tabla commission_rules");
        } catch (e: any) {
          console.warn("[Supabase] Error al borrar en tabla commission_rules:", e.message || e);
        }
        return;
      }
      const { error } = await supabase.from("commission_rules").upsert(rows);
      checkErrorAndDisableIfNeeded(error, "tabla commission_rules");
    };

    const syncPosReports = async (rows: any[]) => {
      if (!supabase || !Array.isArray(rows)) return;
      if (rows.length === 0) {
        try {
          const { error } = await supabase.from("cached_pos_daily_reports").delete().neq("date", "1900-01-01");
          checkErrorAndDisableIfNeeded(error, "borrado tabla cached_pos_daily_reports");
        } catch (e: any) {
          console.warn("[Supabase] Error al borrar en tabla cached_pos_daily_reports:", e.message || e);
        }
        return;
      }
      const { error } = await supabase.from("cached_pos_daily_reports").upsert(rows);
      checkErrorAndDisableIfNeeded(error, "tabla cached_pos_daily_reports");
    };

    const syncUsers = async (rows: any[]) => {
      if (!supabase || !Array.isArray(rows)) return;
      try {
        if (rows.length === 0) {
          const { error } = await supabase.from("portal_users").delete().neq("username", "___none___");
          checkErrorAndDisableIfNeeded(error, "borrado tabla portal_users");
          return;
        }
        const { error } = await supabase.from("portal_users").upsert(rows);
        if (error) {
          if (error.message?.includes("relation") || error.message?.includes("does not exist")) {
            console.warn("[Supabase] Advertencia: tabla portal_users no creada en VPS remoto.");
          } else {
            checkErrorAndDisableIfNeeded(error, "tabla portal_users");
          }
        }
      } catch (e: any) {
        console.log("[Supabase] Error al sincronizar portal_users remota:", e.message || e);
      }
    };

    await Promise.all([
      syncRules(data.rules),
      syncTable("cached_products", data.products),
      syncTable("cached_sale_orders", data.orders),
      syncTable("cached_sale_order_lines", data.orderLines),
      syncTable("cached_expiry_alerts", data.expiryAlerts),
      syncPosReports(data.posReports),
      syncTable("cached_pos_sessions", data.posSessions),
      syncTable("cached_pos_transactions", data.posTransactions),
      syncUsers(data.users || [])
    ]);

    if (supabase) {
      console.log("[Supabase] Sincronización exitosa con el VPS.");
    }
  } catch (err) {
    console.error("[Supabase] Error general de sincronización:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Manual CORS middleware to allow external deployments (like Vercel) to call this backend
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Middleware to parse JSON bodies
  app.use(express.json({ limit: "50mb" }));

  // Logger middleware
  app.use((req, res, next) => {
    console.log(`[Odoo Server Incoming Request] ${req.method} ${req.url}`);
    next();
  });

  // Helper function to make XML-RPC calls to Odoo
  function makeOdooCall(
    url: string,
    path: string,
    method: string,
    params: any[]
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        let formattedUrl = url.trim();
        if (!/^https?:\/\//i.test(formattedUrl)) {
          formattedUrl = "https://" + formattedUrl;
        }

        let parsedUrl: URL;
        try {
          parsedUrl = new URL(formattedUrl);
        } catch (e) {
          return reject(new Error("Formato de URL inválido. Ingrese una dirección de Odoo válida (ej. odoo.miempresa.com o https://odoo.miempresa.com)."));
        }

        const isHttps = parsedUrl.protocol === "https:";
        const host = parsedUrl.hostname;
        const portString = parsedUrl.port;
        const port = portString ? parseInt(portString, 10) : (isHttps ? 443 : 80);

        // Prepend subdirectory path if configured in URL
        let finalPath = path;
        let urlPathname = parsedUrl.pathname;
        if (urlPathname && urlPathname !== "/") {
          if (urlPathname.endsWith("/")) {
            urlPathname = urlPathname.slice(0, -1);
          }
          if (urlPathname.startsWith("/")) {
            finalPath = urlPathname + path;
          } else {
            finalPath = "/" + urlPathname + path;
          }
        }

        const createClient = isHttps ? xmlrpc.createSecureClient : xmlrpc.createClient;
        const client = createClient({ 
          host, 
          port, 
          path: finalPath,
          rejectUnauthorized: false
        } as any);

        // Prevent Node process from crashing due to unhandled socket error event on xmlrpc client
        client.on("error", (err: any) => {
          console.error(`[Odoo XML-RPC Client Socket Error] method: ${method}:`, err.message || err);
        });

        client.methodCall(method, params, (err: any, value: any) => {
          if (err) {
            console.error(`Odoo XML-RPC error on method ${method}:`, err);
            return reject(err);
          }
          resolve(value);
        });
      } catch (err: any) {
        console.error("Error setting up XML-RPC client:", err);
        reject(err);
      }
    });
  }

  // API Route: Generic/High-level Odoo XML-RPC Proxy
  app.post("/api/odoo-proxy", odooProxyHandler);

  // API Route: Test Odoo Connection & List Available Companies
  app.post("/api/odoo/authenticate", async (req, res) => {
    const { url, db, username, password } = req.body;

    if (!url || !db || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos (URL, base de datos, usuario y contraseña/API Key) son obligatorios."
      });
    }

    try {
      console.log(`Intentando conectar a Odoo: ${url}, DB: ${db}, Usuario: ${username}`);
      
      // 1. Authenticate to get uid
      const uid = await makeOdooCall(url, "/xmlrpc/2/common", "authenticate", [
        db,
        username,
        password,
        {} // empty environment context
      ]);

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas. Por favor verifique el usuario, contraseña o base de datos."
        });
      }

      console.log(`Autenticación exitosa. UID recibido: ${uid}`);

      // 2. Fetch companies to allow target selection with robust fallback
      let companies: any[] = [];
      try {
        const result = await makeOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
          db,
          uid,
          password,
          "res.company",
          "search_read",
          [[]], // domain empty for all companies
          { fields: ["id", "name"] } // Avoid currency_id as it can fail due to permissions
        ]);
        if (Array.isArray(result)) {
          companies = result;
        } else {
          companies = [{ id: 1, name: "Compañía Principal (Odoo)" }];
        }
      } catch (compError: any) {
        console.warn("[Odoo] Falló la consulta de compañías. Usando compañía principal virtual:", compError.message || compError);
        companies = [{ id: 1, name: "Compañía Principal (Auto-detectada)" }];
      }

      return res.json({
        success: true,
        uid,
        companies
      });

    } catch (error: any) {
      console.error("Authentication helper error:", error);
      let errMsg = "Error de conexión con Odoo.";
      if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
        errMsg = "No se pudo contactar al servidor de Odoo. Verifique la URL y que no haya restricciones de red.";
      } else if (error.message) {
        errMsg = error.message;
      }
      return res.json({
        success: false,
        message: errMsg
      });
    }
  });

  // API Route: Fetch products & sales data filtered by Company ID
  app.post("/api/odoo/fetch-data", async (req, res) => {
    const { url, db, username, password, uid, companyId } = req.body;

    if (!url || !db || !username || !password || !uid || !companyId) {
      return res.status(400).json({
        success: false,
        message: "Faltan parámetros requeridos para la consulta de datos."
      });
    }

    try {
      const companyIdInt = parseInt(companyId, 10);
      const uidInt = parseInt(uid, 10);

      console.log(`Consiguiendo datos para la compañía ID: ${companyIdInt} en Odoo.`);

      const dbData = await getDBAsync();

      // 1. Fetch sellable products (to set commission rules in front-end)
      // product.product is preferred in Odoo for actual sellable SKU variants
      let products: any[] = [];
      try {
        console.log("Consultando productos...");
        const result = await makeOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
          db,
          uidInt,
          password,
          "product.product",
          "search_read",
          [[["sale_ok", "=", true]]],
          { fields: ["id", "display_name", "default_code", "list_price"] }
        ]);
        if (Array.isArray(result)) {
          products = result;
        } else {
          console.warn("[Odoo] No se devolvió un array de productos. Usando respaldo local.");
          products = dbData.products || [];
        }
      } catch (err: any) {
        console.warn("[Odoo] Fallo al consultar productos (product.product). Usando respaldo local:", err.message || err);
        products = dbData.products || [];
      }

      // 2. Fetch sales orders filtered by company & state (confirmed sales)
      let orders: any[] = [];
      try {
        console.log("Consultando órdenes de venta...");
        const result = await makeOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
          db,
          uidInt,
          password,
          "sale.order",
          "search_read",
          [[
            ["company_id", "=", companyIdInt],
            ["state", "in", ["sale", "done"]]
          ]],
          { fields: ["id", "name", "date_order", "user_id", "amount_total"] }
        ]);
        if (Array.isArray(result)) {
          orders = result;
        } else {
          console.warn("[Odoo] No se devolvió un array de órdenes de venta. Usando respaldo local.");
          orders = dbData.orders || [];
        }
      } catch (err: any) {
        console.warn("[Odoo] Fallo al consultar órdenes de venta (sale.order). Usando respaldo local:", err.message || err);
        orders = dbData.orders || [];
      }

      let orderLines: any[] = [];
      const odooOrders = Array.isArray(orders) ? orders : [];

      if (odooOrders.length > 0) {
        const orderIds = odooOrders.map((o: any) => o.id);
        console.log(`Se encontraron ${orderIds.length} órdenes. Consultando líneas de venta correspondientes...`);

        try {
          // 3. Fetch order lines for these orders
          const result = await makeOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
            db,
            uidInt,
            password,
            "sale.order.line",
            "search_read",
            [[["order_id", "in", orderIds]]],
            { fields: ["id", "order_id", "product_id", "product_uom_qty", "price_unit", "price_subtotal"] }
          ]);
          if (Array.isArray(result)) {
            orderLines = result;
          } else {
            orderLines = dbData.orderLines || [];
          }
        } catch (err: any) {
          console.warn("[Odoo] Fallo al consultar líneas de venta (sale.order.line). Usando respaldo local:", err.message || err);
          orderLines = dbData.orderLines || [];
        }
      } else {
        console.log("No se encontraron órdenes de venta confirmadas para esta compañía.");
        orderLines = dbData.orderLines || [];
      }

      // 4. Try fetching Expiry dates from stock.production.lot or stock.lot using various potential fields and domains
      let expiryAlerts: any[] = [];
      const lotModels = ["stock.production.lot", "stock.lot"];
      const dateFields = ["expiration_date", "life_date", "use_date", "removal_date"];
      let lots: any[] = [];
      let activeModel = "";
      let activeField = "";

      for (const model of lotModels) {
        for (const field of dateFields) {
          // 4a. Try with company filter
          try {
            console.log(`Intentando buscar lotes en modelo '${model}' usando campo '${field}' con filtro de compañía...`);
            const result = await makeOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
              db,
              uidInt,
              password,
              model,
              "search_read",
              [[
                ["company_id", "=", companyIdInt],
                [field, "!=", false]
              ]],
              { fields: ["id", "name", "product_id", field, "product_qty", "product_uom_id"] }
            ]);

            if (Array.isArray(result)) {
              lots = result;
              activeModel = model;
              activeField = field;
              console.log(`Éxito en Odoo: se encontraron ${lots.length} lotes usando '${model}' y campo de fecha '${field}'.`);
              break;
            }
          } catch (err: any) {
            console.log(`Fallo consulta lotes con compañía para ${model} y ${field}: ${err.message || err}`);
          }

          // 4b. Try without company filter (in case company_id is not present or configured differently)
          if (lots.length === 0) {
            try {
              console.log(`Intentando buscar lotes en modelo '${model}' usando campo '${field}' sin filtro de compañía...`);
              const result = await makeOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
                db,
                uidInt,
                password,
                model,
                "search_read",
                [[[field, "!=", false]]],
                { fields: ["id", "name", "product_id", field, "product_qty", "product_uom_id"] }
              ]);

              if (Array.isArray(result)) {
                lots = result;
                activeModel = model;
                activeField = field;
                console.log(`Éxito en Odoo (sin compañía): se encontraron ${lots.length} lotes usando '${model}' y campo de fecha '${field}'.`);
                break;
              }
            } catch (err: any) {
              console.log(`Fallo consulta lotes sin compañía para ${model} y ${field}: ${err.message || err}`);
            }
          }
        }
        if (lots.length > 0) break;
      }

      // If no lots were found with a date filter, try fetching lots without date filter
      if (lots.length === 0) {
        for (const model of lotModels) {
          // 4c. Generic search with company filter
          try {
            console.log(`Intentando buscar lotes genéricos en '${model}' con filtro de compañía...`);
            const result = await makeOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
              db,
              uidInt,
              password,
              model,
              "search_read",
              [[["company_id", "=", companyIdInt]]],
              { fields: ["id", "name", "product_id", "product_qty", "product_uom_id"] }
            ]);

            if (Array.isArray(result) && result.length > 0) {
              lots = result;
              activeModel = model;
              activeField = ""; // No active date field
              console.log(`Éxito: se encontraron ${lots.length} lotes genéricos en '${model}'.`);
              break;
            }
          } catch (err: any) {
            console.log(`Fallo consulta lotes genéricos con compañía en ${model}: ${err.message || err}`);
          }

          // 4d. Generic search without company filter
          if (lots.length === 0) {
            try {
              console.log(`Intentando buscar lotes genéricos en '${model}' sin ningún filtro...`);
              const result = await makeOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
                db,
                uidInt,
                password,
                model,
                "search_read",
                [[]],
                { fields: ["id", "name", "product_id", "product_qty", "product_uom_id"] }
              ]);

              if (Array.isArray(result) && result.length > 0) {
                lots = result;
                activeModel = model;
                activeField = ""; // No active date field
                console.log(`Éxito: se encontraron ${lots.length} lotes genéricos en '${model}' sin filtros.`);
                break;
              }
            } catch (err: any) {
              console.log(`Fallo consulta lotes genéricos sin filtros en ${model}: ${err.message || err}`);
            }
          }
        }
      }

      try {
        if (Array.isArray(lots) && lots.length > 0) {
          const now = new Date();
          expiryAlerts = lots.map((lot: any) => {
            const rawDate = activeField ? lot[activeField] : null;
            // Default to 60 days in future if no expiration date is available
            const expDate = rawDate ? new Date(rawDate) : new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
            const diffTime = expDate.getTime() - now.getTime();
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            let status: "expired" | "soon" | "ok" = "ok";
            if (daysRemaining <= 0) {
              status = "expired";
            } else if (daysRemaining <= 30) {
              status = "soon";
            }
            return {
              id: lot.id,
              productName: Array.isArray(lot.product_id) ? lot.product_id[1] : "Producto Odoo",
              defaultCode: lot.product_id ? `PROD-${lot.product_id[0]}` : "SN",
              lotNumber: lot.name,
              expiryDate: (rawDate && typeof rawDate === "string") ? rawDate.split(" ")[0] : "Sin fecha",
              daysRemaining,
              stockQty: lot.product_qty || 0,
              location: "Almacén Odoo Sede " + companyIdInt,
              status
            };
          });
        }
      } catch (err) {
        console.error("Error al mapear datos de alertas de vencimiento de Odoo:", err);
      }

      // 5. Try fetching POS daily summaries from pos.order
      let posReports: any[] = [];
      try {
        console.log("Buscando órdenes pos.order...");
        const posOrders = await makeOdooCall(url, "/xmlrpc/2/object", "execute_kw", [
          db,
          uidInt,
          password,
          "pos.order",
          "search_read",
          [[
            ["company_id", "=", companyIdInt],
            ["state", "in", ["paid", "done", "invoiced"]]
          ]],
          { fields: ["id", "name", "date_order", "amount_total", "lines", "invoice_id"] }
        ]);

        if (Array.isArray(posOrders) && posOrders.length > 0) {
          // Group by day format YYYY-MM-DD
          const dailyGroups: { [date: string]: any[] } = {};
          posOrders.forEach((order: any) => {
            const dateStr = order.date_order ? order.date_order.split(" ")[0] : new Date().toISOString().split("T")[0];
            if (!dailyGroups[dateStr]) dailyGroups[dateStr] = [];
            dailyGroups[dateStr].push(order);
          });

          posReports = Object.keys(dailyGroups).sort((a,b) => b.localeCompare(a)).slice(0, 5).map((date) => {
            const groupOrders = dailyGroups[date];
            const totalSales = groupOrders.reduce((sum, o) => sum + (o.amount_total || 0), 0);
            
            // Build coherent metrics from pos.order
            const invoicesCount = groupOrders.filter(o => o.invoice_id).length;
            const boletasCount = groupOrders.length - invoicesCount;
            const invoiceAmount = groupOrders.filter(o => o.invoice_id).reduce((sum, o) => sum + (o.amount_total || 0), 0);
            const boletaAmount = totalSales - invoiceAmount;

            return {
              date,
              totalSales,
              payments: [
                { method: "Efectivo", amount: parseFloat((totalSales * 0.35).toFixed(2)) },
                { method: "Yape / Plin", amount: parseFloat((totalSales * 0.40).toFixed(2)) },
                { method: "Tarjeta de Crédito/Débito", amount: parseFloat((totalSales * 0.25).toFixed(2)) }
              ],
              products: [
                { id: 999, name: "Varios POS", code: "POSV", qty: groupOrders.length, amount: totalSales }
              ],
              documents: [
                { type: "Boleta de Venta Electrónica", count: boletasCount || 1, amount: parseFloat(boletaAmount.toFixed(2)) },
                { type: "Factura Electrónica", count: invoicesCount || 1, amount: parseFloat(invoiceAmount.toFixed(2)) }
              ]
            };
          });
        }
      } catch (err) {
        console.log("No se pudo consultar pos.order. Se usarán datos cargados.");
      }

      // Merge into local DB
      dbData.products = Array.isArray(products) ? products : dbData.products;
      dbData.orders = odooOrders.length > 0 ? odooOrders : dbData.orders;
      dbData.orderLines = Array.isArray(orderLines) ? orderLines : dbData.orderLines;
      dbData.expiryAlerts = expiryAlerts.length > 0 ? expiryAlerts : dbData.expiryAlerts;
      dbData.posReports = posReports.length > 0 ? posReports : dbData.posReports;

      // If we got POS reports/orders, we can dynamically mock realistic sessions and transactions mapped to them!
      if (posReports.length > 0) {
        const sessions: any[] = [];
        const txs: any[] = [];
        let txId = 9001;
        posReports.forEach((rep: any, idx: number) => {
          const dateStr = rep.date;
          // Create 2 sessions per day
          const morningSess = {
            id: idx * 2 + 1,
            name: `POS/${dateStr.replace(/-/g, "/")}-01`,
            cashier: "Ana Ramos (Turno Mañana)",
            openingDate: `${dateStr} 08:00:00`,
            closingDate: `${dateStr} 14:00:00`,
            openingBalance: 150.00,
            closedAmount: 150.00 + (rep.totalSales * 0.5),
            totalRevenue: rep.totalSales * 0.5,
            state: "Cerrado"
          };
          const afternoonSess = {
            id: idx * 2 + 2,
            name: `POS/${dateStr.replace(/-/g, "/")}-02`,
            cashier: "Pedro Solano (Turno Tarde)",
            openingDate: `${dateStr} 14:00:00`,
            closingDate: `${dateStr} 21:00:00`,
            openingBalance: 150.00,
            closedAmount: 150.00 + (rep.totalSales * 0.5),
            totalRevenue: rep.totalSales * 0.5,
            state: "Cerrado"
          };
          sessions.push(morningSess, afternoonSess);

          // Create some sample transactions for each session
          const methods = ["Efectivo", "Yape / Plin", "Tarjeta de Crédito/Débito"];
          rep.products.forEach((p: any, pIdx: number) => {
            const sessName = pIdx % 2 === 0 ? morningSess.name : afternoonSess.name;
            txs.push({
              id: txId++,
              sessionName: sessName,
              invoiceName: pIdx % 2 === 0 ? `B001-000${450 + txId % 100}` : `F001-000${180 + txId % 100}`,
              client: pIdx % 3 === 0 ? "Juan Pérez Alvarado" : (pIdx % 3 === 1 ? "Inversiones del Norte" : "Clientes Varios"),
              date: `${dateStr} ${10 + (pIdx % 8)}:${10 + (pIdx % 45)}:00`,
              productName: p.name,
              qty: p.qty,
              priceUnit: p.amount / p.qty,
              subtotal: p.amount,
              paymentMethod: methods[pIdx % 3]
            });
          });
        });
        dbData.posSessions = sessions;
        dbData.posTransactions = txs;
      }

      await saveDBAsync(dbData);

      return res.json({
        success: true,
        products: dbData.products,
        orders: dbData.orders,
        orderLines: dbData.orderLines,
        expiryAlerts: dbData.expiryAlerts,
        posReports: dbData.posReports,
        posSessions: dbData.posSessions,
        posTransactions: dbData.posTransactions
      });

    } catch (error: any) {
      console.error("Error fetching Odoo data:", error);
      return res.json({
        success: false,
        message: error.message || "Error al descargar datos de Odoo. Verifique los permisos del usuario."
      });
    }
  });

  // API Route: Get local Supabase-like DB data
  app.get("/api/db/get-data", async (req, res) => {
    const db = await getDBAsync();
    res.json({
      success: true,
      rules: db.rules,
      products: db.products,
      orders: db.orders,
      orderLines: db.orderLines,
      expiryAlerts: db.expiryAlerts,
      posReports: db.posReports,
      posSessions: db.posSessions,
      posTransactions: db.posTransactions
    });
  });

  // API Route: Secure Portal Login (supports soporte@facturaclic.pe and custom database users)
  app.post("/api/portal/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Usuario y contraseña requeridos." });
    }

    try {
      const db = await getDBAsync();
      const user = db && Array.isArray(db.users) ? db.users.find(
        (u: any) => u && typeof u.username === "string" && u.username.toLowerCase().trim() === username.toLowerCase().trim() && u.password === password
      ) : null;

      if (user) {
        return res.json({
          success: true,
          user: {
            username: user.username,
            name: user.name,
            role: user.role,
            odoo_partner_id: user.odoo_partner_id
          }
        });
      }

      // Default system fallback administrator
      if (username.toLowerCase().trim() === "soporte@facturaclic.pe" && password === "Luis2021.") {
        return res.json({
          success: true,
          user: {
            username: "soporte@facturaclic.pe",
            name: "Luis Soporte (Admin)",
            role: "admin"
          }
        });
      }

      // Default system fallback demo user
      if (username.toLowerCase().trim() === "demo@gaorsystem.pe" && password === "demo") {
        return res.json({
          success: true,
          user: {
            username: "demo@gaorsystem.pe",
            name: "Demo User (Pruebas)",
            role: "user"
          }
        });
      }
    } catch (e: any) {
      console.error("[Login Route Error]:", e);
      return res.status(500).json({
        success: false,
        message: `Error interno de servidor: ${e.message || e}`
      });
    }

    return res.status(401).json({
      success: false,
      message: "Credenciales de acceso incorrectas. Por favor verifique e intente nuevamente."
    });
  });

  // API Route: Get all portal users
  app.get("/api/db/get-users", async (req, res) => {
    const db = await getDBAsync();
    res.json({ success: true, users: db.users || [] });
  });

  // API Route: Save/Update portal user
  app.post("/api/db/save-user", async (req, res) => {
    const { username, password, name, role, odoo_partner_id } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: "Parámetros incompletos." });
    }

    const db = await getDBAsync();
    if (!db.users) db.users = [];

    const existingIndex = db.users.findIndex((u: any) => u.username.toLowerCase().trim() === username.toLowerCase().trim());
    const newUser = {
      username: username.toLowerCase().trim(),
      password,
      name,
      role: role || "user",
      odoo_partner_id: odoo_partner_id ? parseInt(odoo_partner_id, 10) : null
    };

    if (existingIndex >= 0) {
      db.users[existingIndex] = newUser;
    } else {
      db.users.push(newUser);
    }

    await saveDBAsync(db);
    res.json({ success: true, users: db.users });
  });

  // API Route: Remove portal user
  app.post("/api/db/remove-user", async (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, message: "username es requerido." });
    }

    const db = await getDBAsync();
    if (!db.users) db.users = [];

    db.users = db.users.filter((u: any) => u.username.toLowerCase().trim() !== username.toLowerCase().trim());
    await saveDBAsync(db);

    res.json({ success: true, users: db.users });
  });

  // API Route: Save/Update a commission rule in local DB
  app.post("/api/db/save-rule", async (req, res) => {
    const { productId, type, value } = req.body;
    if (!productId || !type || value === undefined) {
      return res.status(400).json({ success: false, message: "Parámetros incompletos." });
    }

    const db = await getDBAsync();
    const existingIndex = db.rules.findIndex((r: any) => r.productId === productId);
    if (existingIndex >= 0) {
      db.rules[existingIndex] = { productId, type, value: parseFloat(value) };
    } else {
      db.rules.push({ productId, type, value: parseFloat(value) });
    }
    await saveDBAsync(db);

    res.json({ success: true, rules: db.rules });
  });

  // API Route: Remove a commission rule
  app.post("/api/db/remove-rule", async (req, res) => {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "productId es requerido." });
    }

    const db = await getDBAsync();
    db.rules = db.rules.filter((r: any) => r.productId !== productId);
    await saveDBAsync(db);

    res.json({ success: true, rules: db.rules });
  });

  // API Route: Reset DB to defaults
  app.post("/api/db/reset", async (req, res) => {
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }

    if (supabase) {
      try {
        console.log("[Supabase] Reseteando tablas en el VPS...");
        await Promise.all([
          supabase.from("commission_rules").delete().neq("productId", -9999),
          supabase.from("cached_products").delete().neq("id", -9999),
          supabase.from("cached_sale_orders").delete().neq("id", -9999),
          supabase.from("cached_sale_order_lines").delete().neq("id", -9999),
          supabase.from("cached_expiry_alerts").delete().neq("id", -9999),
          supabase.from("cached_pos_daily_reports").delete().neq("date", "1900-01-01"),
          supabase.from("cached_pos_sessions").delete().neq("id", -9999),
          supabase.from("cached_pos_transactions").delete().neq("id", -9999)
        ]);
      } catch (err) {
        console.error("[Supabase] Error al limpiar tablas remotas en reset:", err);
      }
    }

    const db = await getDBAsync();
    res.json({
      success: true,
      rules: db.rules,
      products: db.products,
      orders: db.orders,
      orderLines: db.orderLines,
      expiryAlerts: db.expiryAlerts,
      posReports: db.posReports,
      posSessions: db.posSessions,
      posTransactions: db.posTransactions
    });
  });

  // Vite development / production setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Odoo system] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Odoo commission server:", err);
});
