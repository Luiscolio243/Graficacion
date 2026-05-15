import TarjetaStakeholder from "./TarjetaStakeholder";

export default function ListaStakeholders({ stakeholders, onEditar, onEliminar }) {
  if (stakeholders.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
        <p className="text-sm text-gray-500 mb-1">No hay stakeholders registrados</p>
        <p className="text-xs text-gray-400">Comienza agregando personas relacionadas con el proyecto</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {stakeholders.map((s, index) => (
        <TarjetaStakeholder
          key={s.id_stakeholder ?? `sh-${index}`}
          stakeholder={s}
          onEditar={onEditar}
          onEliminar={onEliminar}
          index={index}
        />
      ))}
    </div>
  );
}
