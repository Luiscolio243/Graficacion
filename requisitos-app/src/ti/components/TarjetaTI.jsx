const COLORS = ["#4F46E5", "#0D9488", "#7C3AED", "#D97706", "#2563EB"];

function MailIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
      <rect x="1" y="2.5" width="12" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 4.5l6 4 6-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export default function TarjetaTI({ ti, onEditar, index = 0 }) {
  const nombre   = ti?.usuario?.nombre  ?? "";
  const apellido = ti?.usuario?.apellido ?? "";
  const initial  = (nombre[0] ?? "?").toUpperCase();
  const color    = COLORS[index % COLORS.length];
  const activo   = ti?.activo !== false;

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
            {nombre} {apellido}
          </span>
          <span className="text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
            {ti?.rol?.nombre || "Sin rol"}
          </span>
          {!activo && (
            <span className="text-[11px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
              Inactivo
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 flex items-center gap-1.5">
          <MailIcon /> {ti?.usuario?.email}
        </span>
      </div>

      {/* Editar */}
      <button
        type="button"
        onClick={() => onEditar?.(ti)}
        className="flex-shrink-0 text-xs font-medium text-indigo-600 border border-indigo-200
                   bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
      >
        Editar
      </button>
    </div>
  );
}
