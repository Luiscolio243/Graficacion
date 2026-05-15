import { useState, useEffect } from "react";

const BASE_URL = "http://127.0.0.1:5000";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

export default function ModalNuevoStakeholder({
  onClose,
  onGuardar,
  idProyecto,
  modo = "crear",
  stakeholderInicial = null,
  rolesDisponibles = [],
}) {
  const [form, setForm] = useState({
    nombre:       stakeholderInicial?.nombre       || "",
    apellidos:    stakeholderInicial?.apellidos    || "",
    rol:          stakeholderInicial?.rol          || "",
    tipo:         stakeholderInicial?.tipo         || "Interno",
    correo:       stakeholderInicial?.correo       || stakeholderInicial?.email || "",
    telefono:     stakeholderInicial?.telefono     || "",
    organizacion: stakeholderInicial?.organizacion || "",
    notas:        stakeholderInicial?.notas        || "",
  });

  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState(null);

  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!form.rol && rolesDisponibles.length > 0) {
      setError("Selecciona un rol.");
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      const url = modo === "editar"
        ? `${BASE_URL}/stakeholders/${stakeholderInicial?.id_stakeholder}`
        : `${BASE_URL}/stakeholders/agregar`;

      const res = await fetch(url, {
        method: modo === "editar" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          modo === "editar"
            ? { ...form }
            : { id_proyecto: idProyecto, ...form }
        ),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }

      const data = await res.json();
      const sh = data.stakeholder;
      onGuardar({
        id_stakeholder: sh.id_stakeholder,
        nombre:         sh.nombre,
        apellidos:      "",
        rol:            sh.rol,
        tipo:           sh.tipo,
        correo:         sh.email,
        telefono:       sh.telefono,
        organizacion:   sh.organizacion || "",
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {modo === "editar" ? "Editar Stakeholder" : "Nuevo Stakeholder"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {modo === "editar"
                ? "Actualiza la información del stakeholder"
                : "Agrega una persona involucrada en el proyecto"}
            </p>
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

        <div className="divide-y divide-gray-100">

          {/* Sección: Datos personales */}
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
                <label className={labelCls}>Apellidos</label>
                <input
                  type="text"
                  value={form.apellidos}
                  onChange={(e) => set("apellidos", e.target.value)}
                  placeholder="Ej: García López"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Correo electrónico</label>
                <input
                  type="email"
                  value={form.correo}
                  onChange={(e) => set("correo", e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Teléfono</label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                  placeholder="Ej: 6681234567"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Sección: Rol y tipo */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Rol y participación</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Rol</label>
                {rolesDisponibles.length > 0 ? (
                  <select
                    value={form.rol}
                    onChange={(e) => set("rol", e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Selecciona un rol</option>
                    {rolesDisponibles.map((r) => (
                      <option key={r.id_rol ?? r.nombre} value={r.nombre}>{r.nombre}</option>
                    ))}
                  </select>
                ) : (
                  <>
                    <input
                      type="text"
                      value={form.rol}
                      onChange={(e) => set("rol", e.target.value)}
                      placeholder="Escribe el rol manualmente"
                      className={inputCls}
                    />
                    <p className="text-[11px] text-amber-600 mt-1">
                      No hay roles creados. Cierra este modal y usa "+ Nuevo Rol" para crearlos, o escríbelo aquí.
                    </p>
                  </>
                )}
              </div>
              <div>
                <label className={labelCls}>Tipo</label>
                <div className="flex gap-2 mt-0.5">
                  {["Interno", "Externo"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set("tipo", t)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                        form.tipo === t
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Organización y notas */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Contexto adicional</p>

            <div>
              <label className={labelCls}>Organización / Empresa</label>
              <input
                type="text"
                value={form.organizacion}
                onChange={(e) => set("organizacion", e.target.value)}
                placeholder="Ej: Empresa ABC S.A. de C.V."
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Notas</label>
              <textarea
                value={form.notas}
                onChange={(e) => set("notas", e.target.value)}
                placeholder="Observaciones adicionales sobre este stakeholder"
                rows={3}
                className={inputCls + " resize-none"}
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
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
            {guardando ? "Guardando..." : modo === "editar" ? "Guardar cambios" : "Crear Stakeholder"}
          </button>
        </div>
      </div>
    </div>
  );
}
