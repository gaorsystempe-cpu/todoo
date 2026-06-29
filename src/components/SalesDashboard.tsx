import React, { useState, useMemo } from "react";
import { OdooSaleOrder, OdooSaleOrderLine, CommissionRule, SalespersonSummary, OdooProduct } from "../types";
import { calculateCommissionReport } from "../utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { Users, DollarSign, TrendingUp, BarChart3, Download, Search, Award, ChevronRight, FileSpreadsheet, Percent } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CommissionConfigurator from "./CommissionConfigurator";
import * as XLSX from "xlsx";

interface SalesDashboardProps {
  orders: OdooSaleOrder[];
  orderLines: OdooSaleOrderLine[];
  products: OdooProduct[];
  rules: CommissionRule[];
  onSaveRule: (productId: number, type: "percentage" | "flat", value: number) => void;
  onRemoveRule: (productId: number) => void;
  onSelectSalesperson: (summary: SalespersonSummary) => void;
}

export default function SalesDashboard({
  orders,
  orderLines,
  products,
  rules,
  onSaveRule,
  onRemoveRule,
  onSelectSalesperson
}: SalesDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [subTab, setSubTab] = useState<"reporte" | "tarifas">("reporte");

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeOrderLines = Array.isArray(orderLines) ? orderLines : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeRules = Array.isArray(rules) ? rules : [];

  const { summaries, totalCompanyRevenue, totalCompanyCommission } = useMemo(() => {
    return calculateCommissionReport(safeOrders, safeOrderLines, safeRules);
  }, [safeOrders, safeOrderLines, safeRules]);

  // Filter summaries based on salesperson name search
  const filteredSummaries = useMemo(() => {
    return (summaries || []).filter((item) =>
      item && item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [summaries, searchTerm]);

  // Chart data preparing: commission per salesperson
  const chartData = useMemo(() => {
    return (summaries || []).map((s) => {
      const nameVal = s && s.name ? s.name : "Vendedor";
      return {
        name: nameVal.split(" ")[0] || nameVal, // First name for mobile/short spaces
        fullName: nameVal,
        Ventas: parseFloat((s?.totalRevenue || 0).toFixed(2)),
        Comision: parseFloat((s?.totalCommission || 0).toFixed(2))
      };
    });
  }, [summaries]);

  // Chart colors
  const COLORS = ["#714B67", "#00A09D", "#9b5de5", "#f15bb5", "#fee440", "#00f5d4"];

  // Master detailed excel exporter (contains date, product, salesperson, etc)
  const handleExportDetailedExcel = () => {
    const rows: any[] = [];
    
    summaries.forEach((s) => {
      const txs = s.commissionLines || [];
      txs.forEach((t) => {
        if (t.commission <= 0) return;
        const ruleLabel = t.ruleType === "percentage" ? `${t.ruleValue}%` : `S/. ${t.ruleValue} fijo`;
        
        rows.push({
          "Fecha": t.date,
          "Vendedor": s.name,
          "Orden de Venta": t.orderName,
          "Producto": t.productName,
          "Unidades Vendidas": t.qtySold,
          "Monto Venta (S/.)": parseFloat(t.revenue.toFixed(2)),
          "Comisión Generada (S/.)": parseFloat(t.commission.toFixed(2)),
          "Regla Aplicada": ruleLabel
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Detalle de Comisiones");
    
    // Auto-adjust column widths
    const maxLens = rows.reduce((acc, row) => {
      Object.keys(row).forEach((key, colIndex) => {
        const valStr = String(row[key] ?? "");
        const len = Math.max(valStr.length, key.length);
        acc[colIndex] = Math.max(acc[colIndex] || 0, len);
      });
      return acc;
    }, [] as number[]);
    worksheet["!cols"] = maxLens.map(len => ({ wch: len + 3 }));

    XLSX.writeFile(workbook, "comisiones-master-detallado-todoo.xlsx");
  };

  // Consolidated salesperson summary exporter
  const handleExportSummaryExcel = () => {
    const rows = summaries.map((s) => ({
      "Vendedor": s.name,
      "Ventas Totales (S/.)": parseFloat(s.totalRevenue.toFixed(2)),
      "Comisión Generada (S/.)": parseFloat(s.totalCommission.toFixed(2)),
      "N° Pedidos": s.totalSalesCount
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resumen por Vendedor");

    // Auto-adjust column widths
    const maxLens = rows.reduce((acc, row) => {
      Object.keys(row).forEach((key, colIndex) => {
        const valStr = String(row[key] ?? "");
        const len = Math.max(valStr.length, key.length);
        acc[colIndex] = Math.max(acc[colIndex] || 0, len);
      });
      return acc;
    }, [] as number[]);
    worksheet["!cols"] = maxLens.map(len => ({ wch: len + 3 }));

    XLSX.writeFile(workbook, "reporte-resumen-comisiones-todoo.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Unified sub-navigation header */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Percent className="h-5 w-5 text-[#714B67]" />
            Gestión Integral de Comisiones
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualice los reportes de liquidación de su fuerza de ventas y asigne tarifas por producto en esta pestaña consolidada.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setSubTab("reporte")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === "reporte"
                ? "bg-white text-[#714B67] shadow-soft"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Reporte de Liquidación
          </button>
          <button
            onClick={() => setSubTab("tarifas")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === "tarifas"
                ? "bg-white text-[#714B67] shadow-soft"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Percent className="h-4 w-4" />
            Asignar Tarifas de todoo
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {subTab === "reporte" ? (
          <motion.div
            key="reporte-sub"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Dynamic Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-xl text-[#714B67]">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Ventas de Empresa</span>
                  <span className="text-xl font-bold font-mono text-slate-850">
                    S/. {totalCompanyRevenue.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-[#00A09D]/10 rounded-xl text-[#00A09D]">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Comisiones Acumuladas</span>
                  <span className="text-xl font-bold font-mono text-[#00A09D]">
                    S/. {totalCompanyCommission.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Tasa Promedio</span>
                  <span className="text-xl font-bold font-mono text-amber-700">
                    {totalCompanyRevenue > 0
                      ? ((totalCompanyCommission / totalCompanyRevenue) * 100).toFixed(2)
                      : "0.00"}
                    %
                  </span>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Vendedores Activos</span>
                  <span className="text-xl font-bold text-slate-800">{summaries.length}</span>
                </div>
              </div>
            </div>

            {/* Visual Charts Layout split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sales commission chart bar */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-[#714B67]" />
                  Comisiones por Vendedor en Moneda Local (S/.)
                </h3>
                <div className="h-72 w-full">
                  {chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      Sin datos suficientes para generar gráficos.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip
                          contentStyle={{ border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "11px" }}
                          formatter={(value) => [`S/. ${value}`, "Comisión"]}
                        />
                        <Bar dataKey="Comision" fill="#714B67" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Quick commission summary chart or rules table */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-[#714B67]" />
                    Líderes de Comisión
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Ranking de su fuerza de trabajo por valor liquidado en la compañía actual.</p>
                  
                  <div className="space-y-3">
                    {summaries.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400 italic">No hay registros de ventas.</div>
                    ) : (
                      summaries
                        .slice()
                        .sort((a, b) => b.totalCommission - a.totalCommission)
                        .map((leader, i) => (
                          <div key={leader.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-all">
                            <div className="flex items-center gap-3">
                              <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                                i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-700" : "bg-slate-300"
                              }`}>
                                {i + 1}
                              </span>
                              <div>
                                <span className="text-xs font-semibold text-slate-800 block">{leader.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium font-mono">
                                  {leader.totalSalesCount} órdenes • S/. {leader.totalRevenue.toLocaleString("es-PE", { maximumFractionDigits: 1 })} vendido
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-[#714B67] font-mono">
                              S/. {leader.totalCommission.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Breakdown List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-md font-semibold text-slate-800">Liquidación de Comisiones de Vendedores</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Muestra las comisiones acumuladas computando únicamente los productos configurados con regla.</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportDetailedExcel}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#714B67] hover:bg-[#714B67]/90 border border-[#714B67]/20 rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Exportar Detallado (Con Fecha y Producto)
                  </button>
                  <button
                    type="button"
                    onClick={handleExportSummaryExcel}
                    className="px-3.5 py-1.5 text-xs font-bold text-[#00A09D] hover:text-[#00A09D]/90 bg-[#00A09D]/10 border border-[#00A09D]/20 rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Exportar Resumen
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtro rápido por vendedor..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white"
                  />
                </div>

                {filteredSummaries.length === 0 ? (
                  <div className="text-center p-8 bg-slate-50 border border-slate-150 border-dashed rounded-xl">
                    <span className="text-xs text-slate-400 italic">No se encontraron vendedores activos.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-150 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-55">
                          <th className="py-3 px-4">Nombre del Vendedor</th>
                          <th className="py-3 px-4 text-center">Nº Pedidos</th>
                          <th className="py-3 px-4 text-right">Monto Total de Ventas</th>
                          <th className="py-3 px-4 text-right">Comisión Estimada</th>
                          <th className="py-3 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredSummaries.map((summary) => (
                          <tr key={summary.id} className="hover:bg-slate-50/50">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-purple-50 text-[#714B67] flex items-center justify-center font-bold text-xs">
                                  {summary.name.charAt(0)}
                                </div>
                                <span className="font-semibold text-slate-700 text-sm">{summary.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center font-semibold text-slate-600">
                              {summary.totalSalesCount}
                            </td>
                            <td className="py-4 px-4 text-right font-mono text-xs text-slate-600 font-medium">
                              S/. {summary.totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="px-2.5 py-1 text-xs font-bold text-[#714B67] bg-purple-50 rounded-full font-mono border border-purple-100">
                                S/. {summary.totalCommission.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => onSelectSalesperson(summary)}
                                className="px-3 py-1.5 text-xs font-bold text-[#714B67] bg-purple-50 hover:bg-purple-100 border border-purple-100 hover:border-purple-200 rounded-lg transition-all flex items-center gap-1 ml-auto cursor-pointer"
                              >
                                Detalle
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="tarifas-sub"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <CommissionConfigurator
              products={safeProducts}
              rules={safeRules}
              onSaveRule={onSaveRule}
              onRemoveRule={onRemoveRule}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
