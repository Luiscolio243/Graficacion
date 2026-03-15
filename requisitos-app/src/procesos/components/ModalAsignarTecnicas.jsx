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
  idSubproceso,
  onClose,
  onGuardar,
  tecnicasIniciales = [],
}) {
  const [seleccionadas, setSeleccionadas] = useState(tecnicasIniciales);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const toggleTecnica = (tecnica) => {
    setSeleccionadas((prev) =>
      prev.includes(tecnica)  //si la tecnica ya esta seleccionada 
        ? prev.filter((t) => t !== tecnica)//se elimina del arreglo
        : [...prev, tecnica] //si no esta seleccionada se agrega
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md space-y-6">

        <div>
          {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
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
            disabled={guardando}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            Cancelar
          </button>

          <button
            disabled={guardando || seleccionadas.length === 0}
            onClick={async () => {
              if (seleccionadas.length === 0) return;
              setError(null);
              setGuardando(true);
              try {
                const res = await fetch("http://127.0.0.1:5000/subprocesos/asignar-tecnicas", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id_subproceso: idSubproceso,
                    tecnicas: seleccionadas,
                  }),
                });
                if (!res.ok) {
                  const err = await res.json();
                  throw new Error(err.error || "Error al asignar técnicas");
                }
                const data = await res.json();
                onGuardar(data.tecnicas);
                onClose();
              } catch (e) {
                setError(e.message);
              } finally {
                setGuardando(false);
              }
            }}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-70"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}