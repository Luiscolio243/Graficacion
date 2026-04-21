import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
 
const PASOS = {
  IDLE: "idle",
  SUBIENDO: "subiendo",
  SUBIDO: "subido",
  PROCESANDO: "procesando",
  LISTO: "listo",
  ERROR: "error",
};
 
export default function SubirAudio() {
  const { id, id_entrevista } = useParams();
  const navegar = useNavigate();
 
  const [archivo, setArchivo] = useState(null);
  const [paso, setPaso] = useState(PASOS.IDLE);
  const [rutaAudio, setRutaAudio] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [mensajeError, setMensajeError] = useState("");
 
  const handleArchivo = (e) => {
    const file = e.target.files[0];
    if (file) setArchivo(file);
  };
 
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setArchivo(file);
    subirAudio();
  };
 
  // Paso 1: subir el archivo al servidor
  const subirAudio = async () => {
    if (!archivo) return;
    setPaso(PASOS.SUBIENDO);
    setMensajeError("");
 
    try {
      const formData = new FormData();
      formData.append("audio", archivo);
 
      const response = await fetch(
        `http://localhost:5000/entrevistas/subir-audio/${id_entrevista}`,
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
 
  // Paso 2: procesar con Gemini
  const procesarConIA = async () => {
    if (!rutaAudio) return;
    setPaso(PASOS.PROCESANDO);
    setMensajeError("");
 
    try {
      const response = await fetch(
        `http://localhost:5000/entrevistas/procesar-audio/${id_entrevista}`,
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
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
        >
          ← Atrás
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procesar Audio con IA</h1>
          <p className="text-gray-600 mt-1">
            Sube la grabación y Gemini responderá las preguntas automáticamente
          </p>
        </div>
      </div>
 
      {/* Pasos visuales */}
      <Pasos pasoActual={paso} />
 
      {/* Zona de carga — solo si no estamos en resultado */}
      {[PASOS.IDLE, PASOS.ERROR].includes(paso) && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 transition"
        >
          <div className="text-4xl mb-3">🎙</div>
          <p className="text-gray-700 font-medium mb-1">
            Arrastra tu archivo de audio aquí
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Formatos soportados: MP3, WAV, M4A, OGG, FLAC
          </p>
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition">
            Seleccionar archivo
            <input
              type="file"
              accept="audio/*"
              onChange={handleArchivo}
              className="hidden"
            />
          </label>
 
          {archivo && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 flex items-center justify-between">
              <span className="font-medium">{archivo.name}</span>
              <span className="text-blue-500">{formatBytes(archivo.size)}</span>
            </div>
          )}
 
          {mensajeError && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
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
          <div className="text-4xl">✅</div>
          <p className="font-medium text-emerald-800">Audio subido correctamente</p>
          <p className="text-sm text-emerald-600">
            Ahora puedes enviarlo a Gemini para que analice la entrevista y responda tus preguntas.
          </p>
          <button
            onClick={procesarConIA}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Procesar con Gemini IA
          </button>
        </div>
      )}


      {archivo && paso === PASOS.IDLE && (
  <button
    onClick={subirAudio}
    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium text-sm transition"
  >
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
            <div className="text-4xl mb-3 text-center">🤖</div>
            <h2 className="text-center font-bold text-purple-900 text-lg mb-4">
              ¡Procesamiento completado!
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 text-center border border-purple-100">
                <p className="text-3xl font-bold text-purple-700">
                  {resultado.preguntas_respondidas}
                </p>
                <p className="text-sm text-gray-600 mt-1">Preguntas respondidas</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-purple-100">
                <p className="text-3xl font-bold text-purple-700">
                  {resultado.preguntas_nuevas_detectadas}
                </p>
                <p className="text-sm text-gray-600 mt-1">Preguntas nuevas detectadas</p>
              </div>
            </div>
 
            {resultado.preguntas_nuevas?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-purple-800 mb-2">
                  Nuevas preguntas agregadas:
                </p>
                <ul className="space-y-1">
                  {resultado.preguntas_nuevas.map((p, i) => (
                    <li key={i} className="text-sm text-purple-700 bg-purple-100 rounded px-3 py-1">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
 
          <button
            onClick={() =>
              navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`)
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
          >
            Ver entrevista con respuestas
          </button>
        </div>
      )}
    </div>
  );
}
 
function Pasos({ pasoActual }) {
  const lista = [
    { key: PASOS.IDLE, label: "Seleccionar archivo" },
    { key: PASOS.SUBIDO, label: "Archivo subido" },
    { key: PASOS.LISTO, label: "IA procesó el audio" },
  ];
 
  const orden = [PASOS.IDLE, PASOS.SUBIENDO, PASOS.SUBIDO, PASOS.PROCESANDO, PASOS.LISTO];
  const indiceActual = orden.indexOf(pasoActual);
 
  return (
    <div className="flex items-center gap-2">
      {lista.map((paso, i) => {
        const indPaso = orden.indexOf(paso.key);
        const completado = indiceActual > indPaso;
        const activo = indiceActual === indPaso || (i === 1 && pasoActual === PASOS.SUBIENDO) || (i === 2 && pasoActual === PASOS.PROCESANDO);
 
        return (
          <div key={paso.key} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                  completado
                    ? "bg-emerald-500 text-white"
                    : activo
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {completado ? "✓" : i + 1}
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
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };
 
  return (
    <div className={`border rounded-xl p-10 text-center space-y-3 ${colores[color]}`}>
      <div className="flex justify-center">
        <div
          className={`w-10 h-10 border-4 rounded-full animate-spin ${
            color === "purple"
              ? "border-purple-200 border-t-purple-600"
              : "border-blue-200 border-t-blue-600"
          }`}
        />
      </div>
      <p className="font-medium">{titulo}</p>
      <p className="text-sm opacity-75">{descripcion}</p>
    </div>
  );
}