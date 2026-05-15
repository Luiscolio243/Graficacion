import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TarjetaProyecto from "../components/TarjetaProyecto";

export default function Proyectos() {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    const obtenerProyectos = async () => {
      try {
        const userStorage = localStorage.getItem("user");
        if (!userStorage) {
          setError("No se encontró información de usuario. Por favor, inicia sesión nuevamente.");
          return;
        }
        const user      = JSON.parse(userStorage);
        const idUsuario = user.id;
        if (!idUsuario) {
          setError("No se encontró el ID de usuario. Inicia sesión nuevamente.");
          return;
        }
        const response = await fetch(`http://127.0.0.1:5000/proyectos/obtener/${idUsuario}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Error al obtener proyectos");
        const data = await response.json();
        setProyectos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    obtenerProyectos();
  }, []);

  return (
    <div className="space-y-7">

      {/* Encabezado */}
      <div className="flex items-end justify-between pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Proyectos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona tus proyectos de software</p>
        </div>
        <button
          onClick={() => navigate("/app/proyectos/nuevo")}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700
                     text-white text-sm font-medium px-4 py-2 rounded-md transition-colors duration-150"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Nuevo Proyecto
        </button>
      </div>

      {/* Cargando */}
      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-gray-400">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
          Cargando proyectos...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Vacío */}
      {!loading && !error && proyectos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="4" width="16" height="13" rx="2" stroke="#9CA3AF" strokeWidth="1.4" />
              <path d="M6 4V3a1 1 0 011-1h6a1 1 0 011 1v1" stroke="#9CA3AF" strokeWidth="1.4" />
              <path d="M7 10h6M7 13h4" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">No tienes proyectos registrados</p>
          <p className="text-xs text-gray-400 mt-1">Crea tu primer proyecto para comenzar</p>
        </div>
      )}

      {/* Grid de proyectos */}
      {!loading && !error && proyectos.length > 0 && (
        <div className="space-y-4">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {proyectos.length} {proyectos.length === 1 ? "proyecto" : "proyectos"}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {proyectos.map((proyecto, index) => (
              <TarjetaProyecto key={proyecto.id_proyecto} proyecto={proyecto} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
