import React, { useState } from "react";
import { PosDailyReport, PosSession, PosTransactionDetail } from "../types";
import { 
  DollarSign, 
  Tag, 
  FileText, 
  ShoppingBag, 
  Calendar, 
  ArrowRight, 
  Wallet, 
  TrendingUp, 
  RefreshCw, 
  Users, 
  Layers, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  ExternalLink 
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import * as XLSX from "xlsx";

interface PosDailySumProps {
  reports: PosDailyReport[];
  posSessions: PosSession[];
  posTransactions: PosTransactionDetail[];
  isDemoMode: boolean;
  onRefresh: () => void;
}

export default function PosDailySum({ 
  reports, 
  posSessions = [], 
  posTransactions = [], 
  isDemoMode, 
  onRefresh 
}: PosDailySumProps) {
  
  // Section Tabs: "summary" (Daily charts), "sessions" (Turns/Cash closure), "transactions" (Detailed logs)
  const [activeSubTab, setActiveSubTab] = useState<"summary" | "sessions" | "transactions">("summary");

  // State for Report Date Selector
  const [selectedDate, setSelectedDate] = useState<string>(
    reports.length > 0 ? reports[0].date : ""
  );

  // States for sessions filtering
  const [sessionSearch, setSessionSearch] = useState<string>("");
  const [sessionStateFilter, setSessionStateFilter] = useState<string>("ALL");

  // States for transactions filtering & search
  const [txSearch, setTxSearch] = useState<string>("");
  const [txPaymentFilter, setTxPaymentFilter] = useState<string>("ALL");

  const activeReport = reports.find((r) => r.date === selectedDate) || reports[0];

  // Colors for charts
  const COLORS = ["#714B67", "#00A09D", "#9b5de5", "#f15bb5", "#fee440"];

  // Filtered Sessions
  const filteredSessions = posSessions.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.cashier.toLowerCase().includes(sessionSearch.toLowerCase());
    const matchesState = 
      sessionStateFilter === "ALL" || s.state === sessionStateFilter;
    return matchesSearch && matchesState;
  });

  // Filtered Transactions
  const filteredTransactions = posTransactions.filter((t) => {
    const matchesSearch = 
      t.client.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.productName.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.invoiceName.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.sessionName.toLowerCase().includes(txSearch.toLowerCase());
    const matchesPayment = 
      txPaymentFilter === "ALL" || t.paymentMethod === txPaymentFilter;
    return matchesSearch && matchesPayment;
  });

  // Handle Export to Excel of everything (Comisiones, POS Sessions, and Transactions)
  const handleExportExcel = () => {
    // 1. Create a new workbook
    const wb = XLSX.utils.book_new();

    // 2. Tab 1: Resumen Diario (Daily Summaries)
    const summaryData = reports.map((r) => ({
      "Fecha de Reporte": r.date,
      "Ventas Totales (S/.)": r.totalSales,
      "Nro de Comprobantes": r.documents.reduce((acc, d) => acc + d.count, 0),
      "Unidades Vendidas": r.products.reduce((acc, p) => acc + p.qty, 0),
      "Total Efectivo (S/.)": r.payments.find(p => p.method.includes("Efectivo"))?.amount || 0,
      "Total Yape/Plin (S/.)": r.payments.find(p => p.method.includes("Yape") || p.method.includes("Plin"))?.amount || 0,
      "Total Tarjeta (S/.)": r.payments.find(p => p.method.includes("Tarjeta"))?.amount || 0,
    }));

    // Calculate overall totals for Daily Summaries
    const sumSales = reports.reduce((acc, r) => acc + r.totalSales, 0);
    const sumDocs = reports.reduce((acc, r) => acc + r.documents.reduce((sum, d) => sum + d.count, 0), 0);
    const sumQty = reports.reduce((acc, r) => acc + r.products.reduce((sum, p) => sum + p.qty, 0), 0);
    const sumEfectivo = reports.reduce((acc, r) => acc + (r.payments.find(p => p.method.includes("Efectivo"))?.amount || 0), 0);
    const sumYape = reports.reduce((acc, r) => acc + (r.payments.find(p => p.method.includes("Yape") || p.method.includes("Plin"))?.amount || 0), 0);
    const sumTarjeta = reports.reduce((acc, r) => acc + (r.payments.find(p => p.method.includes("Tarjeta"))?.amount || 0), 0);

    summaryData.push({
      "Fecha de Reporte": "TOTAL GENERAL",
      "Ventas Totales (S/.)": sumSales,
      "Nro de Comprobantes": sumDocs,
      "Unidades Vendidas": sumQty,
      "Total Efectivo (S/.)": sumEfectivo,
      "Total Yape/Plin (S/.)": sumYape,
      "Total Tarjeta (S/.)": sumTarjeta,
    });

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen Diario POS");

    // 3. Tab 2: Sesiones por Turno (POS Sessions with cash balances)
    const sessionsData: any[] = filteredSessions.map((s) => ({
      "ID Odoo": s.id,
      "Nombre de Sesión": s.name,
      "Cajero / Operador": s.cashier,
      "Apertura Turno": s.openingDate,
      "Cierre Turno": s.closingDate,
      "Monto Apertura (S/.)": s.openingBalance,
      "Monto de Cierre en Caja (S/.)": s.closedAmount,
      "Ingreso Ventas Realizado (S/.)": s.totalRevenue,
      "Estado": s.state,
    }));

    // Calculate totals for POS Sessions
    const totalOpening = filteredSessions.reduce((acc, s) => acc + s.openingBalance, 0);
    const totalClosed = filteredSessions.reduce((acc, s) => acc + s.closedAmount, 0);
    const totalRevenue = filteredSessions.reduce((acc, s) => acc + s.totalRevenue, 0);

    sessionsData.push({
      "ID Odoo": "TOTAL GENERAL" as any,
      "Nombre de Sesión": "",
      "Cajero / Operador": "",
      "Apertura Turno": "",
      "Cierre Turno": "",
      "Monto Apertura (S/.)": totalOpening,
      "Monto de Cierre en Caja (S/.)": totalClosed,
      "Ingreso Ventas Realizado (S/.)": totalRevenue,
      "Estado": ""
    });

    const wsSessions = XLSX.utils.json_to_sheet(sessionsData);
    XLSX.utils.book_append_sheet(wb, wsSessions, "Sesiones y Caja");

    // 4. Tab 3: Transacciones Detalladas (Customer, Product, Doc Type, Method)
    const txsData: any[] = filteredTransactions.map((t) => {
      // Determine document type: B for Boleta, F for Factura, else Recibo
      const docType = t.invoiceName.toUpperCase().startsWith("B") 
        ? "Boleta de Venta" 
        : t.invoiceName.toUpperCase().startsWith("F") 
        ? "Factura Electrónica" 
        : "Recibo de Caja";

      return {
        "ID Venta": t.id,
        "Caja / Sesión": t.sessionName,
        "Nro. Comprobante": t.invoiceName,
        "Tipo de Comprobante": docType,
        "Nombre del Cliente": t.client,
        "Fecha/Hora": t.date,
        "Producto": t.productName,
        "Cantidad": t.qty,
        "Precio Unitario (S/.)": t.priceUnit,
        "Monto Total / Subtotal (S/.)": t.subtotal,
        "Método de Pago": t.paymentMethod,
      };
    });

    // Calculate totals for Transactions
    const totalTxQty = filteredTransactions.reduce((acc, t) => acc + (t.qty || 0), 0);
    const totalTxSubtotal = filteredTransactions.reduce((acc, t) => acc + (t.subtotal || 0), 0);

    txsData.push({
      "ID Venta": "TOTAL GENERAL" as any,
      "Caja / Sesión": "",
      "Nro. Comprobante": "",
      "Tipo de Comprobante": "",
      "Nombre del Cliente": "",
      "Fecha/Hora": "",
      "Producto": "",
      "Cantidad": totalTxQty,
      "Precio Unitario (S/.)": "",
      "Monto Total / Subtotal (S/.)": totalTxSubtotal,
      "Método de Pago": ""
    });

    const wsTxs = XLSX.utils.json_to_sheet(txsData);
    XLSX.utils.book_append_sheet(wb, wsTxs, "Detalle de Transacciones");

    // 5. Download Excel
    XLSX.writeFile(wb, `Reporte_Auditoria_POS_todoo_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div id="pos-daily-main" className="space-y-6">
      
      {/* Top Banner & Audit Sub-tabs Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-sky-50 text-[#00A09D] border border-sky-100">
              Módulo POS Audit
            </span>
            {isDemoMode && (
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                Prueba Local
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-2">
            <ShoppingBag className="h-5.5 w-5.5 text-[#714B67]" />
            Auditoría de Ventas y Cajas POS
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Motor de conciliación de turnos del Punto de Venta. Controle cierres de caja, métodos de pago y emita reportes en Excel.
          </p>
        </div>

        {/* Global Action buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Sub-Tabs Selector */}
          <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => setActiveSubTab("summary")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeSubTab === "summary"
                  ? "bg-white text-[#714B67] shadow-soft"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Resumen Diario</span>
            </button>
            <button
              onClick={() => setActiveSubTab("sessions")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeSubTab === "sessions"
                  ? "bg-white text-[#714B67] shadow-soft"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Sesiones y Turnos</span>
            </button>
            <button
              onClick={() => setActiveSubTab("transactions")}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                activeSubTab === "transactions"
                  ? "bg-white text-[#714B67] shadow-soft"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Log Transacciones</span>
            </button>
          </div>

          {/* Sync & Excel actions */}
          <button
            onClick={onRefresh}
            className="p-2.5 text-[#714B67] hover:text-white bg-purple-50 hover:bg-[#714B67] rounded-xl border border-purple-100 hover:border-[#714B67] transition-all cursor-pointer"
            title="Sincronizar Datos POS"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-[#00A09D] hover:bg-[#008f8c] text-white text-xs font-bold rounded-xl shadow-soft transition-all cursor-pointer flex items-center gap-1.5"
            title="Exportar a Microsoft Excel"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* RENDER TAB 1: SUMMARY GRAPHICS */}
      {activeSubTab === "summary" && (
        <div className="space-y-6">
          {/* Day selection segment */}
          <div className="bg-white px-6 py-4 rounded-3xl border border-slate-150 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Calendar className="h-4 w-4 text-[#714B67]" />
              Seleccione una fecha de cierre para desglosar:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200">
              {reports.map((report) => (
                <button
                  key={report.date}
                  onClick={() => setSelectedDate(report.date)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    selectedDate === report.date
                      ? "bg-white text-[#714B67] shadow-soft border border-slate-100"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {report.date}
                </button>
              ))}
            </div>
          </div>

          {/* Core Daily metrics KPIs */}
          {!activeReport ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 text-slate-400">
              No se encontraron datos POS para la fecha seleccionada.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-6 bg-[#714B67] text-white rounded-3xl relative overflow-hidden shadow-soft">
                  <div className="absolute right-0 bottom-0 opacity-10 translate-x-3 translate-y-3">
                    <TrendingUp className="h-28 w-28" />
                  </div>
                  <span className="text-[10px] text-purple-200 font-extrabold uppercase tracking-wider block">Sumatoria Total POS</span>
                  <span className="text-2xl font-black block mt-2">
                    S/. {activeReport.totalSales.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-[10px] text-purple-200/85 mt-1">Ingreso bruto registrado para {activeReport.date}</p>
                </div>

                <div className="p-6 bg-white border border-slate-150 rounded-3xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Productos Vendidos</span>
                    <div className="p-1.5 bg-sky-50 text-[#00A09D] rounded-lg">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="text-2xl font-black block mt-2 text-slate-900">
                    {activeReport.products.reduce((acc, p) => acc + p.qty, 0)} unidades
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Distribuidas en {activeReport.products.length} ítems</p>
                </div>

                <div className="p-6 bg-white border border-slate-150 rounded-3xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Comprobantes Emitidos</span>
                    <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                      <FileText className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="text-2xl font-black block mt-2 text-slate-900">
                    {activeReport.documents.reduce((acc, d) => acc + d.count, 0)} comprobantes
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Con validez legal de Facturación</p>
                </div>

                <div className="p-6 bg-white border border-slate-150 rounded-3xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Yape / Plin Digital</span>
                    <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                      <Wallet className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="text-2xl font-black block mt-2 text-slate-900">
                    S/. {(activeReport.payments.find(p => p.method.includes("Yape"))?.amount || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Recaudado vía monedero digital</p>
                </div>
              </div>

              {/* Graphical breakdowns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Payment split */}
                <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                      <Wallet className="h-4 w-4 text-[#714B67]" />
                      Recaudación por Método de Pago
                    </h3>
                    
                    <div className="h-44 my-3 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={activeReport.payments}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="amount"
                          >
                            {activeReport.payments.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`S/. ${Number(value).toFixed(2)}`, "Recaudado"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 mt-2">
                      {activeReport.payments.map((pay, idx) => {
                        const percent = ((pay.amount / activeReport.totalSales) * 100).toFixed(1);
                        return (
                          <div key={pay.method} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                              <span className="text-xs font-semibold text-slate-700">{pay.method}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-950">S/. {pay.amount.toFixed(2)}</span>
                              <span className="text-[10px] text-slate-400 font-medium ml-1.5">({percent}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Documents count and value */}
                  <div className="border-t border-slate-100 pt-4 mt-4">
                    <h4 className="text-xs font-bold text-slate-800 mb-2">Comprobantes Electrónicos Emitidos</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {activeReport.documents.map((doc) => (
                        <div key={doc.type} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="text-[10px] text-slate-500 font-bold block truncate">{doc.type}</span>
                          <span className="text-xs font-extrabold text-slate-900 block mt-1">{doc.count} emitidos</span>
                          <span className="text-[11px] font-bold text-[#00A09D] block mt-0.5">S/. {doc.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Products ranking breakdown */}
                <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <ShoppingBag className="h-4 w-4 text-[#714B67]" />
                      Ventas POS por Producto
                    </h3>
                    <span className="text-[10px] bg-purple-50 text-[#714B67] px-2.5 py-0.5 rounded-full font-bold">
                      {activeReport.products.length} productos
                    </span>
                  </div>

                  <div className="mt-4 flex-1 overflow-auto max-h-[420px]">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 sticky top-0">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left">Código / Producto</th>
                          <th scope="col" className="px-4 py-3 text-center">Cant. Vendida</th>
                          <th scope="col" className="px-4 py-3 text-right">Sumatoria Total</th>
                          <th scope="col" className="px-4 py-3 text-right">Participación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-xs">
                        {activeReport.products.map((p) => {
                          const contribution = ((p.amount / activeReport.totalSales) * 100).toFixed(1);
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-bold text-slate-800">{p.name}</div>
                                {p.code && (
                                  <span className="inline-block text-[9px] font-mono bg-slate-100 text-slate-600 px-1 rounded mt-0.5">
                                    {p.code}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center font-extrabold text-slate-900">
                                {p.qty} u.
                              </td>
                              <td className="px-4 py-3 text-right font-black text-slate-950">
                                S/. {p.amount.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="text-[10px] font-bold text-slate-600">{contribution}%</div>
                                <div className="w-16 bg-slate-150 h-1 rounded-full mt-1 ml-auto overflow-hidden">
                                  <div className="bg-[#00A09D] h-1 rounded-full" style={{ width: `${contribution}%` }} />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      )}

      {/* RENDER TAB 2: SESSIONS & TURN BALANCES */}
      {activeSubTab === "sessions" && (
        <div className="space-y-4">
          
          {/* Filtering bar for Sessions */}
          <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por cajero, código o número de sesión..."
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-[#714B67] rounded-xl text-xs font-semibold text-slate-700 outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                Estado:
              </span>
              <select
                value={sessionStateFilter}
                onChange={(e) => setSessionStateFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100"
              >
                <option value="ALL">Todos los estados</option>
                <option value="Cerrado">Cerrado (Arqueado)</option>
                <option value="Abierto">Abierto (Activo)</option>
              </select>
            </div>
          </div>

          {/* Sessions List Table */}
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left">ID / Código de Turno</th>
                    <th scope="col" className="px-6 py-4 text-left">Cajero / Operador</th>
                    <th scope="col" className="px-6 py-4 text-left">Horario Apertura / Cierre</th>
                    <th scope="col" className="px-6 py-4 text-right">Saldo Inicial (Caja Chica)</th>
                    <th scope="col" className="px-6 py-4 text-right">Recaudación Ventas</th>
                    <th scope="col" className="px-6 py-4 text-right">Arqueo Cierre Caja</th>
                    <th scope="col" className="px-6 py-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs sm:text-sm">
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold">
                        No se encontraron sesiones que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((sess) => (
                      <tr key={sess.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-slate-900">{sess.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                            Odoo Ref ID: #{sess.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-[#00A09D]" />
                            <span>{sess.cashier}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-700 font-medium">Apertura: {sess.openingDate}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Cierre: {sess.closingDate === "N/A" ? "Sesión activa hoy" : sess.closingDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700">
                          S/. {sess.openingBalance.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-emerald-600">
                          + S/. {sess.totalRevenue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">
                          {sess.closedAmount > 0 ? (
                            <span>S/. {sess.closedAmount.toFixed(2)}</span>
                          ) : (
                            <span className="text-slate-400 italic">No cerrado</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {sess.state === "Cerrado" ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold">
                              <CheckCircle className="h-3 w-3" />
                              Cerrado / Cuadrado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-full text-[10px] font-bold animate-pulse">
                              <Clock className="h-3 w-3" />
                              Abierto / Activo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Mostrando <strong>{filteredSessions.length}</strong> turnos registrados en total.</span>
              <span className="font-semibold text-[#714B67]">todoo Odoo POS Integration</span>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 3: TRANSACTION LOGS */}
      {activeSubTab === "transactions" && (
        <div className="space-y-4">
          
          {/* Filtering bar for Transactions */}
          <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por cliente, producto, comprobante, lote, sesión..."
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-[#714B67] rounded-xl text-xs font-semibold text-slate-700 outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5 text-slate-400" />
                Método de Pago:
              </span>
              <select
                value={txPaymentFilter}
                onChange={(e) => setTxPaymentFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100"
              >
                <option value="ALL">Cualquier método</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Yape / Plin">Yape / Plin</option>
                <option value="Tarjeta de Crédito/Débito">Tarjeta de Crédito/Débito</option>
              </select>
            </div>
          </div>

          {/* Transactions Detailed list */}
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left">Nro Comprobante</th>
                    <th scope="col" className="px-6 py-4 text-left">Cliente</th>
                    <th scope="col" className="px-6 py-4 text-left">Fecha y Hora</th>
                    <th scope="col" className="px-6 py-4 text-left">Ítem Detallado</th>
                    <th scope="col" className="px-6 py-4 text-center">Cant.</th>
                    <th scope="col" className="px-6 py-4 text-right">P. Unitario</th>
                    <th scope="col" className="px-6 py-4 text-right">Importe Subtotal</th>
                    <th scope="col" className="px-6 py-4 text-left">Método Pago</th>
                    <th scope="col" className="px-6 py-4 text-left">Caja / Sesión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs sm:text-sm">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-bold">
                        No se encontraron transacciones detalladas de venta.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-[#714B67]">{tx.invoiceName}</div>
                          <span className="text-[10px] font-bold text-slate-400 block">
                            Ref: #{tx.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {tx.client}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {tx.date}
                        </td>
                        <td className="px-6 py-4 text-slate-800">
                          <div className="font-semibold text-slate-900">{tx.productName}</div>
                        </td>
                        <td className="px-6 py-4 text-center font-extrabold text-slate-800">
                          {tx.qty} u.
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-700">
                          S/. {tx.priceUnit.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-950">
                          S/. {tx.subtotal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.paymentMethod.includes("Efectivo")
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : tx.paymentMethod.includes("Yape")
                              ? "bg-purple-50 text-purple-700 border border-purple-100"
                              : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}>
                            {tx.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium font-mono text-[11px]">
                          {tx.sessionName}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Table pagination summary */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Mostrando <strong>{filteredTransactions.length}</strong> líneas de transacción de venta en total.
              </span>
              <span className="font-bold text-[#00A09D]">
                Total Conciliado: S/. {filteredTransactions.reduce((acc, tx) => acc + tx.subtotal, 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
