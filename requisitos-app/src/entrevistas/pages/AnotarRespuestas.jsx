import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

export default function AnotarRespuestas() {
  const { id, id_entrevista } = useParams();
  const navegar = useNavigate();

  const [entrevista, setEntrevista] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [cargando,   setCargando]   = useState(true);
  const [guardando,  setGuardando]  = useState(false);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const response = await fetch(`${BASE_URL}/entrevistas/detalle/${id_entrevista}`);
        if (!response.ok) throw new Error("Error al cargar la entrevista");
        const data = await response.json();
        setEntrevista(data);

        const iniciales = {};
        (data.preguntas || []).forEach((p) => {
          iniciales[p.id_ent_prg] = p.respuesta || "";
        });
        setRespuestas(iniciales);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id_entrevista]);

  const actualizarRespuesta = (idPregunta, valor) =>
    setRespuestas((prev) => ({ ...prev, [idPregunta]: valor }));

  const guardarRespuestas = async () => {
    setGuardando(true);
    try {
      for (const pregunta of entrevista.preguntas) {
        const res = await fetch(`${BASE_URL}/preguntas/actualizar/${pregunta.id_ent_prg}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ respuesta: respuestas[pregunta.id_ent_prg] || "" }),
        });
        if (!res.ok) throw new Error(`Error al guardar la pregunta ${pregunta.id_ent_prg}`);
      }

      const resActualizar = await fetch(`${BASE_URL}/entrevistas/actualizar/${id_entrevista}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "realizada" }),
      });
      if (!resActualizar.ok) throw new Error("Error al actualizar el estado de la entrevista");

      navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const BackBtn = () => (
    <button
      onClick={() => navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`)}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Volver a la entrevista
    </button>
  );

  if (cargando) return (
    <div className="space-y-4"><BackBtn />
      <div className="flex items-center gap-2 py-6 text-sm text-gray-400">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
        Cargando entrevista...
      </div>
    </div>
  );

  if (error) return (
    <div className="space-y-4"><BackBtn />
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
    </div>
  );

  if (!entrevista) return (
    <div className="space-y-4"><BackBtn />
      <p className="text-sm text-gray-500">No se encontró la entrevista.</p>
    </div>
  );

  const totalPreguntas       = entrevista.preguntas?.length ?? 0;
  const respondidas          = Object.values(respuestas).filter((r) => r?.trim()).length;
  const porcentaje           = totalPreguntas > 0 ? Math.round((respondidas / totalPreguntas) * 100) : 0;

  return (
    <div className="space-y-7 max-w-3xl mx-auto">

      {/* Botón de regreso */}
      <BackBtn />

      {/* Encabezado */}
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Anotar Respuestas</h1>
        <p className="text-sm text-gray-500 mt-0.5">{entrevista.titulo}</p>
      </div>

      {/* Progreso */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Progreso</p>
            <p className="text-xs text-gray-400 mt-0.5">{respondidas} de {totalPreguntas} preguntas respondidas</p>
          </div>
          <span className={`text-2xl font-bold ${porcentaje === 100 ? "text-emerald-600" : "text-blue-600"}`}>
            {porcentaje}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${porcentaje === 100 ? "bg-emerald-500" : "bg-blue-600"}`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>

      {/* Preguntas */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {totalPreguntas === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No hay preguntas para responder
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {entrevista.preguntas.map((pregunta, index) => {
              const respondida = !!(respuestas[pregunta.id_ent_prg]?.trim());
              return (
                <div key={pregunta.id_ent_prg} className="px-6 py-5">
                  {/* Cabecera de pregunta */}
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                                     text-xs font-bold transition-colors
                                     ${respondida ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                      {respondida ? (
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{pregunta.pregunta}</p>
                      {pregunta.origen === "ia" && (
                        <span className="text-[11px] text-indigo-500 font-medium">Generada por IA</span>
                      )}
                    </div>
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={respuestas[pregunta.id_ent_prg] || ""}
                    onChange={(e) => actualizarRespuesta(pregunta.id_ent_prg, e.target.value)}
                    placeholder="Escribe la respuesta aquí..."
                    rows={3}
                    className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none
                                focus:ring-2 transition-colors ml-10
                                ${respondida
                                  ? "border-emerald-300 focus:ring-emerald-400 bg-emerald-50/30"
                                  : "border-gray-300 focus:ring-blue-500"}`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-3 pb-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`)}
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg
                     text-sm font-medium hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          onClick={guardarRespuestas}
          disabled={guardando || totalPreguntas === 0}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition
                      ${porcentaje === 100
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"}
                      disabled:bg-gray-300 disabled:cursor-not-allowed`}
        >
          {guardando ? "Guardando..." : porcentaje === 100 ? "Guardar y marcar como realizada" : "Guardar Respuestas"}
        </button>
      </div>
    </div>
  );
}
