import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function SeguimientoTransaccional() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [seguimientos, setSeguimientos] = useState([]);

  const eliminarSeguimiento = (id) => {
    setSeguimientos(seguimientos.filter((s) => s.id !== id));
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
          <p className="text-gray-600 mt-1">({seguimientos.length})</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional/crear`)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          + Nuevo Seguimiento
        </button>
      </div>

      {/* Seguimientos */}
      {seguimientos.length > 0 && (
        <div className="space-y-6">
          {seguimientos.map((seguimiento) => (
            <TarjetaSeguimiento
              key={seguimiento.id}
              seguimiento={seguimiento}
              onEliminar={eliminarSeguimiento}
            />
          ))}
        </div>
      )}

      {seguimientos.length === 0 && (
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

function TarjetaSeguimiento({ seguimiento, onEliminar }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {seguimiento.titulo}
          </h3>
          <div className="flex gap-4 text-sm text-gray-600 mb-3">
            <span>{seguimiento.fecha}</span>
            <span>ID: {seguimiento.transaccionId}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium">
            Ver
          </button>
          <button
            onClick={() => onEliminar(seguimiento.id)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>

      {seguimiento.proceso && (
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 font-medium text-xs mb-3">
            {seguimiento.proceso}
          </span>
          <p className="text-gray-700 text-sm">
            Proceso: <span className="font-medium">{seguimiento.nombreProceso}</span>
          </p>
        </div>
      )}

      {seguimiento.pasos && seguimiento.pasos.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-bold text-gray-900 mb-3">Pasos del Proceso</h4>
          <div className="space-y-2">
            {seguimiento.pasos.slice(0, 3).map((paso, index) => (
              <div key={index} className="flex items-center gap-3 py-2 px-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <span className="text-green-600 font-bold">✓</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {paso.nombre}
                  </p>
                </div>
                {paso.duracion && (
                  <span className="text-green-600 font-bold text-sm">
                    {paso.duracion}
                  </span>
                )}
              </div>
            ))}
            {seguimiento.pasos.length > 3 && (
              <p className="text-xs text-gray-500 px-3 py-1">
                +{seguimiento.pasos.length - 3} pasos más...
              </p>
            )}
          </div>
        </div>
      )}

      {(seguimiento.tiempoTotal || seguimiento.tiempoObjetivo || seguimiento.desviacion) && (
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <h4 className="text-sm font-bold text-gray-900 mb-3">Métricas</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            {seguimiento.tiempoTotal && (
              <div>
                <p className="text-xs text-gray-600">Tiempo total transcurrido</p>
                <p className="text-lg font-bold text-gray-900">{seguimiento.tiempoTotal}</p>
              </div>
            )}
            {seguimiento.tiempoObjetivo && (
              <div>
                <p className="text-xs text-gray-600">Tiempo objetivo</p>
                <p className="text-lg font-bold text-gray-900">{seguimiento.tiempoObjetivo}</p>
              </div>
            )}
            {seguimiento.desviacion && (
              <div>
                <p className="text-xs text-gray-600">Desviación</p>
                <p className="text-lg font-bold text-red-600">{seguimiento.desviacion}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
