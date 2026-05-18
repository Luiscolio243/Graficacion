import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

const PASOS = {
  IDLE:       "idle",
  SUBIENDO:   "subiendo",
  SUBIDO:     "subido",
  PROCESANDO: "procesando",
  LISTO:      "listo",
  ERROR:      "error",
};

export default function SubirAudio() {
  const { id, id_entrevista } = useParams();
  const navegar = useNavigate();

  const [archivo,       setArchivo]       = useState(null);
  const [paso,          setPaso]          = useState(PASOS.IDLE);
  const [rutaAudio,     setRutaAudio]     = useState(null);
  const [resultado,     setResultado]     = useState(null);
  const [mensajeError,  setMensajeError]  = useState("");

  const handleArchivo = (e) => {
    const file = e.target.files[0];
    if (file) setArchivo(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setArchivo(file);
      subirAudio(file);
    }
  };

  const subirAudio = async (fileParam) => {
    const fileToUpload = fileParam || archivo;
    if (!fileToUpload) return;
    setPaso(PASOS.SUBIENDO);
    setMensajeError("");

    try {
      const formData = new FormData();
      formData.append("audio", fileToUpload);

      const response = await fetch(
        `${BASE_URL}/entrevistas/subir-audio/${id_entrevista}`,
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al subir el audio");
      }

      const data = await response.json();
      setRutaAudio(data.ruta_audio);
      setPaso(PASOS.SUBIDO);
    } catch (err) {
      setMensajeError(err.message);
      setPaso(PASOS.ERROR);
    }
  };

  const procesarConIA = async () => {
    if (!rutaAudio) return;
    setPaso(PASOS.PROCESANDO);
    setMensajeError("");

    try {
      const response = await fetch(
        `${BASE_URL}/entrevistas/procesar-audio/${id_entrevista}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ruta_audio: rutaAudio }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al procesar el audio");
      }

      const data = await response.json();
      setResultado(data);
      setPaso(PASOS.LISTO);
    } catch (err) {
      setMensajeError(err.message);
      setPaso(PASOS.ERROR);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Botón de regreso */}
      <button
        onClick={() => navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver a la entrevista
      </button>

      {/* Encabezado */}
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Procesar Audio con IA</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Sube la grabación y Gemini responderá las preguntas automáticamente
        </p>
      </div>

      {/* Pasos visuales */}
      <Pasos pasoActual={paso} />

      {/* Zona de carga */}
      {[PASOS.IDLE, PASOS.ERROR].includes(paso) && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 transition"
        >
          {/* Icono micrófono */}
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-blue-500">
                <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M5 10a7 7 0 0014 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M12 19v3M9 22h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <p className="text-gray-700 font-medium mb-1">Arrastra tu archivo de audio aquí</p>
          <p className="text-gray-400 text-sm mb-4">Formatos soportados: MP3, WAV, M4A, OGG, FLAC</p>

          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition inline-flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Seleccionar archivo
            <input type="file" accept="audio/*" onChange={handleArchivo} className="hidden" />
          </label>

          {archivo && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <rect x="2" y="1" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <span className="font-medium truncate">{archivo.name}</span>
              </div>
              <span className="text-blue-500 flex-shrink-0">{formatBytes(archivo.size)}</span>
            </div>
          )}

          {mensajeError && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {mensajeError}
            </div>
          )}
        </div>
      )}

      {/* Subiendo */}
      {paso === PASOS.SUBIENDO && (
        <EstadoAnimado
          titulo="Subiendo audio..."
          descripcion="Transfiriendo el archivo al servidor."
          color="blue"
        />
      )}

      {/* Subido — listo para procesar */}
      {paso === PASOS.SUBIDO && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M7.5 12l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <p className="font-medium text-emerald-800">Audio subido correctamente</p>
          <p className="text-sm text-emerald-600">
            Ahora puedes enviarlo a Gemini para que analice la entrevista y responda tus preguntas.
          </p>
          <button
            onClick={procesarConIA}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition inline-flex items-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
                    stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            </svg>
            Procesar con Gemini IA
          </button>
        </div>
      )}

      {/* Botón subir si hay archivo seleccionado */}
      {archivo && paso === PASOS.IDLE && (
        <button
          onClick={() => subirAudio()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Subir audio
        </button>
      )}

      {/* Procesando */}
      {paso === PASOS.PROCESANDO && (
        <EstadoAnimado
          titulo="Gemini está analizando el audio..."
          descripcion="Esto puede tardar uno o dos minutos. No cierres esta pantalla."
          color="purple"
        />
      )}

      {/* Resultado */}
      {paso === PASOS.LISTO && resultado && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">

            {/* Icono IA */}
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-purple-600">
                  <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M8 6V4a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M8 12h.01M12 12h.01M16 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            <h2 className="text-center font-bold text-purple-900 text-lg mb-4">
              ¡Procesamiento completado!
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 text-center border border-purple-100">
                <p className="text-3xl font-bold text-purple-700">{resultado.preguntas_respondidas}</p>
                <p className="text-sm text-gray-600 mt-1">Preguntas respondidas</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-purple-100">
                <p className="text-3xl font-bold text-purple-700">{resultado.preguntas_nuevas_detectadas}</p>
                <p className="text-sm text-gray-600 mt-1">Preguntas nuevas detectadas</p>
              </div>
            </div>

            {resultado.preguntas_nuevas?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-purple-800 mb-2">Nuevas preguntas agregadas:</p>
                <ul className="space-y-1">
                  {resultado.preguntas_nuevas.map((p, i) => (
                    <li key={i} className="text-sm text-purple-700 bg-purple-100 rounded px-3 py-1.5 flex items-start gap-2">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M5.5 8l2 2 3-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={() => navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H7l-4 3V4z"
                    stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
            Ver entrevista con respuestas
          </button>
        </div>
      )}
    </div>
  );
}

function Pasos({ pasoActual }) {
  const lista = [
    { key: PASOS.IDLE,  label: "Seleccionar archivo" },
    { key: PASOS.SUBIDO, label: "Archivo subido" },
    { key: PASOS.LISTO, label: "IA procesó el audio" },
  ];

  const orden = [PASOS.IDLE, PASOS.SUBIENDO, PASOS.SUBIDO, PASOS.PROCESANDO, PASOS.LISTO];
  const indiceActual = orden.indexOf(pasoActual);

  return (
    <div className="flex items-center gap-2">
      {lista.map((paso, i) => {
        const indPaso    = orden.indexOf(paso.key);
        const completado = indiceActual > indPaso;
        const activo     = indiceActual === indPaso
          || (i === 1 && pasoActual === PASOS.SUBIENDO)
          || (i === 2 && pasoActual === PASOS.PROCESANDO);

        return (
          <div key={paso.key} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                completado ? "bg-emerald-500 text-white"
                : activo   ? "bg-blue-600 text-white"
                :             "bg-gray-200 text-gray-400"
              }`}>
                {completado ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span className="text-xs font-medium">{i + 1}</span>
                )}
              </div>
              <span className={`text-sm ${activo ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                {paso.label}
              </span>
            </div>
            {i < lista.length - 1 && (
              <div className={`h-px flex-1 ${completado ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function EstadoAnimado({ titulo, descripcion, color }) {
  const colores = {
    blue:   "bg-blue-50 border-blue-200 text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };
  const spinColores = {
    blue:   "border-blue-200 border-t-blue-600",
    purple: "border-purple-200 border-t-purple-600",
  };

  return (
    <div className={`border rounded-xl p-10 text-center space-y-3 ${colores[color]}`}>
      <div className="flex justify-center">
        <div className={`w-10 h-10 border-4 rounded-full animate-spin ${spinColores[color]}`} />
      </div>
      <p className="font-medium">{titulo}</p>
      <p className="text-sm opacity-75">{descripcion}</p>
    </div>
  );
}