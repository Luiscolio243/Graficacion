import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API = "http://localhost:5000";

/* ── Info por tipo ───────────────────────────────────── */
const TIPO_INFO = {
  clases: {
    titulo: "Diagrama de Clases",
    descripcion: "Estructura estática del sistema con clases, atributos, métodos y relaciones",
    color: "blue",
    editorRuta: "/diseño",
  },
  paquetes: {
    titulo: "Diagrama de Paquetes",
    descripcion: "Organización de clases y componentes en grupos o módulos del sistema",
    color: "violet",
    editorRuta: "/diseño-paquetes",
  },
  secuencias: {
    titulo: "Diagrama de Secuencias",
    descripcion: "Interacción entre objetos a lo largo del tiempo mediante mensajes ordenados",
    color: "emerald",
    editorRuta: "/diseño-secuencia",
  },
  "casos-uso": {
    titulo: "Diagrama de Casos de Uso",
    descripcion: "Funcionalidades del sistema desde la perspectiva de los actores externos",
    color: "amber",
    editorRuta: "/casos-uso",
  },
};

const COLOR_CONFIG = {
  blue:    { accent: "border-t-blue-500",    badge: "bg-blue-50 text-blue-700",    icon: "text-blue-500"    },
  violet:  { accent: "border-t-violet-500",  badge: "bg-violet-50 text-violet-700", icon: "text-violet-500"  },
  emerald: { accent: "border-t-emerald-500", badge: "bg-emerald-50 text-emerald-700", icon: "text-emerald-500" },
  amber:   { accent: "border-t-amber-500",   badge: "bg-amber-50 text-amber-700",   icon: "text-amber-500"   },
};

/* ── Iconos ──────────────────────────────────────────── */
function IconDiagram() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="13" y="3" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="8" y="15" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 9v3M17 9v3M7 12h10M12 12v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconEmpty() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto">
      <rect x="8" y="8" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="22" y="8" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="14" y="24" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13 16v4M27 16v4M13 20h14M20 20v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Página ──────────────────────────────────────────── */
export default function ListaDiagramas() {
  const { tipo, id } = useParams();
  const navegar = useNavigate();
  const info = TIPO_INFO[tipo] || TIPO_INFO.clases;
  const c = COLOR_CONFIG[info.color] ?? COLOR_CONFIG.blue;

  const [diagramas, setDiagramas] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [creando, setCreando]     = useState(false);
  const [error, setError]         = useState(null);
  const [eliminando, setEliminando] = useState(null);

  const tipoMap = { "casos-uso": "casos_uso", secuencias: "secuencia" };
  const tipoBD = tipoMap[tipo] || tipo;

  useEffect(() => {
    setCargando(true);
    fetch(`${API}/diagramas?tipo=${tipoBD}&id_proyecto=${id}`)
      .then((r) => r.json())
      .then((data) => { setDiagramas(data); setCargando(false); })
      .catch(() => { setError("No se pudo conectar al servidor"); setCargando(false); });
  }, [tipo, id]);

  async function crearNuevo() {
    setCreando(true);
    try {
      const res = await fetch(`${API}/diagramas/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: "Nuevo diagrama", tipo: tipoBD, id_proyecto: id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Error al crear el diagrama"); return; }
      navegar(`${info.editorRuta}?id=${data.diagrama.id_diagrama}&tipo=${tipo}&id_proyecto=${id}`);
    } catch {
      setError("No se pudo conectar al servidor");
    } finally {
      setCreando(false);
    }
  }

  async function eliminarDiagrama(e, id_diagrama) {
    e.stopPropagation();
    if (!confirm("¿Eliminar este diagrama? Esta acción no se puede deshacer.")) return;
    setEliminando(id_diagrama);
    try {
      const res = await fetch(`${API}/diagramas/${id_diagrama}`, { method: "DELETE" });
      if (res.ok) setDiagramas((prev) => prev.filter((d) => d.id_diagrama !== id_diagrama));
      else setError("Error al eliminar el diagrama");
    } catch {
      setError("No se pudo conectar al servidor");
    } finally {
      setEliminando(null);
    }
  }

  return (
    <div className="space-y-7 max-w-6xl mx-auto">

      {/* Volver */}
      <button
        onClick={() => navegar(`/app/proyectos/${id}/diagramas`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver a diagramas
      </button>

      {/* Encabezado */}
      <div className="flex items-start justify-between pb-5 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0 ${c.icon}`}>
            <IconDiagram />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{info.titulo}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{info.descripcion}</p>
          </div>
        </div>
        <button
          onClick={crearNuevo}
          disabled={creando}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400
                     text-white text-sm font-semibold rounded-lg transition flex-shrink-0"
        >
          {creando ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <IconPlus />
              Nuevo diagrama
            </>
          )}
        </button>
      </div>

      {/* Estadística */}
      {!cargando && !error && (
        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">{diagramas.length}</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider leading-tight">
              {diagramas.length === 1 ? "diagrama" : "diagramas"}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-red-500 flex-shrink-0 mt-0.5">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M8 5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Cargando */}
      {cargando && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
            <p className="text-sm">Cargando diagramas...</p>
          </div>
        </div>
      )}

      {/* Vacío */}
      {!cargando && !error && diagramas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <IconEmpty />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">No hay diagramas todavía</p>
            <p className="text-xs text-gray-400 mt-0.5">Crea tu primer diagrama con el botón de arriba</p>
          </div>
        </div>
      )}

      {/* Grid de diagramas */}
      {!cargando && !error && diagramas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {diagramas.map((d) => (
            <TarjetaDiagrama
              key={d.id_diagrama}
              diagrama={d}
              colorConfig={c}
              eliminando={eliminando === d.id_diagrama}
              onClick={() => navegar(`${info.editorRuta}?id=${d.id_diagrama}&tipo=${tipo}&id_proyecto=${id}`)}
              onEliminar={(e) => eliminarDiagrama(e, d.id_diagrama)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Tarjeta de diagrama ─────────────────────────────── */
function TarjetaDiagrama({ diagrama, colorConfig, onClick, onEliminar, eliminando }) {
  const fecha = new Date(diagrama.editado_en).toLocaleDateString("es-MX", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 border-t-4 ${colorConfig.accent} rounded-xl
                  overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5
                  transition-all duration-200 group flex flex-col`}
    >
      {/* Preview oscuro */}
      <div className="bg-gray-950 h-32 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
        <span className="text-gray-500 text-xs font-mono relative z-10 px-3 text-center truncate max-w-full">
          {diagrama.nombre}
        </span>
        {/* Botón eliminar */}
        <button
          onClick={onEliminar}
          disabled={eliminando}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
                     bg-red-900/80 hover:bg-red-700 text-red-200 rounded-lg px-2 py-1 text-xs
                     flex items-center gap-1 disabled:opacity-50"
        >
          {eliminando ? (
            <div className="w-3 h-3 rounded-full border border-red-300 border-t-transparent animate-spin" />
          ) : (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
          Eliminar
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
          {diagrama.nombre}
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="text-gray-300 flex-shrink-0">
            <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          <span className="text-xs text-gray-400">{fecha}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorConfig.badge}`}>
            Abrir editor
          </span>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-gray-300 group-hover:text-indigo-400 transition-colors">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
