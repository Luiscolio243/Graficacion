import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
 
export default function SeguimientoTransaccional() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [seguimientos, setSeguimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    const obtenerSeguimientosTransaccionales = async () => {
      try {
        const response = await fetch(`http://localhost:5000/seguimientos/obtener/${id}`);
        if (!response.ok) throw new Error("Error al obtener los seguimientos");
        const data = await response.json();
        setSeguimientos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
 
    obtenerSeguimientosTransaccionales();
  }, [id]);
 
  const eliminarSeguimiento = (id_seguimiento) => {
    setSeguimientos(seguimientos.filter((s) => s.id_seguimiento !== id_seguimiento));
  };
 
  return (
    <div className="space-y-6">
      {/* Encabezado con botón atrás */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}`)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            Seguimiento Transaccional
          </h1>
          {!cargando && (
            <p className="text-gray-600 mt-1">({seguimientos.length})</p>
          )}
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional/crear`)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          + Nuevo Seguimiento
        </button>
      </div>
 
      {/* Estado de carga */}
      {cargando && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-400 text-lg">Cargando seguimientos...</p>
        </div>
      )}
 
      {/* Error */}
      {error && !cargando && (
        <div className="bg-red-50 rounded-xl p-6 border border-red-200 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}
 
      {/* Seguimientos */}
      {!cargando && !error && seguimientos.length > 0 && (
        <div className="space-y-6">
          {seguimientos.map((seguimiento) => (
            <TarjetaSeguimiento
              key={seguimiento.id_seguimiento}
              seguimiento={seguimiento}
              onEliminar={eliminarSeguimiento}
              idProyecto={id}
            />
          ))}
        </div>
      )}
 
      {/* Estado vacío */}
      {!cargando && !error && seguimientos.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">
            No hay seguimientos aún. Crea uno para comenzar.
          </p>
        </div>
      )}
    </div>
  );
}
 
/* COMPONENTES */
 
function TarjetaSeguimiento({ seguimiento, onEliminar, idProyecto }) {
  const navegar = useNavigate();
 
  // Formatear fecha legible
  const fechaFormateada = seguimiento.fecha_creacion
    ? new Date(seguimiento.fecha_creacion).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Sin fecha";
 
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {seguimiento.titulo}
          </h3>
          <div className="flex gap-4 text-sm text-gray-600 mb-3">
            <span>📅 {fechaFormateada}</span>
            <span>🔖 ID Transacción: {seguimiento.id_transaccion}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              navegar(
                `/app/proyectos/${idProyecto}/requerimientos/seguimiento-transaccional/${seguimiento.id_seguimiento}`
              )
            }
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
          >
            Ver
          </button>
          <button
            onClick={() => onEliminar(seguimiento.id_seguimiento)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>
 
      {/* Proceso */}
      {seguimiento.nombre_proceso && (
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 font-medium text-xs">
            {seguimiento.nombre_proceso}
          </span>
        </div>
      )}
    </div>
  );
}
