import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

export default function SeguimientoTransaccional() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [seguimientos,   setSeguimientos]   = useState([]);
  const [cargando,       setCargando]       = useState(true);
  const [error,          setError]          = useState(null);
  const [modalDetalle,   setModalDetalle]   = useState(null);
  const [detalle,        setDetalle]        = useState(null);
  const [cargandoDet,    setCargandoDet]    = useState(false);
  const [modalEliminar,  setModalEliminar]  = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/seguimientos/obtener/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject("Error al cargar"))
      .then(setSeguimientos)
      .catch((e) => setError(String(e)))
      .finally(() => setCargando(false));
  }, [id]);

  const verDetalle = async (seg) => {
    setModalDetalle(seg);
    setDetalle(null);
    setCargandoDet(true);
    try {
      const res = await fetch(`${BASE_URL}/seguimientos/detalle/${seg.id_seguimiento}`);
      if (!res.ok) throw new Error("Error al cargar detalle");
      setDetalle(await res.json());
    } catch {
      setDetalle(null);
    } finally {
      setCargandoDet(false);
    }
  };

  const cerrarDetalle = () => { setModalDetalle(null); setDetalle(null); };

  const ejecutarEliminar = async () => {
    try {
      const res = await fetch(`${BASE_URL}/seguimientos/eliminar/${modalEliminar}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setSeguimientos((prev) => prev.filter((s) => s.id_seguimiento !== modalEliminar));
      if (modalDetalle?.id_seguimiento === modalEliminar) cerrarDetalle();
      setModalEliminar(null);
    } catch (e) {
      alert(e.message);
    }
  };

  // Agrupar por nombre_proceso
  const grupos = seguimientos.reduce((acc, s) => {
    const key = s.nombre_proceso || "Sin proceso";
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const procesosUnicos = Object.keys(grupos).length;

  const botonAtras = (
    <button
      onClick={() => navegar(`/app/proyectos/${id}/requerimientos`)}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Volver a Requerimientos
    </button>
  );

  if (cargando) return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {botonAtras}
      <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
        Cargando seguimientos...
      </div>
    </div>
  );

  if (error) return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {botonAtras}
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
    </div>
  );

  return (
    <div className="space-y-7 max-w-4xl mx-auto">

      {botonAtras}

      {/* Encabezado */}
      <div className="flex items-end justify-between pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Seguimiento Transaccional</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registro y trazabilidad de procesos del sistema</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional/crear`)}
          className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nuevo Seguimiento
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard titulo="Total"                 valor={seguimientos.length} icon={<IconTotal />}   color="gray"   />
        <StatCard titulo="Procesos monitoreados" valor={procesosUnicos}      icon={<IconProceso />} color="indigo" />
      </div>

      {/* Lista */}
      {seguimientos.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-16 text-center">
          <p className="text-sm text-gray-400">No hay seguimientos aún.</p>
          <button
            onClick={() => navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional/crear`)}
            className="mt-3 text-sm text-green-600 hover:text-green-800 font-medium"
          >
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grupos).map(([proceso, items]) => (
            <GrupoProceso
              key={proceso}
              proceso={proceso}
              seguimientos={items}
              onVer={verDetalle}
              onEliminar={setModalEliminar}
            />
          ))}
        </div>
      )}

      {/* Modal detalle */}
      {modalDetalle && (
        <ModalDetalle
          seguimiento={modalDetalle}
          detalle={detalle}
          cargando={cargandoDet}
          onClose={cerrarDetalle}
          onEliminar={(sid) => { setModalEliminar(sid); cerrarDetalle(); }}
        />
      )}

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
              <h2 className="text-lg font-bold text-gray-900">¿Eliminar seguimiento?</h2>
              <p className="text-sm text-gray-500 mt-2">Se eliminarán también sus pasos, problemas y métricas.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalEliminar(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminar}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────── */
function IconTotal() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M4 4h12v2H4V4zm0 4h12v2H4V8zm0 4h8v2H4v-2z" fill="currentColor" opacity="0.8"/>
    </svg>
  );
}
function IconProceso() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="6" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="13" y="6" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="7.5" y="9" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 8h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M10 8v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Stat Card ──────────────────────────────────────── */
function StatCard({ titulo, valor, icon, color }) {
  const colors = {
    gray:   { bg: "bg-gray-100",   text: "text-gray-600",   num: "text-gray-700"   },
    indigo: { bg: "bg-indigo-50",  text: "text-indigo-600", num: "text-indigo-700" },
  };
  const c = colors[color];
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{titulo}</p>
      <p className={`text-3xl font-bold mt-1 ${c.num}`}>{valor}</p>
    </div>
  );
}

/* ── Grupo por proceso ──────────────────────────────── */
function GrupoProceso({ proceso, seguimientos, onVer, onEliminar }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          {proceso} ({seguimientos.length})
        </span>
      </div>
      {seguimientos.map((s) => (
        <TarjetaSeguimiento
          key={s.id_seguimiento}
          seguimiento={s}
          onVer={() => onVer(s)}
          onEliminar={() => onEliminar(s.id_seguimiento)}
        />
      ))}
    </div>
  );
}

/* ── Tarjeta Seguimiento ────────────────────────────── */
function TarjetaSeguimiento({ seguimiento, onVer, onEliminar }) {
  const fecha = seguimiento.fecha_creacion
    ? new Date(seguimiento.fecha_creacion).toLocaleDateString("es-MX", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : null;

  return (
    <div className="bg-white border border-gray-200 border-l-4 border-l-indigo-400 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{seguimiento.titulo}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
              {seguimiento.id_transaccion}
            </span>
            {fecha && <span className="text-[11px] text-gray-400">{fecha}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
          <button
            onClick={onVer}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-2.5 py-1.5 rounded-md transition-colors"
          >
            Ver
          </button>
          <button
            onClick={onEliminar}
            className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal Detalle ──────────────────────────────────── */
function ModalDetalle({ seguimiento, detalle, cargando, onClose, onEliminar }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1 pr-4">
            <span className="font-mono text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded mb-2 inline-block">
              {seguimiento.id_transaccion}
            </span>
            <h2 className="text-lg font-semibold text-gray-900">{seguimiento.titulo}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {cargando ? (
            <div className="flex items-center gap-2 py-6 text-sm text-gray-400 justify-center">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
              Cargando detalle...
            </div>
          ) : detalle ? (
            <>
              {/* Proceso */}
              {detalle.nombre_proceso && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Proceso</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium">
                    {detalle.nombre_proceso}
                  </span>
                </div>
              )}

              {/* Pasos */}
              {detalle.pasos?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Pasos del proceso
                  </p>
                  <div className="space-y-2">
                    {detalle.pasos.map((paso, i) => (
                      <div key={paso.id_seguimiento_paso} className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 font-medium">{paso.nombre}</p>
                          {paso.duracion_min && (
                            <p className="text-xs text-gray-400 mt-0.5">{paso.duracion_min} min</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Métricas */}
              {detalle.metricas?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Métricas</p>
                  <div className="grid grid-cols-2 gap-3">
                    {detalle.metricas.map((m) => (
                      <div key={m.id_seguimiento_metrica} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                        <p className="text-[11px] text-gray-400">{m.nombre}</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{m.valor}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Problemas */}
              {detalle.problemas?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    Problemas identificados
                  </p>
                  <ul className="space-y-2">
                    {detalle.problemas.map((p) => (
                      <li key={p.id_seguimiento_problema} className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5">
                        <svg className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                          <path d="M8 3v6M8 11v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        <span className="text-sm text-gray-700">{p.descripcion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No se pudo cargar el detalle.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
          >
            Cerrar
          </button>
          <button
            onClick={() => onEliminar(seguimiento.id_seguimiento)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
