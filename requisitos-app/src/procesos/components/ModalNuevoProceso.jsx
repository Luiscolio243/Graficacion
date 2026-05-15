import { useState } from "react";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

export default function ModalNuevoProceso({
  onClose,
  onGuardar,
  listaTI = [],
  modo = "crear",
  procesoInicial = null,
}) {
  const [form, setForm] = useState({
    nombre:       procesoInicial?.nombre       || "",
    descripcion:  procesoInicial?.descripcion  || "",
    area:         procesoInicial?.area         || "",
    responsableId: procesoInicial?.responsableId || "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState(null);

  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleGuardar = () => {
    if (!form.nombre.trim()) { setError("El nombre del proceso es obligatorio."); return; }
    setError(null);
    setGuardando(true);
    Promise.resolve(onGuardar({ ...form }))
      .catch((e) => setError(e.message || "Error al guardar proceso"))
      .finally(() => setGuardando(false));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {modo === "editar" ? "Editar proceso" : "Nuevo proceso"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {modo === "editar"
                ? "Actualiza la información del proceso"
                : "Define la información principal del proceso de negocio"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="divide-y divide-gray-100">

          {/* Información del proceso */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Información del proceso</p>
            <div>
              <label className={labelCls}>Nombre <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                placeholder="Ej. Gestión de almacén"
                className={inputCls}
                autoFocus
              />
            </div>
            <div>
              <label className={labelCls}>
                Descripción <span className="text-gray-400 font-normal normal-case">(opcional)</span>
              </label>
              <textarea
                value={form.descripcion}
                onChange={(e) => set("descripcion", e.target.value)}
                placeholder="Describe brevemente el proceso..."
                rows={3}
                className={inputCls + " resize-none"}
              />
            </div>
          </div>

          {/* Responsabilidad */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Responsabilidad</p>
            <div>
              <label className={labelCls}>
                Área responsable <span className="text-gray-400 font-normal normal-case">(opcional)</span>
              </label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
                placeholder="Ej. Operaciones, Ventas, TI"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Responsable del proceso <span className="text-gray-400 font-normal normal-case">(opcional)</span>
              </label>
              <select
                value={form.responsableId}
                onChange={(e) => set("responsableId", e.target.value)}
                className={inputCls}
              >
                <option value="">Selecciona un responsable</option>
                {listaTI.map((pti) => (
                  <option key={pti.id_personal_ti} value={pti.usuario?.id_usuario ?? ""}>
                    {pti.usuario?.nombre} {pti.usuario?.apellido}
                  </option>
                ))}
              </select>
              {listaTI.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">Agrega integrantes al equipo TI primero</p>
              )}
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
            {guardando ? "Guardando..." : modo === "editar" ? "Guardar cambios" : "Agregar proceso"}
          </button>
        </div>
      </div>
    </div>
  );
}
