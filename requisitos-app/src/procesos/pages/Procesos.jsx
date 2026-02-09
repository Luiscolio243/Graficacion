// Pantalla de Procesos

import { useState } from "react";
import ListaProcesos from "../components/ListaProcesos";
import ModalNuevoProceso from "../components/ModalNuevoProceso";

export default function Procesos() {

  const [mostrarNuevoProceso, setMostrarNuevoProceso] = useState(false);

  // datos de prueba
  const [procesos, setProcesos] = useState([]);

  const onAgregarSubproceso = (idProceso, subproceso) => {
    setProcesos((prev) =>
      prev.map((p) =>
        p.id === idProceso
          ? {
              ...p,
              subprocesos: [
                ...p.subprocesos,
                { ...subproceso, tecnicas: [] },
              ],
            }
          : p
      )
    );
  };

  const onAsignarTecnicas = (idProceso, idSubproceso, tecnicas) => {
    setProcesos((prev) =>
        prev.map((p) =>
        p.id === idProceso
            ? {
                ...p,
                subprocesos: p.subprocesos.map((sp) =>
                sp.id === idSubproceso
                    ? { ...sp, tecnicas }
                    : sp
                ),
            }
            : p
        )
    );
    };

  
  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Procesos
          </h1>
          <p className="text-sm text-gray-500">
            Define los procesos, subprocesos y que tecnicas aplicaras
          </p>
        </div>

        <button
          onClick={() => setMostrarNuevoProceso(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
        >
          + Agregar Proceso
        </button>
      </div>

      {/* Lista */}
      <ListaProcesos procesos={procesos} onAgregarSubproceso={onAgregarSubproceso} onAsignarTecnicas={onAsignarTecnicas}/>

      {/* Modal */}
      {mostrarNuevoProceso && (
        <ModalNuevoProceso
          onClose={() => setMostrarNuevoProceso(false)}
          onGuardar={(nuevoProceso) => {
            setProcesos([
              ...procesos,
              { ...nuevoProceso, subprocesos: [] }
            ]);
            setMostrarNuevoProceso(false);
          }}
        />
      )}
    </div>
  );
}