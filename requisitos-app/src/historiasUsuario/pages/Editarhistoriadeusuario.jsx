import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";
const TECNICA  = "Historias de Usuario";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

const PRIORIDADES = [
  { value: "alta",  label: "Alta"  },
  { value: "media", label: "Media" },
  { value: "baja",  label: "Baja"  },
];

export default function EditarHistoriaDeUsuario() {
  const { id, id_historia } = useParams();
  const navegar = useNavigate();

  const [procesos,            setProcesos]            = useState([]);
  const [subprocesosDisp,     setSubprocesosDisp]     = useState([]);
  const [cargandoSubprocesos, setCargandoSubprocesos] = useState(false);
  const [cargando,            setCargando]            = useState(true);
  const [guardando,           setGuardando]           = useState(false);

  const [form, setForm] = useState({
    titulo:        "",
    rol:           "",
    accion:        "",
    beneficio:     "",
    id_proceso:    "",
    id_subproceso: "",
    prioridad:     "media",
    estimacion:    "",
    criterios:     [""],
  });

  // Carga inicial 
  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/historias-usuario/detalle/${id_historia}`).then(r => r.ok ? r.json() : null),
      fetch(`${BASE_URL}/procesos/${id}`).then(r => r.ok ? r.json() : []),
    ]).then(([historia, procs]) => {
      if (historia) {
        setForm({
          titulo:        historia.titulo        || "",
          rol:           historia.rol           || "",
          accion:        historia.accion        || "",
          beneficio:     historia.beneficio     || "",
          id_proceso:    "",
          id_subproceso: String(historia.id_subproceso || ""),
          prioridad:     historia.prioridad     || "media",
          estimacion:    historia.estimacion    || "",
          criterios:     historia.criterios?.length > 0 ? historia.criterios : [""],
        });
      }
      setProcesos(procs);
    }).finally(() => setCargando(false));
  }, [id, id_historia]);

  // Filtrar subprocesos por técnica 
  useEffect(() => {
    if (!form.id_proceso) { setSubprocesosDisp([]); return; }
    setCargandoSubprocesos(true);
    fetch(`${BASE_URL}/subprocesos/por-tecnica?id_proceso=${form.id_proceso}&tecnica=${encodeURIComponent(TECNICA)}`)
      .then(r => r.ok ? r.json() : [])
      .then(setSubprocesosDisp)
      .catch(() => setSubprocesosDisp([]))
      .finally(() => setCargandoSubprocesos(false));
  }, [form.id_proceso]);

  const set = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }));

  const handleCambiarProceso = (e) =>
    setForm(prev => ({ ...prev, id_proceso: e.target.value, id_subproceso: "" }));

  const agregarCriterio    = () => set("criterios", [...form.criterios, ""]);
  const actualizarCriterio = (idx, valor) =>
    set("criterios", form.criterios.map((c, i) => i === idx ? valor : c));
  const eliminarCriterio   = (idx) => {
    if (form.criterios.length > 1)
      set("criterios", form.criterios.filter((_, i) => i !== idx));
  };

  // Guardar 
  const handleGuardar = async () => {
    if (!form.titulo.trim() || !form.rol.trim() || !form.accion.trim() || !form.beneficio.trim())
      return alert("Completa los campos obligatorios: título, rol, acción y beneficio.");

    setGuardando(true);
    try {
      const res = await fetch(`${BASE_URL}/historias-usuario/actualizar/${id_historia}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo:        form.titulo,
          rol:           form.rol,
          accion:        form.accion,
          beneficio:     form.beneficio,
          prioridad:     form.prioridad,
          estimacion:    form.estimacion || null,
          id_subproceso: form.id_subproceso ? parseInt(form.id_subproceso) : null,
          criterios:     form.criterios.filter(c => c.trim()),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al actualizar");
      }
      navegar(`/app/proyectos/${id}/requerimientos/historias-usuario`);
    } catch (e) {
      alert(e.message);
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
      Cargando historia...
    </div>
  );

  return (
    <div className="space-y-7 max-w-3xl mx-auto">

      <button
        onClick={() => navegar(`/app/proyectos/${id}/requerimientos/historias-usuario`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver a Historias de Usuario
      </button>

      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Editar Historia de Usuario</h1>
        <p className="text-sm text-gray-500 mt-0.5">Modifica los campos y criterios de aceptación</p>
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
              <label className={labelCls}>Prioridad <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                {PRIORIDADES.map(p => (
                  <button key={p.value} type="button" onClick={() => set("prioridad", p.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                      form.prioridad === p.value
                        ? p.value === "alta"  ? "bg-red-600 text-white border-red-600"
                        : p.value === "media" ? "bg-amber-500 text-white border-amber-500"
                        :                       "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Estimación <span className="text-gray-400 font-normal normal-case">(opcional)</span></label>
              <input type="text" value={form.estimacion} onChange={e => set("estimacion", e.target.value)}
                placeholder="Ej: 5, 8, 13" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Historia de usuario */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Historia de usuario</p>

          <div>
            <label className={labelCls}>Como... (rol) <span className="text-red-500">*</span></label>
            <input type="text" value={form.rol} onChange={e => set("rol", e.target.value)}
              placeholder="Ej: usuario del sistema, administrador" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Quiero... (acción) <span className="text-red-500">*</span></label>
            <input type="text" value={form.accion} onChange={e => set("accion", e.target.value)}
              placeholder="Ej: restablecer mi contraseña desde el correo" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Para que... (beneficio) <span className="text-red-500">*</span></label>
            <input type="text" value={form.beneficio} onChange={e => set("beneficio", e.target.value)}
              placeholder="Ej: pueda acceder nuevamente sin contactar soporte" className={inputCls} />
          </div>

          {(form.rol || form.accion || form.beneficio) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 italic">
              Como <span className="font-semibold text-gray-800 not-italic">{form.rol || "…"}</span>, quiero{" "}
              <span className="font-semibold text-gray-800 not-italic">{form.accion || "…"}</span>, para que{" "}
              <span className="font-semibold text-gray-800 not-italic">{form.beneficio || "…"}</span>.
            </div>
          )}
        </div>

        {/* Criterios de aceptación */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Criterios de aceptación</p>
            <button type="button" onClick={agregarCriterio}
              className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors">
              + Agregar criterio
            </button>
          </div>
          <div className="space-y-2">
            {form.criterios.map((criterio, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input type="text" value={criterio} onChange={e => actualizarCriterio(idx, e.target.value)}
                  placeholder={`Criterio ${idx + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                {form.criterios.length > 1 && (
                  <button type="button" onClick={() => eliminarCriterio(idx)}
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

        {/* Proceso relacionado */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Proceso relacionado</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Proceso</label>
              <select value={form.id_proceso} onChange={handleCambiarProceso} className={inputCls}>
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
                  Ningún subproceso tiene asignada la técnica <strong className="ml-0.5">Historias de Usuario</strong>.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pb-4">
        <button onClick={() => navegar(`/app/proyectos/${id}/requerimientos/historias-usuario`)}
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