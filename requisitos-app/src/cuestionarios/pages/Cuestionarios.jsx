import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

/* ── Icons ──────────────────────────────────────────── */
function IconTotal() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M4 4h12v2H4V4zm0 4h12v2H4V8zm0 4h8v2H4v-2z"
            fill="currentColor" opacity="0.8"/>
    </svg>
  );
}
function IconBorrador() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M4 4h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"
            stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function IconActiva() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconCerrada() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M5 10a5 5 0 1110 0A5 5 0 015 10z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M10 7v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function IconLink() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L7.5 3.5"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

const ESTADO_CONFIG = {
  borrador: { dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700",   label: "Borrador", accent: "border-l-amber-400"   },
  activa:   { dot: "bg-blue-500",    badge: "bg-blue-50 text-blue-700",     label: "Activa",   accent: "border-l-blue-400"    },
  cerrada:  { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700",label: "Cerrada",  accent: "border-l-emerald-400" },
};

export default function Cuestionarios() {
  const { id }    = useParams();
  const navegar   = useNavigate();
  const [cuestionarios,  setCuestionarios]  = useState([]);
  const [error,          setError]          = useState(null);
  const [cargando,       setCargando]       = useState(true);
  const [modalEliminar,  setModalEliminar]  = useState(null);

  useEffect(() => {
    const obtener = async () => {
      try {
        const res = await fetch(`${BASE_URL}/encuestas/obtener/${id}`);
        if (!res.ok) throw new Error("Error al obtener los cuestionarios");
        setCuestionarios(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    obtener();
  }, [id]);

  const ejecutarEliminar = async () => {
    try {
      const res = await fetch(`${BASE_URL}/encuestas/${modalEliminar}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.error || "Error al eliminar.");
      }
      setCuestionarios((prev) => prev.filter((c) => c.id_encuesta !== modalEliminar));
      setModalEliminar(null);
    } catch {
      alert("Error de conexión al eliminar el cuestionario.");
    }
  };

  const estadisticas = {
    total:      cuestionarios.length,
    borradores: cuestionarios.filter((c) => (c.estado ?? "borrador") === "borrador").length,
    activas:    cuestionarios.filter((c) => c.estado === "activa").length,
    cerradas:   cuestionarios.filter((c) => c.estado === "cerrada").length,
  };

  if (cargando) return (
    <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-green-500 animate-spin" />
      Cargando cuestionarios...
    </div>
  );
  if (error) return <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>;

  const grupos = [
    { key: "activa",   label: "Activos"    },
    { key: "borrador", label: "Borradores" },
    { key: "cerrada",  label: "Cerrados"   },
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
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Cuestionarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Diseña y gestiona cuestionarios para tus stakeholders</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/cuestionarios/crear`)}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700
                     text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Nuevo Cuestionario
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard titulo="Total"      cantidad={estadisticas.total}      icon={<IconTotal />}    color="green"   />
        <StatCard titulo="Borradores" cantidad={estadisticas.borradores} icon={<IconBorrador />} color="amber"   />
        <StatCard titulo="Activos"    cantidad={estadisticas.activas}    icon={<IconActiva />}   color="blue"    />
        <StatCard titulo="Cerrados"   cantidad={estadisticas.cerradas}   icon={<IconCerrada />}  color="emerald" />
      </div>

      {/* Vacío */}
      {cuestionarios.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
            <IconTotal />
          </div>
          <p className="text-sm font-medium text-gray-600">No hay cuestionarios registrados</p>
          <p className="text-xs text-gray-400 mt-1">Crea el primer cuestionario para comenzar</p>
        </div>
      )}

      {/* Grupos por estado */}
      {grupos.map(({ key, label }) => {
        const lista = cuestionarios.filter((c) => (c.estado ?? "borrador") === key);
        if (lista.length === 0) return null;
        return (
          <div key={key} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${ESTADO_CONFIG[key].dot}`} />
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                {label} ({lista.length})
              </h2>
            </div>
            {lista.map((c) => (
              <TarjetaCuestionario
                key={c.id_encuesta}
                cuestionario={c}
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
              <h2 className="text-base font-semibold text-gray-900">Eliminar cuestionario</h2>
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
    green:   { bg: "bg-green-50",   text: "text-green-600",   num: "text-green-700"   },
    amber:   { bg: "bg-amber-50",   text: "text-amber-600",   num: "text-amber-700"   },
    blue:    { bg: "bg-blue-50",    text: "text-blue-600",    num: "text-blue-700"    },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", num: "text-emerald-700" },
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

/* ── Tarjeta Cuestionario ───────────────────────────── */
function TarjetaCuestionario({ cuestionario, idProyecto, onEliminar }) {
  const navegar = useNavigate();
  const estado  = cuestionario.estado ?? "borrador";
  const cfg     = ESTADO_CONFIG[estado];

  const [mostrarLinks, setMostrarLinks] = useState(false);
  const [stakeholders, setStakeholders] = useState([]);
  const [copiado,      setCopiado]      = useState(null);

  const base = `/app/proyectos/${idProyecto}/requerimientos/cuestionarios/${cuestionario.id_encuesta}`;

  const handleMostrarLinks = async () => {
    if (!mostrarLinks && stakeholders.length === 0) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/stakeholders/${idProyecto}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setStakeholders(await res.json());
      } catch (e) {
        console.error("Error al cargar stakeholders:", e);
      }
    }
    setMostrarLinks((v) => !v);
  };

  const copiarLink = (id_stakeholder) => {
    const link = `${window.location.origin}/responder/encuesta/${cuestionario.id_encuesta}/stakeholder/${id_stakeholder}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiado(id_stakeholder);
      setTimeout(() => setCopiado(null), 2000);
    });
  };

  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${cfg.accent} rounded-xl p-5 shadow-sm`}>
      <div className="flex items-start justify-between gap-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{cuestionario.titulo}</h3>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
            {cuestionario.fecha_creacion && <span>{cuestionario.fecha_creacion}</span>}
            {cuestionario.num_participantes > 0 && (
              <span>{cuestionario.num_participantes} participantes</span>
            )}
            {cuestionario.descripcion && (
              <span className="truncate max-w-xs text-gray-500">{cuestionario.descripcion}</span>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => navegar(`${base}/resultados`)}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100
                       px-2.5 py-1.5 rounded-md transition-colors"
          >
            Ver
          </button>
          <button
            onClick={() => onEliminar(cuestionario.id_encuesta)}
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
          onClick={() => navegar(`${base}/resultados`)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium
                     px-4 py-2 rounded-lg transition-colors"
        >
          Ver Resultados
        </button>
        <button
          onClick={handleMostrarLinks}
          className="flex-shrink-0 border border-dashed border-gray-300 hover:border-gray-400
                     text-gray-500 hover:text-gray-700 text-xs font-medium px-3 py-2 rounded-lg
                     transition-colors flex items-center gap-1.5"
        >
          <IconLink />
          {mostrarLinks ? "Ocultar links" : "Compartir links"}
        </button>
      </div>

      {/* Panel de links */}
      {mostrarLinks && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Link por stakeholder
          </p>
          {stakeholders.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No hay stakeholders en este proyecto.</p>
          ) : (
            stakeholders.map((s) => (
              <div
                key={s.id_stakeholder}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-800">{s.nombre} {s.apellido}</p>
                  <p className="text-[11px] text-gray-400 truncate max-w-xs">
                    {`${window.location.origin}/responder/encuesta/${cuestionario.id_encuesta}/stakeholder/${s.id_stakeholder}`}
                  </p>
                </div>
                <button
                  onClick={() => copiarLink(s.id_stakeholder)}
                  className={`ml-3 flex-shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                    copiado === s.id_stakeholder
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {copiado === s.id_stakeholder ? "¡Copiado!" : "Copiar"}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
