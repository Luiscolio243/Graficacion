import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

export default function EditarObservacion() {
  const { id, id_observacion } = useParams();
  const navegar = useNavigate();

  const [formulario, setFormulario] = useState(null);
  const [procesos,   setProcesos]   = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [guardando,  setGuardando]  = useState(false);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    Promise.all([
      fetch(`${BASE_URL}/observaciones/detalle/${id_observacion}`).then((r) => r.json()),
      fetch(`${BASE_URL}/procesos/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.ok ? r.json() : []),
    ])
      .then(([obs, procs]) => {
        setProcesos(procs);
        setFormulario({
          lugar:              obs.lugar || "",
          descripcion:        obs.descripcion || "",
          problema_detectado: obs.problema_detectado || "",
          contexto:           obs.contexto || "",
          fecha_observacion:  obs.fecha_observacion || "",
          duracion_minutos:   obs.duracion_minutos ?? "",
          subproceso:         obs.id_subproceso ? String(obs.id_subproceso) : "",
          proceso:            "",
        });
        if (obs.id_subproceso) {
          const encontrado = procs.find((p) =>
            p.subprocesos?.some((sp) => sp.id_subproceso === obs.id_subproceso)
          );
          if (encontrado) {
            setFormulario((prev) => ({ ...prev, proceso: String(encontrado.id_proceso) }));
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id, id_observacion]);

  const subprocesosFiltrados =
    procesos.find((p) => String(p.id_proceso) === String(formulario?.proceso))?.subprocesos || [];

  const set = (campo, valor) => setFormulario((prev) => ({ ...prev, [campo]: valor }));

  const handleCambiarProceso = (e) =>
    setFormulario((prev) => ({ ...prev, proceso: e.target.value, subproceso: "" }));

  const handleGuardar = async () => {
    if (!formulario.lugar.trim())       return alert("El lugar es obligatorio.");
    if (!formulario.descripcion.trim()) return alert("La descripción es obligatoria.");

    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/observaciones/actualizar/${id_observacion}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          lugar:              formulario.lugar.trim(),
          descripcion:        formulario.descripcion.trim(),
          problema_detectado: formulario.problema_detectado.trim() || null,
          contexto:           formulario.contexto.trim() || null,
          fecha_observacion:  formulario.fecha_observacion || null,
          duracion_minutos:   formulario.duracion_minutos ? parseInt(formulario.duracion_minutos) : null,
          id_subproceso:      formulario.subproceso ? parseInt(formulario.subproceso) : null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.error || "Error al actualizar la observación.");
      }
      navegar(`/app/proyectos/${id}/requerimientos/observaciones/${id_observacion}`);
    } catch {
      alert("Error de conexión con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  const botonAtras = (
    <button
      onClick={() => navegar(`/app/proyectos/${id}/requerimientos/observaciones/${id_observacion}`)}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Volver al detalle
    </button>
  );

  if (cargando) return (
    <div className="space-y-7 max-w-3xl mx-auto">
      {botonAtras}
      <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-violet-500 animate-spin" />
        Cargando observación...
      </div>
    </div>
  );

  if (error || !formulario) return (
    <div className="space-y-7 max-w-3xl mx-auto">
      {botonAtras}
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {error ?? "No se encontró la observación"}
      </div>
    </div>
  );

  return (
    <div className="space-y-7 max-w-3xl mx-auto">

      {botonAtras}

      {/* Encabezado */}
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Editar Observación</h1>
        <p className="text-sm text-gray-500 mt-0.5">Modifica los campos que necesites</p>
      </div>

      {/* Formulario */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">

        {/* Identificación */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Identificación</p>

          <div>
            <label className={labelCls}>Lugar <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formulario.lugar}
              onChange={(e) => set("lugar", e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Fecha <span className="text-gray-400 font-normal normal-case">(opcional)</span>
              </label>
              <input
                type="date"
                value={formulario.fecha_observacion}
                onChange={(e) => set("fecha_observacion", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Duración (min) <span className="text-gray-400 font-normal normal-case">(opcional)</span>
              </label>
              <input
                type="number"
                min="1"
                value={formulario.duracion_minutos}
                onChange={(e) => set("duracion_minutos", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Contenido</p>

          <div>
            <label className={labelCls}>Descripción <span className="text-red-500">*</span></label>
            <textarea
              value={formulario.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              rows={4}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              Problema detectado <span className="text-gray-400 font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              value={formulario.problema_detectado}
              onChange={(e) => set("problema_detectado", e.target.value)}
              rows={3}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              Contexto <span className="text-gray-400 font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              value={formulario.contexto}
              onChange={(e) => set("contexto", e.target.value)}
              rows={3}
              className={inputCls}
            />
          </div>
        </div>

        {/* Proceso relacionado */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Proceso relacionado</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Proceso</label>
              <select value={formulario.proceso} onChange={handleCambiarProceso} className={inputCls}>
                <option value="">Sin proceso</option>
                {procesos.map((p) => (
                  <option key={p.id_proceso} value={p.id_proceso}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Subproceso</label>
              <select
                value={formulario.subproceso}
                onChange={(e) => set("subproceso", e.target.value)}
                disabled={!formulario.proceso}
                className={inputCls + " disabled:opacity-50"}
              >
                <option value="">{formulario.proceso ? "Sin subproceso" : "Elige un proceso primero"}</option>
                {subprocesosFiltrados.map((sp) => (
                  <option key={sp.id_subproceso} value={sp.id_subproceso}>{sp.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pb-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/observaciones/${id_observacion}`)}
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          {guardando ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}
