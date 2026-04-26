import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const BASE_URL = "http://127.0.0.1:5000";

export default function ResponderEncuesta() {
  const { id_encuesta, id_stakeholder } = useParams();

  const [encuesta, setEncuesta] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/responder/encuesta/${id_encuesta}/stakeholder/${id_stakeholder}`)
      .then(r => r.ok ? r.json() : Promise.reject("Error al cargar la encuesta"))
      .then(data => {
        setEncuesta(data);
        // Inicializar respuestas vacías
        const init = {};
        data.preguntas.forEach(p => { init[p.id_pregunta] = ""; });
        setRespuestas(init);
      })
      .catch(err => setError(String(err)))
      .finally(() => setCargando(false));
  }, [id_encuesta, id_stakeholder]);

  const handleCambio = (id_pregunta, valor) => {
    setRespuestas(prev => ({ ...prev, [id_pregunta]: valor }));
  };

  const handleEnviar = async () => {
    const sinResponder = encuesta.preguntas.filter(
      p => !respuestas[p.id_pregunta]?.trim()
    );
    if (sinResponder.length > 0) {
      alert("Por favor responde todas las preguntas antes de enviar.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(
        `${BASE_URL}/responder/encuesta/${id_encuesta}/stakeholder/${id_stakeholder}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            respuestas: Object.entries(respuestas).map(([id_pregunta, respuesta]) => ({
              id_pregunta: parseInt(id_pregunta),
              respuesta,
            })),
          }),
        }
      );
      if (!res.ok) throw new Error("Error al enviar respuestas");
      setEnviado(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Cargando encuesta...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-red-500">{error}</p>
    </div>
  );

  if (enviado) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200 max-w-md">
        <div className="flex justify-center mb-4">
            <CheckCircle size={56} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Gracias por responder!</h2>
        <p className="text-gray-500">Tus respuestas han sido registradas correctamente.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{encuesta.titulo}</h1>
          {encuesta.descripcion && (
            <p className="text-gray-600 text-sm">{encuesta.descripcion}</p>
          )}
          <p className="text-sm text-gray-400 mt-3">
            Respondiendo como: <span className="font-medium text-gray-700">{encuesta.stakeholder}</span>
          </p>
        </div>

        {/* Preguntas */}
        <div className="space-y-4">
          {encuesta.preguntas.map((pregunta, i) => (
            <div key={pregunta.id_pregunta} className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="font-medium text-gray-900 mb-4">
                {i + 1}. {pregunta.pregunta}
              </p>

              {/* Abierta */}
              {pregunta.tipo === "abierta" && (
                <textarea
                  rows={3}
                  value={respuestas[pregunta.id_pregunta] || ""}
                  onChange={e => handleCambio(pregunta.id_pregunta, e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              {/* Opción múltiple */}
              {pregunta.tipo === "opcion_multiple" && (
                <div className="space-y-2">
                  {pregunta.opciones.map((op, j) => (
                    <label key={j} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`pregunta_${pregunta.id_pregunta}`}
                        value={op}
                        checked={respuestas[pregunta.id_pregunta] === op}
                        onChange={() => handleCambio(pregunta.id_pregunta, op)}
                      />
                      <span className="text-sm text-gray-700">{op}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Escala */}
              {pregunta.tipo === "escala" && (
                <div className="flex gap-3 flex-wrap">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => handleCambio(pregunta.id_pregunta, String(n))}
                      className={`w-12 h-12 rounded-full border-2 font-bold text-sm transition ${
                        respuestas[pregunta.id_pregunta] === String(n)
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 text-gray-600 hover:border-blue-400"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {/* Sí / No */}
              {pregunta.tipo === "si_no" && (
                <div className="flex gap-3">
                  {["Sí", "No"].map(op => (
                    <button
                      key={op}
                      onClick={() => handleCambio(pregunta.id_pregunta, op)}
                      className={`flex-1 py-3 rounded-lg border-2 font-medium text-sm transition ${
                        respuestas[pregunta.id_pregunta] === op
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 text-gray-600 hover:border-blue-400"
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botón enviar */}
        <button
          onClick={handleEnviar}
          disabled={enviando}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-medium transition text-lg"
        >
          {enviando ? "Enviando..." : "Enviar Respuestas"}
        </button>
      </div>
    </div>
  );
}