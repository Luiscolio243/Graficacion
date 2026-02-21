// Tarjeta para cada integrante de TI

export default function TarjetaTI({ ti }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-start">

      <div>
        <p className="font-medium text-gray-900">
          {ti?.usuario?.nombre} {ti?.usuario?.apellido}
        </p>

        <p className="text-sm text-gray-500">
          {ti?.rol?.nombre || "Sin rol"} {ti?.activo === false ? "· Inactivo" : ""}
        </p>

        <p className="text-sm text-gray-500">
          {ti?.usuario?.email}
        </p>
      </div>

      {/* Acciones futuras */}
      <div className="text-sm text-gray-400">
        
      </div>
    </div>
  );
}