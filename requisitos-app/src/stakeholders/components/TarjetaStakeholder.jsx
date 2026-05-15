const COLORS = ["#4F46E5", "#0D9488", "#7C3AED", "#D97706", "#2563EB"];

function MailIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
      <rect x="1" y="2.5" width="12" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 4.5l6 4 6-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function OrgIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
      <path d="M2 12V5.5l5-3.5 5 3.5V12" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M5 12V8.5h4V12" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export default function TarjetaStakeholder({ stakeholder, onEditar, onEliminar, index = 0 }) {
  const initial    = (stakeholder.nombre?.[0] ?? "?").toUpperCase();
  const color      = COLORS[index % COLORS.length];
  const isEditable = !!stakeholder.id_stakeholder;

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4
                    hover:shadow-sm hover:border-gray-300 transition-all duration-150">
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white
                   font-bold text-sm flex-shrink-0 select-none"
        style={{ backgroundColor: color }}
      >
        {initial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-gray-900 text-sm">
            {stakeholder.nombre} {stakeholder.apellidos}
          </span>
          {stakeholder.rol && stakeholder.rol !== "Sin rol" ? (
            <span className="text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
              {stakeholder.rol}
            </span>
          ) : (
            <span className="text-[11px] text-gray-400 px-2 py-0.5 rounded-full border border-dashed border-gray-300">
              Sin rol
            </span>
          )}
          <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {stakeholder.tipo}
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {stakeholder.correo && (
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <MailIcon /> {stakeholder.correo}
            </span>
          )}
          {stakeholder.organizacion && (
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <OrgIcon /> {stakeholder.organizacion}
            </span>
          )}
        </div>
      </div>

      {/* Acciones — solo para stakeholders editables (no PO/TL) */}
      {isEditable && (
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => onEditar?.(stakeholder)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onEliminar?.(stakeholder.id_stakeholder)}
            className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
