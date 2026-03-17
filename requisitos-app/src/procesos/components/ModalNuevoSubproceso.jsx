import { useState } from "react";

export default function ModalNuevoSubproceso({
  idProceso,
  stakeholders = [],
  onClose,
  onGuardar,
  modo = "crear",
  subprocesoInicial = null,
}) {
  const [subproceso, setSubproceso] = useState({
    nombre: subprocesoInicial?.nombre || "",
    descripcion: subprocesoInicial?.descripcion || "",
    id_stakeholder: subprocesoInicial?.id_stakeholder || "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setSubproceso({
      ...subproceso,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {modo === "editar" ? "Editar Subproceso" : "Nuevo Subproceso"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Define una actividad específica dentro del proceso
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre del subproceso *
          </label>
          <input
            name="nombre"
            placeholder="Ej. Alta de productos"
            value={subproceso.nombre}
            className="input mt-1"
            onChange={handleChange}
          />
        </div>

        {/* Stakeholder */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stakeholder responsable *
          </label>
          <select
            name="id_stakeholder"
            value={subproceso.id_stakeholder}
            onChange={handleChange}
            className="input mt-1"
          >
            <option value="">Selecciona un stakeholder</option>
            {stakeholders.map((s) => (
              <option key={s.id_stakeholder} value={s.id_stakeholder}>
                {s.nombre}
              </option>
            ))}
          </select>
          {stakeholders.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              Agrega stakeholders al proyecto primero
            </p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            name="descripcion"
            rows={3}
            placeholder="Describe brevemente qué se hace en este subproceso"
            value={subproceso.descripcion}
            className="input mt-1 resize-none"
            onChange={handleChange}
          />
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={guardando}
            className="px-4 py-2 rounded-lg border text-sm"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={guardando || stakeholders.length === 0}
            onClick={async () => {
              if (!subproceso.nombre.trim() || !subproceso.id_stakeholder) return;
              setError(null);
              setGuardando(true);
              try {
                const url =
                  modo === "editar"
                    ? `http://127.0.0.1:5000/subprocesos/${subprocesoInicial?.id}`
                    : "http://127.0.0.1:5000/subprocesos/crear";
                const res = await fetch(url, {
                  method: modo === "editar" ? "PUT" : "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(
                    modo === "editar"
                      ? {
                          id_stakeholder: parseInt(subproceso.id_stakeholder, 10),
                          nombre: subproceso.nombre.trim(),
                          descripcion: subproceso.descripcion || null,
                        }
                      : {
                          id_proceso: parseInt(idProceso, 10),
                          id_stakeholder: parseInt(subproceso.id_stakeholder, 10),
                          nombre: subproceso.nombre.trim(),
                          descripcion: subproceso.descripcion || null,
                        }
                  ),
                });
                if (!res.ok) {
                  const err = await res.json();
                  throw new Error(err.error || "Error al crear subproceso");
                }
                const data = await res.json();
                if (modo === "editar") {
                  const sp = data.subproceso;
                  onGuardar({
                    id: sp.id,
                    nombre: sp.nombre,
                    descripcion: sp.descripcion,
                    id_stakeholder: sp.id_stakeholder,
                  });
                } else {
                  onGuardar({
                    id: data.id_subproceso,
                    nombre: data.nombre,
                    descripcion: subproceso.descripcion,
                    id_stakeholder: parseInt(subproceso.id_stakeholder, 10),
                    tecnicas: [],
                  });
                }
              } catch (e) {
                setError(e.message);
              } finally {
                setGuardando(false);
              }
            }}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-70"
          >
            {guardando ? (modo === "editar" ? "Guardando..." : "Creando...") : modo === "editar" ? "Guardar cambios" : "Crear subproceso"}
          </button>
        </div>
      </div>
    </div>
  );
}