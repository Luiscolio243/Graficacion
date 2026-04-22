import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VerResultados() {
  const { id, idEncuesta } = useParams();
  const navegar = useNavigate();
  const [cuestionario, setCuestionario] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerResultados = async () => {
      try {
        const responseCuestionario = await fetch(
          `http://localhost:5000/encuestas/${idEncuesta}`
        );
        if (!responseCuestionario.ok)
          throw new Error("Error al obtener el cuestionario");
        const dataCuestionario = await responseCuestionario.json();
        setCuestionario(dataCuestionario);

        const responseRespuestas = await fetch(
          `http://localhost:5000/respuestas/obtener/${idEncuesta}`
        );
        if (!responseRespuestas.ok)
          throw new Error("Error al obtener las respuestas");
        const dataRespuestas = await responseRespuestas.json();
        setRespuestas(dataRespuestas || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerResultados();
  }, [idEncuesta]);

  if (cargando) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              navegar(`/app/proyectos/${id}/requerimientos/cuestionarios`)
            }
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            ← Atrás
          </button>
        </div>
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              navegar(`/app/proyectos/${id}/requerimientos/cuestionarios`)
            }
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            ← Atrás
          </button>
        </div>
        <div className="bg-red-50 rounded-xl p-6 text-center border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!cuestionario) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              navegar(`/app/proyectos/${id}/requerimientos/cuestionarios`)
            }
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            ← Atrás
          </button>
        </div>
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">No se encontró el cuestionario</p>
        </div>
      </div>
    );
  }

  const totalRespuestas = respuestas.length;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() =>
            navegar(`/app/proyectos/${id}/requerimientos/cuestionarios`)
          }
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Resultados: {cuestionario.titulo}
          </h1>
          <p className="text-gray-600 mt-1">
            {cuestionario.descripcion}
          </p>
        </div>
      </div>

      {/* Resumen de respuestas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="text-gray-700 text-sm font-medium mb-2">
            Total de Respuestas
          </h3>
          <h2 className="text-4xl font-bold text-gray-900">{totalRespuestas}</h2>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="text-gray-700 text-sm font-medium mb-2">
            Preguntas
          </h3>
          <h2 className="text-4xl font-bold text-gray-900">
            {cuestionario.preguntas?.length || 0}
          </h2>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <h3 className="text-gray-700 text-sm font-medium mb-2">
            Tasa de Respuesta
          </h3>
          <h2 className="text-4xl font-bold text-gray-900">
            {cuestionario.num_participantes
              ? Math.round((totalRespuestas / cuestionario.num_participantes) * 100)
              : 0}
            %
          </h2>
        </div>
      </div>

      {/* Preguntas y respuestas */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-8">
        {cuestionario.preguntas && cuestionario.preguntas.length > 0 ? (
          cuestionario.preguntas.map((pregunta, indexPregunta) => (
            <div key={indexPregunta} className="border-b border-gray-200 pb-6 last:border-b-0">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Pregunta {indexPregunta + 1}: {pregunta.pregunta}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Tipo: <span className="font-medium">{pregunta.tipo}</span>
              </p>

              {pregunta.tipo === "opcion_multiple" ? (
                <div className="space-y-3">
                  {pregunta.opciones && pregunta.opciones.length > 0 ? (
                    pregunta.opciones.map((opcion, indexOpcion) => {
                      const respuestasOpcion = respuestas.filter(
                        (r) =>
                          r.id_pregunta === pregunta.id_pregunta &&
                          r.respuesta === opcion
                      ).length;
                      const porcentaje =
                        totalRespuestas > 0
                          ? ((respuestasOpcion / totalRespuestas) * 100).toFixed(1)
                          : 0;

                      return (
                        <div key={indexOpcion} className="space-y-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-700">
                              {opcion}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {respuestasOpcion} ({porcentaje}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${porcentaje}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500">No hay opciones disponibles</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {respuestas
                    .filter((r) => r.id_pregunta === pregunta.id_pregunta)
                    .map((respuesta, indexRespuesta) => (
                      <div
                        key={indexRespuesta}
                        className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <p className="text-sm text-gray-700">
                          {respuesta.respuesta || "Sin respuesta"}
                        </p>
                      </div>
                    ))}
                  {respuestas.filter((r) => r.id_pregunta === pregunta.id_pregunta).length ===
                    0 && (
                    <p className="text-gray-500 text-sm">
                      No hay respuestas para esta pregunta
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            No hay preguntas en este cuestionario
          </p>
        )}
      </div>

      {/* Botón para volver */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={() =>
            navegar(`/app/proyectos/${id}/requerimientos/cuestionarios`)
          }
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          Volver a Cuestionarios
        </button>
      </div>
    </div>
  );
}
