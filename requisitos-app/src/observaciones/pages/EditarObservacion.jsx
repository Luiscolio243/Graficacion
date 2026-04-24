import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
 
const BASE_URL = "http://127.0.0.1:5000";
 
export default function EditarObservacion() {
  const { id, id_observacion } = useParams();
  const navegar = useNavigate();
 
  const [formulario, setFormulario] = useState(null);
  const [procesos, setProcesos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
 
  // Cargar observación existente y procesos en paralelo
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
 
    Promise.all([
      fetch(`${BASE_URL}/observaciones/detalle/${id_observacion}`).then((r) => r.json()),
      fetch(`${BASE_URL}/procesos/${id}`, { headers }).then((r) => r.ok ? r.json() : []),
    ])
      .then(([obs, procs]) => {
        setProcesos(procs);
        setFormulario({
          lugar:              obs.lugar || "",
          descripcion:        obs.descripcion || "",
          problema_detectado: obs.problema_detectado || "",
          contexto:           obs.contexto || "",
          // fecha viene como "YYYY-MM-DD" desde el backend, el input date lo acepta directo
          fecha_observacion:  obs.fecha_observacion || "",
          duracion_minutos:   obs.duracion_minutos ?? "",
          subproceso:         obs.id_subproceso ? String(obs.id_subproceso) : "",
          // Para preseleccionar el proceso correcto buscamos en la lista
          proceso:            "",
        });
        // Buscar a qué proceso pertenece el subproceso para preseleccionarlo
        if (obs.id_subproceso) {
          const procesoEncontrado = procs.find((p) =>
            p.subprocesos?.some((sp) => sp.id_subproceso === obs.id_subproceso)
          );
          if (procesoEncontrado) {
            setFormulario((prev) => ({
              ...prev,
              proceso: String(procesoEncontrado.id_proceso),
            }));
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id, id_observacion]);
 
  const subprocesosFiltrados =
    procesos.find((p) => String(p.id_proceso) === String(formulario?.proceso))
      ?.subprocesos || [];
 
  const set = (campo, valor) =>
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
 
  const handleGuardar = async () => {
    if (!formulario.lugar.trim())       return alert("El lugar es obligatorio.");
    if (!formulario.descripcion.trim()) return alert("La descripción es obligatoria.");
 
    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      const body = {
        lugar:              formulario.lugar.trim(),
        descripcion:        formulario.descripcion.trim(),
        problema_detectado: formulario.problema_detectado.trim() || null,
        contexto:           formulario.contexto.trim() || null,
        fecha_observacion:  formulario.fecha_observacion || null,
        duracion_minutos:   formulario.duracion_minutos ? parseInt(formulario.duracion_minutos) : null,
        id_subproceso:      formulario.subproceso ? parseInt(formulario.subproceso) : null,
      };
 
      const res = await fetch(`${BASE_URL}/observaciones/actualizar/${id_observacion}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
 
      if (!res.ok) {
        const err = await res.json();
        return alert(err.error || "Error al actualizar la observación.");
      }
 
      navegar(`/app/proyectos/${id}/requerimientos/observaciones/${id_observacion}`);
    } catch (e) {
      alert("Error de conexión con el servidor.");
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };
 
  if (cargando) return <p className="text-center text-gray-500 mt-10">Cargando observación...</p>;
  if (error)    return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!formulario) return null;
 
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() =>
            navegar(`/app/proyectos/${id}/requerimientos/observaciones/${id_observacion}`)
          }
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Observación</h1>
          <p className="text-gray-600 mt-1">Modifica los campos que necesites</p>
        </div>
      </div>
 
      {/* Formulario */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
 
        {/* Fila 1: Lugar · Fecha · Duración */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lugar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formulario.lugar}
              onChange={(e) => set("lugar", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de observación
              <span className="ml-1 text-xs text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="date"
              value={formulario.fecha_observacion}
              onChange={(e) => set("fecha_observacion", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración (minutos)
              <span className="ml-1 text-xs text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="number"
              min="1"
              value={formulario.duracion_minutos}
              onChange={(e) => set("duracion_minutos", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
 
        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formulario.descripcion}
            onChange={(e) => set("descripcion", e.target.value)}
            rows="5"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
 
        {/* Problema detectado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Problema detectado
            <span className="ml-1 text-xs text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            value={formulario.problema_detectado}
            onChange={(e) => set("problema_detectado", e.target.value)}
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
 
        {/* Contexto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contexto
            <span className="ml-1 text-xs text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            value={formulario.contexto}
            onChange={(e) => set("contexto", e.target.value)}
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
 
        {/* Proceso / Subproceso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proceso
              <span className="ml-1 text-xs text-gray-400 font-normal">(opcional)</span>
            </label>
            <select
              value={formulario.proceso}
              onChange={(e) =>
                setFormulario((prev) => ({ ...prev, proceso: e.target.value, subproceso: "" }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">Selecciona un proceso</option>
              {procesos.map((p) => (
                <option key={p.id_proceso} value={p.id_proceso}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subproceso
              <span className="ml-1 text-xs text-gray-400 font-normal">(opcional)</span>
            </label>
            <select
              value={formulario.subproceso}
              onChange={(e) => set("subproceso", e.target.value)}
              disabled={!formulario.proceso}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {formulario.proceso ? "Selecciona un subproceso" : "Primero elige un proceso"}
              </option>
              {subprocesosFiltrados.map((sp) => (
                <option key={sp.id_subproceso} value={sp.id_subproceso}>
                  {sp.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
 
        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition"
          >
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
          <button
            onClick={() =>
              navegar(`/app/proyectos/${id}/requerimientos/observaciones/${id_observacion}`)
            }
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}