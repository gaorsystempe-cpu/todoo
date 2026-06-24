import React, { useState } from "react";
import { ExpiryAlert } from "../types";
import { Search, Calendar, ShieldAlert, AlertTriangle, CheckCircle2, ChevronRight, Package, RefreshCw } from "lucide-react";

interface ExpiryAlertsListProps {
  expiryAlerts: ExpiryAlert[];
  isDemoMode: boolean;
  onRefresh: () => void;
}

export default function ExpiryAlertsList({ expiryAlerts, isDemoMode, onRefresh }: ExpiryAlertsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "expired" | "soon" | "ok">("all");

  const filteredAlerts = expiryAlerts.filter((alert) => {
    const matchesSearch =
      alert.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.defaultCode && alert.defaultCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alert.lotNumber && alert.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = statusFilter === "all" || alert.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const expiredCount = expiryAlerts.filter((a) => a.status === "expired").length;
  const soonCount = expiryAlerts.filter((a) => a.status === "soon").length;
  const okCount = expiryAlerts.filter((a) => a.status === "ok").length;

  return (
    <div id="expiry-alerts-container" className="space-y-6">
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            Alertas de Fecha de Caducidad
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Supervise inventarios, lotes y evite pérdidas con alertas automáticas a 1 mes (30 días de plazo). All currencies displayed in Peruvian Soles (S/.).
          </p>
        </div>
        <div className="flex gap-2">
          {isDemoMode && (
            <span className="text-[11px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium border border-amber-200">
              Datos simulados de stock
            </span>
          )}
          <button
            onClick={onRefresh}
            className="p-2 text-[#714B67] hover:text-white bg-purple-50 hover:bg-[#714B67] rounded-xl border border-purple-100 hover:border-[#714B67] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Sincronizar datos"
          >
            <RefreshCw className="h-4 w-4 animate-spin-slow" />
            Sincronizar Lotes
          </button>
        </div>
      </div>

      {/* Metric Summaries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric Expired */}
        <div className="p-5 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-2xl text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-red-600 font-semibold uppercase tracking-wider block">YA VENCIDO</span>
            <span className="text-2xl font-black text-red-950">{expiredCount} Lotes</span>
          </div>
        </div>

        {/* Metric Warning (< 1 month) */}
        <div className="p-5 bg-amber-50 border border-amber-100 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-amber-600 font-semibold uppercase tracking-wider block">POR VENCER (&lt; 1 Mes)</span>
            <span className="text-2xl font-black text-amber-950">{soonCount} Lotes</span>
          </div>
        </div>

        {/* Metric OK */}
        <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider block">ESTADO CONFORME</span>
            <span className="text-2xl font-black text-emerald-950">{okCount} Lotes</span>
          </div>
        </div>
      </div>

      {/* Filters and List */}
      <div className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center gap-4 justify-between bg-slate-50/50">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar producto, lote o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-slate-350"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                statusFilter === "all"
                  ? "bg-[#714B67] text-white shadow-soft"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Todos ({expiryAlerts.length})
            </button>
            <button
              onClick={() => setStatusFilter("expired")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                statusFilter === "expired"
                  ? "bg-red-600 text-white shadow-soft"
                  : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
              }`}
            >
              Ya Vencidos ({expiredCount})
            </button>
            <button
              onClick={() => setStatusFilter("soon")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                statusFilter === "soon"
                  ? "bg-amber-500 text-white shadow-soft"
                  : "bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              Plazo &lt; 1 Mes ({soonCount})
            </button>
            <button
              onClick={() => setStatusFilter("ok")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                statusFilter === "ok"
                  ? "bg-[#00A09D] text-white"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              Conforme ({okCount})
            </button>
          </div>
        </div>

        {/* Expiry alerts table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-105">
                <th className="px-6 py-4">Producto & SKU</th>
                <th className="px-6 py-4">Lote / ID de Lote</th>
                <th className="px-6 py-4">Fecha Vencimiento</th>
                <th className="px-6 py-4 text-center">Plazo Crítico (Días)</th>
                <th className="px-6 py-4 text-emerald-700">Cant. en Stock</th>
                <th className="px-6 py-4 text-right">Ubicación / Sede</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => {
                  const isExpired = alert.status === "expired";
                  const isSoon = alert.status === "soon";

                  return (
                    <tr
                      key={alert.id}
                      className={`hover:bg-slate-50/75 transition-colors ${
                        isExpired
                          ? "bg-red-50/25"
                          : isSoon
                          ? "bg-amber-50/10"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`p-1.5 rounded-lg font-bold shrink-0 text-white ${
                              isExpired
                                ? "bg-red-600"
                                : isSoon
                                ? "bg-amber-500"
                                : "bg-emerald-600"
                            }`}
                          >
                            <Package className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{alert.productName}</div>
                            {alert.defaultCode && (
                              <span className="inline-block mt-0.5 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                SKU: {alert.defaultCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono bg-slate-50 border border-slate-100 text-slate-800 px-2 py-1 rounded text-xs">
                          {alert.lotNumber || "SIN LOTE ASIGNADO"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {alert.expiryDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                            Vencido hace {Math.abs(alert.daysRemaining)} días
                          </span>
                        ) : isSoon ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold animate-pulse">
                            ¡Vence en {alert.daysRemaining} días!
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                            Conforme ({alert.daysRemaining} días)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {alert.stockQty} unidades
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 font-medium">
                        {alert.location || "Almacén Central"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No hay productos o lotes que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
