-- ====================================================================
-- SCRIPT DE CREACIÓN DE TABLAS EN SUPABASE PARA TODOO CONTROL
-- ====================================================================
-- Este script permite crear las tablas necesarias para sincronizar Odoo con Supabase.
-- 
-- Elija UNA de las siguientes dos opciones para ejecutar en el Editor SQL de Supabase:
-- ====================================================================

-- ====================================================================
-- OPCIÓN A: ESQUEMA POR DEFECTO "public" (RECOMENDADO Y MÁS SENCILLO)
-- Use esta opción si no quiere lidiar con configuraciones adicionales de API en Supabase.
-- Nota: Si usa esta opción, asegúrese de que en su archivo .env.example
-- o variables de entorno del servidor, SUPABASE_SCHEMA esté vacío o configurado como "public".
-- ====================================================================

-- 1. Tabla de Reglas de Comisión
CREATE TABLE IF NOT EXISTS public."rules" (
  "productId" INT PRIMARY KEY,
  "type" VARCHAR(50) NOT NULL, -- 'percentage' o 'flat'
  "value" NUMERIC NOT NULL
);

-- 2. Tabla de Productos
CREATE TABLE IF NOT EXISTS public."products" (
  "id" INT PRIMARY KEY,
  "display_name" TEXT,
  "default_code" TEXT,
  "list_price" NUMERIC
);

-- 3. Tabla de Órdenes de Venta
CREATE TABLE IF NOT EXISTS public."orders" (
  "id" INT PRIMARY KEY,
  "name" VARCHAR(100),
  "date_order" TEXT,
  "user_id" JSONB, -- [id, nombre]
  "amount_total" NUMERIC
);

-- 4. Tabla de Detalles de Líneas de Órdenes
CREATE TABLE IF NOT EXISTS public."orderLines" (
  "id" INT PRIMARY KEY,
  "order_id" JSONB, -- [id, nombre]
  "product_id" JSONB, -- [id, nombre]
  "product_uom_qty" NUMERIC,
  "price_unit" NUMERIC,
  "price_subtotal" NUMERIC
);

-- 5. Tabla de Alertas de Caducidad
CREATE TABLE IF NOT EXISTS public."expiryAlerts" (
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

-- 6. Tabla de Resúmenes Diarios POS
CREATE TABLE IF NOT EXISTS public."posReports" (
  "date" TEXT PRIMARY KEY,
  "totalSales" NUMERIC,
  "payments" JSONB,
  "products" JSONB,
  "documents" JSONB
);

-- 7. Tabla de Sesiones de Caja POS
CREATE TABLE IF NOT EXISTS public."posSessions" (
  "id" INT PRIMARY KEY,
  "name" VARCHAR(100),
  "cashier" TEXT,
  "openingDate" TEXT,
  "closingDate" TEXT,
  "openingBalance" NUMERIC,
  "closedAmount" NUMERIC,
  "totalRevenue" NUMERIC,
  "state" VARCHAR(50)
);

-- 8. Tabla de Transacciones POS Detalladas
CREATE TABLE IF NOT EXISTS public."posTransactions" (
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

-- 9. Tabla de Usuarios del Portal
CREATE TABLE IF NOT EXISTS public."portal_users" (
  "username" VARCHAR(150) PRIMARY KEY,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" VARCHAR(50) DEFAULT 'user',
  "odoo_partner_id" INT
);


-- ====================================================================
-- OPCIÓN B: ESQUEMA PERSONALIZADO "todoo_control" (AVANZADO)
-- Use esta opción SOLO si desea separar las tablas en un esquema propio.
-- IMPORTANTE: Para usar esta opción, debe ir a la Consola de Supabase ->
-- Project Settings -> API -> y en "Exposed schemas" agregar "todoo_control".
-- De lo contrario, las consultas fallarán con error de autenticación/esquema.
-- ====================================================================

/*
-- Descomente todo este bloque si prefiere usar el esquema personalizado todoo_control:

CREATE SCHEMA IF NOT EXISTS todoo_control;

CREATE TABLE IF NOT EXISTS todoo_control."rules" (
  "productId" INT PRIMARY KEY,
  "type" VARCHAR(50) NOT NULL,
  "value" NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS todoo_control."products" (
  "id" INT PRIMARY KEY,
  "display_name" TEXT,
  "default_code" TEXT,
  "list_price" NUMERIC
);

CREATE TABLE IF NOT EXISTS todoo_control."orders" (
  "id" INT PRIMARY KEY,
  "name" VARCHAR(100),
  "date_order" TEXT,
  "user_id" JSONB,
  "amount_total" NUMERIC
);

CREATE TABLE IF NOT EXISTS todoo_control."orderLines" (
  "id" INT PRIMARY KEY,
  "order_id" JSONB,
  "product_id" JSONB,
  "product_uom_qty" NUMERIC,
  "price_unit" NUMERIC,
  "price_subtotal" NUMERIC
);

CREATE TABLE IF NOT EXISTS todoo_control."expiryAlerts" (
  "id" INT PRIMARY KEY,
  "productName" TEXT,
  "defaultCode" TEXT,
  "lotNumber" TEXT,
  "expiryDate" TEXT,
  "daysRemaining" INT,
  "stockQty" NUMERIC,
  "location" TEXT,
  "status" VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS todoo_control."posReports" (
  "date" TEXT PRIMARY KEY,
  "totalSales" NUMERIC,
  "payments" JSONB,
  "products" JSONB,
  "documents" JSONB
);

CREATE TABLE IF NOT EXISTS todoo_control."posSessions" (
  "id" INT PRIMARY KEY,
  "name" VARCHAR(100),
  "cashier" TEXT,
  "openingDate" TEXT,
  "closingDate" TEXT,
  "openingBalance" NUMERIC,
  "closedAmount" NUMERIC,
  "totalRevenue" NUMERIC,
  "state" VARCHAR(50)
);

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

CREATE TABLE IF NOT EXISTS todoo_control."portal_users" (
  "username" VARCHAR(150) PRIMARY KEY,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" VARCHAR(50) DEFAULT 'user',
  "odoo_partner_id" INT
);
*/
