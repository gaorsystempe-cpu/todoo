import React, { useState, useEffect } from "react";
import { UserPlus, Trash2, Shield, User, Lock, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface PortalUser {
  username: string;
  password?: string;
  name: string;
  role: string;
  odoo_partner_id?: number | null;
}

interface PortalUserManagementProps {
  orders: any[]; // Used to extract salespersons dynamically from real orders!
  currentUsername: string;
  odooUsers?: any[];
}

export default function PortalUserManagement({ orders, currentUsername, odooUsers }: PortalUserManagementProps) {
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [odooPartnerId, setOdooPartnerId] = useState<string>("");

  // Extract unique salespersons from active Odoo orders
  const salespersons = React.useMemo(() => {
    const list: { id: number; name: string }[] = [];
    const seenIds = new Set<number>();

    orders.forEach((o) => {
      if (o.user_id && Array.isArray(o.user_id) && o.user_id.length === 2) {
        const id = o.user_id[0];
        const label = o.user_id[1];
        if (id && label && !seenIds.has(id)) {
          seenIds.add(id);
          list.push({ id, name: label });
        }
      }
    });
    return list;
  }, [orders]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/db/get-users");
      const data = await response.json();
      if (response.ok && data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.message || "Error al cargar los usuarios del portal.");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron consultar los usuarios del portal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !name.trim()) {
      setError("Por favor, rellene todos los campos obligatorios.");
      return;
    }

    setSaveLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/db/save-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.toLowerCase().trim(),
          password: password.trim(),
          name: name.trim(),
          role,
          odoo_partner_id: odooPartnerId ? parseInt(odooPartnerId, 10) : null
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUsers(data.users || []);
        setSuccess(`Usuario ${username} guardado con éxito.`);
        // Reset form
        setUsername("");
        setPassword("");
        setName("");
        setRole("user");
        setOdooPartnerId("");
      } else {
        setError(data.message || "Error al registrar el usuario.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de red al intentar registrar el usuario.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRemoveUser = async (targetUsername: string) => {
    if (targetUsername.toLowerCase() === currentUsername.toLowerCase()) {
      setError("No puede eliminar su propio usuario activo de sesión.");
      return;
    }

    if (!confirm(`¿Está seguro de que desea revocar el acceso para el usuario ${targetUsername}?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/db/remove-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: targetUsername })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUsers(data.users || []);
        setSuccess("Acceso revocado exitosamente.");
      } else {
        setError(data.message || "Error al eliminar el usuario.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de comunicación al intentar revocar el acceso.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSalesperson = (sp: { id: number; name: string }) => {
    setName(sp.name);
    setOdooPartnerId(sp.id.toString());
    // Auto-suggest a default username if empty
    if (!username) {
      const cleanEmail = sp.name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/\s+/g, ".") + "@facturaclic.pe";
      setUsername(cleanEmail);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            Gestión de Accesos al Portal (Usuarios)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Asigne contraseñas de ingreso y perfiles para sus vendedores detectados en Odoo o cree administradores adicionales.
          </p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Recargar usuarios"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Add/Assign User */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">Asignar Acceso de Colaborador</h3>
            <p className="text-[11px] text-indigo-700/90 leading-relaxed">
              Para habilitar que un vendedor consulte sus comisiones u alertas, cree su usuario aquí. Las credenciales se guardarán de manera segura.
            </p>
          </div>

          {/* Quick Match with Odoo Salesperson */}
          {salespersons.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Vendedores Detectados en Odoo
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto p-1 border border-slate-100 rounded-lg bg-slate-50/30">
                {salespersons.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => handleSelectSalesperson(sp)}
                    className="px-2.5 py-1 text-[10px] font-medium bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-md transition-all cursor-pointer shadow-xs truncate max-w-[180px]"
                    title={`Vendedor Odoo ID: ${sp.id}`}
                  >
                    👤 {sp.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSaveUser} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Mendoza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Usuario / Email *</label>
                <input
                  type="email"
                  required
                  placeholder="carlos@facturaclic.pe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña Acceso *</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Clave de acceso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white font-mono font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rol / Permiso</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white font-medium text-slate-800"
                >
                  <option value="user">Vendedor (Básico)</option>
                  <option value="admin">Administrador (Completo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Usuario Vendedor Odoo</label>
                {odooUsers && odooUsers.length > 0 ? (
                  <select
                    value={odooPartnerId}
                    onChange={(e) => {
                      setOdooPartnerId(e.target.value);
                      if (e.target.value) {
                        const matched = odooUsers.find((u) => u.id.toString() === e.target.value);
                        if (matched && !name) {
                          setName(matched.name);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white font-medium text-slate-800"
                  >
                    <option value="">-- Seleccionar Odoo User --</option>
                    {odooUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.login})
                      </option>
                    ))}
                  </select>
                ) : salespersons && salespersons.length > 0 ? (
                  <select
                    value={odooPartnerId}
                    onChange={(e) => {
                      setOdooPartnerId(e.target.value);
                      if (e.target.value) {
                        const matched = salespersons.find((u) => u.id.toString() === e.target.value);
                        if (matched && !name) {
                          setName(matched.name);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white font-medium text-slate-800"
                  >
                    <option value="">-- Seleccionar Vendedor Extraído --</option>
                    {salespersons.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (ID: {s.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    placeholder="Ej: 111"
                    value={odooPartnerId}
                    onChange={(e) => setOdooPartnerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white font-medium text-slate-800"
                    title="Permite filtrar automáticamente los pedidos que le pertenecen a este usuario al ingresar."
                  />
                )}
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-start gap-1.5 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-600 flex items-start gap-1.5 font-medium">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saveLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {saveLoading ? "Registrando..." : "Registrar y Activar Acceso"}
            </button>
          </form>
        </div>

        {/* Right Section: Registered Portal Users list */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Accesos Registrados en el Sistema ({users.length})
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
            {users.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <User className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">No hay usuarios adicionales registrados en el portal todavía.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Colaborador</th>
                      <th className="px-4 py-2.5">Credenciales</th>
                      <th className="px-4 py-2.5">Rol</th>
                      <th className="px-4 py-2.5">Vinculación ERP</th>
                      <th className="px-4 py-2.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 bg-white">
                    {users.map((u) => (
                      <tr key={u.username} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">{u.username}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200/50 w-fit">
                            🔑 {u.password || "••••••••"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                            u.role === "admin"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-150"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            {u.role === "admin" ? "Administrador" : "Vendedor"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-500 font-medium">
                          {u.odoo_partner_id ? (
                            <span className="text-emerald-700 font-semibold">
                              Odoo ID: {u.odoo_partner_id}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No vinculado</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveUser(u.username)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Revocar acceso"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>
    </div>
  );
}
