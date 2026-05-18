import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";
const TECNICA  = "Entrevista";

export default function EditarEntrevista() {
  const { id, id_entrevista } = useParams();
  const navegar = useNavigate();

  const [form, setForm] = useState({
    titulo:           "",
    entrevistador:    "",
    entrevistado:     "",
    notas:            "",
    proceso:          "",
    subproceso:       "",
    fecha_programada: "",
  });

  // Preguntas existentes — ID real del backend: id_ent_prg
  const [preguntasExistentes, setPreguntasExistentes] = useState([]);
  // Preguntas nuevas a agregar al guardar
  const [preguntasNuevas,     setPreguntasNuevas]     = useState([]);
  // id_ent_prg de preguntas marcadas para eliminar
  const [preguntasAEliminar,  setPreguntasAEliminar]  = useState([]);

  const [entrevistadores,     setEntrevistadores]     = useState([]);
  const [stakeholders,        setStakeholders]        = useState([]);
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
      fetch(`${BASE_URL}/entrevistas/detalle/${id_entrevista}`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${BASE_URL}/ti/${id}`,           { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${BASE_URL}/stakeholders/${id}`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${BASE_URL}/procesos/${id}`,     { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([entrevista, ti, sh, procs]) => {
      if (entrevista) {
        setForm({
          titulo:           entrevista.titulo            || "",
          entrevistador:    String(entrevista.id_entrevistador || ""),
          entrevistado:     String(entrevista.id_stakeholder   || ""),
          notas:            entrevista.objetivo          || "",
          proceso:          String(entrevista.id_proceso || ""),
          subproceso:       String(entrevista.id_subproceso || ""),
          fecha_programada: entrevista.fecha_programada
            ? entrevista.fecha_programada.slice(0, 16)
            : "",
        });
        // preguntas vienen con id_ent_prg desde el backend
        setPreguntasExistentes(entrevista.preguntas || []);
      }
      setEntrevistadores(ti);
      setStakeholders(sh);
      setProcesos(procs);
    }).finally(() => setCargando(false));
  }, [id, id_entrevista]);

  // Filtrar subprocesos al cambiar proceso 
  useEffect(() => {
    if (!form.proceso) { setSubprocesosDisp([]); return; }
    setCargandoSubprocesos(true);
    const token = localStorage.getItem("token");
    fetch(
      `${BASE_URL}/subprocesos/por-tecnica?id_proceso=${form.proceso}&tecnica=${encodeURIComponent(TECNICA)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(r => r.ok ? r.json() : [])
      .then(setSubprocesosDisp)
      .catch(() => setSubprocesosDisp([]))
      .finally(() => setCargandoSubprocesos(false));
  }, [form.proceso]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // Preguntas existentes 
  const toggleEliminar = (id_ent_prg) => {
    setPreguntasAEliminar(prev =>
      prev.includes(id_ent_prg)
        ? prev.filter(x => x !== id_ent_prg)
        : [...prev, id_ent_prg]
    );
  };

  //  Preguntas nuevas 
  const agregarNueva    = () => setPreguntasNuevas(prev => [...prev, ""]);
  const actualizarNueva = (idx, valor) =>
    setPreguntasNuevas(prev => prev.map((p, i) => i === idx ? valor : p));
  const eliminarNueva   = (idx) =>
    setPreguntasNuevas(prev => prev.filter((_, i) => i !== idx));

  // Guardar 
  const handleGuardar = async () => {
    if (!form.titulo.trim()) return alert("El título es obligatorio.");
    if (!form.entrevistador) return alert("Selecciona un entrevistador.");
    if (!form.entrevistado)  return alert("Selecciona un entrevistado.");

    setGuardando(true);
    try {
      const token   = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

      // 1. Actualizar datos principales - PATCH /entrevistas/actualizar/:id
      const res = await fetch(`${BASE_URL}/entrevistas/actualizar/${id_entrevista}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          titulo:           form.titulo,
          id_entrevistador: parseInt(form.entrevistador),
          id_stakeholder:   parseInt(form.entrevistado),
          objetivo:         form.notas || null,
          id_subproceso:    form.subproceso ? parseInt(form.subproceso) : null,
          fecha_programada: form.fecha_programada || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.error || "Error al actualizar la entrevista.");
      }

      // 2. Eliminar preguntas marcadas - DELETE /preguntas/eliminar/:id_ent_prg
      for (const id_ent_prg of preguntasAEliminar) {
        await fetch(`${BASE_URL}/preguntas/eliminar/${id_ent_prg}`, {
          method: "DELETE",
          headers,
        });
      }

      // 3. Agregar preguntas nuevas - POST /preguntas/agregar
      for (const pregunta of preguntasNuevas.filter(p => p.trim())) {
        await fetch(`${BASE_URL}/preguntas/agregar`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            id_entrevista: parseInt(id_entrevista),
            pregunta,
            origen: "manual",
          }),
        });
      }

      navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`);
    } catch (e) {
      alert("Error de conexión con el servidor.");
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  const subprocesoPlaceholder = () => {
    if (!form.proceso)                return "Elige un proceso primero";
    if (cargandoSubprocesos)          return "Cargando...";
    if (subprocesosDisp.length === 0) return "Sin subprocesos disponibles";
    return "Sin subproceso";
  };

  if (cargando) return (
    <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
      Cargando entrevista...
    </div>
  );

  const preguntasVisibles   = preguntasExistentes.filter(p => !preguntasAEliminar.includes(p.id_ent_prg));
  const preguntasEliminadas = preguntasExistentes.filter(p =>  preguntasAEliminar.includes(p.id_ent_prg));

  return (
    <div className="space-y-7 max-w-3xl mx-auto">

      <button
        onClick={() => navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver al detalle
      </button>

      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Editar Entrevista</h1>
        <p className="text-sm text-gray-500 mt-0.5">Modifica los datos, agrega o elimina preguntas</p>
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
              <label className={labelCls}>Entrevistador <span className="text-red-500">*</span></label>
              <select value={form.entrevistador} onChange={e => set("entrevistador", e.target.value)} className={inputCls}>
                <option value="">Seleccionar</option>
                {entrevistadores.map(e => (
                  <option key={e.usuario.id_usuario} value={e.usuario.id_usuario}>
                    {e.usuario.nombre} {e.usuario.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Entrevistado <span className="text-red-500">*</span></label>
              <select value={form.entrevistado} onChange={e => set("entrevistado", e.target.value)} className={inputCls}>
                <option value="">Seleccionar</option>
                {stakeholders.map(s => (
                  <option key={s.id_stakeholder} value={s.id_stakeholder}>{s.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Fecha programada
                <span className="ml-1 text-gray-400 normal-case font-normal">(opcional)</span>
              </label>
              <input
                type="datetime-local"
                value={form.fecha_programada}
                onChange={e => set("fecha_programada", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Notas / Contexto</label>
            <textarea value={form.notas} onChange={e => set("notas", e.target.value)} rows={3} className={inputCls} />
          </div>
        </div>

        {/* Proceso relacionado */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Proceso relacionado</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Proceso</label>
              <select
                value={form.proceso}
                onChange={e => { set("proceso", e.target.value); set("subproceso", ""); }}
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
                value={form.subproceso}
                onChange={e => set("subproceso", e.target.value)}
                disabled={!form.proceso || cargandoSubprocesos || subprocesosDisp.length === 0}
                className={inputCls + " disabled:opacity-50"}
              >
                <option value="">{subprocesoPlaceholder()}</option>
                {subprocesosDisp.map(sp => (
                  <option key={sp.id_subproceso} value={sp.id_subproceso}>{sp.nombre}</option>
                ))}
              </select>
              {form.proceso && !cargandoSubprocesos && subprocesosDisp.length === 0 && (
                <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                    <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 4v3m0 2.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Ningún subproceso tiene asignada la técnica <strong className="ml-0.5">Entrevista</strong>.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Preguntas existentes */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Preguntas actuales</p>

          {preguntasExistentes.length === 0 && (
            <p className="text-xs text-gray-400 italic">Esta entrevista no tiene preguntas todavía.</p>
          )}

          <div className="space-y-2">
            {preguntasVisibles.map((p, idx) => (
              <div key={p.id_ent_prg} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold
                                 flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="flex-1 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                  {p.pregunta}
                </span>
                <button
                  type="button"
                  onClick={() => toggleEliminar(p.id_ent_prg)}
                  title="Marcar para eliminar"
                  className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {preguntasEliminadas.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-dashed border-red-200 pt-3">
              <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">
                Se eliminarán al guardar:
              </p>
              {preguntasEliminadas.map(p => (
                <div key={p.id_ent_prg} className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-red-400 line-through truncate">{p.pregunta}</span>
                  <button
                    type="button"
                    onClick={() => toggleEliminar(p.id_ent_prg)}
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                  >
                    Deshacer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preguntas nuevas */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Agregar preguntas</p>
            <button type="button" onClick={agregarNueva}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
              + Añadir pregunta
            </button>
          </div>

          {preguntasNuevas.length === 0 && (
            <p className="text-xs text-gray-400 italic">
              Usa el botón para agregar más preguntas a esta entrevista.
            </p>
          )}

          <div className="space-y-2">
            {preguntasNuevas.map((pregunta, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold
                                 flex items-center justify-center flex-shrink-0">
                  +
                </span>
                <input
                  type="text"
                  value={pregunta}
                  onChange={e => actualizarNueva(idx, e.target.value)}
                  placeholder={`Nueva pregunta ${idx + 1}`}
                  className="flex-1 border border-green-300 rounded-lg px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button type="button" onClick={() => eliminarNueva(idx)}
                  className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pb-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/entrevistas/${id_entrevista}`)}
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg
                     text-sm font-medium hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                     text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}