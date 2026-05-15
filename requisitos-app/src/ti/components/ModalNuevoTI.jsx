import { useState } from "react";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

export default function ModalNuevoTI({
  onClose,
  onGuardar,
  roles = [],
  modo = "crear",
  tiInicial = null,
}) {
  const [form, setForm] = useState({
    nombre:   tiInicial?.usuario?.nombre   || "",
    apellido: tiInicial?.usuario?.apellido || "",
    email:    tiInicial?.usuario?.email    || "",
    id_rol:   tiInicial?.rol?.id_rol       || "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState(null);

  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleGuardar = () => {
    if (!form.nombre.trim())   { setError("El nombre es obligatorio.");        return; }
    if (!form.apellido.trim()) { setError("El apellido es obligatorio.");       return; }
    if (!form.email.trim())    { setError("El correo electrónico es obligatorio."); return; }
    if (!form.id_rol)          { setError("Selecciona un rol.");                return; }
    setError(null);
    setGuardando(true);
    onGuardar({ ...form, id_rol: Number(form.id_rol) })
      .finally(() => setGuardando(false));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {modo === "editar" ? "Editar integrante de TI" : "Nuevo integrante de TI"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {modo === "editar"
                ? "Actualiza la información del integrante"
                : "Si el correo no existe se creará un usuario con contraseña temporal"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="divide-y divide-gray-100">

          {/* Datos personales */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Datos personales</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nombre <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => set("nombre", e.target.value)}
                  placeholder="Ej: Juan"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <label className={labelCls}>Apellido <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.apellido}
                  onChange={(e) => set("apellido", e.target.value)}
                  placeholder="Ej: García"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Correo electrónico <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="correo@ejemplo.com"
                className={inputCls}
                disabled={modo === "editar"}
              />
              {modo === "editar" && (
                <p className="text-[11px] text-gray-400 mt-1">El correo no se puede modificar después de creado.</p>
              )}
            </div>
          </div>

          {/* Rol */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Rol en el equipo</p>
            <div>
              <label className={labelCls}>Rol <span className="text-red-500">*</span></label>
              <select
                value={form.id_rol}
                onChange={(e) => set("id_rol", e.target.value)}
                className={inputCls}
              >
                <option value="">Selecciona un rol</option>
                {roles.map((r) => (
                  <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={guardando}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {guardando ? "Guardando..." : modo === "editar" ? "Guardar cambios" : "Agregar integrante"}
          </button>
        </div>
      </div>
    </div>
  );
}
