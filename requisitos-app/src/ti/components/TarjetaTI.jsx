// Tarjeta para cada de un stakeholder

export default function TarjetaTI({ ti }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-start">

      <div>
        <p className="font-medium text-gray-900">
          {ti.nombre} {ti.apellidos}
        </p>

        <p className="text-sm text-gray-500">
          {ti.rol} · {ti.tipo}
        </p>

        <p className="text-sm text-gray-500">
          {ti.correo}
        </p>

        {ti.organizacion && (
          <p className="text-sm text-gray-400">
            {ti.organizacion}
          </p>
        )}
      </div>

      {/* Acciones futuras */}
      <div className="text-sm text-gray-400">
        
      </div>
    </div>
  );
}