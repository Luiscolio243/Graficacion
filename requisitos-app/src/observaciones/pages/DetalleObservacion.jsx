import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
 
const BASE_URL = "http://127.0.0.1:5000";
 
export default function DetalleObservacion() {
  const { id, id_observacion } = useParams();
  const navegar = useNavigate();
 
  const [observacion, setObservacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(false);
 
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${BASE_URL}/observaciones/detalle/${id_observacion}`);
        if (!res.ok) throw new Error("Error al cargar la observación");
        const data = await res.json();
        setObservacion(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id_observacion]);
 
  const ejecutarEliminar = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/observaciones/eliminar/${id_observacion}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json();
        return alert(err.error || "Error al eliminar.");
      }
      navegar(`/app/proyectos/${id}/requerimientos/observaciones`);
    } catch {
      alert("Error de conexión al eliminar.");
    }
  };
 
  if (cargando) return <p className="text-center text-gray-500 mt-10">Cargando observación...</p>;
  if (error)    return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!observacion) return null;
 
  const fecha = observacion.fecha_observacion
    ? new Date(observacion.fecha_observacion).toLocaleDateString("es-MX", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : "Sin fecha";
 
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/observaciones`)}
          className="mt-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
        >
          ← Atrás
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{observacion.lugar}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {fecha}
            {observacion.duracion_minutos ? ` · ${observacion.duracion_minutos} minutos` : ""}
          </p>
        </div>
      </div>
 
      {/* Acciones */}
      <div className="flex gap-3">
        <button
          onClick={() =>
            navegar(`/app/proyectos/${id}/requerimientos/observaciones/${id_observacion}/editar`)
          }
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
        >
          Editar
        </button>
        <button
          onClick={() => setModalEliminar(true)}
          className="border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition text-sm"
        >
          Eliminar
        </button>
      </div>
 
      {/* Descripción */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-1">
        <p className="text-sm font-medium text-gray-500">Descripción</p>
        <p className="text-gray-800 text-sm whitespace-pre-wrap">{observacion.descripcion}</p>
      </div>
 
      {/* Problema detectado */}
      {observacion.problema_detectado && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 space-y-1">
          <p className="text-sm font-medium text-orange-700">Problema detectado</p>
          <p className="text-orange-800 text-sm whitespace-pre-wrap">{observacion.problema_detectado}</p>
        </div>
      )}
 
      {/* Contexto */}
      {observacion.contexto && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-1">
          <p className="text-sm font-medium text-blue-700">Contexto</p>
          <p className="text-blue-800 text-sm whitespace-pre-wrap">{observacion.contexto}</p>
        </div>
      )}
 
      {/* Modal eliminar */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">¿Eliminar observación?</h2>
              <p className="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalEliminar(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminar}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}