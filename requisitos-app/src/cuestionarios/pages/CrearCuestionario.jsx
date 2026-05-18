import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";
const TECNICA  = "Formulario / Encuesta";

const TIPOS = [
  { value: "abierta",        label: "Abierta"         },
  { value: "opcionMultiple", label: "Opción múltiple"  },
  { value: "escala",         label: "Escala 1-5"       },
  { value: "siNo",           label: "Sí / No"          },
];

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

export default function CrearCuestionario() {
  const { id }    = useParams();
  const navegar   = useNavigate();
  const [guardando,            setGuardando]            = useState(false);
  const [procesos,             setProcesos]             = useState([]);
  const [subprocesosDisp,      setSubprocesosDisp]      = useState([]);
  const [cargandoSubprocesos,  setCargandoSubprocesos]  = useState(false);

  const [form, setForm] = useState({
    titulo:                "",
    descripcion:           "",
    participantesEsperados:"",
    id_proceso:            "",
    id_subproceso:         "",
    preguntas: [{ texto: "", tipo: "abierta", opciones: [] }],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/procesos/${id}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setProcesos)
      .catch(() => {});
  }, [id]);

  // Filtrar subprocesos por técnica al cambiar proceso
  useEffect(() => {
    if (!form.id_proceso) { setSubprocesosDisp([]); return; }
    setCargandoSubprocesos(true);
    fetch(`${BASE_URL}/subprocesos/por-tecnica?id_proceso=${form.id_proceso}&tecnica=${encodeURIComponent(TECNICA)}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setSubprocesosDisp)
      .catch(() => setSubprocesosDisp([]))
      .finally(() => setCargandoSubprocesos(false));
  }, [form.id_proceso]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleCambiarProceso = (e) =>
    setForm((f) => ({ ...f, id_proceso: e.target.value, id_subproceso: "" }));

  const agregarPregunta = () =>
    set("preguntas", [...form.preguntas, { texto: "", tipo: "abierta", opciones: [] }]);

  const actualizarPregunta = (idx, campo, valor) =>
    set("preguntas", form.preguntas.map((p, i) => i === idx ? { ...p, [campo]: valor } : p));

  const eliminarPregunta = (idx) => {
    if (form.preguntas.length === 1) return;
    set("preguntas", form.preguntas.filter((_, i) => i !== idx));
  };

  const agregarOpcion = (idx) =>
    set("preguntas", form.preguntas.map((p, i) =>
      i === idx ? { ...p, opciones: [...(p.opciones || []), ""] } : p
    ));

  const actualizarOpcion = (idxP, idxO, valor) =>
    set("preguntas", form.preguntas.map((p, i) => {
      if (i !== idxP) return p;
      const ops = [...p.opciones];
      ops[idxO] = valor;
      return { ...p, opciones: ops };
    }));

  const eliminarOpcion = (idxP, idxO) =>
    set("preguntas", form.preguntas.map((p, i) =>
      i === idxP ? { ...p, opciones: p.opciones.filter((_, j) => j !== idxO) } : p
    ));

  const handleGuardar = async () => {
    if (!form.titulo.trim())                          return alert("El título es obligatorio.");
    if (!form.preguntas.some((p) => p.texto.trim())) return alert("Agrega al menos una pregunta.");

    setGuardando(true);
    try {
      const res = await fetch(`${BASE_URL}/encuestas/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_proyecto:      Number(id),
          titulo:           form.titulo,
          descripcion:      form.descripcion,
          num_participantes:Number(form.participantesEsperados) || 0,
          id_subproceso:    form.id_subproceso || null,
          preguntas: form.preguntas
            .filter((p) => p.texto.trim())
            .map((p, i) => ({
              pregunta: p.texto,
              tipo:     p.tipo === "opcionMultiple" ? "opcion_multiple"
                      : p.tipo === "siNo"           ? "si_no"
                      : p.tipo,
              orden: i + 1,
              ...(p.tipo === "opcionMultiple" && {
                opciones: (p.opciones || []).filter((o) => o.trim()),
              }),
            })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.message || "Error al crear el cuestionario.");
      }
      navegar(`/app/proyectos/${id}/requerimientos/cuestionarios`);
    } catch {
      alert("Error de conexión con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  const subprocesoPlaceholder = () => {
    if (!form.id_proceso)              return "Elige un proceso primero";
    if (cargandoSubprocesos)           return "Cargando...";
    if (subprocesosDisp.length === 0)  return "Sin subprocesos disponibles";
    return "Sin subproceso";
  };

  return (
    <div className="space-y-7 max-w-3xl mx-auto">

      <button
        onClick={() => navegar(`/app/proyectos/${id}/requerimientos/cuestionarios`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver a Cuestionarios
      </button>

      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Nuevo Cuestionario</h1>
        <p className="text-sm text-gray-500 mt-0.5">Diseña las preguntas y asígnalo a un proceso</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">

        {/* Información general */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Información general</p>

          <div>
            <label className={labelCls}>Título <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              placeholder="Ej: Encuesta de satisfacción"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Participantes esperados
                <span className="ml-1 text-gray-400 normal-case font-normal">(opcional)</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.participantesEsperados}
                onChange={(e) => set("participantesEsperados", e.target.value)}
                placeholder="0"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Objetivo del cuestionario..."
              rows={3}
              className={inputCls}
            />
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
                  Ningún subproceso tiene asignada la técnica <strong className="ml-0.5">Formulario / Encuesta</strong>.
                  Asígnala desde el módulo de Procesos.
                </p>
              )}
              {form.id_proceso && !cargandoSubprocesos && subprocesosDisp.length > 0 && (
                <p className="mt-1.5 text-xs text-gray-400">
                  Solo subprocesos con técnica <strong>Formulario / Encuesta</strong> asignada
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Preguntas */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Preguntas <span className="text-red-500">*</span>
            </p>
            <button type="button" onClick={agregarPregunta}
              className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors">
              + Añadir pregunta
            </button>
          </div>

          <div className="space-y-3">
            {form.preguntas.map((pregunta, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  {form.preguntas.length > 1 && (
                    <button type="button" onClick={() => eliminarPregunta(idx)}
                      className="text-gray-300 hover:text-red-500 transition-colors">
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={pregunta.texto}
                  onChange={(e) => actualizarPregunta(idx, "texto", e.target.value)}
                  placeholder={`Escribe la pregunta ${idx + 1}...`}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <div className="flex flex-wrap gap-1.5">
                  {TIPOS.map((t) => (
                    <button key={t.value} type="button"
                      onClick={() => actualizarPregunta(idx, "tipo", t.value)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                        pregunta.tipo === t.value
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-green-400"
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {pregunta.tipo === "opcionMultiple" && (
                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Opciones</span>
                      <button type="button" onClick={() => agregarOpcion(idx)}
                        className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors">
                        + Agregar opción
                      </button>
                    </div>
                    {pregunta.opciones && pregunta.opciones.length > 0 ? (
                      pregunta.opciones.map((op, idxO) => (
                        <div key={idxO} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-4 text-right">{idxO + 1}.</span>
                          <input type="text" value={op}
                            onChange={(e) => actualizarOpcion(idx, idxO, e.target.value)}
                            placeholder={`Opción ${idxO + 1}`}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <button type="button" onClick={() => eliminarOpcion(idx, idxO)}
                            className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">Sin opciones aún — agrega al menos una.</p>
                    )}
                  </div>
                )}

                {pregunta.tipo === "escala" && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs text-gray-400 mb-2">Vista previa:</p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} className="w-8 h-8 rounded-lg border-2 border-gray-200 flex items-center justify-center text-xs font-medium text-gray-400">{n}</span>
                      ))}
                    </div>
                  </div>
                )}

                {pregunta.tipo === "siNo" && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs text-gray-400 mb-2">Vista previa:</p>
                    <div className="flex gap-2">
                      <span className="px-4 py-1 rounded-lg border-2 border-gray-200 text-xs font-medium text-gray-500">Sí</span>
                      <span className="px-4 py-1 rounded-lg border-2 border-gray-200 text-xs font-medium text-gray-500">No</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pb-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/cuestionarios`)}
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          {guardando ? "Guardando..." : "Crear Cuestionario"}
        </button>
      </div>
    </div>
  );
}
