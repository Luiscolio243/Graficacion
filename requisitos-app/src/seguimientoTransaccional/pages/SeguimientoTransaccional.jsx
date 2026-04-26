import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const BASE_URL = "http://127.0.0.1:5000";

export default function SeguimientoTransaccional() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [seguimientos, setSeguimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/seguimientos/obtener/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject("Error al cargar"))
      .then(setSeguimientos)
      .catch(err => setError(String(err)))
      .finally(() => setCargando(false));
  }, [id]);

  const verDetalle = async (seguimiento) => {
    setSeleccionado(seguimiento);
    setCargandoDetalle(true);
    try {
      const res = await fetch(`${BASE_URL}/seguimientos/detalle/${seguimiento.id_seguimiento}`);
      if (!res.ok) throw new Error("Error al cargar detalle");
      const data = await res.json();
      setDetalle(data);
    } catch (e) {
      setDetalle(null);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const eliminarSeguimiento = async (id_seguimiento) => {
    try {
      const res = await fetch(`${BASE_URL}/seguimientos/eliminar/${id_seguimiento}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      setSeguimientos(prev => prev.filter(s => s.id_seguimiento !== id_seguimiento));
      if (seleccionado?.id_seguimiento === id_seguimiento) {
        setSeleccionado(null);
        setDetalle(null);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  if (cargando) return <p className="text-center text-gray-500 mt-10">Cargando seguimientos...</p>;
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
          <h1 className="text-3xl font-bold text-gray-900">Seguimiento Transaccional</h1>
          <p className="text-gray-600 mt-1">({seguimientos.length})</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional/crear`)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          + Nuevo Seguimiento
        </button>
      </div>

      {seguimientos.length > 0 ? (
        <div className="space-y-4">
          {seguimientos.map(s => (
            <TarjetaSeguimiento
              key={s.id_seguimiento}
              seguimiento={s}
              onEliminar={eliminarSeguimiento}
              onVer={() => verDetalle(s)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">No hay seguimientos aún. Crea uno para comenzar.</p>
        </div>
      )}

      {seleccionado && (
        <ModalDetalleSeguimiento
          detalle={detalle}
          cargando={cargandoDetalle}
          onClose={() => { setSeleccionado(null); setDetalle(null); }}
          onEliminar={eliminarSeguimiento}
        />
      )}
    </div>
  );
}

function TarjetaSeguimiento({ seguimiento, onEliminar, onVer }) {
  const fecha = seguimiento.fecha_creacion
    ? new Date(seguimiento.fecha_creacion).toLocaleDateString("es-MX", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "Sin fecha";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{seguimiento.titulo}</h3>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>{fecha}</span>
            <span className="font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs">
              {seguimiento.id_transaccion}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onVer}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition text-sm font-medium"
          >
            Ver
          </button>
          <button
            onClick={() => onEliminar(seguimiento.id_seguimiento)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>

      {seguimiento.nombre_proceso && (
        <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 font-medium text-xs">
          {seguimiento.nombre_proceso}
        </span>
      )}
    </div>
  );
}

function ModalDetalleSeguimiento({ detalle, cargando, onClose, onEliminar }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {cargando ? "Cargando..." : detalle?.titulo}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        {cargando ? (
          <div className="p-12 text-center">
            <p className="text-gray-400">Cargando detalle...</p>
          </div>
        ) : detalle && (
          <div className="p-6 space-y-5">

            {/* ID Transacción */}
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-xs text-red-600 font-medium mb-1">ID de Transacción</p>
              <p className="font-mono font-bold text-red-800">{detalle.id_transaccion}</p>
            </div>

            {/* Proceso */}
            {detalle.nombre_proceso && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Proceso</p>
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                  {detalle.nombre_proceso}
                </span>
              </div>
            )}

            {/* Pasos */}
            {detalle.pasos?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Pasos</p>
                <div className="space-y-2">
                  {detalle.pasos.map((paso, i) => (
                    <div key={paso.id_seguimiento_paso} className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{paso.nombre}</p>
                        {paso.duracion_min && (
                          <p className="text-xs text-gray-500 mt-0.5">{paso.duracion_min} minutos</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Problemas */}
            {detalle.problemas?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Problemas Identificados</p>
                <ul className="space-y-2">
                  {detalle.problemas.map(p => (
                    <li key={p.id_seguimiento_problema} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                      <span className="text-red-500 font-bold text-sm mt-0.5">!</span>
                      <span className="text-sm text-gray-700">{p.descripcion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Métricas */}
            {detalle.metricas?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Métricas</p>
                <div className="grid grid-cols-2 gap-3">
                  {detalle.metricas.map(m => (
                    <div key={m.id_seguimiento_metrica} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      <p className="text-xs text-gray-500">{m.nombre}</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{m.valor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 border border-grayaler-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
          >
            Cerrar
          </button>
          {detalle && (
            <button
              onClick={() => { onEliminar(detalle.id_seguimiento); onClose(); }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}