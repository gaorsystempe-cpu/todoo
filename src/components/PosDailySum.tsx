import React, { useState } from "react";
import { PosDailyReport, PosSession, PosTransactionDetail } from "../types";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  FileText,
  DollarSign,
  Wallet,
  CreditCard,
  RefreshCw
} from "lucide-react";
import * as XLSX from "xlsx";

interface PosDailySumProps {
  reports: PosDailyReport[];
  posSessions: PosSession[];
  posTransactions: PosTransactionDetail[];
  isDemoMode: boolean;
  onRefresh: () => void;
}

export default function PosDailySum({ 
  posSessions = [], 
  posTransactions = [], 
  isDemoMode, 
  onRefresh 
}: PosDailySumProps) {
  
  // State for search & filters
  const [sessionSearch, setSessionSearch] = useState<string>("");
  const [sessionStateFilter, setSessionStateFilter] = useState<string>("ALL");
  const [selectedSessionName, setSelectedSessionName] = useState<string | null>(null);

  // Helper to match transaction lines with each session
  const getSessionTransactions = (sessName: string, sessId: number) => {
    return posTransactions.filter(t => 
      t.sessionName === sessName || 
      t.sessionName === `Turno #${sessId}` || 
      t.sessionName === `Turno #${sessName}` ||
      t.sessionName === String(sessId)
    );
  };

  // Filtered Sessions
  const filteredSessions = posSessions.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.cashier.toLowerCase().includes(sessionSearch.toLowerCase());
    const matchesState = 
      sessionStateFilter === "ALL" || s.state === sessionStateFilter;
    return matchesSearch && matchesState;
  });

  // Calculate payment methods and totals for each session for Excel Export
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const dataToExport = filteredSessions.map((sess) => {
      const sessTxs = getSessionTransactions(sess.name, sess.id);

      const cashSum = sessTxs
        .filter(t => t.paymentMethod.toLowerCase().includes("efectivo"))
        .reduce((sum, t) => sum + t.subtotal, 0);

      const digitalSum = sessTxs
        .filter(t => t.paymentMethod.toLowerCase().includes("yape") || t.paymentMethod.toLowerCase().includes("plin"))
        .reduce((sum, t) => sum + t.subtotal, 0);

      const cardSum = sessTxs
        .filter(t => t.paymentMethod.toLowerCase().includes("tarjeta") || t.paymentMethod.toLowerCase().includes("crédito") || t.paymentMethod.toLowerCase().includes("débito"))
        .reduce((sum, t) => sum + t.subtotal, 0);

      const otherSum = sessTxs
        .filter(t => 
          !t.paymentMethod.toLowerCase().includes("efectivo") && 
          !t.paymentMethod.toLowerCase().includes("yape") && 
          !t.paymentMethod.toLowerCase().includes("plin") && 
          !t.paymentMethod.toLowerCase().includes("tarjeta") && 
          !t.paymentMethod.toLowerCase().includes("crédito") && 
          !t.paymentMethod.toLowerCase().includes("débito")
        )
        .reduce((sum, t) => sum + t.subtotal, 0);

      const computedTotal = cashSum + digitalSum + cardSum + otherSum;
      const finalTotal = computedTotal > 0 ? computedTotal : sess.totalRevenue;
      
      let finalCash = cashSum;
      if (computedTotal === 0 && sess.totalRevenue > 0) {
        // Default to cash if no transactions details found
        finalCash = sess.totalRevenue;
      }

      return {
        "ID Odoo": sess.id,
        "Código de Turno": sess.name,
        "Punto de Venta": sess.config_id ? (Array.isArray(sess.config_id) ? sess.config_id[1] : sess.config_id) : "Caja General",
        "Cajero / Operador": sess.cashier,
        "Apertura": sess.openingDate,
        "Cierre": sess.closingDate === "N/A" ? "Abierto" : sess.closingDate,
        "Estado": sess.state === "Abierto" ? "Abierto" : "Cerrado",
        "Efectivo (S/.)": Number(finalCash.toFixed(2)),
        "Yape / Plin (S/.)": Number(digitalSum.toFixed(2)),
        "Tarjeta (S/.)": Number(cardSum.toFixed(2)),
        "Otros (S/.)": Number(otherSum.toFixed(2)),
        "Total Vendido (S/.)": Number(finalTotal.toFixed(2))
      };
    });

    // Add totals row
    const totalCash = dataToExport.reduce((acc, curr) => acc + (curr["Efectivo (S/.)"] || 0), 0);
    const totalDigital = dataToExport.reduce((acc, curr) => acc + (curr["Yape / Plin (S/.)"] || 0), 0);
    const totalCard = dataToExport.reduce((acc, curr) => acc + (curr["Tarjeta (S/.)"] || 0), 0);
    const totalOther = dataToExport.reduce((acc, curr) => acc + (curr["Otros (S/.)"] || 0), 0);
    const totalAll = dataToExport.reduce((acc, curr) => acc + (curr["Total Vendido (S/.)"] || 0), 0);

    dataToExport.push({
      "ID Odoo": "TOTAL GENERAL" as any,
      "Código de Turno": "",
      "Punto de Venta": "",
      "Cajero / Operador": "",
      "Apertura": "",
      "Cierre": "",
      "Estado": "",
      "Efectivo (S/.)": Number(totalCash.toFixed(2)),
      "Yape / Plin (S/.)": Number(totalDigital.toFixed(2)),
      "Tarjeta (S/.)": Number(totalCard.toFixed(2)),
      "Otros (S/.)": Number(totalOther.toFixed(2)),
      "Total Vendido (S/.)": Number(totalAll.toFixed(2))
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(wb, ws, "Auditoria Sesiones POS");
    XLSX.writeFile(wb, `Ventas_Cajas_POS_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div id="pos-simple-audit" className="space-y-6">
      
      {/* Top Simple Header Banner */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/85 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              Cajas de Ventas POS
            </span>
            {isDemoMode && (
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                Modo Demo
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-2">
            <ShoppingBag className="h-5.5 w-5.5 text-[#714B67]" />
            Auditoría de Ventas y Cajas POS
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Resumen simplificado de ventas por sesión o turno con desglose de métodos de pago y exportación directa a Excel.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefresh}
            className="p-2.5 text-[#714B67] hover:text-white bg-purple-50 hover:bg-[#714B67] rounded-xl border border-purple-100 hover:border-[#714B67] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Sincronizar con Odoo"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Sincronizar</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-[#00A09D] hover:bg-[#008f8c] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            title="Exportar Reporte a Excel"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            <option value="ALL">Todas las cajas</option>
            <option value="Cerrado">Solo Cerradas</option>
            <option value="Abierto">Solo Abiertas (Activas)</option>
          </select>
        </div>
      </div>

      {/* Simplified Sessions Table */}
      <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-4 text-left">Código / Nro de Sesión</th>
                <th scope="col" className="px-6 py-4 text-left">Cajero / Operador</th>
                <th scope="col" className="px-6 py-4 text-left">Apertura y Cierre</th>
                <th scope="col" className="px-6 py-4 text-center">Estado</th>
                <th scope="col" className="px-6 py-4 text-right">Efectivo</th>
                <th scope="col" className="px-6 py-4 text-right">Yape / Plin</th>
                <th scope="col" className="px-6 py-4 text-right">Tarjeta</th>
                <th scope="col" className="px-6 py-4 text-right">Venta Total</th>
                <th scope="col" className="px-6 py-4 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-bold">
                    No se encontraron sesiones registradas.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((sess) => {
                  const sessTxs = getSessionTransactions(sess.name, sess.id);

                  // Calculate breakdown
                  const cashSum = sessTxs
                    .filter(t => t.paymentMethod.toLowerCase().includes("efectivo"))
                    .reduce((sum, t) => sum + t.subtotal, 0);

                  const digitalSum = sessTxs
                    .filter(t => t.paymentMethod.toLowerCase().includes("yape") || t.paymentMethod.toLowerCase().includes("plin"))
                    .reduce((sum, t) => sum + t.subtotal, 0);

                  const cardSum = sessTxs
                    .filter(t => t.paymentMethod.toLowerCase().includes("tarjeta") || t.paymentMethod.toLowerCase().includes("crédito") || t.paymentMethod.toLowerCase().includes("débito"))
                    .reduce((sum, t) => sum + t.subtotal, 0);

                  const otherSum = sessTxs
                    .filter(t => 
                      !t.paymentMethod.toLowerCase().includes("efectivo") && 
                      !t.paymentMethod.toLowerCase().includes("yape") && 
                      !t.paymentMethod.toLowerCase().includes("plin") && 
                      !t.paymentMethod.toLowerCase().includes("tarjeta") && 
                      !t.paymentMethod.toLowerCase().includes("crédito") && 
                      !t.paymentMethod.toLowerCase().includes("débito")
                    )
                    .reduce((sum, t) => sum + t.subtotal, 0);

                  const computedTotal = cashSum + digitalSum + cardSum + otherSum;
                  const finalTotal = computedTotal > 0 ? computedTotal : sess.totalRevenue;
                  
                  let finalCash = cashSum;
                  if (computedTotal === 0 && sess.totalRevenue > 0) {
                    finalCash = sess.totalRevenue; // Fallback
                  }

                  return (
                    <tr 
                      key={sess.id} 
                      className="hover:bg-slate-50/75 transition-colors cursor-pointer"
                      onClick={() => setSelectedSessionName(sess.name)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-extrabold text-slate-950">{sess.name}</div>
                        {sess.config_id && (
                          <div className="text-[10px] font-semibold text-purple-700 mt-0.5">
                            {Array.isArray(sess.config_id) ? sess.config_id[1] : sess.config_id}
                          </div>
                        )}
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
                          ID Odoo: #{sess.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-[#00A09D]" />
                          <span>{sess.cashier}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="font-semibold">Ap: {sess.openingDate}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {sess.closingDate === "N/A" || !sess.closingDate ? "Activo (Sin cierre)" : `Cierre: ${sess.closingDate}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {sess.state === "Abierto" ? (
                          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-150 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            <Clock className="h-2.5 w-2.5" />
                            Abierto
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-150 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Cerrado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-700">
                        S/. {finalCash.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-purple-700">
                        S/. {digitalSum.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-sky-700">
                        S/. {cardSum.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 bg-slate-50/40">
                        S/. {finalTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedSessionName(sess.name)}
                          className="px-2.5 py-1 bg-[#714B67] hover:bg-[#5a3b52] text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 mx-auto"
                        >
                          <FileText className="h-3 w-3" />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Mostrando <strong>{filteredSessions.length}</strong> sesiones.</span>
          <span className="font-semibold text-[#714B67]">todoo Odoo POS Audit</span>
        </div>
      </div>

      {/* Session Details Modal (if user clicks "Ver") */}
      {selectedSessionName && (() => {
        const session = posSessions.find(s => s.name === selectedSessionName);
        const sessionTxs = getSessionTransactions(selectedSessionName, session?.id || 0);
        const totalSalesSum = sessionTxs.reduce((sum, t) => sum + t.subtotal, 0);

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="bg-[#714B67] text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest rounded bg-white/20 text-white">
                    Desglose de Ventas por Sesión
                  </span>
                  <h3 className="text-base font-black mt-1">
                    Sesión: {selectedSessionName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSessionName(null)}
                  className="p-1 hover:bg-white/15 rounded-lg text-white transition-all cursor-pointer"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Quick Info bar */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">Cajero / Operador</span>
                  <span className="font-extrabold text-slate-800 block mt-0.5 flex items-center gap-1">
                    <Users className="h-3 w-3 text-[#00A09D]" />
                    {session?.cashier || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">Estado</span>
                  <span className="font-extrabold block mt-0.5">
                    {session?.state === "Abierto" ? (
                      <span className="text-sky-600 font-black">Abierto</span>
                    ) : (
                      <span className="text-emerald-600 font-black">Cerrado</span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9px] block">Fecha Apertura</span>
                  <span className="font-extrabold text-slate-800 block mt-0.5">{session?.openingDate || "N/A"}</span>
                </div>
                <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/50">
                  <span className="text-emerald-700 font-extrabold uppercase text-[9px] block">Total Vendido</span>
                  <span className="font-black text-emerald-800 block mt-0.5">S/. {totalSalesSum.toFixed(2)}</span>
                </div>
              </div>

              {/* Transactions list inside the session */}
              <div className="flex-1 overflow-y-auto p-6">
                {sessionTxs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-bold text-xs">
                    No se registran ventas detalladas para esta sesión en este momento.
                  </div>
                ) : (
                  <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-4 py-2 text-left">Nro Comprobante</th>
                          <th className="px-4 py-2 text-left">Cliente</th>
                          <th className="px-4 py-2 text-left">Fecha y Hora</th>
                          <th className="px-4 py-2 text-left">Producto</th>
                          <th className="px-4 py-2 text-center">Cant.</th>
                          <th className="px-4 py-2 text-right">P. Unit</th>
                          <th className="px-4 py-2 text-right">Total</th>
                          <th className="px-4 py-2 text-center">Método Pago</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-xs">
                        {sessionTxs.map((t, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-extrabold text-[#714B67]">{t.invoiceName}</td>
                            <td className="px-4 py-2.5 font-bold text-slate-700">{t.client}</td>
                            <td className="px-4 py-2.5 text-slate-500">{t.date}</td>
                            <td className="px-4 py-2.5 font-semibold text-slate-800">{t.productName}</td>
                            <td className="px-4 py-2.5 text-center font-bold text-slate-600">{t.qty}</td>
                            <td className="px-4 py-2.5 text-right text-slate-600">S/. {t.priceUnit.toFixed(2)}</td>
                            <td className="px-4 py-2.5 text-right font-extrabold text-slate-950">S/. {t.subtotal.toFixed(2)}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                                t.paymentMethod.toLowerCase().includes("efectivo") 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                  : t.paymentMethod.toLowerCase().includes("yape") || t.paymentMethod.toLowerCase().includes("plin")
                                  ? "bg-purple-50 text-purple-700 border border-purple-100"
                                  : "bg-sky-50 text-sky-700 border border-sky-100"
                              }`}>
                                {t.paymentMethod}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-end shrink-0">
                <button
                  onClick={() => setSelectedSessionName(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
