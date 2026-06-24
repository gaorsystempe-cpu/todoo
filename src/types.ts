export interface OdooConnection {
  url: string;
  db: string;
  username: string;
  password?: string;
  uid?: number;
  companyId?: number;
  companyName?: string;
  isConnected: boolean;
  isDemoMode: boolean;
}

export interface OdooCompany {
  id: number;
  name: string;
  currency_id?: [number, string];
}

export interface OdooProduct {
  id: number;
  display_name: string;
  default_code?: string;
  list_price?: number;
}

export interface OdooSaleOrder {
  id: number;
  name: string;
  date_order: string;
  user_id: [number, string]; // [id, name]
  amount_total: number;
}

export interface OdooSaleOrderLine {
  id: number;
  order_id: [number, string]; // [id, name]
  product_id: [number, string]; // [id, name]
  product_uom_qty: number;
  price_unit: number;
  price_subtotal: number;
}

export interface CommissionRule {
  productId: number;
  type: "percentage" | "flat";
  value: number; // e.g. 10% or $15 flat
}

export interface ProductSoldDetail {
  id: number;
  name: string;
  code?: string;
  qtySold: number;
  revenue: number;
  commission: number;
  ruleType: "percentage" | "flat";
  ruleValue: number;
}

export interface CommissionLineDetail {
  orderId: number;
  orderName: string;
  date: string;
  productId: number;
  productName: string;
  qtySold: number;
  revenue: number;
  commission: number;
  ruleType: "percentage" | "flat";
  ruleValue: number;
}

export interface SalespersonSummary {
  id: number;
  name: string;
  totalSalesCount: number;
  totalRevenue: number;
  totalCommission: number;
  soldProducts: { [productId: number]: ProductSoldDetail };
  commissionLines: CommissionLineDetail[];
}

export interface OdooDataResponse {
  products: OdooProduct[];
  orders: OdooSaleOrder[];
  orderLines: OdooSaleOrderLine[];
}

export interface PosPaymentMethod {
  method: string;
  amount: number;
}

export interface PosProductSold {
  id: number;
  name: string;
  code?: string;
  qty: number;
  amount: number;
}

export interface PosDocumentSummary {
  type: string; // "Boleta", "Factura", "Nota de Venta", etc.
  count: number;
  amount: number;
}

export interface PosDailyReport {
  date: string;
  totalSales: number;
  payments: PosPaymentMethod[];
  products: PosProductSold[];
  documents: PosDocumentSummary[];
}

export interface PosSession {
  id: number;
  name: string;
  cashier: string;
  openingDate: string;
  closingDate: string;
  openingBalance: number;
  closedAmount: number; // Con cuánto cerró caja
  totalRevenue: number;
  state: "Abierto" | "Cerrado";
}

export interface PosTransactionDetail {
  id: number;
  sessionName: string;
  invoiceName: string; // Comprobante
  client: string; // Cliente
  date: string; // Fecha
  productName: string; // Producto
  qty: number;
  priceUnit: number;
  subtotal: number;
  paymentMethod: string; // Método de pago
}

export interface ExpiryAlert {
  id: number;
  productName: string;
  defaultCode?: string;
  lotNumber?: string;
  expiryDate: string;
  daysRemaining: number;
  stockQty: number;
  location?: string;
  status: "expired" | "soon" | "ok"; // soon = < 1 month
}

