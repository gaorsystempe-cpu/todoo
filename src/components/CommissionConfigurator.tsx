import React, { useState } from "react";
import { OdooProduct, CommissionRule } from "../types";
import { Search, Percent, CircleDollarSign, Trash2, ShieldCheck, HelpCircle, Filter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CommissionConfiguratorProps {
  products: OdooProduct[];
  rules: CommissionRule[];
  onSaveRule: (productId: number, type: "percentage" | "flat", value: number) => void;
  onRemoveRule: (productId: number) => void;
}

export default function CommissionConfigurator({
  products,
  rules,
  onSaveRule,
  onRemoveRule
}: CommissionConfiguratorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "configured">("all");
  const [editingRule, setEditingRule] = useState<{
    productId: number;
    type: "percentage" | "flat";
    value: number;
  } | null>(null);

  const safeProducts = Array.isArray(products) ? products : [];
  const safeRules = Array.isArray(rules) ? rules : [];

  // Helper to find a rule assigned to a product
  const getRuleForProduct = (productId: number) => {
    if (!productId) return undefined;
    return safeRules.find((r) => r && r.productId === productId);
  };

  // Filter products by search term and whether they have configured commissions
  const filteredProducts = safeProducts.filter((product) => {
    if (!product || !product.id) return false;
    const displayName = product.display_name || "";
    const defaultCode = product.default_code || "";
    const nameMatch = displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const codeMatch = defaultCode.toLowerCase().includes(searchTerm.toLowerCase());
    const rule = getRuleForProduct(product.id);
    
    const matchesSearch = nameMatch || codeMatch;
    
    if (filterType === "configured") {
      return matchesSearch && !!rule;
    }
    return matchesSearch;
  });

  const handleEditValueChange = (valStr: string) => {
    if (!editingRule) return;
    const value = parseFloat(valStr) || 0;
    setEditingRule({ ...editingRule, value });
  };

  const startEditing = (product: OdooProduct) => {
    if (!product || !product.id) return;
    const existing = getRuleForProduct(product.id);
    setEditingRule({
      productId: product.id,
      type: existing?.type || "percentage",
      value: typeof existing?.value === "number" ? existing.value : 3
    });
  };

  const saveRuleChanges = () => {
    if (!editingRule) return;
    onSaveRule(editingRule.productId, editingRule.type, editingRule.value);
    setEditingRule(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Percent className="h-5 w-5 text-[#714B67]" />
            Configuración de Comisiones Específicas
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Defina reglas de comisión (porcentaje o valor fijo) para cada producto vendido de todoo.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Todos ({safeProducts.length})
          </button>
          <button
            onClick={() => setFilterType("configured")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              filterType === "configured"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Configurados ({safeRules.length})
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar producto por nombre o código (SKU todoo)..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] transition-all bg-white"
            />
          </div>
          <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 flex items-center gap-2 text-xs text-slate-700 md:max-w-xs">
            <ShieldCheck className="h-4 w-4 text-[#714B67] shrink-0" />
            <span>
              Los productos sin regla asignada se calcularán con <strong>0% de comisión</strong> por venta.
            </span>
          </div>
        </div>

        {/* Editing Modal/Drawer inline layer */}
        <AnimatePresence>
          {editingRule && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700">
                    Definir Comisión para:{" "}
                    <span className="text-[#714B67]">
                      {safeProducts.find((p) => p && p.id === editingRule.productId)?.display_name || "Producto seleccionado"}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Elija si la comisión es porcentual (%) o un valor de dinero fijo en Soles Peruanos (S/.) por unidad vendida.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex bg-white rounded-lg border border-slate-200 p-0.5">
                    <button
                      type="button"
                      onClick={() => setEditingRule({ ...editingRule, type: "percentage" })}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        editingRule.type === "percentage"
                          ? "bg-[#714B67] text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Percent className="h-3 w-3 inline mr-1" /> Porcentual
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingRule({ ...editingRule, type: "flat" })}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        editingRule.type === "flat"
                          ? "bg-[#714B67] text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <CircleDollarSign className="h-3 w-3 inline mr-1" /> Fijo por Unidad (S/.)
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
                    <span className="text-xs text-slate-500">
                      {editingRule.type === "percentage" ? "%" : "S/."}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={editingRule.value}
                      onChange={(e) => handleEditValueChange(e.target.value)}
                      className="w-16 text-center text-sm font-semibold focus:outline-none focus:ring-0 select-none bg-white border-0"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveRuleChanges}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#00A09D] hover:bg-[#008f8c] hover:shadow rounded-lg cursor-pointer transition-all"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingRule(null)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg cursor-pointer transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Slider Helper */}
              {editingRule.type === "percentage" && (
                <div className="mt-3 flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.5"
                    value={editingRule.value}
                    onChange={(e) => setEditingRule({ ...editingRule, value: parseFloat(e.target.value) })}
                    className="flex-1 accent-[#714B67] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                  <span className="text-xs text-slate-400 w-12 font-mono">{editingRule.value}%</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Filter className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-slate-600">No se encontraron productos</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Pruebe cambiando el texto de búsqueda o consulte si tiene productos asignados a la compañía.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-55/70">
                  <th className="py-3 px-4">Código / SKU</th>
                  <th className="py-3 px-4">Nombre del Producto</th>
                  <th className="py-3 px-4 text-right">Precio de Lista</th>
                  <th className="py-3 px-4">Comisión Configurada</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map((product) => {
                  const rule = getRuleForProduct(product.id);
                  return (
                    <motion.tr
                      key={product.id}
                      layout="position"
                      className="hover:bg-slate-50/50 transition-all font-sans"
                    >
                      <td className="py-4 px-4 font-mono text-xs text-slate-500 font-semibold">
                        {product.default_code || "SIN_CODIGO"}
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700 max-w-xs md:max-w-md truncate">
                        {product.display_name}
                      </td>
                      <td className="py-4 px-4 text-right text-slate-600 font-mono text-xs">
                        {typeof product.list_price === "number"
                          ? `S/. ${product.list_price.toFixed(2)}`
                          : product.list_price !== undefined && product.list_price !== null
                            ? `S/. ${parseFloat(product.list_price as any || "0").toFixed(2)}`
                            : "S/. 0.00"
                        }
                      </td>
                      <td className="py-4 px-4">
                        {rule ? (
                          <div className="inline-flex items-center gap-1 bg-purple-50 text-[#714B67] border border-purple-100 px-2.5 py-1 rounded-full text-xs font-semibold">
                            {rule.type === "percentage" ? (
                              <>
                                <Percent className="h-3 w-3 text-[#714B67]" />
                                {typeof rule.value === "number" ? rule.value : parseFloat(rule.value as any || "0")}% del Subtotal
                              </>
                            ) : (
                              <>
                                <CircleDollarSign className="h-3 w-3 text-[#714B67]" />
                                S/. {typeof rule.value === "number" ? rule.value.toFixed(2) : parseFloat(rule.value as any || "0").toFixed(2)} fijo por u.
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sin regla (0% com.)</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEditing(product)}
                            className="text-xs px-3 py-1.5 font-bold text-[#714B67] hover:text-white bg-purple-50 hover:bg-[#714B67] rounded-lg hover:shadow-xs transition-all cursor-pointer"
                          >
                            Asignar / Editar
                          </button>
                          {rule && (
                            <button
                              onClick={() => onRemoveRule(product.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              title="Borrar regla"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
