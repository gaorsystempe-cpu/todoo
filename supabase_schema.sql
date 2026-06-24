-- ====================================================================
-- SCRIPT DE CREACIÓN DE TABLAS EN SUPABASE PARA TODOO CONTROL
-- Ejecute este script en el editor SQL de su consola de Supabase.
-- ====================================================================

-- 1. Crear el esquema personalizado si no existe
CREATE SCHEMA IF NOT EXISTS todoo_control;

-- 2. Tabla de Reglas de Comisión
CREATE TABLE IF NOT EXISTS todoo_control."rules" (
  "productId" INT PRIMARY KEY,
  "type" VARCHAR(50) NOT NULL, -- 'percentage' o 'flat'
  "value" NUMERIC NOT NULL
);

-- 3. Tabla de Productos (caché sincronizada de Odoo)
CREATE TABLE IF NOT EXISTS todoo_control."products" (
  "id" INT PRIMARY KEY,
  "display_name" TEXT,
  "default_code" TEXT,
  "list_price" NUMERIC
);

-- 4. Tabla de Órdenes de Venta (sale.order de Odoo)
CREATE TABLE IF NOT EXISTS todoo_control."orders" (
  "id" INT PRIMARY KEY,
  "name" VARCHAR(100),
  "date_order" TEXT,
  "user_id" JSONB, -- Almacena la tupla de Odoo [id, nombre_usuario]
  "amount_total" NUMERIC
);

-- 5. Tabla de Detalles de Líneas de Órdenes (sale.order.line de Odoo)
CREATE TABLE IF NOT EXISTS todoo_control."orderLines" (
  "id" INT PRIMARY KEY,
  "order_id" JSONB, -- Tupla [id, nombre_orden]
  "product_id" JSONB, -- Tupla [id, nombre_producto]
  "product_uom_qty" NUMERIC,
  "price_unit" NUMERIC,
  "price_subtotal" NUMERIC
);

-- 6. Tabla de Alertas de Caducidad / Lotes (stock.production.lot de Odoo)
CREATE TABLE IF NOT EXISTS todoo_control."expiryAlerts" (
  "id" INT PRIMARY KEY,
  "productName" TEXT,
  "defaultCode" TEXT,
  "lotNumber" TEXT,
  "expiryDate" TEXT,
  "daysRemaining" INT,
  "stockQty" NUMERIC,
  "location" TEXT,
  "status" VARCHAR(50) -- 'expired', 'soon', 'ok'
);

-- 7. Tabla de Resúmenes Diarios POS (pos.order de Odoo agrupado por fecha)
CREATE TABLE IF NOT EXISTS todoo_control."posReports" (
  "date" TEXT PRIMARY KEY,
  "totalSales" NUMERIC,
  "payments" JSONB, -- Listado de métodos de pago con montos
  "products" JSONB, -- Listado de productos vendidos con cantidades
  "documents" JSONB -- Listado de boletas y facturas
);

-- 8. Tabla de Sesiones de Caja POS (pos.session de Odoo)
CREATE TABLE IF NOT EXISTS todoo_control."posSessions" (
  "id" INT PRIMARY KEY,
  "name" VARCHAR(100),
  "cashier" TEXT,
  "openingDate" TEXT,
  "closingDate" TEXT,
  "openingBalance" NUMERIC,
  "closedAmount" NUMERIC,
  "totalRevenue" NUMERIC,
  "state" VARCHAR(50) -- 'Cerrado' o 'Abierto'
);

-- 9. Tabla de Transacciones POS Detalladas
CREATE TABLE IF NOT EXISTS todoo_control."posTransactions" (
  "id" INT PRIMARY KEY,
  "sessionName" VARCHAR(100),
  "invoiceName" VARCHAR(100),
  "client" TEXT,
  "date" TEXT,
  "productName" TEXT,
  "qty" NUMERIC,
  "priceUnit" NUMERIC,
  "subtotal" NUMERIC,
  "paymentMethod" VARCHAR(100)
);

-- Habilitar RLS (Row Level Security) es opcional si se trabaja con Service Key.
-- Si desea mayor seguridad, puede configurar políticas personalizadas de acceso.
