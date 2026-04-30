import { useNavigate } from "react-router-dom";

// Franja de acento por índice — colores sobrios
const ACCENT_COLORS = ["#4F46E5", "#0D9488", "#6B7280", "#D97706", "#DC2626"];

const BADGE_STYLES = {
  "En Progreso":  "bg-indigo-50 text-indigo-700",
  "En progreso":  "bg-indigo-50 text-indigo-700",
  "Planificación":"bg-orange-50 text-orange-700",
  "Completado":   "bg-green-50 text-green-700",
};

function CalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="inline">
      <rect x="1" y="2" width="10" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function TarjetaProyecto({ proyecto, index = 0 }) {
  const navigate = useNavigate();

  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const badgeClass  = BADGE_STYLES[proyecto.estado] ?? "bg-gray-100 text-gray-600";

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer
                 hover:-translate-y-0.5 transition-transform duration-150"
      onClick={() => navigate(`/app/proyectos/${proyecto.id_proyecto}`)}
    >
      {/* Franja de color arriba */}
      <div className="h-1.5" style={{ background: accentColor }} />

      <div className="px-4 pt-4 pb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
          {proyecto.nombre}
        </h3>

        <p className="text-xs text-gray-400 leading-relaxed mb-3 min-h-[34px] line-clamp-2">
          {proyecto.descripcion}
        </p>

        {/* Estado y fecha */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${badgeClass}`}>
            {proyecto.estado}
          </span>
          {proyecto.fecha && (
            <span className="text-[11px] text-gray-300 flex items-center gap-1">
              <CalIcon />
              {proyecto.fecha}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex divide-x divide-gray-100 border-t border-gray-100 -mx-4 px-4 pt-2.5">
          {[
            { label: "Stakeholders", value: proyecto.stakeholders ?? 0 },
            { label: "Procesos",     value: proyecto.procesos     ?? 0 },
            { label: "Requisitos",   value: proyecto.requisitos   ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="flex-1 text-center">
              <span className="block text-[15px] font-semibold text-gray-800">{value}</span>
              <span className="block text-[10px] text-gray-300 uppercase tracking-wide">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}