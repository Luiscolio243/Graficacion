import TarjetaProceso from "./TarjetaProceso";

export default function ListaProcesos({
  procesos,
  stakeholders = [],
  onAgregarSubproceso,
  onAsignarTecnicas,
  onEditarProceso,
  onEditarSubproceso,
}) {

  if (procesos.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <p className="text-gray-500 mb-4">
          No hay procesos
        </p>
        <p className="text-sm text-gray-400">
          Define los procesos principales para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {procesos.map((proceso) => (
        <TarjetaProceso
          key={proceso.id}
          proceso={proceso}
          stakeholders={stakeholders}
          onAgregarSubproceso={onAgregarSubproceso}
          onAsignarTecnicas={onAsignarTecnicas}
          onEditarProceso={onEditarProceso}
          onEditarSubproceso={onEditarSubproceso}
        />
      ))}
    </div>
  );
}