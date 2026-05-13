import { useParams, useNavigate } from "react-router-dom";

/* ── Iconos ──────────────────────────────────────────── */
function IconEntrevistas() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H7l-4 3V4z"
            stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IconCuestionarios() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M7 7l-1-1 1-1" stroke="none"/>
    </svg>
  );
}

function IconObservaciones() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <ellipse cx="10" cy="10" rx="8" ry="5" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}

function IconHistorias() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconFocusGroup() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="13" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 17c0-2.8 2.2-5 5-5M13 12c2.8 0 5 2.2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M7 12c.9-.3 1.9-.5 3-.5s2.1.2 3 .5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IconDocumentos() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12 2H5a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V7l-4-5z"
            stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M12 2v5h5M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IconSeguimiento() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 14l4-4 3 3 4-5 3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4"
            strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Config de colores ───────────────────────────────── */
const COLOR_CONFIG = {
  blue:    { iconBg: "bg-blue-50",    iconText: "text-blue-600",    border: "border-blue-100",    cta: "text-blue-600"    },
  indigo:  { iconBg: "bg-indigo-50",  iconText: "text-indigo-600",  border: "border-indigo-100",  cta: "text-indigo-600"  },
  emerald: { iconBg: "bg-emerald-50", iconText: "text-emerald-600", border: "border-emerald-100", cta: "text-emerald-600" },
  rose:    { iconBg: "bg-rose-50",    iconText: "text-rose-600",    border: "border-rose-100",    cta: "text-rose-600"    },
  amber:   { iconBg: "bg-amber-50",   iconText: "text-amber-600",   border: "border-amber-100",   cta: "text-amber-600"   },
  violet:  { iconBg: "bg-violet-50",  iconText: "text-violet-600",  border: "border-violet-100",  cta: "text-violet-600"  },
  cyan:    { iconBg: "bg-cyan-50",    iconText: "text-cyan-600",    border: "border-cyan-100",    cta: "text-cyan-600"    },
};

/* ── Página principal ────────────────────────────────── */
export default function Requerimientos() {
  const { id }  = useParams();
  const navegar = useNavigate();

  const modulos = [
    {
      titulo: "Entrevistas",
      descripcion: "Recopilación de información mediante conversaciones directas con los involucrados del proyecto",
      color: "blue",
      icon: <IconEntrevistas />,
      ruta: `/app/proyectos/${id}/entrevistas`,
    },
    {
      titulo: "Cuestionarios",
      descripcion: "Formularios estructurados para obtener datos cuantitativos de múltiples participantes",
      color: "indigo",
      icon: <IconCuestionarios />,
      ruta: `/app/proyectos/${id}/requerimientos/cuestionarios`,
    },
    {
      titulo: "Observaciones",
      descripcion: "Registro de procesos y comportamientos en el entorno actual del negocio",
      color: "emerald",
      icon: <IconObservaciones />,
      ruta: `/app/proyectos/${id}/requerimientos/observaciones`,
    },
    {
      titulo: "Historias de Usuario",
      descripcion: "Descripción de funcionalidades desde la perspectiva y necesidades del usuario final",
      color: "rose",
      icon: <IconHistorias />,
      ruta: `/app/proyectos/${id}/requerimientos/historias-usuario`,
    },
    {
      titulo: "Focus Group",
      descripcion: "Sesiones colaborativas de análisis con múltiples stakeholders del proyecto",
      color: "amber",
      icon: <IconFocusGroup />,
      ruta: `/app/proyectos/${id}/requerimientos/focus-groups`,
    },
    {
      titulo: "Documentos",
      descripcion: "Análisis de documentos existentes para identificar hallazgos y recomendaciones clave",
      color: "violet",
      icon: <IconDocumentos />,
      ruta: `/app/proyectos/${id}/requerimientos/documentos`,
    },
    {
      titulo: "Seguimiento Transaccional",
      descripcion: "Monitoreo de transacciones y flujos de datos del sistema en operación",
      color: "cyan",
      icon: <IconSeguimiento />,
      ruta: `/app/proyectos/${id}/requerimientos/seguimiento-transaccional`,
    },
  ];

  return (
    <div className="space-y-7 max-w-6xl mx-auto">

      {/* Botón de regreso */}
      <button
        onClick={() => navegar(`/app/proyectos/${id}`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver al proyecto
      </button>

      {/* Encabezado */}
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Requerimientos</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Selecciona una técnica para documentar los requerimientos del proyecto
        </p>
      </div>

      {/* Resumen */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          {modulos.length} técnicas disponibles
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modulos.map((modulo, index) => (
          <TarjetaModulo
            key={index}
            titulo={modulo.titulo}
            descripcion={modulo.descripcion}
            color={modulo.color}
            icon={modulo.icon}
            onClick={() => navegar(modulo.ruta)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Tarjeta ─────────────────────────────────────────── */
function TarjetaModulo({ titulo, descripcion, color = "indigo", icon, onClick }) {
  const c = COLOR_CONFIG[color] ?? COLOR_CONFIG.indigo;

  return (
    <div
      onClick={onClick}
      className={`bg-white border ${c.border} rounded-xl p-5 cursor-pointer
                  hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group
                  flex flex-col`}
    >
      {/* Icono */}
      <div className={`w-10 h-10 rounded-lg ${c.iconBg} ${c.iconText}
                       flex items-center justify-center mb-3 flex-shrink-0`}>
        {icon}
      </div>

      {/* Título */}
      <h3 className="font-semibold text-gray-900 text-sm mb-1">{titulo}</h3>

      {/* Descripción */}
      <p className="text-xs text-gray-400 leading-relaxed flex-1 mb-4">{descripcion}</p>

      {/* CTA */}
      <div className={`flex items-center gap-1 text-xs font-semibold ${c.cta}
                       group-hover:gap-2 transition-all duration-150`}>
        Ver técnica
        <IconArrow />
      </div>
    </div>
  );
}
