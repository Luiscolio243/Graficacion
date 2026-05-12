import { useNavigate } from "react-router-dom";

const ACCENT_COLORS = [
  { bg: "#4F46E5", light: "#EEF2FF" },
  { bg: "#0D9488", light: "#F0FDFA" },
  { bg: "#7C3AED", light: "#F5F3FF" },
  { bg: "#D97706", light: "#FFFBEB" },
  { bg: "#DC2626", light: "#FEF2F2" },
];

const BADGE_STYLES = {
  "En Progreso":   { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500"    },
  "En progreso":   { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500"    },
  "Planificación": { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   },
  "Completado":    { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
};

export default function TarjetaProyecto({ proyecto, index = 0 }) {
  const navigate = useNavigate();
  const accent   = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const badge    = BADGE_STYLES[proyecto.estado] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  const initial  = proyecto.nombre?.charAt(0).toUpperCase() ?? "P";

  const stats = [
    { label: "Stakeholders", value: proyecto.stakeholders ?? 0 },
    { label: "Procesos",     value: proyecto.procesos     ?? 0 },
    { label: "Requisitos",   value: proyecto.requisitos   ?? 0 },
  ];

  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100
                 hover:shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
      onClick={() => navigate(`/app/proyectos/${proyecto.id_proyecto}`)}
    >
      {/* Encabezado coloreado */}
      <div
        className="h-16 flex items-center justify-between px-5"
        style={{ backgroundColor: accent.bg }}
      >
        {/* Avatar con inicial */}
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
          <span className="text-white font-bold text-lg leading-none">{initial}</span>
        </div>

        {/* Flecha */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white/60">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Cuerpo */}
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
          {proyecto.nombre}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 min-h-[32px]">
          {proyecto.descripcion || "Sin descripción"}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium
                        px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            {proyecto.estado}
          </span>
          {proyecto.fecha && (
            <span className="text-[11px] text-gray-400">{proyecto.fecha}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border-t border-gray-100">
        {stats.map(({ label, value }, i) => (
          <div
            key={label}
            className={`py-3 text-center ${i < stats.length - 1 ? "border-r border-gray-100" : ""}`}
          >
            <span className="block text-sm font-bold text-gray-800">{value}</span>
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
