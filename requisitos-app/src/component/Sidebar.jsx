import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function IconProyectos() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
      <path d="M2 6a2 2 0 012-2h3.5l2 2H16a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <path d="M13 3h4a1 1 0 011 1v12a1 1 0 01-1 1h-4M8 14l4-4-4-4M12 10H3"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { label: "Proyectos", icon: <IconProyectos />, path: "/app/proyectos" },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [user] = useState(() => {
    const s = localStorage.getItem("user");
    return s ? JSON.parse(s) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const initial = user?.nombre?.[0]?.toUpperCase() ?? "U";
  const fullName = user ? `${user.nombre} ${user.apellido ?? ""}`.trim() : "Usuario";

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col select-none">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          R
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight">Req</p>
          <p className="text-[11px] text-gray-400 leading-tight truncate">Gestión de requisitos</p>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
            Principal
          </p>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-150 text-left
                    ${active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <span className={active ? "text-indigo-600" : "text-gray-400"}>
                    {item.icon}
                  </span>
                  {item.label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Usuario */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition group">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initial}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
              {fullName}
            </p>
            <p className="text-[11px] text-gray-400 leading-tight">
              {user?.email ?? ""}
            </p>
          </div>
        </div>

        {/* Botón cerrar sesión */}
        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
        >
          <IconLogout />
          Cerrar sesión
        </button>
      </div>

    </aside>
  );
}
