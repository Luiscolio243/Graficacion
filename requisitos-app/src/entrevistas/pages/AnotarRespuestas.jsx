import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AnotarRespuestas() {
  const { id, id_entrevista } = useParams();
  const navegar = useNavigate();

  const [entrevista, setEntrevista] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarEntrevista = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/entrevistas/detalle/${id_entrevista}`
        );
        if (!response.ok) throw new Error("Error al cargar la entrevista");
        const data = await response.json();
        setEntrevista(data);

        // Inicializar respuestas con las existentes
        const respuestasIniciales = {};
        if (data.preguntas && data.preguntas.length > 0) {
          data.preguntas.forEach((pregunta) => {
            respuestasIniciales[pregunta.id_ent_prg] = pregunta.respuesta || "";
          });
        }
        setRespuestas(respuestasIniciales);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarEntrevista();
  }, [id_entrevista]);

  const actualizarRespuesta = (idPregunta, valor) => {
    setRespuestas({
      ...respuestas,
      [idPregunta]: valor,
    });
  };

  const guardarRespuestas = async () => {
    setGuardando(true);
    try {
      // Actualizar cada pregunta con su respuesta
      for (const pregunta of entrevista.preguntas) {
        const idPregunta = pregunta.id_ent_prg;
        const respuesta = respuestas[idPregunta] || "";

        const response = await fetch(
          `http://localhost:5000/preguntas/actualizar/${idPregunta}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              respuesta: respuesta,
            }),
          }
        );

        if (!response.ok) throw new Error(`Error al guardar la pregunta ${idPregunta}`);
      }

      navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`)
            }
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            ← Atrás
          </button>
        </div>
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">Cargando entrevista...</p>
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
              navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`)
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

  if (!entrevista) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`)
            }
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            ← Atrás
          </button>
        </div>
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">
            No se encontró la entrevista
          </p>
        </div>
      </div>
    );
  }

  const totalPreguntas = entrevista.preguntas?.length ?? 0;
  const respuestasCompletadas = Object.values(respuestas).filter(
    (r) => r && r.trim()
  ).length;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() =>
            navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`)
          }
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            Anotar Respuestas
          </h1>
          <p className="text-gray-600 mt-1">{entrevista.titulo}</p>
        </div>
      </div>

      {/* Progreso */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-900">Progreso</h2>
          <span className="text-sm text-gray-600">
            {respuestasCompletadas}/{totalPreguntas} respondidas
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{
              width:
                totalPreguntas > 0
                  ? `${(respuestasCompletadas / totalPreguntas) * 100}%`
                  : "0%",
            }}
          />
        </div>
      </div>

      {/* Formulario de respuestas */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        {totalPreguntas === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay preguntas para responder
          </p>
        ) : (
          entrevista.preguntas.map((pregunta, index) => (
            <div
              key={pregunta.id_ent_prg}
              className="border-b border-gray-200 pb-6 last:border-b-0"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {pregunta.pregunta}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {pregunta.origen === "ia" ? "Generada por IA" : "Manual"}
                  </p>
                </div>
              </div>

              <textarea
                value={respuestas[pregunta.id_ent_prg] || ""}
                onChange={(e) =>
                  actualizarRespuesta(pregunta.id_ent_prg, e.target.value)
                }
                placeholder="Escribe la respuesta aquí..."
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ml-11"
              />
            </div>
          ))
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3">
        <button
          onClick={() =>
            navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`)
          }
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          onClick={guardarRespuestas}
          disabled={guardando || totalPreguntas === 0}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition"
        >
          {guardando ? "Guardando..." : "Guardar Respuestas"}
        </button>
      </div>
    </div>
  );
}
