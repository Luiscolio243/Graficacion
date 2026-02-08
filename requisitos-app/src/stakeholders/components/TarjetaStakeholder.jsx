// Tarjeta para cada de un stakeholder

export default function TarjetaStakeholder({ stakeholder }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-start">

      <div>
        <p className="font-medium text-gray-900">
          {stakeholder.nombre} {stakeholder.apellidos}
        </p>

        <p className="text-sm text-gray-500">
          {stakeholder.rol} · {stakeholder.tipo}
        </p>

        <p className="text-sm text-gray-500">
          {stakeholder.correo}
        </p>

        {stakeholder.organizacion && (
          <p className="text-sm text-gray-400">
            {stakeholder.organizacion}
          </p>
        )}
      </div>

      {/* Acciones futuras */}
      <div className="text-sm text-gray-400">
        
      </div>
    </div>
  );
}