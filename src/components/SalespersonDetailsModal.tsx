import React, { useState } from "react";
import { SalespersonSummary } from "../types";
import { X, FileSpreadsheet, Award, Check, Calendar, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import * as XLSX from "xlsx";

interface SalespersonDetailsModalProps {
  salesperson: SalespersonSummary | null;
  onClose: () => void;
}

export default function SalespersonDetailsModal({
  salesperson,
  onClose
}: SalespersonDetailsModalProps) {
  if (!salesperson) return null;

  const [viewTab, setViewTab] = useState<"transacciones" | "consolidado">("transacciones");

  const soldProductsArray = Object.values(salesperson.soldProducts || {}).filter((p) => p && p.commission > 0);
  const transactionsArray = (salesperson.commissionLines || []).filter((t) => t && t.commission > 0);

  const handleExportIndividual = () => {
    let rows: any[] = [];
    const typeLabel = viewTab === "transacciones" ? "detallado" : "consolidado";

    if (viewTab === "transacciones") {
      rows = transactionsArray.map((t) => ({
        "Fecha": t.date || "",
        "Orden de Venta": t.orderName || "",
        "Producto": t.productName || "",
        "Cantidad": t.qtySold || 0,
        "Ventas (S/.)": parseFloat((t.revenue || 0).toFixed(2)),
        "Tipo de Regla": t.ruleType === "percentage" ? "Porcentual" : "Fijo",
        "Valor de Regla": t.ruleValue || 0,
        "Comisión (S/.)": parseFloat((t.commission || 0).toFixed(2))
      }));
    } else {
      rows = soldProductsArray.map((p) => ({
        "Producto": p.name || "",
        "Cantidad Vendida": p.qtySold || 0,
        "Monto Ventas (S/.)": parseFloat((p.revenue || 0).toFixed(2)),
        "Tipo de Regla": p.ruleType === "percentage" ? "Porcentual" : "Fijo",
        "Valor de Regla": p.ruleValue || 0,
        "Comisión Calculada (S/.)": parseFloat((p.commission || 0).toFixed(2))
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Comisiones ${viewTab === "transacciones" ? "Detalle" : "Consolidado"}`);

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

    XLSX.writeFile(workbook, `comisiones-${typeLabel}-${salesperson.name.replace(/\s+/g, "_")}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#714B67] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#00A09D] text-white flex items-center justify-center font-bold text-lg shadow-sm animate-pulse-slow">
              {salesperson.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">{salesperson.name}</h3>
              <p className="text-xs text-purple-100">Desglose de productos vendidos y cálculo de comisión asociado.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Salesperson Stats Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 grid grid-cols-3 gap-6 text-sm">
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Total Órdenes</span>
            <span className="text-base font-bold text-slate-700">{salesperson.totalSalesCount || 0}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Ingresos Totales</span>
            <span className="text-base font-bold text-slate-700 font-mono">
              S/. {(salesperson.totalRevenue || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Comisión Acumulada</span>
            <span className="text-base font-bold text-[#00A09D] font-mono">
              S/. {(salesperson.totalCommission || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Detail Table */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewTab("transacciones")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewTab === "transacciones"
                    ? "bg-white text-[#714B67] shadow-soft"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                Detalle por Transacción (Con Fecha)
              </button>
              <button
                type="button"
                onClick={() => setViewTab("consolidado")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewTab === "consolidado"
                    ? "bg-white text-[#714B67] shadow-soft"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Consolidado por Producto
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportIndividual}
              className="px-3.5 py-1.5 text-xs font-bold text-[#00A09D] bg-[#00A09D]/10 hover:bg-[#00A09D] hover:text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition-all border border-[#00A09D]/20 shadow-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Exportar a Excel (.CSV)
            </button>
          </div>

          <div className="max-h-[350px] overflow-y-auto rounded-xl border border-slate-200">
            {viewTab === "transacciones" ? (
              transactionsArray.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs italic">
                  Este vendedor no tiene transacciones registradas en la empresa actual.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                      <th className="py-2.5 px-4">Fecha</th>
                      <th className="py-2.5 px-4">Orden</th>
                      <th className="py-2.5 px-4">Producto</th>
                      <th className="py-2.5 px-4 text-center">Unidades</th>
                      <th className="py-2.5 px-4 text-right">Monto</th>
                      <th className="py-2.5 px-4 text-right">Comisión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                    {transactionsArray.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {t.date}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                          {t.orderName}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-850 max-w-[200px] truncate" title={t.productName}>
                          {t.productName}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                          {t.qtySold}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">
                          S/. {t.revenue.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#714B67] font-mono">
                          S/. {t.commission.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          {t.commission > 0 && (
                            <span className="block text-[9px] font-normal text-[#00A09D] mt-0.5">
                              {t.ruleType === "percentage" ? `${t.ruleValue}%` : `S/. ${t.ruleValue} f.`}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : (
              soldProductsArray.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs italic">
                  Este vendedor no tiene líneas de venta registradas en la empresa actual.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                      <th className="py-2.5 px-4">Producto</th>
                      <th className="py-2.5 px-4 text-center">Unidades</th>
                      <th className="py-2.5 px-4 text-right">Monto Línea</th>
                      <th className="py-2.5 px-4">Regla Aplicada</th>
                      <th className="py-2.5 px-4 text-right">Comisión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                    {soldProductsArray.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/40">
                        <td className="py-3.5 px-4 font-medium text-slate-800 max-w-[280px]">
                          {product.name}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                          {product.qtySold}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                          S/. {product.revenue.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          {product.commission > 0 ? (
                            <span className="inline-flex items-center gap-0.5 bg-purple-50 text-[#714B67] border border-purple-100 px-2 py-0.5 rounded text-[10px] font-bold">
                              <Check className="h-2.5 w-2.5 text-[#714B67]" />
                              {product.ruleType === "percentage"
                                ? `${product.ruleValue}%`
                                : `S/. ${product.ruleValue} f.`}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">0% (Inactiva)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-700 font-mono">
                          S/. {product.commission.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-150 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 hover:bg-slate-200 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer border border-slate-300"
          >
            Cerrar Reporte
          </button>
        </div>
      </motion.div>
    </div>
  );
}
