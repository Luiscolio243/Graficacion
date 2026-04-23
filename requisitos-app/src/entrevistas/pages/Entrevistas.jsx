import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
 
const BASE_URL = "http://127.0.0.1:5000";
 
export default function Entrevistas() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [entrevistas, setEntrevistas] = useState([]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalEliminar, setModalEliminar] = useState(null);
 
  useEffect(() => {
    const obtenerEntrevistas = async () => {
      try {
        const response = await fetch(`${BASE_URL}/entrevistas/${id}`);
        if (!response.ok) throw new Error("Error al obtener las entrevistas");
        const data = await response.json();
        setEntrevistas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    obtenerEntrevistas();
  }, [id]);
 
  const estadisticas = {
    total: entrevistas.length,
    realizadas: entrevistas.filter((e) => e.estado === "realizada").length,
    pendientes: entrevistas.filter((e) => e.estado === "pendiente").length,
    planificadas: entrevistas.filter((e) => e.estado === "planificada").length,
  };
 
  const confirmarEliminar = (id_entrevista) => {
    setModalEliminar(id_entrevista);
  };
 
  const ejecutarEliminar = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/entrevistas/eliminar/${modalEliminar}`,
        { method: "DELETE" }
      );
 
      if (!response.ok) {
        const err = await response.json();
        return alert(err.error || "Error al eliminar la entrevista.");
      }
 
      setEntrevistas((prev) => prev.filter((e) => e.id_entrevista !== modalEliminar));
      setModalEliminar(null);
    } catch {
      alert("Error de conexión al eliminar la entrevista.");
    }
  };
 
  if (cargando) return <p className="text-center text-gray-500 mt-10">Cargando entrevistas...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
 
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}`)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Entrevistas</h1>
          <p className="text-gray-600 mt-1">Gestiona las entrevistas y sus respuestas</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/entrevistas/crear`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          + Nueva Entrevista
        </button>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TarjetaEstadistica titulo="Total"      cantidad={estadisticas.total}      color="blue" />
        <TarjetaEstadistica titulo="Realizadas" cantidad={estadisticas.realizadas} color="emerald" />
        <TarjetaEstadistica titulo="Pendientes" cantidad={estadisticas.pendientes} color="orange" />
      </div>
 
      {entrevistas.filter((e) => e.estado === "realizada").length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Realizadas ({estadisticas.realizadas})
          </h2>
          <div className="grid gap-4">
            {entrevistas
              .filter((e) => e.estado === "realizada")
              .map((entrevista) => (
                <TarjetaEntrevista
                  key={entrevista.id_entrevista}
                  entrevista={entrevista}
                  idProyecto={id}
                  onEliminar={confirmarEliminar}
                />
              ))}
          </div>
        </div>
      )}
 
      {entrevistas.filter((e) => e.estado === "pendiente").length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Pendientes ({estadisticas.pendientes})
          </h2>
          <div className="grid gap-4">
            {entrevistas
              .filter((e) => e.estado === "pendiente")
              .map((entrevista) => (
                <TarjetaEntrevista
                  key={entrevista.id_entrevista}
                  entrevista={entrevista}
                  idProyecto={id}
                  onEliminar={confirmarEliminar}
                />
              ))}
          </div>
        </div>
      )}
 
      {entrevistas.filter((e) => e.estado === "planificada").length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Planificadas ({estadisticas.planificadas})
          </h2>
          <div className="grid gap-4">
            {entrevistas
              .filter((e) => e.estado === "planificada")
              .map((entrevista) => (
                <TarjetaEntrevista
                  key={entrevista.id_entrevista}
                  entrevista={entrevista}
                  idProyecto={id}
                  onEliminar={confirmarEliminar}
                />
              ))}
          </div>
        </div>
      )}
 
      {entrevistas.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">No hay entrevistas aún. Crea una para comenzar.</p>
        </div>
      )}
 
      {/* Modal de confirmación de eliminación */}
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
              <h2 className="text-lg font-bold text-gray-900">¿Eliminar entrevista?</h2>
              <p className="text-sm text-gray-500 mt-2">
                Esta acción no se puede deshacer. Se eliminarán también todas las preguntas y respuestas asociadas.
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
 
function TarjetaEstadistica({ titulo, cantidad, color }) {
  const colores = {
    blue:    "bg-blue-50 border-blue-200",
    emerald: "bg-emerald-50 border-emerald-200",
    orange:  "bg-orange-50 border-orange-200",
  };
  return (
    <div className={`rounded-xl border ${colores[color]} p-6`}>
      <h3 className="text-gray-700 text-sm font-medium mb-2">{titulo}</h3>
      <h2 className="text-4xl font-bold text-gray-900">{cantidad}</h2>
    </div>
  );
}
 
function TarjetaEntrevista({ entrevista, idProyecto, onEliminar }) {
  const navegar = useNavigate();
 
  const esEstado = {
    realizada:   "border-emerald-200 bg-emerald-50",
    pendiente:   "border-orange-200 bg-orange-50",
    planificada: "border-blue-200 bg-blue-50",
  };
 
  const fecha = entrevista.fecha_programada
    ? new Date(entrevista.fecha_programada).toLocaleDateString("es-MX", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "Sin fecha";
 
  const base = `/app/proyectos/${idProyecto}/entrevistas/${entrevista.id_entrevista}`;
 
  return (
    <div className={`rounded-xl border ${esEstado[entrevista.estado] ?? "border-gray-200 bg-white"} p-6 space-y-4`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{entrevista.titulo}</h3>
          <div className="flex gap-4 text-sm text-gray-600 mb-3">
            <span>{fecha}</span>
          </div>
          {entrevista.objetivo && (
            <p className="text-gray-700 text-sm mb-2">{entrevista.objetivo}</p>
          )}
          <p className="text-sm text-gray-600">
            Preguntas: <span className="font-medium">{entrevista.total_preguntas}</span>
          </p>
        </div>
 
        <div className="flex gap-2">
          <button
            onClick={() => navegar(base)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition text-sm font-medium"
          >
            Ver
          </button>
          <button
            onClick={() => onEliminar(entrevista.id_entrevista)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-white rounded-lg transition text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>
 
      <button
        onClick={() => navegar(`${base}/audio`)}
        className="w-full border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
      >
        Subir archivo (grabación/documento)
      </button>
 
      <div className="flex gap-3">
        <button
          onClick={() => navegar(`${base}/respuestas`)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          Anotar Respuestas
        </button>
 
        <span className={`px-4 py-2 rounded-lg font-medium text-sm ${
          entrevista.estado === "realizada"
            ? "bg-emerald-100 text-emerald-800"
            : entrevista.estado === "planificada"
            ? "bg-blue-100 text-blue-800"
            : "bg-orange-100 text-orange-800"
        }`}>
          {entrevista.estado === "realizada"
            ? "Realizada"
            : entrevista.estado === "planificada"
            ? "Planificada"
            : "Pendiente"}
        </span>
      </div>
    </div>
  );
}