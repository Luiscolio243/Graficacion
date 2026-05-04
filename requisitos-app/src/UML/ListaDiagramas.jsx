import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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
    disponible: false,
  },
};

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function ListaDiagramas() {
  const { tipo } = useParams();
  const navegar = useNavigate();
  const info = TIPO_INFO[tipo] || TIPO_INFO.clases;
  const storageKey = `diagramas_${tipo}`;

  const [diagramas, setDiagramas] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    setDiagramas(stored);
  }, [storageKey]);

  function crearNuevo() {
    const id = generarId();
    const nuevo = {
      id,
      nombre: "Nuevo diagrama",
      tipo,
      fechaCreacion: new Date().toISOString(),
      ultimaModificacion: new Date().toISOString(),
      nodes: [],
      edges: [],
    };
    const updated = [nuevo, ...diagramas];
    localStorage.setItem(storageKey, JSON.stringify(updated));
    navegar(`${info.editorRuta}?id=${id}&tipo=${tipo}`);
  }

  function abrirDiagrama(id) {
    navegar(`${info.editorRuta}?id=${id}&tipo=${tipo}`);
  }

  function eliminarDiagrama(e, id) {
    e.stopPropagation();
    if (!confirm("¿Eliminar este diagrama?")) return;
    const updated = diagramas.filter((d) => d.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setDiagramas(updated);
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

      {/* Botón crear / aviso próximamente */}
      {info.disponible ? (
        <button
          onClick={crearNuevo}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          + Crear nuevo diagrama
        </button>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="text-amber-700 font-medium">Editor próximamente disponible</p>
          <p className="text-amber-600 text-sm mt-1">
            Este tipo de diagrama estará disponible en una próxima versión
          </p>
        </div>
      )}

      {/* Estado vacío */}
      {info.disponible && diagramas.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No hay diagramas todavía</p>
          <p className="text-sm mt-1">Crea tu primer diagrama con el botón de arriba</p>
        </div>
      )}

      {/* Grid de diagramas */}
      {info.disponible && diagramas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {diagramas.map((d) => (
            <TarjetaDiagrama
              key={d.id}
              diagrama={d}
              onClick={() => abrirDiagrama(d.id)}
              onEliminar={(e) => eliminarDiagrama(e, d.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TarjetaDiagrama({ diagrama, onClick, onEliminar }) {
  const fecha = new Date(diagrama.ultimaModificacion).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const clases = diagrama.nodes || [];
  const relaciones = diagrama.edges || [];

  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition group"
    >
      {/* Mini preview oscuro */}
      <div className="bg-gray-900 h-36 p-3 relative overflow-hidden">
        {clases.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-600 text-xs font-mono">canvas vacío</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 items-start content-start">
            {clases.slice(0, 6).map((nodo, i) => (
              <div
                key={i}
                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-gray-300 font-mono truncate"
                style={{ fontSize: 9, maxWidth: 100 }}
              >
                {nodo.data?.name || "Clase"}
              </div>
            ))}
            {clases.length > 6 && (
              <div
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-400 font-mono"
                style={{ fontSize: 9 }}
              >
                +{clases.length - 6} más
              </div>
            )}
          </div>
        )}

        {/* Botón eliminar */}
        <button
          onClick={onEliminar}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-red-900 hover:bg-red-700 text-red-200 rounded px-1.5 py-0.5 text-xs"
        >
          ✕
        </button>
      </div>

      {/* Info */}
      <div className="p-4 bg-white">
        <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition truncate">
          {diagrama.nombre}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
          <span>{clases.length} {clases.length === 1 ? "clase" : "clases"}</span>
          <span>·</span>
          <span>{relaciones.length} {relaciones.length === 1 ? "relación" : "relaciones"}</span>
          <span>·</span>
          <span>{fecha}</span>
        </div>
      </div>
    </div>
  );
}
