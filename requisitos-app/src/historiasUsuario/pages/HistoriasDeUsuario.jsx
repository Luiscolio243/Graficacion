import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, Check } from "lucide-react";

const BASE_URL = "http://127.0.0.1:5000";

export default function HistoriasDeUsuario() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [historias, setHistorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [historiaSeleccionada, setHistoriaSeleccionada] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/historias-usuario/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject("Error al cargar"))
      .then(setHistorias)
      .catch(err => setError(String(err)))
      .finally(() => setCargando(false));
  }, [id]);

  const eliminarHistoria = async (id_historia) => {
    try {
      const res = await fetch(`${BASE_URL}/historias-usuario/eliminar/${id_historia}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      setHistorias(prev => prev.filter(h => h.id_historia !== id_historia));
      if (historiaSeleccionada?.id_historia === id_historia) setHistoriaSeleccionada(null);
    } catch (e) {
      alert(e.message);
    }
  };

  if (cargando) return <p className="text-center text-gray-500 mt-10">Cargando historias...</p>;
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
          <h1 className="text-3xl font-bold text-gray-900">Historias de Usuario</h1>
          <p className="text-gray-600 mt-1">({historias.length})</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/historias-usuario/crear`)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          + Nueva Historia
        </button>
      </div>

      {historias.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {historias.map((historia) => (
            <TarjetaHistoria
              key={historia.id_historia}
              historia={historia}
              onEliminar={eliminarHistoria}
              onVer={() => setHistoriaSeleccionada(historia)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">No hay historias de usuario aún. Crea una para comenzar.</p>
        </div>
      )}

      {/* Modal de detalle */}
      {historiaSeleccionada && (
        <ModalDetalleHistoria
          historia={historiaSeleccionada}
          onClose={() => setHistoriaSeleccionada(null)}
          onEliminar={eliminarHistoria}
        />
      )}
    </div>
  );
}

/* Tarjeta */
function TarjetaHistoria({ historia, onEliminar, onVer }) {
  const colorPrioridad = {
    alta:  "bg-red-100 text-red-800",
    media: "bg-yellow-100 text-yellow-800",
    baja:  "bg-green-100 text-green-800",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{historia.titulo}</h3>
          {historia.fecha_creacion && (
            <p className="text-xs text-gray-400">
              {new Date(historia.fecha_creacion).toLocaleDateString("es-MX", {
                day: "2-digit", month: "long", year: "numeric"
              })}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onVer}
            className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition text-sm font-medium"
          >
            Ver
          </button>
          <button
            onClick={() => onEliminar(historia.id_historia)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className={`px-3 py-1 rounded-full font-medium text-xs ${colorPrioridad[historia.prioridad]}`}>
          {historia.prioridad}
        </span>
      </div>

      <p className="text-gray-700 text-sm italic">
        Como <span className="font-medium">{historia.rol}</span>, quiero{" "}
        <span className="font-medium">{historia.accion}</span>, para que{" "}
        <span className="font-medium">{historia.beneficio}</span>.
      </p>

      {historia.criterios && historia.criterios.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-bold text-gray-900 mb-2">Criterios de Aceptación:</h4>
          <ul className="space-y-1">
            {historia.criterios.slice(0, 2).map((criterio, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <Check size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>{criterio}</span>
              </li>
            ))}
            {historia.criterios.length > 2 && (
              <li className="text-sm text-gray-500">+{historia.criterios.length - 2} más...</li>
            )}
          </ul>
        </div>
      )}

      {historia.estimacion && (
        <div className="text-sm text-gray-600 pt-2 border-t">
          Estimación: <span className="font-bold text-gray-900">{historia.estimacion}</span>
        </div>
      )}
    </div>
  );
}

/* Modal de detalle */
function ModalDetalleHistoria({ historia, onClose, onEliminar }) {
  const colorPrioridad = {
    alta:  "bg-red-100 text-red-800",
    media: "bg-yellow-100 text-yellow-800",
    baja:  "bg-green-100 text-green-800",
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold text-gray-900">{historia.titulo}</h2>
            {historia.fecha_creacion && (
              <p className="text-xs text-gray-400 mt-1">
                Creada el {new Date(historia.fecha_creacion).toLocaleDateString("es-MX", {
                  day: "2-digit", month: "long", year: "numeric"
                })}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Prioridad y estimación */}
          <div className="flex gap-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorPrioridad[historia.prioridad]}`}>
              Prioridad: {historia.prioridad}
            </span>
            {historia.estimacion && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                Estimación: {historia.estimacion}
              </span>
            )}
          </div>

          {/* Historia en formato */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-3">
              Historia de Usuario
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-indigo-700">Como</span> {historia.rol},
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-indigo-700">quiero</span> {historia.accion},
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-indigo-700">para que</span> {historia.beneficio}.
            </p>
          </div>

          {/* Criterios de aceptación */}
          {historia.criterios && historia.criterios.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Criterios de Aceptación</h3>
              <ul className="space-y-2">
                {historia.criterios.map((criterio, i) => (
                  <li key={i} className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
                    <Check size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{criterio}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
          >
            Cerrar
          </button>
          <button
            onClick={() => { onEliminar(historia.id_historia); onClose(); }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
          >
            Eliminar Historia
          </button>
        </div>
      </div>
    </div>
  );
}