
// Sidebar que esta a la izquierda
// Por mientras solo puse el modulo de proyectos, despues se sabra si haremos mas modulos (yo creo que si)

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {

  const navigate = useNavigate();

  const [user] = useState(() => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
});


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };


  return (
    <aside className="w-64 bg-white border-r min-h-screen px-5 py-6 flex flex-col">
      
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-semibold">
          R
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Req
          </p>
          <p className="text-xs text-gray-500">
            Gestión de requisitos
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
        Principal
      </p>

      {/* Navegación principal en los modulos*/}
      <nav className="space-y-1">
        {/* Aqui van los modulos, despues pongo simbolo bonito de los modulos */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lx bg-indigo-50 text-indigo-600 text-sm font-medium">
            {/* Ícono placeholder */}
            <span className="text-base"></span>
            Proyectos
        </button>
      </nav>

      {/* Espaciador */}
      <div className="flex-1" />

      {/* Usuario */}
      <div className="pt-4 border-t">
        <p className="text-sm font-medium text-gray-800">
          {user ? `${user.nombre} ${user.apellido}` : "Usuario"}
        </p>

        <button
        onClick={handleLogout}
        className="mt-2 text-xs text-red-500 hover:underline"
        >
        Cerrar sesión
        </button>
      </div>

    </aside>
  );
}