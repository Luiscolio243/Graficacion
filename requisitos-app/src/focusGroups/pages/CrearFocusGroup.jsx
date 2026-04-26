import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

const PASOS = {
  IDLE: "idle",
  SUBIENDO: "subiendo",
  SUBIDO: "subido",
  PROCESANDO: "procesando",
  LISTO: "listo",
  ERROR: "error",
};

export default function CrearFocusGroup() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [procesos, setProcesos] = useState([]);
  const [subprocesosFiltrados, setSubprocesosFiltrados] = useState([]);
  const [equipoTI, setEquipoTI] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [guardando, setGuardando] = useState(false);

  // Audio
  const [archivo, setArchivo] = useState(null);
  const [paso, setPaso] = useState(PASOS.IDLE);
  const [rutaAudio, setRutaAudio] = useState(null);
  const [resultadoIA, setResultadoIA] = useState(null);
  const [mensajeError, setMensajeError] = useState("");

  const [formulario, setFormulario] = useState({
    titulo: "",
    id_moderador: "",
    tipo_media: "",
    objetivo: "",
    transcripcion: "",
    id_proceso: "",
    id_subproceso: "",
    participantes: [],   // array de id_stakeholder
    conclusiones: [""],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${BASE_URL}/procesos/${id}`, { headers })
      .then(r => r.ok ? r.json() : []).then(setProcesos).catch(() => {});

    fetch(`${BASE_URL}/ti/${id}`, { headers })
      .then(r => r.ok ? r.json() : []).then(setEquipoTI).catch(() => {});

    fetch(`${BASE_URL}/stakeholders/${id}`, { headers })
      .then(r => r.ok ? r.json() : []).then(setStakeholders).catch(() => {});
  }, [id]);

  const handleCambiarProceso = (e) => {
    const idProceso = e.target.value;
    const proceso = procesos.find(p => String(p.id_proceso) === String(idProceso));
    setSubprocesosFiltrados(proceso?.subprocesos || []);
    setFormulario({ ...formulario, id_proceso: idProceso, id_subproceso: "" });
  };

  const toggleParticipante = (id_stakeholder) => {
    const ya = formulario.participantes.includes(id_stakeholder);
    setFormulario({
      ...formulario,
      participantes: ya
        ? formulario.participantes.filter(p => p !== id_stakeholder)
        : [...formulario.participantes, id_stakeholder],
    });
  };

  const agregarConclusion = () =>
    setFormulario({ ...formulario, conclusiones: [...formulario.conclusiones, ""] });

  const actualizarConclusion = (index, valor) => {
    const nuevas = [...formulario.conclusiones];
    nuevas[index] = valor;
    setFormulario({ ...formulario, conclusiones: nuevas });
  };

  const eliminarConclusion = (index) => {
    if (formulario.conclusiones.length > 1)
      setFormulario({ ...formulario, conclusiones: formulario.conclusiones.filter((_, i) => i !== index) });
  };

  // ── Audio ──
  const subirAudio = async (focusGroupId) => {
    if (!archivo) return null;
    setPaso(PASOS.SUBIENDO);
    const formData = new FormData();
    formData.append("audio", archivo);
    const res = await fetch(`${BASE_URL}/focus-groups/subir-audio/${focusGroupId}`, {
      method: "POST", body: formData,
    });
    if (!res.ok) throw new Error("Error al subir el audio");
    const data = await res.json();
    setRutaAudio(data.ruta_audio);
    setPaso(PASOS.SUBIDO);
    return data.ruta_audio;
  };

  const procesarConIA = async (focusGroupId, ruta) => {
    setPaso(PASOS.PROCESANDO);
    const res = await fetch(`${BASE_URL}/focus-groups/procesar-audio/${focusGroupId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruta_audio: ruta }),
    });
    if (!res.ok) throw new Error("Error al procesar con IA");
    const data = await res.json();
    setResultadoIA(data);
    setPaso(PASOS.LISTO);
    // Actualizar formulario con datos de IA
    setFormulario(prev => ({
      ...prev,
      transcripcion: data.transcripcion || prev.transcripcion,
      conclusiones: data.conclusiones?.length > 0 ? data.conclusiones : prev.conclusiones,
    }));
  };

  const handleGuardar = async () => {
    if (!formulario.titulo.trim() || !formulario.id_moderador || !formulario.objetivo.trim()) {
      alert("Completa los campos obligatorios: título, moderador y objetivo.");
      return;
    }
    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

      // 1. Crear el focus group
      const res = await fetch(`${BASE_URL}/focus-groups/crear`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id_proyecto: parseInt(id),
          id_moderador: parseInt(formulario.id_moderador),
          titulo: formulario.titulo,
          objetivo: formulario.objetivo,
          tipo_media: formulario.tipo_media || null,
          transcripcion: formulario.transcripcion || null,
          id_subproceso: formulario.id_subproceso ? parseInt(formulario.id_subproceso) : null,
          conclusiones: formulario.conclusiones.filter(c => c.trim()),
          participantes: formulario.participantes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear focus group");
      }

      const { focus_group } = await res.json();
      const fgId = focus_group.id_focus_group;

      // 2. Subir y procesar audio si hay archivo
      if (archivo) {
        const ruta = await subirAudio(fgId);
        if (ruta) await procesarConIA(fgId, ruta);
      }

      navegar(`/app/proyectos/${id}/requerimientos/focus-groups`);
    } catch (e) {
      alert(e.message);
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/focus-groups`)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrar Nuevo Focus Group</h1>
          <p className="text-gray-600 mt-1">Documenta los resultados de la sesión</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título del Focus Group <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formulario.titulo}
            onChange={e => setFormulario({ ...formulario, titulo: e.target.value })}
            placeholder="Ej: Focus group sobre usabilidad"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Moderador y Tipo de Media */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moderador <span className="text-red-500">*</span>
            </label>
            <select
              value={formulario.id_moderador}
              onChange={e => setFormulario({ ...formulario, id_moderador: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="">Selecciona un moderador</option>
              {equipoTI.map(e => (
                <option key={e.usuario.id_usuario} value={e.usuario.id_usuario}>
                  {e.usuario.nombre} {e.usuario.apellido}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Media</label>
            <select
              value={formulario.tipo_media}
              onChange={e => setFormulario({ ...formulario, tipo_media: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="">Selecciona un tipo</option>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
        </div>

        {/* Objetivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Objetivo <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formulario.objetivo}
            onChange={e => setFormulario({ ...formulario, objetivo: e.target.value })}
            placeholder="Objetivo del focus group"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Proceso / Subproceso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proceso</label>
            <select
              value={formulario.id_proceso}
              onChange={handleCambiarProceso}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="">Selecciona un proceso</option>
              {procesos.map(p => (
                <option key={p.id_proceso} value={p.id_proceso}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subproceso</label>
            <select
              value={formulario.id_subproceso}
              onChange={e => setFormulario({ ...formulario, id_subproceso: e.target.value })}
              disabled={!formulario.id_proceso}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {formulario.id_proceso ? "Selecciona un subproceso" : "Primero elige un proceso"}
              </option>
              {subprocesosFiltrados.map(sp => (
                <option key={sp.id_subproceso} value={sp.id_subproceso}>{sp.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Participantes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Participantes <span className="text-red-500">*</span>
            <span className="ml-2 text-gray-400 font-normal">({formulario.participantes.length} seleccionados)</span>
          </label>
          {stakeholders.length === 0 ? (
            <p className="text-sm text-amber-600">No hay stakeholders en este proyecto.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {stakeholders.map(s => (
                <label
                  key={s.id_stakeholder}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                    formulario.participantes.includes(s.id_stakeholder)
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formulario.participantes.includes(s.id_stakeholder)}
                    onChange={() => toggleParticipante(s.id_stakeholder)}
                    className="accent-orange-500"
                  />
                  <span className="text-sm text-gray-700">{s.nombre}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Conclusiones */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">Conclusiones</label>
            <button onClick={agregarConclusion} className="text-orange-600 hover:text-orange-700 font-medium text-sm">
              + Añadir Conclusión
            </button>
          </div>
          <div className="space-y-2">
            {formulario.conclusiones.map((conclusion, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={conclusion}
                  onChange={e => actualizarConclusion(index, e.target.value)}
                  placeholder={`Conclusión ${index + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {formulario.conclusiones.length > 1 && (
                  <button onClick={() => eliminarConclusion(index)} className="px-3 py-2 text-red-500 hover:text-red-700 font-medium text-sm">
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Transcripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transcripción / Notas
            {resultadoIA && <span className="ml-2 text-xs text-purple-600 font-normal">Completada por IA</span>}
          </label>
          <textarea
            value={formulario.transcripcion}
            onChange={e => setFormulario({ ...formulario, transcripcion: e.target.value })}
            placeholder="Transcripción de la sesión o notas principales"
            rows={4}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              resultadoIA ? "border-purple-300 bg-purple-50" : "border-gray-300"
            }`}
          />
        </div>

        {/* Audio */}
        <div className="border-2 border-dashed border-orange-200 rounded-xl p-6 space-y-4 bg-orange-50">
          <p className="text-sm font-medium text-orange-800">
            Procesar con IA (opcional)
          </p>
          <p className="text-xs text-orange-600">
            Sube la grabación de la sesión y Gemini completará automáticamente la transcripción y conclusiones.
          </p>

          {[PASOS.IDLE, PASOS.ERROR].includes(paso) && (
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition">
                Seleccionar audio
                <input type="file" accept="audio/*" onChange={e => setArchivo(e.target.files[0])} className="hidden" />
              </label>
              {archivo && <span className="text-sm text-gray-700">{archivo.name}</span>}
            </div>
          )}

          {paso === PASOS.SUBIENDO && <p className="text-sm text-orange-700 animate-pulse">Subiendo audio...</p>}
          {paso === PASOS.SUBIDO && <p className="text-sm text-orange-700">Audio listo. Se procesará al guardar.</p>}
          {paso === PASOS.PROCESANDO && <p className="text-sm text-purple-700 animate-pulse">Gemini analizando la sesión...</p>}
          {paso === PASOS.LISTO && (
            <div className="bg-white border border-purple-200 rounded-lg p-3">
              <p className="text-sm font-medium text-purple-800 mb-1">Procesamiento completado</p>
              <p className="text-xs text-purple-600">{resultadoIA?.temas_detectados?.length ?? 0} temas detectados</p>
            </div>
          )}
          {mensajeError && <p className="text-sm text-red-600">{mensajeError}</p>}
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition"
          >
            {guardando ? "Guardando..." : "Guardar Focus Group"}
          </button>
          <button
            onClick={() => navegar(`/app/proyectos/${id}/requerimientos/focus-groups`)}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}