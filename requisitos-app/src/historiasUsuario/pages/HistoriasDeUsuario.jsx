import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function HistoriasDeUsuario() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [historias, setHistorias] = useState([]);

  const eliminarHistoria = (id) => {
    setHistorias(historias.filter((h) => h.id !== id));
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
            Historias de Usuario
          </h1>
          <p className="text-gray-600 mt-1">({historias.length})</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/historias-usuario/crear`)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          + Nueva Historia
        </button>
      </div>

      {/* Historias de usuario */}
      {historias.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {historias.map((historia) => (
            <TarjetaHistoria
              key={historia.id}
              historia={historia}
              onEliminar={eliminarHistoria}
            />
          ))}
        </div>
      )}

      {historias.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">
            No hay historias de usuario aún. Crea una para comenzar.
          </p>
        </div>
      )}
    </div>
  );
}

/* COMPONENTES */

function TarjetaHistoria({ historia, onEliminar }) {
  const colorPrioridad = {
    alta: "bg-red-100 text-red-800",
    media: "bg-yellow-100 text-yellow-800",
    baja: "bg-green-100 text-green-800",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {historia.titulo}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {historia.fecha}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium">
            Ver
          </button>
          <button
            onClick={() => onEliminar(historia.id)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className={`px-3 py-1 rounded-full font-medium text-xs ${colorPrioridad[historia.prioridad]}`}>
          {historia.prioridad}
        </span>
        {historia.proceso && (
          <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium text-xs">
            {historia.proceso}
          </span>
        )}
        {historia.subproceso && (
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-xs">
            {historia.subproceso}
          </span>
        )}
      </div>

      <p className="text-gray-700 text-sm">
        {historia.descripcion}
      </p>

      {historia.criterios && historia.criterios.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-bold text-gray-900 mb-2">
            Criterios de Aceptación:
          </h4>
          <ul className="space-y-1">
            {historia.criterios.slice(0, 2).map((criterio, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{criterio}</span>
              </li>
            ))}
            {historia.criterios.length > 2 && (
              <li className="text-sm text-gray-500">
                +{historia.criterios.length - 2} más...
              </li>
            )}
          </ul>
        </div>
      )}

      {historia.estimacion && (
        <div className="text-sm text-gray-600 pt-2 border-t">
          Estimación: <span className="font-bold text-gray-900">{historia.estimacion} puntos</span>
        </div>
      )}
    </div>
  );
}
