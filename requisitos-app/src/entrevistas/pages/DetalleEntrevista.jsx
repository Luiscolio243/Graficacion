import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
 
const ESTADOS_COLOR = {
  realizada: "bg-emerald-100 text-emerald-800",
  pendiente: "bg-orange-100 text-orange-800",
  planificada: "bg-blue-100 text-blue-800",
};
 
const ESTADOS_LABEL = {
  realizada: "Realizada",
  pendiente: "Pendiente",
  planificada: "Planificada",
};
 
const ORIGEN_LABEL = {
  ia: { label: "IA", cls: "bg-purple-100 text-purple-700" },
  manual: { label: "Manual", cls: "bg-gray-100 text-gray-600" },
};
 
export default function DetalleEntrevista() {
  const { id, id_entrevista } = useParams();
  const navegar = useNavigate();
 
  const [entrevista, setEntrevista] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
 
  const cargar = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/entrevistas/detalle/${id_entrevista}`
      );
      if (!response.ok) throw new Error("Error al cargar la entrevista");
      const data = await response.json();
      setEntrevista(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };
 
  useEffect(() => {
    cargar();
  }, [id_entrevista]);
 
  if (cargando) return <p className="text-center text-gray-500 mt-10">Cargando entrevista...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!entrevista) return null;
 
  const fecha = entrevista.fecha_programada
    ? new Date(entrevista.fecha_programada).toLocaleDateString("es-MX", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : "Sin fecha";
 
  const respondidas = entrevista.preguntas?.filter((p) => p.respuesta).length ?? 0;
  const total = entrevista.preguntas?.length ?? 0;
 
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/entrevistas`)}
          className="mt-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
        >
          ← Atrás
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">{entrevista.titulo}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${ESTADOS_COLOR[entrevista.estado] ?? "bg-gray-100 text-gray-600"}`}>
              {ESTADOS_LABEL[entrevista.estado] ?? entrevista.estado}
            </span>
            {entrevista.procesado_ia && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                Procesado por IA
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">{fecha}{entrevista.lugar ? ` · ${entrevista.lugar}` : ""}</p>
        </div>
      </div>
 
      {/* Acciones */}
      <div className="flex gap-3">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}/respuestas`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
        >
          Anotar Respuestas
        </button>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}/audio`)}
          className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition text-sm"
        >
          Subir Audio / Procesar con IA
        </button>
      </div>
 
      {/* Info general */}
      {entrevista.objetivo && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-800 mb-1">Objetivo</p>
          <p className="text-sm text-blue-700">{entrevista.objetivo}</p>
        </div>
      )}
 
      {/* Progreso de preguntas */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-900">
            Preguntas ({total})
          </h2>
          <span className="text-sm text-gray-500">
            {respondidas}/{total} respondidas
          </span>
        </div>
 
        {/* Barra de progreso */}
        <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all"
            style={{ width: total > 0 ? `${(respondidas / total) * 100}%` : "0%" }}
          />
        </div>
 
        {/* Lista de preguntas */}
        {total === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            No hay preguntas aún. Usa "Anotar Respuestas" para agregar.
          </p>
        ) : (
          <div className="space-y-4">
            {entrevista.preguntas.map((pregunta, i) => (
              <TarjetaPregunta key={pregunta.id_ent_prg} pregunta={pregunta} numero={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
 
function TarjetaPregunta({ pregunta, numero }) {
  const [expandida, setExpandida] = useState(!!pregunta.respuesta);
  const origen = ORIGEN_LABEL[pregunta.origen] ?? { label: pregunta.origen, cls: "bg-gray-100 text-gray-600" };
  const tieneRespuesta = !!pregunta.respuesta;
 
  return (
    <div className={`border rounded-xl p-4 ${tieneRespuesta ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"}`}>
      <div
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setExpandida(!expandida)}
      >
        {/* Número */}
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
          tieneRespuesta ? "bg-emerald-200 text-emerald-800" : "bg-gray-100 text-gray-600"
        }`}>
          {numero}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{pregunta.pregunta}</p>
          <div className="flex gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${origen.cls}`}>
              {origen.label}
            </span>
            {tieneRespuesta ? (
              <span className="text-xs text-emerald-600 font-medium">Respondida</span>
            ) : (
              <span className="text-xs text-orange-500 font-medium">Sin respuesta</span>
            )}
          </div>
        </div>
        <span className="text-gray-400 text-sm">{expandida ? "▲" : "▼"}</span>
      </div>
 
      {expandida && (
        <div className="mt-3 ml-10">
          {tieneRespuesta ? (
            <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
              {pregunta.respuesta}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">Sin respuesta registrada.</p>
          )}
        </div>
      )}
    </div>
  );
}