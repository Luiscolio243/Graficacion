import TarjetaTI from "./TarjetaTI";

export default function ListaTI({ ti, onEditar, onEliminar }) {
  if (ti.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
        <p className="text-sm text-gray-500 mb-1">No hay integrantes de TI registrados</p>
        <p className="text-xs text-gray-400">Comienza agregando personas al equipo técnico del proyecto</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ti.map((s, index) => (
        <TarjetaTI
          key={s.id_personal_ti ?? index}
          ti={s}
          onEditar={onEditar}
          onEliminar={onEliminar}
          index={index}
        />
      ))}
    </div>
  );
}
