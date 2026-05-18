import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";
const TECNICA  = "Focus Group";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

const PASOS = { IDLE: "idle", SUBIENDO: "subiendo", PROCESANDO: "procesando", LISTO: "listo", ERROR: "error" };

export default function CrearFocusGroup() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [procesos,            setProcesos]            = useState([]);
  const [equipoTI,            setEquipoTI]            = useState([]);
  const [stakeholders,        setStakeholders]        = useState([]);
  const [subprocesosDisp,     setSubprocesosDisp]     = useState([]);
  const [cargandoSubprocesos, setCargandoSubprocesos] = useState(false);
  const [guardando,           setGuardando]           = useState(false);
  const [archivo,             setArchivo]             = useState(null);
  const [paso,                setPaso]                = useState(PASOS.IDLE);
  const [resultadoIA,         setResultadoIA]         = useState(null);

  const [form, setForm] = useState({
    titulo:        "",
    id_moderador:  "",
    tipo_media:    "",
    objetivo:      "",
    transcripcion: "",
    id_proceso:    "",
    id_subproceso: "",
    participantes: [],
    conclusiones:  [""],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const h = { Authorization: `Bearer ${token}` };
    fetch(`${BASE_URL}/procesos/${id}`, { headers: h }).then((r) => r.ok ? r.json() : []).then(setProcesos).catch(() => {});
    fetch(`${BASE_URL}/ti/${id}`, { headers: h }).then((r) => r.ok ? r.json() : []).then(setEquipoTI).catch(() => {});
    fetch(`${BASE_URL}/stakeholders/${id}`, { headers: h }).then((r) => r.ok ? r.json() : []).then(setStakeholders).catch(() => {});
  }, [id]);

  // Filtrar subprocesos por técnica al cambiar proceso
  useEffect(() => {
    if (!form.id_proceso) { setSubprocesosDisp([]); return; }
    setCargandoSubprocesos(true);
    const token = localStorage.getItem("token");
    fetch(
      `${BASE_URL}/subprocesos/por-tecnica?id_proceso=${form.id_proceso}&tecnica=${encodeURIComponent(TECNICA)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((r) => r.ok ? r.json() : [])
      .then(setSubprocesosDisp)
      .catch(() => setSubprocesosDisp([]))
      .finally(() => setCargandoSubprocesos(false));
  }, [form.id_proceso]);

  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleCambiarProceso = (e) =>
    setForm((prev) => ({ ...prev, id_proceso: e.target.value, id_subproceso: "" }));

  const toggleParticipante = (id_sh) =>
    set("participantes", form.participantes.includes(id_sh)
      ? form.participantes.filter((p) => p !== id_sh)
      : [...form.participantes, id_sh]);

  const agregarConclusion    = () => set("conclusiones", [...form.conclusiones, ""]);
  const actualizarConclusion = (idx, val) =>
    set("conclusiones", form.conclusiones.map((c, i) => i === idx ? val : c));
  const eliminarConclusion   = (idx) => {
    if (form.conclusiones.length > 1)
      set("conclusiones", form.conclusiones.filter((_, i) => i !== idx));
  };

  const subirAudio = async (fgId) => {
    if (!archivo) return null;
    setPaso(PASOS.SUBIENDO);
    const fd = new FormData();
    fd.append("audio", archivo);
    const res = await fetch(`${BASE_URL}/focus-groups/subir-audio/${fgId}`, { method: "POST", body: fd });
    if (!res.ok) throw new Error("Error al subir el audio");
    const data = await res.json();
    return data.ruta_audio;
  };

  const procesarConIA = async (fgId, ruta) => {
    setPaso(PASOS.PROCESANDO);
    const res = await fetch(`${BASE_URL}/focus-groups/procesar-audio/${fgId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruta_audio: ruta }),
    });
    if (!res.ok) throw new Error("Error al procesar con IA");
    const data = await res.json();
    setResultadoIA(data);
    setPaso(PASOS.LISTO);
    setForm((prev) => ({
      ...prev,
      transcripcion: data.transcripcion || prev.transcripcion,
      conclusiones:  data.conclusiones?.length > 0 ? data.conclusiones : prev.conclusiones,
    }));
  };

  const handleGuardar = async () => {
    if (!form.titulo.trim() || !form.id_moderador || !form.objetivo.trim())
      return alert("Completa los campos obligatorios: título, moderador y objetivo.");

    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/focus-groups/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id_proyecto:   parseInt(id),
          id_moderador:  parseInt(form.id_moderador),
          titulo:        form.titulo,
          objetivo:      form.objetivo,
          tipo_media:    form.tipo_media || null,
          transcripcion: form.transcripcion || null,
          id_subproceso: form.id_subproceso ? parseInt(form.id_subproceso) : null,
          conclusiones:  form.conclusiones.filter((c) => c.trim()),
          participantes: form.participantes,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear focus group");
      }
      const { focus_group } = await res.json();
      if (archivo) {
        const ruta = await subirAudio(focus_group.id_focus_group);
        if (ruta) await procesarConIA(focus_group.id_focus_group, ruta);
      }
      navegar(`/app/proyectos/${id}/requerimientos/focus-groups`);
    } catch (e) {
      alert(e.message);
      setGuardando(false);
    }
  };

  const subprocesoPlaceholder = () => {
    if (!form.id_proceso)             return "Elige un proceso primero";
    if (cargandoSubprocesos)          return "Cargando...";
    if (subprocesosDisp.length === 0) return "Sin subprocesos disponibles";
    return "Sin subproceso";
  };

  return (
    <div className="space-y-7 max-w-3xl mx-auto">

      <button
        onClick={() => navegar(`/app/proyectos/${id}/requerimientos/focus-groups`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver a Focus Groups
      </button>

      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Nuevo Focus Group</h1>
        <p className="text-sm text-gray-500 mt-0.5">Documenta los resultados de la sesión grupal</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">

        {/* Información general */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Información general</p>

          <div>
            <label className={labelCls}>Título <span className="text-red-500">*</span></label>
            <input type="text" value={form.titulo} onChange={(e) => set("titulo", e.target.value)}
              placeholder="Ej: Sesión de descubrimiento de necesidades" className={inputCls} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Moderador <span className="text-red-500">*</span></label>
              <select value={form.id_moderador} onChange={(e) => set("id_moderador", e.target.value)} className={inputCls}>
                <option value="">Selecciona un moderador</option>
                {equipoTI.map((e) => (
                  <option key={e.usuario.id_usuario} value={e.usuario.id_usuario}>
                    {e.usuario.nombre} {e.usuario.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tipo de media <span className="text-gray-400 font-normal normal-case">(opcional)</span></label>
              <select value={form.tipo_media} onChange={(e) => set("tipo_media", e.target.value)} className={inputCls}>
                <option value="">Sin media</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="notas">Solo notas</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Objetivo <span className="text-red-500">*</span></label>
            <textarea value={form.objetivo} onChange={(e) => set("objetivo", e.target.value)}
              placeholder="¿Qué se busca obtener de esta sesión?" rows={3} className={inputCls} />
          </div>
        </div>

        {/* Participantes */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Participantes</p>
            {form.participantes.length > 0 && (
              <span className="text-xs text-gray-500">{form.participantes.length} seleccionados</span>
            )}
          </div>
          {stakeholders.length === 0 ? (
            <p className="text-sm text-amber-600 italic">No hay stakeholders registrados en este proyecto.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {stakeholders.map((s) => {
                const activo = form.participantes.includes(s.id_stakeholder);
                return (
                  <label key={s.id_stakeholder}
                    className={`flex items-center gap-3 px-3 py-2.5 border rounded-lg cursor-pointer transition-colors ${
                      activo ? "border-green-400 bg-green-50" : "border-gray-200 hover:bg-gray-50"
                    }`}>
                    <input type="checkbox" checked={activo} onChange={() => toggleParticipante(s.id_stakeholder)} className="accent-green-600 w-4 h-4" />
                    <span className="text-sm text-gray-700">{s.nombre}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Conclusiones */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Conclusiones</p>
            <button type="button" onClick={agregarConclusion}
              className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors">+ Añadir</button>
          </div>
          <div className="space-y-2">
            {form.conclusiones.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input type="text" value={c} onChange={(e) => actualizarConclusion(idx, e.target.value)}
                  placeholder={`Conclusión ${idx + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                {form.conclusiones.length > 1 && (
                  <button type="button" onClick={() => eliminarConclusion(idx)}
                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Transcripción */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Transcripción / Notas
            {resultadoIA && <span className="ml-2 text-emerald-600 normal-case font-normal">completada por IA</span>}
          </p>
          <textarea value={form.transcripcion} onChange={(e) => set("transcripcion", e.target.value)}
            placeholder="Transcripción de la sesión o notas principales..." rows={4}
            className={inputCls + (resultadoIA ? " border-emerald-300 bg-emerald-50" : "")} />
        </div>

        {/* Proceso relacionado */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Proceso relacionado</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Proceso</label>
              <select value={form.id_proceso} onChange={handleCambiarProceso} className={inputCls}>
                <option value="">Sin proceso</option>
                {procesos.map((p) => (
                  <option key={p.id_proceso} value={p.id_proceso}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Subproceso</label>
              <select
                value={form.id_subproceso}
                onChange={(e) => set("id_subproceso", e.target.value)}
                disabled={!form.id_proceso || cargandoSubprocesos || subprocesosDisp.length === 0}
                className={inputCls + " disabled:opacity-50"}
              >
                <option value="">{subprocesoPlaceholder()}</option>
                {subprocesosDisp.map((sp) => (
                  <option key={sp.id_subproceso} value={sp.id_subproceso}>{sp.nombre}</option>
                ))}
              </select>
              {form.id_proceso && !cargandoSubprocesos && subprocesosDisp.length === 0 && (
                <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                    <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 4v3m0 2.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Ningún subproceso tiene asignada la técnica <strong className="ml-0.5">Focus Group</strong>.
                  Asígnala desde el módulo de Procesos.
                </p>
              )}
              {form.id_proceso && !cargandoSubprocesos && subprocesosDisp.length > 0 && (
                <p className="mt-1.5 text-xs text-gray-400">Solo subprocesos con técnica <strong>Focus Group</strong> asignada</p>
              )}
            </div>
          </div>
        </div>

        {/* IA */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Procesar con IA</p>
          <p className="text-xs text-gray-500">
            Sube la grabación de la sesión y Gemini completará automáticamente la transcripción y conclusiones.
          </p>
          {[PASOS.IDLE, PASOS.ERROR].includes(paso) && (
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v8M5 5l3-3 3 3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Seleccionar audio
                <input type="file" accept="audio/*" onChange={(e) => setArchivo(e.target.files[0])} className="hidden" />
              </label>
              {archivo && <span className="text-xs text-gray-500 truncate max-w-[180px]">{archivo.name}</span>}
            </div>
          )}
          {paso === PASOS.SUBIENDO   && <p className="text-sm text-gray-500 animate-pulse">Subiendo audio...</p>}
          {paso === PASOS.PROCESANDO && <p className="text-sm text-emerald-600 animate-pulse">Gemini analizando la sesión...</p>}
          {paso === PASOS.LISTO && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
              <p className="text-sm font-medium text-emerald-800">Procesamiento completado</p>
              <p className="text-xs text-emerald-600 mt-0.5">{resultadoIA?.temas_detectados?.length ?? 0} temas detectados por IA</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pb-4">
        <button onClick={() => navegar(`/app/proyectos/${id}/requerimientos/focus-groups`)}
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
          Cancelar
        </button>
        <button onClick={handleGuardar} disabled={guardando}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
          {guardando ? "Guardando..." : "Guardar Focus Group"}
        </button>
      </div>
    </div>
  );
}
