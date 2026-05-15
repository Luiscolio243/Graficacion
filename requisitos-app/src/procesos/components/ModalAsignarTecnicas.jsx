import { useState } from "react";

const BASE_URL = "http://127.0.0.1:5000";

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
  const [guardando,     setGuardando]     = useState(false);
  const [error,         setError]         = useState(null);

  const toggleTecnica = (tecnica) => {
    setSeleccionadas((prev) =>
      prev.includes(tecnica) ? prev.filter((t) => t !== tecnica) : [...prev, tecnica]
    );
  };

  const handleGuardar = async () => {
    if (seleccionadas.length === 0) { setError("Selecciona al menos una técnica."); return; }
    setError(null);
    setGuardando(true);
    try {
      const res = await fetch(`${BASE_URL}/subprocesos/asignar-tecnicas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_subproceso: idSubproceso, tecnicas: seleccionadas }),
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
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Asignar técnicas</h2>
            <p className="text-xs text-gray-400 mt-0.5">Selecciona las técnicas de levantamiento de requisitos</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-2">
          {TECNICAS_DISPONIBLES.map((tecnica) => {
            const activa = seleccionadas.includes(tecnica);
            return (
              <button
                key={tecnica}
                type="button"
                onClick={() => toggleTecnica(tecnica)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left text-sm transition-colors ${
                  activa
                    ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${
                  activa ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"
                }`}>
                  {activa && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                {tecnica}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mx-6 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={guardando}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {guardando ? "Guardando..." : `Guardar${seleccionadas.length > 0 ? ` (${seleccionadas.length})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
