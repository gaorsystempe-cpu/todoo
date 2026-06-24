import React, { useState } from "react";
import { OdooConnection } from "../types";
import { KeyRound, Mail, Eye, EyeOff, Loader2, BarChart3, ShieldCheck, ShoppingBag } from "lucide-react";

interface OdooPortalLoginProps {
  connection: OdooConnection;
  onChangeConnection: (conn: OdooConnection) => void;
  onDataLoaded: (products: any[], orders: any[], orderLines: any[], expiryAlerts?: any[], posReports?: any[]) => void;
  onLoginSuccess: () => void;
}

export default function OdooPortalLogin({
  connection,
  onChangeConnection,
  onLoginSuccess
}: OdooPortalLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Por favor, ingrese su usuario y contraseña.");
      return;
    }

    setLoading(true);

    // Simulate standard secure enterprise portal authentication
    setTimeout(() => {
      onChangeConnection({
        ...connection,
        username: username,
        isConnected: true,
        isDemoMode: true,
        companyId: 1,
        companyName: "GAORSYSTEM PERU"
      });
      setLoading(false);
      onLoginSuccess();
    }, 800);
  };

  const handleAutofillDemo = () => {
    setUsername("demo@gaorsystem.pe");
    setPassword("demo");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Column - Odoo Branding & Premium Business Pitch */}
        <div className="lg:col-span-6 bg-[#714B67] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle elegant gradient pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#714B67] via-[#5c3c54] to-[#4c2f44] opacity-95 z-0" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight font-serif lowercase">todoo</span>
              <span className="bg-[#00A09D] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md tracking-wider">
                Portal Empresarial
              </span>
            </div>
            
            <div className="space-y-3">
              <span className="text-[10px] bg-white/10 text-purple-100 uppercase font-black tracking-widest px-2.5 py-1 rounded-full w-fit block">
                Sistemas de Información de Negocios
              </span>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white">
                Gestión Inteligente y Decisiones Comerciales
              </h2>
              <p className="text-xs sm:text-sm text-purple-100/90 font-medium leading-relaxed">
                Optimice el rendimiento de su compañía mediante nuestro portal unificado. Diseñado exclusivamente para supervisar indicadores clave de ventas, auditorías diarias y logística.
              </p>
            </div>

            {/* List of high-level business capabilities */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white/10 rounded-lg text-[#00A09D] shrink-0 mt-0.5">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Liquidación de Comisiones</h4>
                  <p className="text-[11px] text-purple-200/90">Efectúe el cálculo preciso y automatizado para su fuerza de ventas.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white/10 rounded-lg text-[#00A09D] shrink-0 mt-0.5">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Control de Lotes y Caducidades</h4>
                  <p className="text-[11px] text-purple-200/90">Prevenga pérdidas monitoreando fechas de vencimiento clave.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-white/10 rounded-lg text-[#00A09D] shrink-0 mt-0.5">
                  <ShoppingBag className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Auditoría POS Diaria</h4>
                  <p className="text-[11px] text-purple-200/90">Visualice e integre los ingresos de sus puntos de venta.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Generated Dashboard Preview from earlier step */}
          <div className="relative z-10 my-6">
            <img
              src="/src/assets/images/odoo_portal_hero_1782267365688.jpg"
              alt="todoo Portal Dashboard"
              referrerPolicy="no-referrer"
              className="rounded-2xl shadow-xl border border-white/10 max-h-[160px] object-cover w-full transform hover:scale-[1.02] transition-transform duration-300"
            />
          </div>

          <div className="relative z-10 text-[10px] text-purple-200/70 flex items-center justify-between border-t border-white/10 pt-4">
            <span>Soles Peruanos • S/. PEN</span>
            <span>Sistema Multicompañía</span>
          </div>
        </div>

        {/* Right Column - Beautiful and simple login panel */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8 text-center lg:text-left">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Ingresar al Portal
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 font-medium leading-relaxed">
              Introduzca sus credenciales autorizadas de colaborador para ingresar al sistema de información corporativo.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-150 rounded-xl text-xs text-red-600 font-medium animate-shake">
              {error}
            </div>
          )}

          {/* Quick demo credentials display & autofill button */}
          <div className="mb-6 p-4 bg-purple-50/70 rounded-2xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase text-[#714B67] tracking-wider block">Acceso de Demostración</span>
              <div className="text-[11px] text-slate-600 font-medium space-y-0.5">
                <div><span className="font-bold text-slate-700">Usuario:</span> demo@gaorsystem.pe</div>
                <div><span className="font-bold text-slate-700">Contraseña:</span> demo</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="px-3.5 py-1.5 text-[10px] font-extrabold text-[#714B67] hover:text-white bg-purple-100/80 hover:bg-[#714B67] border border-purple-200 hover:border-[#714B67] rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-center"
            >
              Autocompletar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Usuario o Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ejemplo@gaorsystem.pe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-[#714B67] focus:ring-2 focus:ring-[#714B67]/10 transition-all text-slate-800 font-medium"
                  disabled={loading}
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Contraseña de Acceso
                </label>
                <span className="text-[11px] text-[#714B67] hover:underline cursor-pointer font-bold">
                  ¿Olvidó su contraseña?
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-xs focus:outline-none focus:border-[#714B67] focus:ring-2 focus:ring-[#714B67]/10 transition-all text-slate-800 font-medium"
                  disabled={loading}
                />
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember device checkbox */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-[#714B67] focus:ring-[#714B67] h-3.5 w-3.5"
                />
                <span className="text-[11px] text-slate-500 font-medium">Recordar este dispositivo</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#714B67] hover:bg-[#5c3c54] active:bg-[#4c2f44] text-white py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando credenciales...
                </>
              ) : (
                "Acceder al Sistema de Información"
              )}
            </button>
          </form>

          {/* Business notice */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center lg:text-left">
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              * Para fines de demostración de este sistema, puede ingresar cualquier usuario y contraseña para explorar las pantallas del portal.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
