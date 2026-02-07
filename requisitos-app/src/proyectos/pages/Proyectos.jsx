// Vista donde se ven los proyectos que tiene el usuario

import TarjetaProyecto from "../components/TarjetaProyecto";

// Datos por mientras se hace el back
const proyectosPrueba = [
  {
    id: 1,
    nombre: "Sistema de Gestión Académica",
    descripcion: "Plataforma para administrar alumnos y calificaciones",
    estado: "En progreso",
    requisitos: 24,
    fecha: "15 Ene 2026",
  },
  {
    id: 2,
    nombre: "App Móvil de Delivery",
    descripcion: "Aplicación para pedidos de comida a domicilio",
    estado: "Planificación",
    requisitos: 12,
    fecha: "3 Feb 2026",
  },
];



export default function Proyectos() {
  return (
    <div className="space-y-8">

      {/* Encabezado */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Proyectos
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona tus proyectos de software
          </p>
        </div>

        {/* Boton para crear proyecto */}
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Nuevo Proyecto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <button className="px-3 py-1.5 rounded-lg text-sm bg-indigo-50 text-indigo-600 font-medium">
          Todos
        </button>
        <button className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
          En progreso
        </button>
        <button className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
          Planificación
        </button>
        <button className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
          Completado
        </button>
      </div>

      {/* Lista de proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {proyectosPrueba.map((proyecto) => (
          <TarjetaProyecto
            key={proyecto.id}
            proyecto={proyecto}
          />
        ))}
      </div>

    </div>
  );
}