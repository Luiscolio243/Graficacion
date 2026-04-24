import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
 
const BASE_URL = "http://127.0.0.1:5000";
 
export default function Observaciones() {
  const { id } = useParams();
  const navegar = useNavigate();
 
  const [observaciones, setObservaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
 
  useEffect(() => {
    const obtenerObservaciones = async () => {
      try {
        const response = await fetch(`${BASE_URL}/observaciones/${id}`);
        if (!response.ok) throw new Error("Error al obtener las observaciones");
        const data = await response.json();
        setObservaciones(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    obtenerObservaciones();
  }, [id]);
 
  const confirmarEliminar = (id_observacion) => {
    setModalEliminar(id_observacion);
  };
 
  const ejecutarEliminar = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/observaciones/eliminar/${modalEliminar}`,
        { method: "DELETE" }
      );
 
      if (!response.ok) {
        const err = await response.json();
        return alert(err.error || "Error al eliminar la observación.");
      }
 
      setObservaciones((prev) =>
        prev.filter((o) => o.id_observacion !== modalEliminar)
      );
      setModalEliminar(null);
    } catch {
      alert("Error de conexión al eliminar la observación.");
    }
  };
 
  if (cargando) return <p className="text-center text-gray-500 mt-10">Cargando observaciones...</p>;
  if (error)    return <p className="text-center text-red-500 mt-10">{error}</p>;
 
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}`)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Observaciones</h1>
          <p className="text-gray-600 mt-1">Notas rápidas de campo</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/observaciones/crear`)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          + Nueva Nota
        </button>
      </div>
 
      {/* Estadística rápida */}
      {observaciones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-4xl font-bold text-gray-900">{observaciones.length}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
            <p className="text-sm text-gray-600 mb-1">Con problema detectado</p>
            <p className="text-4xl font-bold text-gray-900">
              {observaciones.filter((o) => o.problema_detectado).length}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-sm text-gray-600 mb-1">Sin problema</p>
            <p className="text-4xl font-bold text-gray-900">
              {observaciones.filter((o) => !o.problema_detectado).length}
            </p>
          </div>
        </div>
      )}
 
      {/* Tarjetas */}
      {observaciones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {observaciones.map((observacion) => (
            <TarjetaObservacion
              key={observacion.id_observacion}
              observacion={observacion}
              onEliminar={confirmarEliminar}
              onVer={() =>
                navegar(
                  `/app/proyectos/${id}/requerimientos/observaciones/${observacion.id_observacion}`
                )
              }
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">
            No hay observaciones aún. Crea una para comenzar.
          </p>
        </div>
      )}
 
      {/* Modal de confirmación */}
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
              <p className="text-sm text-gray-500 mt-2">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalEliminar(null)}
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
 
function TarjetaObservacion({ observacion, onEliminar, onVer }) {
  const fecha = observacion.fecha_observacion
    ? new Date(observacion.fecha_observacion).toLocaleDateString("es-MX", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "Sin fecha";
 
  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-6 space-y-3 hover:shadow-lg transition flex flex-col">
      {/* Título y botón eliminar */}
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-lg font-bold text-gray-900 flex-1 line-clamp-2">
          {observacion.lugar}
        </h3>
        <button
          onClick={() => onEliminar(observacion.id_observacion)}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-white rounded-lg transition text-sm font-medium flex-shrink-0"
        >
          Eliminar
        </button>
      </div>
 
      {/* Descripción */}
      <p className="text-gray-700 text-sm line-clamp-3 flex-1">
        {observacion.descripcion}
      </p>
 
      {/* Problema detectado */}
      {observacion.problema_detectado && (
        <div className="bg-orange-100 border border-orange-200 rounded-lg px-3 py-2">
          <p className="text-xs font-medium text-orange-700 mb-0.5">Problema detectado</p>
          <p className="text-xs text-orange-600 line-clamp-2">{observacion.problema_detectado}</p>
        </div>
      )}
 
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
        <span>{fecha}</span>
        {observacion.duracion_minutos && (
          <span>{observacion.duracion_minutos} min</span>
        )}
      </div>
 
      {/* Botón ver detalle */}
      <button
        onClick={onVer}
        className="w-full border border-purple-300 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        Ver detalle
      </button>
    </div>
  );
}