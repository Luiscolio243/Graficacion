import { useState } from "react";

const BASE_URL = "http://127.0.0.1:5000";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

export default function ModalRol({ onClose, onGuardar }) {
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      setError("El nombre del rol es obligatorio.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/roles/agregar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: form.nombre.trim(), descripcion: form.descripcion.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar el rol");
      }
      const data = await res.json();
      onGuardar(data);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Nuevo Rol</h2>
            <p className="text-xs text-gray-400 mt-0.5">Define un nuevo rol para stakeholders</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Nombre del rol <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Ej: Usuario clave, Sponsor, Analista"
              className={inputCls}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleGuardar()}
            />
          </div>

          <div>
            <label className={labelCls}>
              Descripción <span className="text-gray-400 font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Descripción breve del rol y sus responsabilidades"
              rows={3}
              className={inputCls + " resize-none"}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

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
            {guardando ? "Guardando..." : "Crear Rol"}
          </button>
        </div>
      </div>
    </div>
  );
}
