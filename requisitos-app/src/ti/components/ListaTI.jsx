// Muestra la lista de ti o un mensaje si está vacío

import TarjetaTI from "./TarjetaTI";

export default function ListaTI({ ti }) {
  if (ti.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
        <p className="text-gray-500 mb-4">
          No hay personas de ti registradas
        </p>
        <p className="text-sm text-gray-400">
          Comienza agregando personas relacionadas con el proyecto
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ti.map((s, index) => (
        <TarjetaTI key={index} ti={s} />
      ))}
    </div>
  );
}