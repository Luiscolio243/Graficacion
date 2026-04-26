import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const BASE_URL = "http://127.0.0.1:5000";

export default function FocusGroups() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [focusGroups, setFocusGroups] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/focus-groups/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject("Error al cargar"))
      .then(setFocusGroups)
      .catch(err => setError(String(err)))
      .finally(() => setCargando(false));
  }, [id]);

  const eliminarFocusGroup = async (id_focus_group) => {
    try {
      const res = await fetch(`${BASE_URL}/focus-groups/eliminar/${id_focus_group}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setFocusGroups(prev => prev.filter(f => f.id_focus_group !== id_focus_group));
      if (seleccionado?.id_focus_group === id_focus_group) setSeleccionado(null);
    } catch (e) {
      alert(e.message);
    }
  };

  if (cargando) return <p className="text-center text-gray-500 mt-10">Cargando focus groups...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="space-y-6">
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

      {focusGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {focusGroups.map(fg => (
            <TarjetaFocusGroup
              key={fg.id_focus_group}
              focusGroup={fg}
              onEliminar={eliminarFocusGroup}
              onVer={() => setSeleccionado(fg)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">No hay focus groups aún. Crea uno para comenzar.</p>
        </div>
      )}

      {seleccionado && (
        <ModalDetalleFocusGroup
          focusGroup={seleccionado}
          onClose={() => setSeleccionado(null)}
          onEliminar={eliminarFocusGroup}
        />
      )}
    </div>
  );
}

function TarjetaFocusGroup({ focusGroup, onEliminar, onVer }) {
  const estadoColor = {
    planificado: "bg-blue-100 text-blue-800",
    realizado:   "bg-emerald-100 text-emerald-800",
    cancelado:   "bg-red-100 text-red-800",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start gap-2">
        <h3 className="text-lg font-bold text-gray-900 flex-1">{focusGroup.titulo}</h3>
        <div className="flex gap-2">
          <button
            onClick={onVer}
            className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition text-sm font-medium"
          >
            Ver
          </button>
          <button
            onClick={() => onEliminar(focusGroup.id_focus_group)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>

      {focusGroup.objetivo && (
        <p className="text-gray-600 text-sm line-clamp-2">{focusGroup.objetivo}</p>
      )}

      <div className="flex gap-2 flex-wrap">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoColor[focusGroup.estado] ?? "bg-gray-100 text-gray-600"}`}>
          {focusGroup.estado}
        </span>
        {focusGroup.tipo_media && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            {focusGroup.tipo_media}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t text-sm">
        <div>
          <p className="text-gray-500">Participantes</p>
          <p className="text-lg font-bold text-gray-900">{focusGroup.total_participantes}</p>
        </div>
        <div>
          <p className="text-gray-500">Temas</p>
          <p className="text-lg font-bold text-gray-900">{focusGroup.total_temas}</p>
        </div>
      </div>
    </div>
  );
}

function ModalDetalleFocusGroup({ focusGroup, onClose, onEliminar }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold text-gray-900">{focusGroup.titulo}</h2>
            {focusGroup.fecha_creacion && (
              <p className="text-xs text-gray-400 mt-1">
                Creado el {new Date(focusGroup.fecha_creacion).toLocaleDateString("es-MX", {
                  day: "2-digit", month: "long", year: "numeric"
                })}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Estado y tipo */}
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {focusGroup.estado}
            </span>
            {focusGroup.tipo_media && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                {focusGroup.tipo_media}
              </span>
            )}
          </div>

          {/* Objetivo */}
          {focusGroup.objetivo && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Objetivo</p>
              <p className="text-sm text-gray-700">{focusGroup.objetivo}</p>
            </div>
          )}

          {/* Conclusiones */}
          {focusGroup.conclusiones?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Conclusiones</p>
              <ul className="space-y-2">
                {focusGroup.conclusiones.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
                    <span className="text-orange-500 font-bold text-sm mt-0.5">→</span>
                    <span className="text-sm text-gray-700">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Transcripción */}
          {focusGroup.transcripcion && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Transcripción / Notas</p>
              <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-4 whitespace-pre-wrap">
                {focusGroup.transcripcion}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{focusGroup.total_participantes}</p>
              <p className="text-xs text-gray-500">Participantes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{focusGroup.total_temas}</p>
              <p className="text-xs text-gray-500">Temas detectados</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
          >
            Cerrar
          </button>
          <button
            onClick={() => { onEliminar(focusGroup.id_focus_group); onClose(); }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}