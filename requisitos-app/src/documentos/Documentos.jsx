import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

const hdrs = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

const FORM_VACIO = {
  titulo: '', tipo_documento: '', fuente: '',
  id_proceso: '', id_subproceso: '', recomendaciones: '',
  documentos: [{ nombre: '', tipo: '', url: '', descripcion: '' }],
  hallazgos: [''],
};

const TIPO_CONFIG = {
  manual:    { color: "border-l-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200"    },
  reporte:   { color: "border-l-violet-400",  badge: "bg-violet-50 text-violet-700 border-violet-200" },
  contrato:  { color: "border-l-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200"  },
  normativa: { color: "border-l-red-400",     badge: "bg-red-50 text-red-700 border-red-200"       },
  diagrama:  { color: "border-l-cyan-400",    badge: "bg-cyan-50 text-cyan-700 border-cyan-200"    },
  encuesta:  { color: "border-l-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  politica:  { color: "border-l-orange-400",  badge: "bg-orange-50 text-orange-700 border-orange-200" },
};

function tipoCfg(tipo) {
  return TIPO_CONFIG[tipo?.toLowerCase()] ?? { color: "border-l-gray-300", badge: "bg-gray-100 text-gray-600 border-gray-200" };
}

export default function Documentos() {
  const { id: idProyecto } = useParams();
  const navegar = useNavigate();

  const [analisis,     setAnalisis]     = useState([]);
  const [vista,        setVista]        = useState('lista');
  const [form,         setForm]         = useState(FORM_VACIO);
  const [procesos,     setProcesos]     = useState([]);
  const [subFiltrados, setSubFiltrados] = useState([]);
  const [expandidos,   setExpandidos]   = useState({});
  const [modalEliminar,setModalEliminar]= useState(null);
  const [detalle,      setDetalle]      = useState(null);
  const [cargando,     setCargando]     = useState(true);
  const [guardando,    setGuardando]    = useState(false);
  const [error,        setError]        = useState('');

  useEffect(() => {
    if (!idProyecto) return;
    Promise.all([
      fetch(`${API}/documentos/${idProyecto}`, { headers: hdrs() }).then(r => r.json()).catch(() => []),
      fetch(`${API}/procesos/${idProyecto}`,   { headers: hdrs() }).then(r => r.json()).catch(() => []),
    ]).then(([docs, procs]) => {
      setAnalisis(Array.isArray(docs) ? docs : []);
      setProcesos(Array.isArray(procs) ? procs : []);
    }).finally(() => setCargando(false));
  }, [idProyecto]);

  const subprocesosGlobal = procesos.flatMap(p =>
    (p.subprocesos || []).map(s => ({ ...s, id_proceso: p.id_proceso }))
  );

  function handleProceso(id_proceso) {
    setForm(f => ({ ...f, id_proceso, id_subproceso: '' }));
    setSubFiltrados(subprocesosGlobal.filter(s => String(s.id_proceso) === String(id_proceso)));
  }

  const setF = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  function agregarDocumento() {
    setF('documentos', [...form.documentos, { nombre: '', tipo: '', url: '', descripcion: '' }]);
  }
  function actualizarDocumento(idx, campo, valor) {
    const docs = [...form.documentos];
    docs[idx] = { ...docs[idx], [campo]: valor };
    setF('documentos', docs);
  }
  function eliminarDocumento(idx) {
    setF('documentos', form.documentos.filter((_, i) => i !== idx));
  }

  function agregarHallazgo() { setF('hallazgos', [...form.hallazgos, '']); }
  function actualizarHallazgo(idx, valor) {
    const h = [...form.hallazgos]; h[idx] = valor; setF('hallazgos', h);
  }
  function eliminarHallazgo(idx) {
    if (form.hallazgos.length > 1) setF('hallazgos', form.hallazgos.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    setError('');
    if (!form.titulo.trim() || !form.tipo_documento.trim() || !form.fuente.trim())
      return setError('Título, Tipo de Documento y Fuente son obligatorios.');
    const docsValidos = form.documentos.filter(d => d.nombre.trim());
    if (!docsValidos.length) return setError('Agrega al menos un documento analizado.');
    const hallazgosValidos = form.hallazgos.filter(h => h.trim());
    if (!hallazgosValidos.length) return setError('Agrega al menos un hallazgo.');

    setGuardando(true);
    try {
      const res = await fetch(`${API}/documentos/crear`, {
        method: 'POST',
        headers: hdrs(),
        body: JSON.stringify({
          id_proyecto: idProyecto, titulo: form.titulo,
          tipo_documento: form.tipo_documento, fuente: form.fuente,
          id_proceso: form.id_proceso || null, id_subproceso: form.id_subproceso || null,
          recomendaciones: form.recomendaciones,
          documentos: docsValidos, hallazgos: hallazgosValidos,
        }),
      });
      if (!res.ok) throw new Error('Error al crear el análisis');
      const data = await res.json();
      setAnalisis(prev => [data.analisis, ...prev]);
      setForm(FORM_VACIO); setVista('lista');
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function ejecutarEliminar() {
    try {
      const res = await fetch(`${API}/documentos/eliminar/${modalEliminar}`, { method: 'DELETE', headers: hdrs() });
      if (!res.ok) throw new Error('Error al eliminar');
      setAnalisis(prev => prev.filter(a => a.id_analisis !== modalEliminar));
      if (detalle?.id_analisis === modalEliminar) setDetalle(null);
      setModalEliminar(null);
    } catch { alert('Error al eliminar'); }
  }

  /* ── VISTA FORMULARIO ─────────────────────────────────── */
  if (vista === 'form') {
    return (
      <div className="space-y-7 max-w-3xl mx-auto">

        <button
          onClick={() => { setVista('lista'); setForm(FORM_VACIO); setError(''); }}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Volver a Análisis de Documentos
        </button>

        <div className="pb-5 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Nuevo Análisis de Documentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registra el análisis y los hallazgos del documento revisado</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">

          {/* Información general */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Información general</p>
            <div>
              <label className={labelCls}>Título <span className="text-red-500">*</span></label>
              <input value={form.titulo} onChange={e => setF('titulo', e.target.value)}
                placeholder="Ej: Análisis de manual de procedimientos operativos" className={inputCls} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Tipo de documento <span className="text-red-500">*</span></label>
                <input value={form.tipo_documento} onChange={e => setF('tipo_documento', e.target.value)}
                  placeholder="Ej: manual, reporte, contrato" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Fuente <span className="text-red-500">*</span></label>
                <input value={form.fuente} onChange={e => setF('fuente', e.target.value)}
                  placeholder="Ej: Departamento de Operaciones" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Documentos analizados */}
          <div className="px-6 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Documentos analizados <span className="text-red-500">*</span>
              </p>
              <button type="button" onClick={agregarDocumento}
                className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors">
                + Agregar
              </button>
            </div>
            <div className="space-y-3">
              {form.documentos.map((doc, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-400">Documento {idx + 1}</span>
                    {form.documentos.length > 1 && (
                      <button type="button" onClick={() => eliminarDocumento(idx)}
                        className="text-gray-300 hover:text-red-500 transition-colors">
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <input value={doc.nombre} onChange={e => actualizarDocumento(idx, 'nombre', e.target.value)}
                    placeholder="Nombre del documento"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={doc.tipo} onChange={e => actualizarDocumento(idx, 'tipo', e.target.value)}
                      placeholder="Tipo (PDF, Word, Excel...)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <input value={doc.url} onChange={e => actualizarDocumento(idx, 'url', e.target.value)}
                      placeholder="URL o ubicación (opcional)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <input value={doc.descripcion} onChange={e => actualizarDocumento(idx, 'descripcion', e.target.value)}
                    placeholder="Descripción breve"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Hallazgos */}
          <div className="px-6 py-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Hallazgos <span className="text-red-500">*</span>
              </p>
              <button type="button" onClick={agregarHallazgo}
                className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors">
                + Agregar
              </button>
            </div>
            <div className="space-y-2">
              {form.hallazgos.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-gray-300 text-lg leading-none flex-shrink-0">•</span>
                  <input value={h} onChange={e => actualizarHallazgo(idx, e.target.value)}
                    placeholder={`Hallazgo ${idx + 1}`}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                  {form.hallazgos.length > 1 && (
                    <button type="button" onClick={() => eliminarHallazgo(idx)}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="px-6 py-5 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Recomendaciones</p>
            <textarea value={form.recomendaciones} onChange={e => setF('recomendaciones', e.target.value)}
              placeholder="Recomendaciones basadas en el análisis..."
              rows={3} className={inputCls} />
          </div>

          {/* Proceso */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Proceso relacionado</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Proceso</label>
                <select value={form.id_proceso} onChange={e => handleProceso(e.target.value)} className={inputCls}>
                  <option value="">Sin proceso</option>
                  {procesos.map(p => <option key={p.id_proceso} value={p.id_proceso}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Subproceso</label>
                <select value={form.id_subproceso} onChange={e => setF('id_subproceso', e.target.value)}
                  disabled={!form.id_proceso} className={inputCls + " disabled:opacity-50"}>
                  <option value="">{form.id_proceso ? 'Sin subproceso' : 'Elige un proceso primero'}</option>
                  {subFiltrados.map(s => <option key={s.id_subproceso} value={s.id_subproceso}>{s.nombre}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-4">
          <button onClick={() => { setVista('lista'); setForm(FORM_VACIO); setError(''); }}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={guardando}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
            {guardando ? 'Guardando…' : 'Crear Análisis'}
          </button>
        </div>
      </div>
    );
  }

  /* ── VISTA LISTA ──────────────────────────────────────── */
  return (
    <div className="space-y-7 max-w-4xl mx-auto">

      {/* Botón regreso */}
      <button
        onClick={() => navegar(`/app/proyectos/${idProyecto}/requerimientos`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver a Requerimientos
      </button>

      {/* Encabezado */}
      <div className="flex items-end justify-between pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Análisis de Documentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Revisión y hallazgos de documentos del proyecto</p>
        </div>
        <button
          onClick={() => { setVista('form'); setError(''); }}
          className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nuevo Análisis
        </button>
      </div>

      {/* StatCards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard titulo="Total" valor={analisis.length} color="gray" />
        <StatCard titulo="Con hallazgos"      valor={analisis.filter(a => a.hallazgos?.length > 0).length}  color="amber"   />
        <StatCard titulo="Con recomendaciones" valor={analisis.filter(a => a.recomendaciones?.trim()).length} color="emerald" />
      </div>

      {/* Cargando */}
      {cargando && (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-amber-500 animate-spin" />
          Cargando análisis...
        </div>
      )}

      {/* Vacío */}
      {!cargando && analisis.length === 0 && (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-16 text-center">
          <p className="text-sm text-gray-400">No hay análisis registrados.</p>
          <button onClick={() => setVista('form')}
            className="mt-3 text-sm text-green-600 hover:text-green-800 font-medium">
            Crear el primero
          </button>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {analisis.map(a => {
          const cfg = tipoCfg(a.tipo_documento);
          const LIMITE = 3;
          const expandido = expandidos[a.id_analisis];
          const hallazgosMostrados = expandido ? a.hallazgos : a.hallazgos.slice(0, LIMITE);

          return (
            <div key={a.id_analisis}
              className={`bg-white border border-gray-200 rounded-xl shadow-sm border-l-4 ${cfg.color} overflow-hidden`}>

              {/* Cabecera de tarjeta */}
              <div className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-gray-900">{a.titulo}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cfg.badge}`}>
                      {a.tipo_documento}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {a.fuente}
                    {a.fecha_creacion ? ` · ${a.fecha_creacion}` : ''}
                  </p>
                  {(a.proceso_nombre || a.subproceso_nombre) && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {[a.proceso_nombre, a.subproceso_nombre].filter(Boolean).join(' → ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 pt-0.5">
                  <button onClick={() => setDetalle(detalle?.id_analisis === a.id_analisis ? null : a)}
                    className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors">
                    {detalle?.id_analisis === a.id_analisis ? 'Cerrar' : 'Ver'}
                  </button>
                  <button onClick={() => setModalEliminar(a.id_analisis)}
                    className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Detalle expandible */}
              {detalle?.id_analisis === a.id_analisis && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">

                  {/* Documentos */}
                  {a.documentos?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                        Documentos analizados ({a.documentos.length})
                      </p>
                      <div className="space-y-2">
                        {a.documentos.map(d => (
                          <div key={d.id_documento}
                            className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                              <path d="M4 2h6l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                              <path d="M10 2v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div>
                              <span className="text-sm font-medium text-gray-800">{d.nombre}</span>
                              {d.tipo && <span className="ml-1.5 text-[11px] text-gray-400">({d.tipo})</span>}
                              {d.descripcion && <p className="text-xs text-gray-500 mt-0.5">{d.descripcion}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hallazgos */}
                  {a.hallazgos?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                        Hallazgos ({a.hallazgos.length})
                      </p>
                      <ul className="space-y-1.5">
                        {hallazgosMostrados.map((h, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                      {a.hallazgos.length > LIMITE && (
                        <button
                          onClick={() => setExpandidos(p => ({ ...p, [a.id_analisis]: !p[a.id_analisis] }))}
                          className="mt-2 text-xs font-medium text-green-600 hover:text-green-800 transition-colors"
                        >
                          {expandido ? 'Ver menos' : `+${a.hallazgos.length - LIMITE} hallazgos más`}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Recomendaciones */}
                  {a.recomendaciones && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Recomendaciones</p>
                      <p className="text-sm text-gray-700">{a.recomendaciones}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal eliminar */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">¿Eliminar análisis?</h2>
              <p className="text-sm text-gray-500 mt-2">Se eliminarán también sus documentos y hallazgos.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalEliminar(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={ejecutarEliminar}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ titulo, valor, color }) {
  const nums = { gray: "text-gray-700", amber: "text-amber-700", emerald: "text-emerald-700" };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{titulo}</p>
      <p className={`text-3xl font-bold ${nums[color]}`}>{valor}</p>
    </div>
  );
}
