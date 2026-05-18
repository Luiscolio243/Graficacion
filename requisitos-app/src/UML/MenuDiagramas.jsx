import { useNavigate, useParams } from "react-router-dom";

/* ── Iconos ──────────────────────────────────────────── */
function IconPaquetes() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="6" width="7" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="11" y="6" width="7" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="5" y="13" width="10" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5.5 6V4a1 1 0 011-1h7a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconClases() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M3 7h14" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IconSecuencias() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 3v14M15 3v14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="1.5 2"/>
      <rect x="2" y="3" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="12" y="3" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8 7.5h4M8 7.5l-1.5 1M8 7.5l-1.5-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M12 11.5H8M12 11.5l1.5 1M12 11.5l1.5-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <rect x="2" y="14" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="12" y="14" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  );
}

function IconCasosUso() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" rx="8" ry="5" stroke="currentColor" strokeWidth="1.4"/>
      <ellipse cx="10" cy="10" rx="8" ry="5" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="4" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 13c0-1.1.9-2 2-2s2 .9 2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
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

/* ── Config ──────────────────────────────────────────── */
const COLOR_CONFIG = {
  violet:  { iconBg: "bg-violet-50",  iconText: "text-violet-600",  border: "border-violet-100",  cta: "text-violet-600"  },
  blue:    { iconBg: "bg-blue-50",    iconText: "text-blue-600",    border: "border-blue-100",    cta: "text-blue-600"    },
  emerald: { iconBg: "bg-emerald-50", iconText: "text-emerald-600", border: "border-emerald-100", cta: "text-emerald-600" },
  amber:   { iconBg: "bg-amber-50",   iconText: "text-amber-600",   border: "border-amber-100",   cta: "text-amber-600"   },
};

const TIPOS_DIAGRAMA = [
  {
    titulo: "Diagrama de Paquetes",
    descripcion: "Organización de clases y componentes en grupos o módulos del sistema",
    color: "violet",
    tipo: "paquetes",
    icon: <IconPaquetes />,
  },
  {
    titulo: "Diagrama de Clases",
    descripcion: "Estructura estática del sistema con clases, atributos, métodos y relaciones",
    color: "blue",
    tipo: "clases",
    icon: <IconClases />,
  },
  {
    titulo: "Diagrama de Secuencias",
    descripcion: "Interacción entre objetos a lo largo del tiempo mediante mensajes ordenados",
    color: "emerald",
    tipo: "secuencias",
    icon: <IconSecuencias />,
  },
  {
    titulo: "Diagrama de Casos de Uso",
    descripcion: "Funcionalidades del sistema desde la perspectiva de los actores externos",
    color: "amber",
    tipo: "casos-uso",
    icon: <IconCasosUso />,
  },
];

/* ── Página ──────────────────────────────────────────── */
export default function MenuDiagramas() {
  const navegar = useNavigate();
  const { id } = useParams();

  return (
    <div className="space-y-7 max-w-6xl mx-auto">

      {/* Volver */}
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
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Diagramas UML</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Herramientas de modelado y diseño del sistema
        </p>
      </div>

      {/* Conteo */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          {TIPOS_DIAGRAMA.length} tipos disponibles
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {TIPOS_DIAGRAMA.map((diagrama) => (
          <TarjetaTipo
            key={diagrama.tipo}
            titulo={diagrama.titulo}
            descripcion={diagrama.descripcion}
            color={diagrama.color}
            icon={diagrama.icon}
            onClick={() => navegar(`/app/proyectos/${id}/diagramas/${diagrama.tipo}`)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Tarjeta de tipo ─────────────────────────────────── */
function TarjetaTipo({ titulo, descripcion, color = "blue", icon, onClick }) {
  const c = COLOR_CONFIG[color] ?? COLOR_CONFIG.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white border ${c.border} rounded-xl p-5 cursor-pointer
                  hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group
                  flex flex-col`}
    >
      <div className={`w-10 h-10 rounded-lg ${c.iconBg} ${c.iconText}
                       flex items-center justify-center mb-3 flex-shrink-0`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1">{titulo}</h3>
      <p className="text-xs text-gray-400 leading-relaxed flex-1 mb-4">{descripcion}</p>
      <div className={`flex items-center gap-1 text-xs font-semibold ${c.cta}
                       group-hover:gap-2 transition-all duration-150`}>
        Ver diagramas
        <IconArrow />
      </div>
    </div>
  );
}
