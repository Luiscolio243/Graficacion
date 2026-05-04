import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
 
const API = "http://localhost:5000";
 
const TIPO_INFO = {
  clases: {
    titulo: "Diagrama de Clases",
    descripcion: "Clases, atributos, métodos y relaciones",
    color: "blue",
    editorRuta: "/diseño",
    disponible: true,
  },
  paquetes: {
    titulo: "Diagrama de Paquetes",
    descripcion: "Organización de módulos del sistema",
    color: "violet",
    editorRuta: "/diseño-paquetes",
    disponible: true,
  },
  secuencias: {
    titulo: "Diagrama de Secuencias",
    descripcion: "Interacción entre objetos en el tiempo",
    color: "emerald",
    disponible: false,
  },
  "casos-uso": {
    titulo: "Diagrama de Casos de Uso",
    descripcion: "Funcionalidades desde la perspectiva del actor",
    color: "amber",
    editorRuta: "/casos-uso",
    disponible: true,
  },
};
 
export default function ListaDiagramas() {
  const { tipo } = useParams();
  const navegar = useNavigate();
  const info = TIPO_INFO[tipo] || TIPO_INFO.clases;
 
  const [diagramas, setDiagramas]   = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [creando, setCreando]       = useState(false);
  const [error, setError]           = useState(null);
 

  useEffect(() => {
    if (!info.disponible) { setCargando(false); return; }
 
    setCargando(true);
    fetch(`${API}/diagramas?tipo=${tipo === 'casos-uso' ? 'casos_uso' : tipo}`)
      .then((r) => r.json())
      .then((data) => { setDiagramas(data); setCargando(false); })
      .catch(() => { setError("No se pudo conectar al servidor"); setCargando(false); });
  }, [tipo]);
 

  async function crearNuevo() {
    setCreando(true);
    try {
      const res = await fetch(`${API}/diagramas/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: "Nuevo diagrama",
          tipo: tipo === "casos-uso" ? "casos_uso" : tipo,
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Error al crear"); return; }
      // Redirigir al editor con el id real de la BD
      navegar(`${info.editorRuta}?id=${data.diagrama.id_diagrama}&tipo=${tipo}`);
    } catch {
      alert("No se pudo conectar al servidor");
    } finally {
      setCreando(false);
    }
  }
 
  async function eliminarDiagrama(e, id_diagrama) {
    e.stopPropagation();
    if (!confirm("¿Eliminar este diagrama?")) return;
    try {
      const res = await fetch(`${API}/diagramas/${id_diagrama}`, { method: "DELETE" });
      if (res.ok) setDiagramas((prev) => prev.filter((d) => d.id_diagrama !== id_diagrama));
      else alert("Error al eliminar");
    } catch {
      alert("No se pudo conectar al servidor");
    }
  }
 
  function abrirDiagrama(id_diagrama) {
    navegar(`${info.editorRuta}?id=${id_diagrama}&tipo=${tipo}`);
  }
 
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navegar("/app/diagramas")}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{info.titulo}</h1>
          <p className="text-gray-500 mt-1">{info.descripcion}</p>
        </div>
      </div>
 
      {}
      {info.disponible ? (
        <button
          onClick={crearNuevo}
          disabled={creando}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
        >
          {creando ? "Creando..." : "+ Crear nuevo diagrama"}
        </button>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-700 font-medium">Editor próximamente disponible</p>
          <p className="text-amber-600 text-sm mt-1">
            Este tipo de diagrama estará disponible en una próxima versión
          </p>
        </div>
      )}
 
      {}
      {cargando && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-sm">Cargando diagramas...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-10 text-red-400">
          <p className="text-sm">{error}</p>
        </div>
      )}
 
      {}
      {info.disponible && !cargando && !error && diagramas.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No hay diagramas todavía</p>
          <p className="text-sm mt-1">Crea tu primer diagrama con el botón de arriba</p>
        </div>
      )}
 
      {}
      {info.disponible && !cargando && diagramas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {diagramas.map((d) => (
            <TarjetaDiagrama
              key={d.id_diagrama}
              diagrama={d}
              onClick={() => abrirDiagrama(d.id_diagrama)}
              onEliminar={(e) => eliminarDiagrama(e, d.id_diagrama)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
 
function TarjetaDiagrama({ diagrama, onClick, onEliminar }) {
  const fecha = new Date(diagrama.editado_en).toLocaleDateString("es-MX", {
    day: "numeric", month: "short", year: "numeric",
  });
 
  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition group"
    >
      {}
      <div className="bg-gray-900 h-36 p-3 relative overflow-hidden flex items-center justify-center">
        <span className="text-gray-600 text-xs font-mono">{diagrama.nombre}</span>
        <button
          onClick={onEliminar}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-red-900 hover:bg-red-700 text-red-200 rounded px-1.5 py-0.5 text-xs"
        >
          ✕
        </button>
      </div>
 
      {}
      <div className="p-4 bg-white">
        <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition truncate">
          {diagrama.nombre}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
          <span>Modificado: {fecha}</span>
        </div>
        {diagrama.descripcion && (
          <p className="text-xs text-gray-400 mt-1 truncate">{diagrama.descripcion}</p>
        )}
      </div>
    </div>
  );
}
 