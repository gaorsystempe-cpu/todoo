import React, { useState } from "react";
import { OdooConnection } from "../types";
import { KeyRound, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import heroImage from "../assets/images/odoo_portal_hero_1782267365688.jpg";

interface OdooPortalLoginProps {
  connection: OdooConnection;
  onChangeConnection: (conn: OdooConnection) => void;
  onDataLoaded: (products: any[], orders: any[], orderLines: any[], expiryAlerts?: any[], posReports?: any[]) => void;
  onLoginSuccess: (user: any) => void;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Por favor, ingrese su usuario y contraseña.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const isAdmin = data.user.role === "admin";
        if (data.odooConnection && data.odooConnection.isConnected) {
          onChangeConnection(data.odooConnection);
        } else {
          onChangeConnection({
            ...connection,
            username: isAdmin ? (connection.username || "") : username.trim(),
            password: isAdmin ? (connection.password || "") : password.trim(),
            isConnected: false,
            isDemoMode: true, // fallback to demo mode if no Odoo connection configured yet
            companyId: isAdmin ? (connection.companyId || 0) : 1,
            companyName: "GAORSYSTEM PERU"
          });
        }
        onLoginSuccess(data.user);
      } else {
        setError(data.message || "Credenciales de acceso incorrectas.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de comunicación con el servidor. Verifique su conexión.");
    } finally {
      setLoading(false);
    }
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
              <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-white">
                Gestión de Comisiones
              </h2>
              <p className="text-xs sm:text-sm text-purple-100/90 font-medium leading-relaxed">
                Acceda a su portal unificado para supervisar sus liquidaciones de comisiones, ventas acumuladas e indicadores en tiempo real.
              </p>
            </div>
          </div>

          {/* Dynamic Generated Dashboard Preview from earlier step */}
          <div className="relative z-10 my-6">
            <img
              src={heroImage}
              alt="todoo Portal Dashboard"
              referrerPolicy="no-referrer"
              className="rounded-2xl shadow-xl border border-white/10 max-h-[180px] object-cover w-full transform hover:scale-[1.02] transition-transform duration-300"
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
        </div>

      </div>
    </div>
  );
}
