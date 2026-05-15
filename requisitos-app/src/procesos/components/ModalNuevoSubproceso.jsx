import { useState } from "react";

const BASE_URL = "http://127.0.0.1:5000";
const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

export default function ModalNuevoSubproceso({
  idProceso,
  stakeholders = [],
  onClose,
  onGuardar,
  modo = "crear",
  subprocesoInicial = null,
}) {
  const [form, setForm] = useState({
    nombre:         subprocesoInicial?.nombre         || "",
    descripcion:    subprocesoInicial?.descripcion    || "",
    id_stakeholder: subprocesoInicial?.id_stakeholder || "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState(null);

  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleGuardar = async () => {
    if (!form.nombre.trim())  { setError("El nombre es obligatorio."); return; }
    if (!form.id_stakeholder) { setError("Selecciona un stakeholder responsable."); return; }
    if (!idProceso)           { setError("Error: no se recibió el id del proceso. Cierra y vuelve a intentar."); return; }

    setError(null);
    setGuardando(true);
    try {
      const url = modo === "editar"
        ? `${BASE_URL}/subprocesos/${subprocesoInicial?.id}`
        : `${BASE_URL}/subprocesos/crear`;
      const res = await fetch(url, {
        method: modo === "editar" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          modo === "editar"
            ? {
                id_stakeholder: parseInt(form.id_stakeholder, 10),
                nombre: form.nombre.trim(),
                descripcion: form.descripcion || null,
              }
            : {
                id_proceso: parseInt(idProceso, 10),
                id_stakeholder: parseInt(form.id_stakeholder, 10),
                nombre: form.nombre.trim(),
                descripcion: form.descripcion || null,
              }
        ),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar subproceso");
      }
      const data = await res.json();
      if (modo === "editar") {
        const sp = data.subproceso;
        onGuardar({ id: sp.id, nombre: sp.nombre, descripcion: sp.descripcion, id_stakeholder: sp.id_stakeholder });
      } else {
        onGuardar({
          id: data.id_subproceso,
          nombre: data.nombre,
          descripcion: form.descripcion,
          id_stakeholder: parseInt(form.id_stakeholder, 10),
          tecnicas: [],
        });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {modo === "editar" ? "Editar subproceso" : "Nuevo subproceso"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Define una actividad específica dentro del proceso</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Datos del subproceso</p>

          <div>
            <label className={labelCls}>Nombre <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Ej. Alta de productos"
              className={inputCls}
              autoFocus
            />
          </div>

          <div>
            <label className={labelCls}>Stakeholder responsable <span className="text-red-500">*</span></label>
            <select
              value={form.id_stakeholder}
              onChange={(e) => set("id_stakeholder", e.target.value)}
              className={inputCls}
            >
              <option value="">Selecciona un stakeholder</option>
              {stakeholders.map((s) => (
                <option key={s.id_stakeholder} value={s.id_stakeholder}>
                  {s.nombre}
                </option>
              ))}
            </select>
            {stakeholders.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">Agrega stakeholders al proyecto primero</p>
            )}
          </div>

          <div>
            <label className={labelCls}>
              Descripción <span className="text-gray-400 font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              rows={3}
              placeholder="Describe brevemente qué se hace en este subproceso"
              className={inputCls + " resize-none"}
            />
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={guardando}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {guardando ? "Guardando..." : modo === "editar" ? "Guardar cambios" : "Crear subproceso"}
          </button>
        </div>
      </div>
    </div>
  );
}
