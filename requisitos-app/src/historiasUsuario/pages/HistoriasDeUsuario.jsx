import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

const PRIORIDAD_CONFIG = {
  alta:  { dot: "bg-red-400",    border: "border-l-red-400",    badge: "bg-red-50 text-red-700 border-red-200",    label: "Alta"  },
  media: { dot: "bg-amber-400",  border: "border-l-amber-400",  badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Media" },
  baja:  { dot: "bg-blue-400",   border: "border-l-blue-400",   badge: "bg-blue-50 text-blue-700 border-blue-200",  label: "Baja"  },
};

export default function HistoriasDeUsuario() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [historias,          setHistorias]          = useState([]);
  const [cargando,           setCargando]           = useState(true);
  const [error,              setError]              = useState(null);
  const [historiaDetalle,    setHistoriaDetalle]    = useState(null);
  const [modalEliminar,      setModalEliminar]      = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/historias-usuario/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject("Error al cargar"))
      .then(setHistorias)
      .catch((err) => setError(String(err)))
      .finally(() => setCargando(false));
  }, [id]);

  const ejecutarEliminar = async () => {
    try {
      const res = await fetch(`${BASE_URL}/historias-usuario/eliminar/${modalEliminar}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setHistorias((prev) => prev.filter((h) => h.id_historia !== modalEliminar));
      if (historiaDetalle?.id_historia === modalEliminar) setHistoriaDetalle(null);
      setModalEliminar(null);
    } catch (e) {
      alert(e.message);
    }
  };

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
        Cargando historias...
      </div>
    </div>
  );

  if (error) return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {botonAtras}
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
    </div>
  );

  const porPrioridad = {
    alta:  historias.filter((h) => h.prioridad === "alta"),
    media: historias.filter((h) => h.prioridad === "media"),
    baja:  historias.filter((h) => h.prioridad === "baja"),
  };

  return (
    <div className="space-y-7 max-w-4xl mx-auto">

      {botonAtras}

      {/* Encabezado */}
      <div className="flex items-end justify-between pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Historias de Usuario</h1>
          <p className="text-sm text-gray-500 mt-0.5">Requisitos funcionales en formato ágil</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/historias-usuario/crear`)}
          className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nueva Historia
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard titulo="Total"         valor={historias.length}            color="gray"   />
        <StatCard titulo="Prioridad alta" valor={porPrioridad.alta.length}   color="red"    />
        <StatCard titulo="Prioridad media" valor={porPrioridad.media.length} color="amber"  />
        <StatCard titulo="Prioridad baja" valor={porPrioridad.baja.length}   color="blue"   />
      </div>

      {/* Lista */}
      {historias.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-16 text-center">
          <p className="text-sm text-gray-400">No hay historias de usuario aún.</p>
          <button
            onClick={() => navegar(`/app/proyectos/${id}/requerimientos/historias-usuario/crear`)}
            className="mt-3 text-sm text-green-600 hover:text-green-800 font-medium"
          >
            Crear la primera
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {["alta", "media", "baja"].map((prioridad) =>
            porPrioridad[prioridad].length > 0 && (
              <Grupo
                key={prioridad}
                prioridad={prioridad}
                historias={porPrioridad[prioridad]}
                onVer={setHistoriaDetalle}
                onEliminar={setModalEliminar}
              />
            )
          )}
        </div>
      )}

      {/* Modal detalle */}
      {historiaDetalle && (
        <ModalDetalle
          historia={historiaDetalle}
          onClose={() => setHistoriaDetalle(null)}
          onEliminar={(id_historia) => { setModalEliminar(id_historia); setHistoriaDetalle(null); }}
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
              <h2 className="text-lg font-bold text-gray-900">¿Eliminar historia?</h2>
              <p className="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
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

/* ── Stat Card ──────────────────────────────────────── */
function StatCard({ titulo, valor, color }) {
  const colors = {
    gray:  { num: "text-gray-700"  },
    red:   { num: "text-red-700"   },
    amber: { num: "text-amber-700" },
    blue:  { num: "text-blue-700"  },
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{titulo}</p>
      <p className={`text-3xl font-bold ${colors[color].num}`}>{valor}</p>
    </div>
  );
}

/* ── Grupo por prioridad ────────────────────────────── */
function Grupo({ prioridad, historias, onVer, onEliminar }) {
  const cfg = PRIORIDAD_CONFIG[prioridad];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Prioridad {cfg.label}
        </span>
        <span className="text-xs text-gray-400">({historias.length})</span>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
        {historias.map((h) => (
          <TarjetaHistoria
            key={h.id_historia}
            historia={h}
            onVer={() => onVer(h)}
            onEliminar={() => onEliminar(h.id_historia)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Tarjeta Historia ───────────────────────────────── */
function TarjetaHistoria({ historia, onVer, onEliminar }) {
  const cfg = PRIORIDAD_CONFIG[historia.prioridad] ?? PRIORIDAD_CONFIG.media;
  return (
    <div className={`flex items-start justify-between gap-4 px-5 py-4 border-l-4 ${cfg.border}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{historia.titulo}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          Como <span className="font-medium">{historia.rol}</span>, quiero {historia.accion}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cfg.badge}`}>
            {cfg.label}
          </span>
          {historia.estimacion && (
            <span className="text-[11px] text-gray-400">{historia.estimacion} pts</span>
          )}
          {historia.criterios?.length > 0 && (
            <span className="text-[11px] text-gray-400">{historia.criterios.length} criterios</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0 pt-0.5">
        <button onClick={onVer} className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors">
          Ver
        </button>
        <button onClick={onEliminar} className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">
          Eliminar
        </button>
      </div>
    </div>
  );
}

/* ── Modal Detalle ──────────────────────────────────── */
function ModalDetalle({ historia, onClose, onEliminar }) {
  const cfg = PRIORIDAD_CONFIG[historia.prioridad] ?? PRIORIDAD_CONFIG.media;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cfg.badge}`}>
                {cfg.label}
              </span>
              {historia.estimacion && (
                <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {historia.estimacion} pts
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{historia.titulo}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Historia formato */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Historia de usuario</p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Como</span> {historia.rol},
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">quiero</span> {historia.accion},
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">para que</span> {historia.beneficio}.
            </p>
          </div>

          {/* Criterios */}
          {historia.criterios?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Criterios de aceptación
              </p>
              <ul className="space-y-2">
                {historia.criterios.map((criterio, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                    <svg className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-sm text-gray-700">{criterio}</span>
                  </li>
                ))}
              </ul>
            </div>
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
            onClick={() => onEliminar(historia.id_historia)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
