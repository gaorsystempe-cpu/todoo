import React, { useState, useEffect } from "react";
import { OdooConnection, OdooProduct, OdooSaleOrder, OdooSaleOrderLine, CommissionRule, SalespersonSummary, ExpiryAlert, PosDailyReport, PosSession, PosTransactionDetail } from "./types";
import { MOCK_COMPANIES, MOCK_PRODUCTS, MOCK_ORDERS, MOCK_ORDER_LINES, INITIAL_MOCK_RULES, MOCK_EXPIRY_ALERTS, MOCK_POS_DAILY_REPORTS, MOCK_POS_SESSIONS, MOCK_POS_TRANSACTIONS } from "./mockData";
import OdooPortalLogin from "./components/OdooPortalLogin";
import SalesDashboard from "./components/SalesDashboard";
import ExpiryAlertsList from "./components/ExpiryAlertsList";
import PosDailySum from "./components/PosDailySum";
import OdooConnectionForm from "./components/OdooConnectionForm";
import PortalUserManagement from "./components/PortalUserManagement";
import SalespersonDetailsModal from "./components/SalespersonDetailsModal";
import { Grid, Layers, Percent, BarChart3, ShieldAlert, BadgeInfo, Play, Cpu, CheckCircle, Calendar, ShoppingBag, Settings, LogOut, AppWindow, Sparkles, Building2, UserCheck, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem("portal_isLoggedIn");
    return saved === "true";
  });

  const [activeTab, setActiveTab] = useState<"comisiones" | "caducidad" | "ventas_pos" | "configuracion">(() => {
    const saved = localStorage.getItem("portal_activeTab");
    return (saved as any) || "comisiones";
  });

  const [showAppSwitcher, setShowAppSwitcher] = useState<boolean>(true);

  // Connection settings
  const [connection, setConnection] = useState<OdooConnection>(() => {
    const saved = localStorage.getItem("portal_connection");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      url: "",
      db: "",
      username: "",
      isConnected: false,
      isDemoMode: true, // Default to demo simulation on portal
      companyId: 1,
      companyName: "Corporación Tecnológica del Perú S.A.C."
    };
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("portal_isLoggedIn", isLoggedIn ? "true" : "false");
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem("portal_activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("portal_connection", JSON.stringify(connection));
  }, [connection]);

  // Main data collections (synced with persistent backend JSON db)
  const [products, setProducts] = useState<OdooProduct[]>(() => connection.isDemoMode ? MOCK_PRODUCTS : []);
  const [orders, setOrders] = useState<OdooSaleOrder[]>(() => connection.isDemoMode ? MOCK_ORDERS : []);
  const [orderLines, setOrderLines] = useState<OdooSaleOrderLine[]>(() => connection.isDemoMode ? MOCK_ORDER_LINES : []);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>(() => connection.isDemoMode ? MOCK_EXPIRY_ALERTS : []);
  const [posReports, setPosReports] = useState<PosDailyReport[]>(() => connection.isDemoMode ? MOCK_POS_DAILY_REPORTS : []);
  const [posSessions, setPosSessions] = useState<PosSession[]>(() => connection.isDemoMode ? MOCK_POS_SESSIONS : []);
  const [posTransactions, setPosTransactions] = useState<PosTransactionDetail[]>(() => connection.isDemoMode ? MOCK_POS_TRANSACTIONS : []);
  const [odooUsers, setOdooUsers] = useState<any[]>([]);

  // Commission rules setup
  const [rules, setRules] = useState<CommissionRule[]>(INITIAL_MOCK_RULES);

  // Selected salesperson detail Modal
  const [selectedSalesperson, setSelectedSalesperson] = useState<SalespersonSummary | null>(null);

  // Load from database on mount
  useEffect(() => {
    const fetchDatabase = async () => {
      try {
        const res = await fetch("/api/db/get-data");
        const data = await res.json();
        if (data.success) {
          if (connection.isDemoMode) {
            if (data.products && data.products.length > 0) setProducts(data.products);
            if (data.orders) setOrders(data.orders);
            if (data.orderLines) setOrderLines(data.orderLines);
            if (data.expiryAlerts) setExpiryAlerts(data.expiryAlerts);
            if (data.posReports) setPosReports(data.posReports);
            if (data.posSessions) setPosSessions(data.posSessions);
            if (data.posTransactions) setPosTransactions(data.posTransactions);
          } else {
            setProducts(data.products || []);
            setOrders(data.orders || []);
            setOrderLines(data.orderLines || []);
            setExpiryAlerts(data.expiryAlerts || []);
            setPosReports(data.posReports || []);
            setPosSessions(data.posSessions || []);
            setPosTransactions(data.posTransactions || []);
          }
          if (data.odooUsers) setOdooUsers(data.odooUsers);
          if (data.rules) setRules(data.rules);
        }
      } catch (err) {
        console.error("Error reading backend local DB:", err);
      }
    };
    fetchDatabase();
  }, [connection.isDemoMode]);

  // Handle loading real data vs returning to demo mode
  useEffect(() => {
    if (connection.isDemoMode) {
      setProducts(MOCK_PRODUCTS);
      setOrders(MOCK_ORDERS);
      setOrderLines(MOCK_ORDER_LINES);
      setExpiryAlerts(MOCK_EXPIRY_ALERTS);
      setPosReports(MOCK_POS_DAILY_REPORTS);
      setPosSessions(MOCK_POS_SESSIONS);
      setPosTransactions(MOCK_POS_TRANSACTIONS);
    }
  }, [connection.isDemoMode]);

  // Redirect administrator to Odoo connection settings on first real login
  useEffect(() => {
    if (isLoggedIn && !connection.isDemoMode && !connection.isConnected) {
      setActiveTab("configuracion");
      setShowAppSwitcher(false);
    }
  }, [isLoggedIn, connection.isDemoMode, connection.isConnected]);

  const handleConnectionChange = (newConn: OdooConnection) => {
    setConnection(newConn);
  };

  const handleRealOdooDataLoaded = (
    loadedProducts: OdooProduct[],
    loadedOrders: OdooSaleOrder[],
    loadedLines: OdooSaleOrderLine[],
    loadedExpiry?: ExpiryAlert[],
    loadedPos?: PosDailyReport[],
    loadedSessions?: PosSession[],
    loadedTxs?: PosTransactionDetail[],
    loadedUsers?: any[]
  ) => {
    setProducts(Array.isArray(loadedProducts) ? loadedProducts : []);
    setOrders(Array.isArray(loadedOrders) ? loadedOrders : []);
    setOrderLines(Array.isArray(loadedLines) ? loadedLines : []);
    
    if (connection.isDemoMode) {
      setExpiryAlerts(loadedExpiry && Array.isArray(loadedExpiry) && loadedExpiry.length > 0 ? loadedExpiry : MOCK_EXPIRY_ALERTS);
      setPosReports(loadedPos && Array.isArray(loadedPos) && loadedPos.length > 0 ? loadedPos : MOCK_POS_DAILY_REPORTS);
      setPosSessions(loadedSessions && Array.isArray(loadedSessions) && loadedSessions.length > 0 ? loadedSessions : MOCK_POS_SESSIONS);
      setPosTransactions(loadedTxs && Array.isArray(loadedTxs) && loadedTxs.length > 0 ? loadedTxs : MOCK_POS_TRANSACTIONS);
    } else {
      setExpiryAlerts(Array.isArray(loadedExpiry) ? loadedExpiry : []);
      setPosReports(Array.isArray(loadedPos) ? loadedPos : []);
      setPosSessions(Array.isArray(loadedSessions) ? loadedSessions : []);
      setPosTransactions(Array.isArray(loadedTxs) ? loadedTxs : []);
    }
    
    if (loadedUsers && Array.isArray(loadedUsers)) {
      setOdooUsers(loadedUsers);
    } else {
      setOdooUsers([]);
    }
  };

  const handleSaveCommissionRule = async (productId: number, type: "percentage" | "flat", value: number) => {
    setRules((prevRules) => {
      const idx = prevRules.findIndex((r) => r.productId === productId);
      if (idx > -1) {
        const next = [...prevRules];
        next[idx] = { productId, type, value };
        return next;
      }
      return [...prevRules, { productId, type, value }];
    });

    try {
      await fetch("/api/db/save-rule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, type, value })
      });
    } catch (err) {
      console.error("Error writing to backend rules DB:", err);
    }
  };

  const handleRemoveCommissionRule = async (productId: number) => {
    setRules((prevRules) => prevRules.filter((r) => r.productId !== productId));

    try {
      await fetch("/api/db/remove-rule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });
    } catch (err) {
      console.error("Error removing rule from backend DB:", err);
    }
  };

  const handleManualSync = async () => {
    if (connection.isDemoMode) {
      // Simulate quick synchronization
      const originalExpiry = [...expiryAlerts];
      const originalPos = [...posReports];
      setExpiryAlerts([]);
      setPosReports([]);
      setTimeout(() => {
        setExpiryAlerts(originalExpiry);
        setPosReports(originalPos);
      }, 400);
      return;
    }

    try {
      const response = await fetch("/api/odoo/fetch-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: connection.url,
          db: connection.db,
          username: connection.username,
          password: connection.password,
          uid: connection.uid,
          companyId: connection.companyId
        })
      });

      const data = await response.json();
      if (data.success) {
        handleRealOdooDataLoaded(
          data.products,
          data.orders,
          data.orderLines,
          data.expiryAlerts,
          data.posReports,
          data.posSessions,
          data.posTransactions,
          data.users
        );
      }
    } catch (err) {
      console.error("Failed to sync automatically", err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowAppSwitcher(true);
    // Reset connection state partially
    setConnection({
      ...connection,
      isConnected: false
    });
  };

  const handleAppSelect = (tab: "comisiones" | "caducidad" | "ventas_pos" | "configuracion") => {
    setActiveTab(tab);
    setShowAppSwitcher(false);
  };

  // Render Portal Login if not logged in
  if (!isLoggedIn) {
    return (
      <OdooPortalLogin
        connection={connection}
        onChangeConnection={handleConnectionChange}
        onDataLoaded={handleRealOdooDataLoaded}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setShowAppSwitcher(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Odoo 19 Signature Header */}
      <header className="bg-[#714B67] text-white shadow-md select-none relative z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          
          {/* Left Controls: App switcher grid, breadcrumbs & app identifier */}
          <div className="flex items-center gap-4">
            {/* todoo 9-dots App Launcher Switcher */}
            <button
              onClick={() => setShowAppSwitcher(!showAppSwitcher)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Selector de Aplicaciones todoo"
            >
              <Grid className="h-5.5 w-5.5" />
            </button>

            {/* Breadcrumbs / Branding */}
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg lowercase tracking-tight">todoo</span>
              <span className="text-white/45 text-sm">/</span>
              <span className="font-bold text-sm tracking-tight flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md">
                {activeTab === "comisiones" && (
                  <>
                    <Percent className="h-4 w-4 text-[#00A09D]" />
                    <span>Comisiones</span>
                  </>
                )}
                {activeTab === "caducidad" && (
                  <>
                    <Calendar className="h-4 w-4 text-amber-400" />
                    <span>Lotes y Caducidad</span>
                  </>
                )}
                {activeTab === "ventas_pos" && (
                  <>
                    <ShoppingBag className="h-4 w-4 text-sky-400" />
                    <span>Ventas POS Diarias</span>
                  </>
                )}
                {activeTab === "configuracion" && (
                  <>
                    <Settings className="h-4 w-4 text-indigo-400" />
                    <span>Configuración Odoo & Portal</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Center Navigation Menu Bar like Odoo 19 Studio / Portal */}
          <div className="hidden md:flex items-center gap-1 bg-black/15 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => handleAppSelect("comisiones")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "comisiones"
                  ? "bg-white text-[#714B67] shadow-sm"
                  : "text-purple-100 hover:text-white hover:bg-white/5"
              }`}
            >
              Liquidación
            </button>
            <button
              onClick={() => handleAppSelect("caducidad")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "caducidad"
                  ? "bg-white text-[#714B67] shadow-sm"
                  : "text-purple-100 hover:text-white hover:bg-white/5"
              }`}
            >
              Fecha Caducidad Lotes
            </button>
            <button
              onClick={() => handleAppSelect("ventas_pos")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "ventas_pos"
                  ? "bg-white text-[#714B67] shadow-sm"
                  : "text-purple-100 hover:text-white hover:bg-white/5"
              }`}
            >
              Auditoría POS
            </button>
            <button
              onClick={() => handleAppSelect("configuracion")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === "configuracion"
                  ? "bg-white text-[#714B67] shadow-sm"
                  : "text-purple-100 hover:text-white hover:bg-white/5"
              }`}
            >
              Configuración ERP
            </button>
          </div>

          {/* Right Controls: Database details, Company & Logout */}
          <div className="flex items-center gap-3">
            
            {/* Active Company Name tag */}
            <div className="hidden lg:flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <Building2 className="h-3.5 w-3.5 text-purple-200" />
              <span className="font-semibold text-purple-100 max-w-[180px] truncate">
                {connection.companyName}
              </span>
            </div>

            {/* Sync connection details badge */}
            <div className="hidden sm:inline-flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg text-[10px] font-mono text-purple-200">
              {connection.isDemoMode ? "DB: demo_peru" : `DB: ${connection.db}`}
            </div>

            {/* Exit/Logout Button */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-white/10 text-purple-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Cerrar Sesión / Volver al Portal"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

        </div>
      </header>

      {/* Interactive Floating/Collapsible Odoo 19 App Switcher Drawer */}
      <AnimatePresence>
        {showAppSwitcher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-14 bg-slate-900/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 sm:p-12"
          >
            {/* Close handle background click */}
            <div className="absolute inset-0 z-0" onClick={() => setShowAppSwitcher(false)} />

            <div className="relative z-10 w-full max-w-4xl text-center space-y-12">
              <div className="space-y-2">
                <span className="text-[#00A09D] font-mono text-xs uppercase tracking-widest font-extrabold block">
                  todoo App Launcher
                </span>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  Seleccione un Módulo Comercial
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
                  Intercambie dinámicamente entre las funcionalidades avanzadas para optimizar la toma de decisiones en Soles Peruanos.
                </p>
              </div>

              {/* Launcher Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-5xl mx-auto">
                
                {/* Module 1 */}
                <button
                  onClick={() => handleAppSelect("comisiones")}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-6 rounded-2xl text-left transition-all hover:-translate-y-1 flex flex-col justify-between h-48 cursor-pointer group"
                >
                  <div className="p-3 bg-[#714B67] text-white rounded-xl w-fit group-hover:scale-105 transition-transform">
                    <Percent className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white block">Comisiones y Reglas</h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      Gestione tarifas fijas o porcentuales y liquide pagos para la fuerza de ventas.
                    </p>
                  </div>
                </button>

                {/* Module 2 */}
                <button
                  onClick={() => handleAppSelect("caducidad")}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-6 rounded-2xl text-left transition-all hover:-translate-y-1 flex flex-col justify-between h-48 cursor-pointer group"
                >
                  <div className="p-3 bg-amber-500 text-white rounded-xl w-fit group-hover:scale-105 transition-transform">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white block">Control de Caducidad</h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      Alertas tempranas de vencimiento menor a 30 días en almacenes y lotes.
                    </p>
                  </div>
                </button>

                {/* Module 3 */}
                <button
                  onClick={() => handleAppSelect("ventas_pos")}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-6 rounded-2xl text-left transition-all hover:-translate-y-1 flex flex-col justify-between h-48 cursor-pointer group"
                >
                  <div className="p-3 bg-[#00A09D] text-white rounded-xl w-fit group-hover:scale-105 transition-transform">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white block">Ventas Diarias POS</h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      Métricas diarias del punto de venta por método de pago y tipo de boleta/factura.
                    </p>
                  </div>
                </button>

                {/* Module 4 */}
                <button
                  onClick={() => handleAppSelect("configuracion")}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-6 rounded-2xl text-left transition-all hover:-translate-y-1 flex flex-col justify-between h-48 cursor-pointer group"
                >
                  <div className="p-3 bg-indigo-600 text-white rounded-xl w-fit group-hover:scale-105 transition-transform">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white block">Configuración ERP</h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      Conecte a su Odoo real mediante XML-RPC y configure los accesos para su personal.
                    </p>
                  </div>
                </button>

              </div>

              <div className="text-slate-500 text-[11px]">
                Presione cualquier módulo o haga clic afuera para cancelar.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        
        {/* Connection status bar context (minimalist, Odoo styled) */}
        {connection.isDemoMode && (
          <div className="mb-6 p-4 bg-purple-50/70 border border-[#714B67]/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <BadgeInfo className="h-5 w-5 text-[#714B67] shrink-0" />
              <p className="text-xs sm:text-sm text-slate-700">
                Sesión de prueba iniciada con base de datos <strong>demo_peru</strong>. Los importes reflejan soles de prueba.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-[#714B67] hover:bg-[#5a3b52] text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Conectar Base Real
            </button>
          </div>
        )}

        {/* Dynamic subcomponent rendering with smooth fade-in */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "comisiones" && (
              <motion.div
                key="comisiones-enterprise"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <SalesDashboard
                  orders={orders}
                  orderLines={orderLines}
                  products={products}
                  rules={rules}
                  onSaveRule={handleSaveCommissionRule}
                  onRemoveRule={handleRemoveCommissionRule}
                  onSelectSalesperson={(summary) => setSelectedSalesperson(summary)}
                />
              </motion.div>
            )}

            {activeTab === "caducidad" && (
              <motion.div
                key="caducidad-enterprise"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <ExpiryAlertsList
                  expiryAlerts={expiryAlerts}
                  isDemoMode={connection.isDemoMode}
                  onRefresh={handleManualSync}
                />
              </motion.div>
            )}

            {activeTab === "ventas_pos" && (
              <motion.div
                key="pos-enterprise"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <PosDailySum
                  reports={posReports}
                  posSessions={posSessions}
                  posTransactions={posTransactions}
                  isDemoMode={connection.isDemoMode}
                  onRefresh={handleManualSync}
                />
              </motion.div>
            )}

            {activeTab === "configuracion" && (
              <motion.div
                key="configuracion-enterprise"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <OdooConnectionForm
                  connection={connection}
                  onChangeConnection={handleConnectionChange}
                  onDataLoaded={handleRealOdooDataLoaded}
                />
                
                <PortalUserManagement
                  orders={orders}
                  currentUsername={connection.username}
                  odooUsers={odooUsers}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Details modal backdrop and portal popup */}
      <AnimatePresence>
        {selectedSalesperson && (
          <SalespersonDetailsModal
            salesperson={selectedSalesperson}
            onClose={() => setSelectedSalesperson(null)}
          />
        )}
      </AnimatePresence>

      {/* Footer bar styled like todoo workspace metadata */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-16 py-8 text-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-white">
              <span className="lowercase font-extrabold text-sm tracking-tight text-[#00A09D]">todoo</span>
              <span>GAORSYSTEM PERU</span>
            </div>
            <p className="text-slate-400">
              Sistema de información para los negocios - Comisiones, Lotes y Ventas POS.
            </p>
          </div>
          <div className="space-y-1 sm:text-right text-slate-400">
            <p>Todos los importes monetarios mostrados están expresados en Soles Peruanos (S/.).</p>
            <p className="text-[10px]">Servidor de Base de Datos Conectado en Zona Horaria UTC-5 (Lima, Perú).</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
