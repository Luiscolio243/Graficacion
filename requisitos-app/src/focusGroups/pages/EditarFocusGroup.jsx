import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";
const TECNICA  = "Focus Group";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

const ESTADOS = [
  { value: "planificado", label: "Planificado" },
  { value: "en_progreso", label: "En progreso" },
  { value: "realizado",   label: "Realizado"   },
  { value: "cancelado",   label: "Cancelado"   },
];

export default function EditarFocusGroup() {
  const { id, id_focus_group } = useParams();
  const navegar = useNavigate();

  const [form, setForm] = useState({
    titulo:        "",
    id_moderador:  "",
    tipo_media:    "",
    objetivo:      "",
    transcripcion: "",
    estado:        "planificado",
    id_proceso:    "",
    id_subproceso: "",
    conclusiones:  [""],
  });

  // Participantes
  const [participantesActuales, setParticipantesActuales] = useState([]);
  const [participantesSelec,    setParticipantesSelec]    = useState([]);
  const [stakeholders,          setStakeholders]          = useState([]);

  const [equipoTI,            setEquipoTI]            = useState([]);
  const [procesos,            setProcesos]            = useState([]);
  const [subprocesosDisp,     setSubprocesosDisp]     = useState([]);
  const [cargandoSubprocesos, setCargandoSubprocesos] = useState(false);
  const [cargando,            setCargando]            = useState(true);
  const [guardando,           setGuardando]           = useState(false);

  // Carga inicial 
  useEffect(() => {
    const token   = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${BASE_URL}/focus-groups/detalle/${id_focus_group}`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${BASE_URL}/ti/${id}`,           { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${BASE_URL}/stakeholders/${id}`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${BASE_URL}/procesos/${id}`,     { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([fg, ti, sh, procs]) => {
      setEquipoTI(ti);
      setStakeholders(sh);
      setProcesos(procs);

      if (fg) {
        // Buscar el id_proceso que contiene el subproceso guardado
        let procesoEncontrado = "";
        if (fg.id_subproceso) {
          const proceso = procs.find(p =>
            p.subprocesos?.some(sp => sp.id_subproceso === fg.id_subproceso)
          );
          if (proceso) procesoEncontrado = String(proceso.id_proceso);
        }

        setForm({
          titulo:        fg.titulo        || "",
          id_moderador:  String(fg.id_moderador  || ""),
          tipo_media:    fg.tipo_media    || "",
          objetivo:      fg.objetivo      || "",
          transcripcion: fg.transcripcion || "",
          estado:        fg.estado        || "planificado",
          id_proceso:    procesoEncontrado,
          id_subproceso: String(fg.id_subproceso || ""),
          conclusiones:  fg.conclusiones?.length > 0 ? fg.conclusiones : [""],
        });

        const parts = fg.participantes || [];
        setParticipantesActuales(parts);
        setParticipantesSelec(parts.map(p => p.id_stakeholder));
      }
    }).finally(() => setCargando(false));
  }, [id, id_focus_group]);

  // Filtrar subprocesos por técnica al cambiar proceso 
  useEffect(() => {
    if (!form.id_proceso) { setSubprocesosDisp([]); return; }
    setCargandoSubprocesos(true);
    const token = localStorage.getItem("token");
    fetch(
      `${BASE_URL}/subprocesos/por-tecnica?id_proceso=${form.id_proceso}&tecnica=${encodeURIComponent(TECNICA)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(r => r.ok ? r.json() : [])
      .then(setSubprocesosDisp)
      .catch(() => setSubprocesosDisp([]))
      .finally(() => setCargandoSubprocesos(false));
  }, [form.id_proceso]);

  const set = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }));

  // Participantes 
  const toggleParticipante = (id_sh) =>
    setParticipantesSelec(prev =>
      prev.includes(id_sh) ? prev.filter(x => x !== id_sh) : [...prev, id_sh]
    );

  // Conclusiones 
  const agregarConclusion    = () => set("conclusiones", [...form.conclusiones, ""]);
  const actualizarConclusion = (idx, val) =>
    set("conclusiones", form.conclusiones.map((c, i) => i === idx ? val : c));
  const eliminarConclusion   = (idx) => {
    if (form.conclusiones.length > 1)
      set("conclusiones", form.conclusiones.filter((_, i) => i !== idx));
  };

  // Guardar 
  const handleGuardar = async () => {
    if (!form.titulo.trim())   return alert("El título es obligatorio.");
    if (!form.id_moderador)    return alert("Selecciona un moderador.");

    setGuardando(true);
    try {
      const token   = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

      // 1. Actualizar datos principales
      const res = await fetch(`${BASE_URL}/focus-groups/actualizar/${id_focus_group}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          titulo:        form.titulo,
          id_moderador:  parseInt(form.id_moderador),
          tipo_media:    form.tipo_media    || null,
          objetivo:      form.objetivo      || null,
          transcripcion: form.transcripcion || null,
          estado:        form.estado,
          id_subproceso: form.id_subproceso ? parseInt(form.id_subproceso) : null,
          conclusiones:  form.conclusiones.filter(c => c.trim()),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.error || "Error al actualizar.");
      }

      // 2. Sincronizar participantes
      const originales = participantesActuales.map(p => p.id_stakeholder);

      for (const p of participantesActuales) {
        if (!participantesSelec.includes(p.id_stakeholder)) {
          await fetch(`${BASE_URL}/focus-groups/participantes/eliminar/${p.id_participante}`, {
            method: "DELETE", headers,
          });
        }
      }
      for (const id_sh of participantesSelec) {
        if (!originales.includes(id_sh)) {
          await fetch(`${BASE_URL}/focus-groups/${id_focus_group}/participantes/agregar`, {
            method: "POST", headers,
            body: JSON.stringify({ id_stakeholder: id_sh }),
          });
        }
      }

      navegar(`/app/proyectos/${id}/requerimientos/focus-groups`);
    } catch (e) {
      alert("Error de conexión con el servidor.");
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };

  const subprocesoPlaceholder = () => {
    if (!form.id_proceso)             return "Elige un proceso primero";
    if (cargandoSubprocesos)          return "Cargando...";
    if (subprocesosDisp.length === 0) return "Sin subprocesos disponibles";
    return "Sin subproceso";
  };

  if (cargando) return (
    <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-green-500 animate-spin" />
      Cargando focus group...
    </div>
  );

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
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Editar Focus Group</h1>
        <p className="text-sm text-gray-500 mt-0.5">Modifica los datos, participantes y conclusiones</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">

        {/* Información general */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Información general</p>

          <div>
            <label className={labelCls}>Título <span className="text-red-500">*</span></label>
            <input type="text" value={form.titulo} onChange={e => set("titulo", e.target.value)} className={inputCls} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Moderador <span className="text-red-500">*</span></label>
              <select value={form.id_moderador} onChange={e => set("id_moderador", e.target.value)} className={inputCls}>
                <option value="">Seleccionar</option>
                {equipoTI.map(e => (
                  <option key={e.usuario.id_usuario} value={e.usuario.id_usuario}>
                    {e.usuario.nombre} {e.usuario.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tipo de media</label>
              <select value={form.tipo_media} onChange={e => set("tipo_media", e.target.value)} className={inputCls}>
                <option value="">Sin media</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="notas">Solo notas</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Estado</label>
            <select value={form.estado} onChange={e => set("estado", e.target.value)} className={inputCls}>
              {ESTADOS.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Objetivo</label>
            <textarea value={form.objetivo} onChange={e => set("objetivo", e.target.value)}
              placeholder="¿Qué se busca obtener de esta sesión?" rows={3} className={inputCls} />
          </div>
        </div>

        {/* Proceso relacionado */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Proceso relacionado</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Proceso</label>
              <select
                value={form.id_proceso}
                onChange={e => { set("id_proceso", e.target.value); set("id_subproceso", ""); }}
                className={inputCls}
              >
                <option value="">Sin proceso</option>
                {procesos.map(p => (
                  <option key={p.id_proceso} value={p.id_proceso}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Subproceso</label>
              <select
                value={form.id_subproceso}
                onChange={e => set("id_subproceso", e.target.value)}
                disabled={!form.id_proceso || cargandoSubprocesos || subprocesosDisp.length === 0}
                className={inputCls + " disabled:opacity-50"}
              >
                <option value="">{subprocesoPlaceholder()}</option>
                {subprocesosDisp.map(sp => (
                  <option key={sp.id_subproceso} value={sp.id_subproceso}>{sp.nombre}</option>
                ))}
              </select>
              {form.id_proceso && !cargandoSubprocesos && subprocesosDisp.length === 0 && (
                <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                    <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 4v3m0 2.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Ningún subproceso tiene asignada la técnica <strong className="ml-0.5">Focus Group</strong>.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Participantes */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Participantes</p>
            {participantesSelec.length > 0 && (
              <span className="text-xs text-gray-500">{participantesSelec.length} seleccionados</span>
            )}
          </div>
          {stakeholders.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No hay stakeholders en este proyecto.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {stakeholders.map(s => {
                const activo = participantesSelec.includes(s.id_stakeholder);
                return (
                  <label key={s.id_stakeholder}
                    className={`flex items-center gap-3 px-3 py-2.5 border rounded-lg cursor-pointer transition-colors ${
                      activo ? "border-green-400 bg-green-50" : "border-gray-200 hover:bg-gray-50"
                    }`}>
                    <input type="checkbox" checked={activo} onChange={() => toggleParticipante(s.id_stakeholder)}
                      className="accent-green-600 w-4 h-4" />
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
              className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors">
              + Añadir
            </button>
          </div>
          <div className="space-y-2">
            {form.conclusiones.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input type="text" value={c} onChange={e => actualizarConclusion(idx, e.target.value)}
                  placeholder={`Conclusión ${idx + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white
                             focus:outline-none focus:ring-2 focus:ring-green-500" />
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
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Transcripción / Notas</p>
          <textarea value={form.transcripcion} onChange={e => set("transcripcion", e.target.value)}
            placeholder="Transcripción de la sesión o notas principales..." rows={4} className={inputCls} />
        </div>
      </div>

      <div className="flex gap-3 pb-4">
        <button onClick={() => navegar(`/app/proyectos/${id}/requerimientos/focus-groups`)}
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
          Cancelar
        </button>
        <button onClick={handleGuardar} disabled={guardando}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}