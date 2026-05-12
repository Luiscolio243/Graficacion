import { useState, useEffect } from 'react';
import { Eye, Trash2, Plus, FileText, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useParams } from 'react-router-dom';

const API = 'http://localhost:5000';

const token = () => localStorage.getItem('token');
const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token()}`,
});

// Estado vacío del formulario 
const FORM_VACIO = {
  titulo: '',
  tipo_documento: '',
  fuente: '',
  id_proceso: '',
  id_subproceso: '',
  recomendaciones: '',
  documentos: [{ nombre: '', tipo: '', url: '', descripcion: '' }],
  hallazgos: [''],
};

export default function Documentos() {
  const { id: idProyecto } = useParams();

  const [analisis, setAnalisis]     = useState([]);
  const [vista, setVista]           = useState('lista'); // 'lista' | 'form'
  const [form, setForm]             = useState(FORM_VACIO);
  const [procesos, setProcesos]     = useState([]);
  const [subprocesos, setSubprocesos] = useState([]);
  const [subFiltrados, setSubFiltrados] = useState([]);
  const [expandidos, setExpandidos] = useState({});
  const [cargando, setCargando]     = useState(false);
  const [error, setError]           = useState('');

  // Carga inicial 
  useEffect(() => {
    if (!idProyecto) return;
    fetchAnalisis();
    fetchProcesos();
  }, [idProyecto]);

  async function fetchAnalisis() {
    try {
      const res = await fetch(`${API}/documentos/${idProyecto}`, { headers: headers() });
      const data = await res.json();
      setAnalisis(Array.isArray(data) ? data : []);
    } catch {
      setAnalisis([]);
    }
  }

  async function fetchProcesos() {
    try {
        const res = await fetch(`${API}/procesos/${idProyecto}`, { headers: headers() });
        const data = await res.json();
        setProcesos(Array.isArray(data) ? data : []);
        // Los subprocesos vienen anidados dentro de cada proceso
        const todos = data.flatMap(p =>
        (p.subprocesos || []).map(s => ({ ...s, id_proceso: p.id_proceso }))
        );
        setSubprocesos(todos);
    } catch {
        setProcesos([]);
    }
  }

  // Proceso - filtra subprocesos 
  function handleProceso(id_proceso) {
    setForm(f => ({ ...f, id_proceso, id_subproceso: '' }));
    setSubFiltrados(subprocesos.filter(s => String(s.id_proceso) === String(id_proceso)));
  }

  //  Documentos dinámicos 
  function agregarDocumento() {
    setForm(f => ({ ...f, documentos: [...f.documentos, { nombre: '', tipo: '', url: '', descripcion: '' }] }));
  }

  function actualizarDocumento(idx, campo, valor) {
    setForm(f => {
      const docs = [...f.documentos];
      docs[idx] = { ...docs[idx], [campo]: valor };
      return { ...f, documentos: docs };
    });
  }

  function eliminarDocumento(idx) {
    setForm(f => ({ ...f, documentos: f.documentos.filter((_, i) => i !== idx) }));
  }

  //  Hallazgos dinámicos 
  function agregarHallazgo() {
    setForm(f => ({ ...f, hallazgos: [...f.hallazgos, ''] }));
  }

  function actualizarHallazgo(idx, valor) {
    setForm(f => {
      const h = [...f.hallazgos];
      h[idx] = valor;
      return { ...f, hallazgos: h };
    });
  }

  function eliminarHallazgo(idx) {
    setForm(f => ({ ...f, hallazgos: f.hallazgos.filter((_, i) => i !== idx) }));
  }

  // Submit 
  async function handleSubmit() {
    setError('');
    if (!form.titulo.trim() || !form.tipo_documento.trim() || !form.fuente.trim()) {
      setError('Título, Tipo de Documento y Fuente son obligatorios.');
      return;
    }
    const docsValidos = form.documentos.filter(d => d.nombre.trim());
    if (docsValidos.length === 0) {
      setError('Agrega al menos un documento analizado.');
      return;
    }
    const hallazgosValidos = form.hallazgos.filter(h => h.trim());
    if (hallazgosValidos.length === 0) {
      setError('Agrega al menos un hallazgo.');
      return;
    }

    setCargando(true);
    try {
      const res = await fetch(`${API}/documentos/crear`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          id_proyecto:    idProyecto,
          titulo:         form.titulo,
          tipo_documento: form.tipo_documento,
          fuente:         form.fuente,
          id_proceso:     form.id_proceso || null,
          id_subproceso:  form.id_subproceso || null,
          recomendaciones: form.recomendaciones,
          documentos:     docsValidos,
          hallazgos:      hallazgosValidos,
        }),
      });
      if (!res.ok) throw new Error('Error al crear el análisis');
      await fetchAnalisis();
      setForm(FORM_VACIO);
      setVista('lista');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  // Eliminar 
  async function handleEliminar(id_analisis) {
    if (!window.confirm('¿Eliminar este análisis?')) return;
    try {
      await fetch(`${API}/documentos/${id_analisis}`, { method: 'DELETE', headers: headers() });
      setAnalisis(prev => prev.filter(a => a.id_analisis !== id_analisis));
    } catch {
      alert('Error al eliminar');
    }
  }

  // Toggle hallazgos expandidos 
  function toggleExpandido(id) {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  }

  
  //Formulario

  if (vista === 'form') {
    return (
      <div className="p-6 w-full">
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Análisis de Documentos</h2>
            <p className="text-sm text-gray-400">({analisis.length})</p>
          </div>
          <button
            onClick={() => { setVista('lista'); setForm(FORM_VACIO); setError(''); }}
            className="flex items-center gap-1 text-sm text-gray-500 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
          >
            <X size={14} /> Cancelar
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título del Análisis <span className="text-red-500">*</span>
            </label>
            <input
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Ej: Análisis de Políticas de Descuentos"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Tipo + Fuente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento <span className="text-red-500">*</span>
              </label>
              <input
                value={form.tipo_documento}
                onChange={e => setForm(f => ({ ...f, tipo_documento: e.target.value }))}
                placeholder="Ej: Política Empresarial, Manual"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuente <span className="text-red-500">*</span>
              </label>
              <input
                value={form.fuente}
                onChange={e => setForm(f => ({ ...f, fuente: e.target.value }))}
                placeholder="Ej: Gerencia Comercial"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          {/* Proceso + Subproceso */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proceso</label>
              <select
                value={form.id_proceso}
                onChange={e => handleProceso(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                <option value="">— Seleccionar —</option>
                {procesos.map(p => (
                  <option key={p.id_proceso || p.id} value={p.id_proceso || p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subproceso</label>
              <select
                value={form.id_subproceso}
                onChange={e => setForm(f => ({ ...f, id_subproceso: e.target.value }))}
                disabled={!form.id_proceso}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">— Seleccionar —</option>
                {subFiltrados.map(s => (
                  <option key={s.id_subproceso || s.id} value={s.id_subproceso || s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Documentos analizados */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Documentos Analizados <span className="text-red-500">*</span>
              </label>
              <button
                onClick={agregarDocumento}
                className="text-xs text-amber-600 font-medium hover:text-amber-700 flex items-center gap-1"
              >
                <Plus size={13} /> Agregar documento
              </button>
            </div>
            <div className="space-y-3">
              {form.documentos.map((doc, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">Documento {idx + 1}</span>
                    {form.documentos.length > 1 && (
                      <button onClick={() => eliminarDocumento(idx)} className="text-gray-400 hover:text-red-500">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  <input
                    value={doc.nombre}
                    onChange={e => actualizarDocumento(idx, 'nombre', e.target.value)}
                    placeholder="Nombre del documento"
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                  />
                  <input
                    value={doc.tipo}
                    onChange={e => actualizarDocumento(idx, 'tipo', e.target.value)}
                    placeholder="Tipo (ej: PDF, Word, Excel)"
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                  />
                  <input
                    value={doc.url}
                    onChange={e => actualizarDocumento(idx, 'url', e.target.value)}
                    placeholder="URL o ubicación"
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                  />
                  <input
                    value={doc.descripcion}
                    onChange={e => actualizarDocumento(idx, 'descripcion', e.target.value)}
                    placeholder="Descripción breve del documento"
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Hallazgos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Hallazgos <span className="text-red-500">*</span>
              </label>
              <button
                onClick={agregarHallazgo}
                className="text-xs text-amber-600 font-medium hover:text-amber-700 flex items-center gap-1"
              >
                <Plus size={13} /> Agregar hallazgo
              </button>
            </div>
            <div className="space-y-2">
              {form.hallazgos.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={h}
                    onChange={e => actualizarHallazgo(idx, e.target.value)}
                    placeholder={`Hallazgo ${idx + 1}`}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  {form.hallazgos.length > 1 && (
                    <button onClick={() => eliminarHallazgo(idx)} className="text-gray-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recomendaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recomendaciones <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.recomendaciones}
              onChange={e => setForm(f => ({ ...f, recomendaciones: e.target.value }))}
              placeholder="Describa las recomendaciones basadas en el análisis de los documentos"
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>

          {/* Botón crear */}
          <button
            onClick={handleSubmit}
            disabled={cargando}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            {cargando ? 'Guardando…' : 'Crear Análisis de Documentos'}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Lista
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Análisis de Documentos</h2>
          <p className="text-sm text-gray-400">({analisis.length})</p>
        </div>
        <button
          onClick={() => { setVista('form'); setError(''); }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Plus size={16} /> Nuevo Análisis
        </button>
      </div>

      {/* Sin resultados */}
      {analisis.length === 0 && (
        <div className="text-center text-gray-400 py-16 text-sm">
          No hay análisis registrados. Crea el primero con el botón de arriba.
        </div>
      )}

      {/* Cards */}
      <div className="space-y-4">
        {analisis.map(a => {
          const LIMITE = 3;
          const expandido = expandidos[a.id_analisis];
          const hallazgosMostrados = expandido ? a.hallazgos : a.hallazgos.slice(0, LIMITE);
          const hayMas = a.hallazgos.length > LIMITE;

          return (
            <div key={a.id_analisis} className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
              {/* Fila superior */}
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-semibold text-gray-800 text-base">{a.titulo}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.fecha_creacion} &bull; {a.tipo_documento}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-400 hover:text-indigo-500 transition">
                    <Eye size={17} />
                  </button>
                  <button
                    onClick={() => handleEliminar(a.id_analisis)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              {/* Tags proceso → subproceso */}
              {(a.proceso_nombre || a.subproceso_nombre) && (
                <div className="flex items-center gap-2 mt-2 mb-3 flex-wrap">
                  {a.proceso_nombre && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-2.5 py-0.5 font-medium">
                      {a.proceso_nombre}
                    </span>
                  )}
                  {a.proceso_nombre && a.subproceso_nombre && (
                    <span className="text-gray-400 text-xs">→</span>
                  )}
                  {a.subproceso_nombre && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-2.5 py-0.5 font-medium">
                      {a.subproceso_nombre}
                    </span>
                  )}
                </div>
              )}

              {/* Fuente */}
              <div className="mb-3">
                <span className="text-xs font-semibold text-gray-600">Fuente:</span>
                <p className="text-sm text-gray-700">{a.fuente}</p>
              </div>

              {/* Documentos */}
              {a.documentos.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    Documentos Analizados ({a.documentos.length}):
                  </p>
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2 space-y-2">
                    {a.documentos.map(d => (
                      <div key={d.id_documento} className="flex items-start gap-2">
                        <FileText size={14} className="text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">{d.nombre}</span>
                          {d.tipo && (
                            <span className="text-xs text-gray-400 ml-1">({d.tipo})</span>
                          )}
                          {d.descripcion && (
                            <p className="text-xs text-gray-500">{d.descripcion}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hallazgos */}
              {a.hallazgos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Hallazgos:</p>
                  <ul className="space-y-0.5">
                    {hallazgosMostrados.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-gray-400 mt-1">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  {hayMas && (
                    <button
                      onClick={() => toggleExpandido(a.id_analisis)}
                      className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 mt-1 font-medium"
                    >
                      {expandido ? (
                        <><ChevronUp size={13} /> Mostrar menos</>
                      ) : (
                        <><ChevronDown size={13} /> +{a.hallazgos.length - LIMITE} hallazgos más</>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Recomendaciones */}
              {a.recomendaciones && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-600 mb-0.5">Recomendaciones:</p>
                  <p className="text-sm text-gray-600">{a.recomendaciones}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}