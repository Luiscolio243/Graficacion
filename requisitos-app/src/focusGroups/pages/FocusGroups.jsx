import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

const ESTADO_CONFIG = {
  planificado: { dot: "bg-blue-400",    border: "border-l-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200",         label: "Planificado" },
  en_progreso: { dot: "bg-amber-400",   border: "border-l-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200",      label: "En progreso" },
  realizado:   { dot: "bg-emerald-400", border: "border-l-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Realizado"   },
  cancelado:   { dot: "bg-red-400",     border: "border-l-red-400",     badge: "bg-red-50 text-red-700 border-red-200",            label: "Cancelado"   },
};

export default function FocusGroups() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [focusGroups,   setFocusGroups]   = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [error,         setError]         = useState(null);
  const [detalle,       setDetalle]       = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/focus-groups/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject("Error al cargar"))
      .then(setFocusGroups)
      .catch((err) => setError(String(err)))
      .finally(() => setCargando(false));
  }, [id]);

  const ejecutarEliminar = async () => {
    try {
      const res = await fetch(`${BASE_URL}/focus-groups/eliminar/${modalEliminar}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setFocusGroups((prev) => prev.filter((f) => f.id_focus_group !== modalEliminar));
      if (detalle?.id_focus_group === modalEliminar) setDetalle(null);
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
        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-orange-500 animate-spin" />
        Cargando focus groups...
      </div>
    </div>
  );

  if (error) return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {botonAtras}
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
    </div>
  );

  const porEstado = {
    planificado: focusGroups.filter((f) => f.estado === "planificado"),
    en_progreso: focusGroups.filter((f) => f.estado === "en_progreso"),
    realizado:   focusGroups.filter((f) => f.estado === "realizado"),
    cancelado:   focusGroups.filter((f) => f.estado === "cancelado"),
  };

  return (
    <div className="space-y-7 max-w-4xl mx-auto">

      {botonAtras}

      {/* Encabezado */}
      <div className="flex items-end justify-between pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Focus Groups</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sesiones grupales de levantamiento de requisitos</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/focus-groups/crear`)}
          className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nuevo Focus Group
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard titulo="Total"        valor={focusGroups.length}           color="gray"    />
        <StatCard titulo="Planificados" valor={porEstado.planificado.length} color="blue"    />
        <StatCard titulo="En progreso"  valor={porEstado.en_progreso.length} color="amber"   />
        <StatCard titulo="Realizados"   valor={porEstado.realizado.length}   color="emerald" />
      </div>

      {/* Lista */}
      {focusGroups.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-16 text-center">
          <p className="text-sm text-gray-400">No hay focus groups aún.</p>
          <button
            onClick={() => navegar(`/app/proyectos/${id}/requerimientos/focus-groups/crear`)}
            className="mt-3 text-sm text-green-600 hover:text-green-800 font-medium"
          >
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {["planificado", "en_progreso", "realizado", "cancelado"].map((estado) =>
            porEstado[estado]?.length > 0 && (
              <Grupo
                key={estado}
                estado={estado}
                focusGroups={porEstado[estado]}
                idProyecto={id}
                onVer={setDetalle}
                onEliminar={setModalEliminar}
              />
            )
          )}
        </div>
      )}

      {/* Modal detalle */}
      {detalle && (
        <ModalDetalle
          fg={detalle}
          idProyecto={id}
          onClose={() => setDetalle(null)}
          onEliminar={(id_fg) => { setModalEliminar(id_fg); setDetalle(null); }}
          onEditar={(id_fg) => navegar(`/app/proyectos/${id}/requerimientos/focus-groups/${id_fg}/editar`)}
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
              <h2 className="text-lg font-bold text-gray-900">¿Eliminar focus group?</h2>
              <p className="text-sm text-gray-500 mt-2">Esta acción eliminará también sus temas y participantes.</p>
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

/* Stat Card */
function StatCard({ titulo, valor, color }) {
  const nums = { gray: "text-gray-700", blue: "text-blue-700", amber: "text-amber-700", emerald: "text-emerald-700" };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{titulo}</p>
      <p className={`text-3xl font-bold ${nums[color]}`}>{valor}</p>
    </div>
  );
}

/* Grupo por estado  */
function Grupo({ estado, focusGroups, idProyecto, onVer, onEliminar }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.planificado;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{cfg.label}</span>
        <span className="text-xs text-gray-400">({focusGroups.length})</span>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
        {focusGroups.map((fg) => (
          <TarjetaFG
            key={fg.id_focus_group}
            fg={fg}
            idProyecto={idProyecto}
            onVer={() => onVer(fg)}
            onEliminar={() => onEliminar(fg.id_focus_group)}
          />
        ))}
      </div>
    </div>
  );
}

/* Tarjeta FG  */
function TarjetaFG({ fg, idProyecto, onVer, onEliminar }) {
  const navegar = useNavigate();
  const cfg = ESTADO_CONFIG[fg.estado] ?? ESTADO_CONFIG.planificado;
  const fecha = fg.fecha
    ? new Date(fg.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <div className={`flex items-start justify-between gap-4 px-5 py-4 border-l-4 ${cfg.border}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{fg.titulo}</p>
        {fg.objetivo && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{fg.objetivo}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cfg.badge}`}>
            {cfg.label}
          </span>
          {fg.tipo_media && (
            <span className="text-[11px] text-gray-400 capitalize">{fg.tipo_media}</span>
          )}
          <span className="text-[11px] text-gray-400">{fg.total_participantes} participantes</span>
          <span className="text-[11px] text-gray-400">{fg.total_temas} temas</span>
          {fecha && <span className="text-[11px] text-gray-400">{fecha}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 pt-0.5">
        <button onClick={onVer}
          className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors">
          Ver
        </button>
        <button
          onClick={() => navegar(`/app/proyectos/${idProyecto}/requerimientos/focus-groups/${fg.id_focus_group}/editar`)}
          className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors"
        >
          Editar
        </button>
        <button onClick={onEliminar}
          className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">
          Eliminar
        </button>
      </div>
    </div>
  );
}

/* Modal Detalle  */
function ModalDetalle({ fg, onClose, onEliminar, onEditar }) {
  const cfg = ESTADO_CONFIG[fg.estado] ?? ESTADO_CONFIG.planificado;
  const fecha = fg.fecha
    ? new Date(fg.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cfg.badge}`}>
                {cfg.label}
              </span>
              {fg.tipo_media && (
                <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded capitalize">{fg.tipo_media}</span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{fg.titulo}</h2>
            {fecha && <p className="text-xs text-gray-400 mt-0.5">{fecha}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{fg.total_participantes}</p>
              <p className="text-xs text-gray-500 mt-0.5">Participantes</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{fg.total_temas}</p>
              <p className="text-xs text-gray-500 mt-0.5">Temas</p>
            </div>
          </div>

          {fg.objetivo && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Objetivo</p>
              <p className="text-sm text-gray-700">{fg.objetivo}</p>
            </div>
          )}

          {fg.conclusiones?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Conclusiones</p>
              <ul className="space-y-2">
                {fg.conclusiones.map((c, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                    <svg className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-sm text-gray-700">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fg.transcripcion && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Transcripción / Notas</p>
              <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-4 whitespace-pre-wrap">
                {fg.transcripcion}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
            Cerrar
          </button>
          <button onClick={() => onEditar(fg.id_focus_group)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
            Editar
          </button>
          <button onClick={() => onEliminar(fg.id_focus_group)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
