// Tarjetas que muestra la informacion basica de un proyecto

export default function TarjetaProyecto({ proyecto }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
    onClick={() => Navigate(`/app/proyectos/${proyecto.id}`)}
      
      {/* Nombre y estado del proyecto */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900">
          {proyecto.nombre}
        </h3>

        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
          {proyecto.estado}
        </span>
      </div>

      {/* Descripcion */}
      <p className="text-sm text-gray-500 mb-4">
        {proyecto.descripcion}
      </p>

      {/* Mas datoss, luego le pongo simbolos bonis */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>{proyecto.requisitos} requisitos</span>
        <span>{proyecto.fecha}</span>
      </div>

    </div>
  );
}