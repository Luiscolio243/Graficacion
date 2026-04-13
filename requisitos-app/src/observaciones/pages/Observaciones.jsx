import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Observaciones() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [observaciones, setObservaciones] = useState([]);

  const eliminarObservacion = (id) => {
    setObservaciones(observaciones.filter((o) => o.id !== id));
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
          <h1 className="text-3xl font-bold text-gray-900">Observaciones</h1>
          <p className="text-gray-600 mt-1">Notas rápidas de campo</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/observaciones/crear`)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          + Nueva Nota
        </button>
      </div>

      {/* Notas de observación */}
      {observaciones.length > 0 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {observaciones.map((observacion) => (
              <TarjetaObservacion
                key={observacion.id}
                observacion={observacion}
                onEliminar={eliminarObservacion}
              />
            ))}
          </div>
        </div>
      )}

      {observaciones.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">
            No hay observaciones aún. Crea una para comenzar.
          </p>
        </div>
      )}
    </div>
  );
}

/* COMPONENTES */

function TarjetaObservacion({ observacion, onEliminar }) {
  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-6 space-y-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-lg font-bold text-gray-900 flex-1">
          {observacion.titulo}
        </h3>
        <button
          onClick={() => onEliminar(observacion.id)}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-white rounded-lg transition text-sm font-medium"
        >
          Eliminar
        </button>
      </div>

      <p className="text-gray-700 text-sm line-clamp-4">
        {observacion.observaciones}
      </p>

      {observacion.puntos > 0 && (
        <div className="flex gap-4 text-sm text-gray-600">
          <span>{observacion.fecha}</span>
          <span className="text-purple-600 font-medium">{observacion.puntos} puntos</span>
        </div>
      )}

      {!observacion.puntos && (
        <div className="text-sm text-gray-600">
          {observacion.fecha}
        </div>
      )}
    </div>
  );
}
