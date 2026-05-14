import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

/* ── Icons ──────────────────────────────────────────── */
function IconTotal() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H7l-4 3V4z"
            stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
}
function IconRealizada() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M6.5 10l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconPendiente() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

const ESTADO_CONFIG = {
  realizada:   { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700", label: "Realizada",   accent: "border-l-emerald-400" },
  pendiente:   { dot: "bg-orange-400",  badge: "bg-orange-50 text-orange-700",   label: "Pendiente",   accent: "border-l-orange-400"  },
  planificada: { dot: "bg-blue-500",    badge: "bg-blue-50 text-blue-700",       label: "Planificada", accent: "border-l-blue-400"    },
};

export default function Entrevistas() {
  const { id }   = useParams();
  const navegar  = useNavigate();
  const [entrevistas,  setEntrevistas]  = useState([]);
  const [error,        setError]        = useState(null);
  const [cargando,     setCargando]     = useState(true);
  const [modalEliminar,setModalEliminar]= useState(null);

  useEffect(() => {
    const obtenerEntrevistas = async () => {
      try {
        const response = await fetch(`${BASE_URL}/entrevistas/${id}`);
        if (!response.ok) throw new Error("Error al obtener las entrevistas");
        const data = await response.json();
        setEntrevistas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    obtenerEntrevistas();
  }, [id]);

  const estadisticas = {
    total:      entrevistas.length,
    realizadas: entrevistas.filter((e) => e.estado === "realizada").length,
    pendientes: entrevistas.filter((e) => e.estado === "pendiente").length,
  };

  const ejecutarEliminar = async () => {
    try {
      const response = await fetch(`${BASE_URL}/entrevistas/eliminar/${modalEliminar}`, { method: "DELETE" });
      if (!response.ok) {
        const err = await response.json();
        return alert(err.error || "Error al eliminar la entrevista.");
      }
      setEntrevistas((prev) => prev.filter((e) => e.id_entrevista !== modalEliminar));
      setModalEliminar(null);
    } catch {
      alert("Error de conexión al eliminar la entrevista.");
    }
  };

  if (cargando) return (
    <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
      Cargando entrevistas...
    </div>
  );
  if (error) return <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>;

  const grupos = [
    { key: "realizada",   label: "Realizadas"   },
    { key: "pendiente",   label: "Pendientes"   },
    { key: "planificada", label: "Planificadas" },
  ];

  return (
    <div className="space-y-7 max-w-4xl mx-auto">

      {/* Botón de regreso */}
      <button
        onClick={() => navegar(`/app/proyectos/${id}/requerimientos`)}
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
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Entrevistas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona las entrevistas y sus respuestas</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/entrevistas/crear`)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Nueva Entrevista
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard titulo="Total"      cantidad={estadisticas.total}      icon={<IconTotal />}    color="blue"    />
        <StatCard titulo="Realizadas" cantidad={estadisticas.realizadas} icon={<IconRealizada />} color="emerald" />
        <StatCard titulo="Pendientes" cantidad={estadisticas.pendientes} icon={<IconPendiente />} color="orange"  />
      </div>

      {/* Vacío */}
      {entrevistas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <IconTotal />
          </div>
          <p className="text-sm font-medium text-gray-600">No hay entrevistas registradas</p>
          <p className="text-xs text-gray-400 mt-1">Crea la primera entrevista para comenzar</p>
        </div>
      )}

      {/* Grupos por estado */}
      {grupos.map(({ key, label }) => {
        const lista = entrevistas.filter((e) => e.estado === key);
        if (lista.length === 0) return null;
        return (
          <div key={key} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${ESTADO_CONFIG[key].dot}`} />
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                {label} ({lista.length})
              </h2>
            </div>
            {lista.map((entrevista) => (
              <TarjetaEntrevista
                key={entrevista.id_entrevista}
                entrevista={entrevista}
                idProyecto={id}
                onEliminar={setModalEliminar}
              />
            ))}
          </div>
        );
      })}

      {/* Modal eliminar */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-7 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-red-100 mx-auto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-base font-semibold text-gray-900">Eliminar entrevista</h2>
              <p className="text-sm text-gray-500 mt-1.5">
                Esta acción no se puede deshacer. Se eliminarán todas las preguntas y respuestas asociadas.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModalEliminar(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminar}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stat Card ──────────────────────────────────────── */
function StatCard({ titulo, cantidad, icon, color }) {
  const colors = {
    blue:    { bg: "bg-blue-50",    text: "text-blue-600",    num: "text-blue-700"    },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", num: "text-emerald-700" },
    orange:  { bg: "bg-orange-50",  text: "text-orange-600",  num: "text-orange-700"  },
  };
  const c = colors[color];
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{titulo}</p>
      <p className={`text-3xl font-bold mt-1 ${c.num}`}>{cantidad}</p>
    </div>
  );
}

/* ── Tarjeta Entrevista ─────────────────────────────── */
function TarjetaEntrevista({ entrevista, idProyecto, onEliminar }) {
  const navegar = useNavigate();
  const cfg     = ESTADO_CONFIG[entrevista.estado] ?? ESTADO_CONFIG.pendiente;

  const fecha = entrevista.fecha_programada
    ? new Date(entrevista.fecha_programada).toLocaleDateString("es-MX", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : null;

  const base = `/app/proyectos/${idProyecto}/entrevistas/${entrevista.id_entrevista}`;

  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${cfg.accent} rounded-xl p-5 shadow-sm`}>
      <div className="flex items-start justify-between gap-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{entrevista.titulo}</h3>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
            {fecha && <span>{fecha}</span>}
            <span>{entrevista.total_preguntas ?? 0} preguntas</span>
            {entrevista.objetivo && (
              <span className="truncate max-w-xs text-gray-500">{entrevista.objetivo}</span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => navegar(base)}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100
                       px-2.5 py-1.5 rounded-md transition-colors"
          >
            Ver
          </button>
          <button
            onClick={() => onEliminar(entrevista.id_entrevista)}
            className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50
                       px-2.5 py-1.5 rounded-md transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Acciones principales */}
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => navegar(`${base}/respuestas`)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium
                     px-4 py-2 rounded-lg transition-colors"
        >
          Anotar Respuestas
        </button>
        <button
          onClick={() => navegar(`${base}/audio`)}
          className="flex-shrink-0 border border-dashed border-gray-300 hover:border-gray-400
                     text-gray-500 hover:text-gray-700 text-xs font-medium px-3 py-2 rounded-lg
                     transition-colors flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Subir archivo
        </button>
      </div>
    </div>
  );
}
