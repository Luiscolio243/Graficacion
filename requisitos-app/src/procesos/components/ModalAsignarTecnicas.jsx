import { useState } from "react";

const TECNICAS_DISPONIBLES = [
  "Entrevista",
  "Formulario / Encuesta",
  "Observación",
  "Focus Group",
  "Historias de Usuario",
  "Seguimiento Transaccional",
];

export default function ModalAsignarTecnicas({
  onClose,
  onGuardar,
  tecnicasIniciales = [],
}) {
  const [seleccionadas, setSeleccionadas] = useState(tecnicasIniciales);

  const toggleTecnica = (tecnica) => {
    setSeleccionadas((prev) =>
      prev.includes(tecnica)
        ? prev.filter((t) => t !== tecnica)
        : [...prev, tecnica]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md space-y-6">

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Asignar Técnicas
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona las tecnicas de levantamiento de requisitos que usaras
          </p>
        </div>

        <div className="space-y-3">
          {TECNICAS_DISPONIBLES.map((tecnica) => (
            <label
              key={tecnica}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={seleccionadas.includes(tecnica)}
                onChange={() => toggleTecnica(tecnica)}
              />
              <span className="text-sm">{tecnica}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            Cancelar
          </button>

          <button
            onClick={() => onGuardar(seleccionadas)}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}