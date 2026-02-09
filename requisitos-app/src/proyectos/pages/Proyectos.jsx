import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TarjetaProyecto from "../components/TarjetaProyecto";

export default function Proyectos() {
  const navigate = useNavigate();

  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerProyectos = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/roles/agregar");

        if (!response.ok) {
          throw new Error("Error al obtener proyectos");
        }

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
    <div className="space-y-8">

      {/* Encabezado */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Proyectos
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona tus proyectos de software
          </p>
        </div>

        <button
          onClick={() => navigate("/app/proyectos/nuevo")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Nuevo Proyecto
        </button>
      </div>

      {}
      {loading && <p className="text-gray-500">Cargando proyectos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Lista de proyectos */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {proyectos.map((proyecto) => (
            <TarjetaProyecto
              key={proyecto.id}
              proyecto={proyecto}
            />
          ))}
        </div>
      )}
    </div>
  );
}
