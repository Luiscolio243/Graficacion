import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

export default function DetalleObservacion() {
  const { id, id_observacion } = useParams();
  const navegar = useNavigate();

  const [observacion,   setObservacion]   = useState(null);
  const [cargando,      setCargando]      = useState(true);
  const [error,         setError]         = useState(null);
  const [modalEliminar, setModalEliminar] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${BASE_URL}/observaciones/detalle/${id_observacion}`);
        if (!res.ok) throw new Error("Error al cargar la observación");
        setObservacion(await res.json());
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
      const res = await fetch(`${BASE_URL}/observaciones/eliminar/${id_observacion}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.error || "Error al eliminar.");
      }
      navegar(`/app/proyectos/${id}/requerimientos/observaciones`);
    } catch {
      alert("Error de conexión al eliminar.");
    }
  };

  const botonAtras = (
    <button
      onClick={() => navegar(`/app/proyectos/${id}/requerimientos/observaciones`)}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Volver a Observaciones
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

  if (error || !observacion) return (
    <div className="space-y-7 max-w-3xl mx-auto">
      {botonAtras}
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {error ?? "No se encontró la observación"}
      </div>
    </div>
  );

  const fecha = observacion.fecha_observacion
    ? new Date(observacion.fecha_observacion).toLocaleDateString("es-MX", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : null;

  return (
    <div className="space-y-7 max-w-3xl mx-auto">

      {botonAtras}

      {/* Encabezado */}
      <div className="flex items-start justify-between pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{observacion.lugar}</h1>
          {(fecha || observacion.duracion_minutos) && (
            <p className="text-sm text-gray-500 mt-0.5">
              {fecha}{observacion.duracion_minutos ? ` · ${observacion.duracion_minutos} min` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => navegar(`/app/proyectos/${id}/requerimientos/observaciones/${id_observacion}/editar`)}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => setModalEliminar(true)}
            className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Secciones */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">

        <div className="px-6 py-5 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Descripción</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{observacion.descripcion}</p>
        </div>

        {observacion.problema_detectado && (
          <div className="px-6 py-5 space-y-1">
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-2">Problema detectado</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{observacion.problema_detectado}</p>
          </div>
        )}

        {observacion.contexto && (
          <div className="px-6 py-5 space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Contexto</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{observacion.contexto}</p>
          </div>
        )}
      </div>

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
