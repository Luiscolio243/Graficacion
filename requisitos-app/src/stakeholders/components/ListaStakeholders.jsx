// Muestra la lista de stakeholders o un mensaje si está vacío

import TarjetaStakeholder from "./TarjetaStakeholder";

export default function ListaStakeholders({ stakeholders }) {
  if (stakeholders.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <p className="text-gray-500 mb-4">
          No hay stakeholders registrados
        </p>
        <p className="text-sm text-gray-400">
          Comienza agregando personas relacionadas con el proyecto
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stakeholders.map((s, index) => (
        <TarjetaStakeholder key={index} stakeholder={s} />
      ))}
    </div>
  );
}