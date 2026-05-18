import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

export default function Observaciones() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [observaciones, setObservaciones] = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [error,         setError]         = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);

  useEffect(() => {
    const obtener = async () => {
      try {
        const res = await fetch(`${BASE_URL}/observaciones/${id}`);
        if (!res.ok) throw new Error("Error al obtener las observaciones");
        setObservaciones(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    obtener();
  }, [id]);

  const ejecutarEliminar = async () => {
    try {
      const res = await fetch(`${BASE_URL}/observaciones/eliminar/${modalEliminar}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.error || "Error al eliminar la observación.");
      }
      setObservaciones((prev) => prev.filter((o) => o.id_observacion !== modalEliminar));
      setModalEliminar(null);
    } catch {
      alert("Error de conexión al eliminar la observación.");
    }
  };

  const botonAtras = (
    <button
      onClick={() => navegar(`/app/proyectos/${id}/requerimientos`)}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Volver a Requerimientos
    </button>
  );

  if (cargando) return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {botonAtras}
      <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-violet-500 animate-spin" />
        Cargando observaciones...
      </div>
    </div>
  );

  if (error) return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {botonAtras}
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
    </div>
  );

  const conProblema    = observaciones.filter((o) => o.problema_detectado);
  const sinProblema    = observaciones.filter((o) => !o.problema_detectado);

  return (
    <div className="space-y-7 max-w-4xl mx-auto">

      {botonAtras}

      {/* Encabezado */}
      <div className="flex items-end justify-between pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Observaciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">Notas rápidas de campo del proyecto</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/observaciones/crear`)}
          className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nueva Observación
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard titulo="Total"        valor={observaciones.length} icon={<IconTotal />}  color="violet" />
        <StatCard titulo="Con problema" valor={conProblema.length}   icon={<IconAlerta />} color="orange" />
        <StatCard titulo="Sin problema" valor={sinProblema.length}   icon={<IconCheck />}  color="blue"   />
      </div>

      {/* Lista */}
      {observaciones.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-16 text-center">
          <p className="text-sm text-gray-400">No hay observaciones aún.</p>
          <button
            onClick={() => navegar(`/app/proyectos/${id}/requerimientos/observaciones/crear`)}
            className="mt-3 text-sm text-green-600 hover:text-green-800 font-medium"
          >
            Crear la primera
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {conProblema.length > 0 && (
            <Grupo
              titulo="Con problema detectado"
              color="orange"
              observaciones={conProblema}
              proyectoId={id}
              navegar={navegar}
              onEliminar={setModalEliminar}
            />
          )}
          {sinProblema.length > 0 && (
            <Grupo
              titulo="Sin problema detectado"
              color="violet"
              observaciones={sinProblema}
              proyectoId={id}
              navegar={navegar}
              onEliminar={setModalEliminar}
            />
          )}
        </div>
      )}

      {/* Modal eliminar */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">¿Eliminar observación?</h2>
              <p className="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalEliminar(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminar}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────── */
function IconTotal() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M4 4h12v2H4V4zm0 4h12v2H4V8zm0 4h8v2H4v-2z" fill="currentColor" opacity="0.8"/>
    </svg>
  );
}
function IconAlerta() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 3L2 17h16L10 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M10 9v4M10 14.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Stat Card ──────────────────────────────────────── */
function StatCard({ titulo, valor, icon, color }) {
  const colors = {
    violet: { bg: "bg-violet-50", text: "text-violet-600", num: "text-violet-700" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", num: "text-orange-700" },
    blue:   { bg: "bg-blue-50",   text: "text-blue-600",   num: "text-blue-700"   },
  };
  const c = colors[color];
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{titulo}</p>
      <p className={`text-3xl font-bold mt-1 ${c.num}`}>{valor}</p>
    </div>
  );
}

/* ── Grupo ──────────────────────────────────────────── */
function Grupo({ titulo, color, observaciones, proyectoId, navegar, onEliminar }) {
  const dots = { orange: "bg-orange-400", violet: "bg-violet-400" };
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dots[color]}`} />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          {titulo} ({observaciones.length})
        </span>
      </div>
      {observaciones.map((obs) => (
        <TarjetaObservacion
          key={obs.id_observacion}
          obs={obs}
          color={color}
          onVer={() => navegar(`/app/proyectos/${proyectoId}/requerimientos/observaciones/${obs.id_observacion}`)}
          onEliminar={() => onEliminar(obs.id_observacion)}
        />
      ))}
    </div>
  );
}

/* ── Tarjeta Observacion ────────────────────────────── */
function TarjetaObservacion({ obs, color, onVer, onEliminar }) {
  const accents = { orange: "border-l-orange-400", violet: "border-l-violet-400" };
  const fecha = obs.fecha_observacion
    ? new Date(obs.fecha_observacion).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${accents[color]} rounded-xl p-5 shadow-sm`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{obs.lugar}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{obs.descripcion}</p>
          {fecha && <p className="text-[11px] text-gray-400 mt-1">{fecha}{obs.duracion_minutos ? ` · ${obs.duracion_minutos} min` : ""}</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onVer}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-2.5 py-1.5 rounded-md transition-colors"
          >
            Ver detalle
          </button>
          <button
            onClick={onEliminar}
            className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
