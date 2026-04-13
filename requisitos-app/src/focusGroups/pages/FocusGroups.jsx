import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function FocusGroups() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [focusGroups, setFocusGroups] = useState([]);

  const eliminarFocusGroup = (id) => {
    setFocusGroups(focusGroups.filter((f) => f.id !== id));
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
          <h1 className="text-3xl font-bold text-gray-900">Focus Groups</h1>
          <p className="text-gray-600 mt-1">Registra sesiones de focus group</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/focus-groups/crear`)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          + Nuevo Focus Group
        </button>
      </div>

      {/* Focus Groups */}
      {focusGroups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {focusGroups.map((focusGroup) => (
            <TarjetaFocusGroup
              key={focusGroup.id}
              focusGroup={focusGroup}
              onEliminar={eliminarFocusGroup}
            />
          ))}
        </div>
      )}

      {focusGroups.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">
            No hay focus groups aún. Crea uno para comenzar.
          </p>
        </div>
      )}
    </div>
  );
}

/* COMPONENTES */

function TarjetaFocusGroup({ focusGroup, onEliminar }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-lg font-bold text-gray-900 flex-1">
          {focusGroup.titulo}
        </h3>
        <div className="flex gap-2">
          <button className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition text-sm font-medium">
            Ver
          </button>
          <button
            onClick={() => onEliminar(focusGroup.id)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>

      <p className="text-gray-700 text-sm">
        {focusGroup.objetivo}
      </p>

      <div className="flex gap-4 text-sm text-gray-600">
        <span>{focusGroup.fecha}</span>
        <span>{focusGroup.moderador}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t text-sm">
        <div>
          <p className="text-gray-500">Participantes</p>
          <p className="text-lg font-bold text-gray-900">{focusGroup.participantes}</p>
        </div>
        <div>
          <p className="text-gray-500">Conclusiones</p>
          <p className="text-lg font-bold text-gray-900">{focusGroup.conclusiones}</p>
        </div>
      </div>
    </div>
  );
}
