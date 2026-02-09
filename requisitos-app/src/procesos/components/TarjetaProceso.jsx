import { useState } from "react";
import ModalNuevoSubproceso from "../components/ModalNuevoSubproceso";
import ModalAsignarTecnicas from "./ModalAsignarTecnicas";

export default function TarjetaProceso({ proceso, onAgregarSubproceso, onAsignarTecnicas }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarSubproceso, setMostrarSubproceso] = useState(false);
  const [mostrarTecnicas, setMostrarTecnicas] = useState(false);
  const [subprocesoActivo, setSubprocesoActivo] = useState(null);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

      {/* Encabezado */}
      <div className="flex justify-between items-center px-5 py-4 bg-indigo-500 text-white">
        <div>
          <h3 className="font-medium">
            {proceso.nombre}
          </h3>
          <p className="text-sm text-indigo-100">
            {(proceso.subprocesos || []).length} subprocesos
          </p>
        </div>

        <button 
            onClick={() => setMostrarModal(true)}
            className="px-3 py-1 text-sm bg-white/20 rounded-lg">
            + Agregar Subproceso
        </button>
      </div>

      {/* Subprocesos */}
      {(proceso.subprocesos || []).length === 0 ? (
        <p className="text-sm text-gray-500">
          No hay subprocesos
        </p>
      ) : (
        <div className="space-y-3">
          {proceso.subprocesos.map((sp) => (
            <div
              key={sp.id}
              className="border rounded-lg p-4"
            >
              <h4 className="font-medium text-gray-800">
                {sp.nombre}
              </h4>

              {sp.descripcion && (
                <p className="text-sm text-gray-500 mt-1">
                  {sp.descripcion}
                </p>
              )}

              <p className="text-xs text-gray-400 mt-2">
                {sp.tecnicas.length} técnicas asignadas
              </p>

              <button
                onClick={() => {
                    setSubprocesoActivo(sp);
                    setMostrarTecnicas(true);
                }}
                className="text-sm text-indigo-600 hover:underline"
                >
                Asignar técnicas
                </button>
            </div>
          ))}
        </div>
      )}

      {/*Modal que crear un nuevo subproceso*/}
      {mostrarModal && (
        <ModalNuevoSubproceso
          onClose={() => setMostrarModal(false)} // Cierra el modal de subproceso
          onGuardar={(subproceso) => { //se guarda el nuevo subproceso
            // si onAgregarSubproceso no llega, aqui se notarioa
            if (!onAgregarSubproceso) return;
            // Se agrega el subproceso al proceso correspondiente
            onAgregarSubproceso(proceso.id, subproceso);
            setMostrarModal(false); //cierra modal
          }}
        />
      )}

      {/* Modal asigna tecnicas a un subproceso */}
      {mostrarTecnicas && subprocesoActivo && (
        <ModalAsignarTecnicas
          tecnicasIniciales={subprocesoActivo.tecnicas} //tecnicas que ya tiene asignadas
          onClose={() => setMostrarTecnicas(false)} //cierra modal
          onGuardar={(tecnicas) => { //guarda las tecnicas que se seleccionaron
            //se ponen las tecnicas al subproceso dentro del proceso
            onAsignarTecnicas(proceso.id, subprocesoActivo.id, tecnicas); 
            setMostrarTecnicas(false); //cierra modal
          }}
        />
      )}
    </div>
  );
}