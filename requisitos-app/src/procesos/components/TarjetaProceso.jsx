import { useState } from "react";
import ModalNuevoSubproceso from "../components/ModalNuevoSubproceso";
import ModalAsignarTecnicas from "./ModalAsignarTecnicas";

export default function TarjetaProceso({
  proceso,
  stakeholders = [],
  onAgregarSubproceso,
  onAsignarTecnicas,
  onEditarProceso,
  onEditarSubproceso,
}) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarSubproceso, setMostrarSubproceso] = useState(false);
  const [mostrarTecnicas, setMostrarTecnicas] = useState(false);
  const [subprocesoActivo, setSubprocesoActivo] = useState(null);
  const [mostrarEditarSubproceso, setMostrarEditarSubproceso] = useState(false);

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEditarProceso?.(proceso)}
            className="px-3 py-1 text-sm bg-white/20 rounded-lg"
          >
            Editar
          </button>

          <button 
              onClick={() => setMostrarModal(true)}
              className="px-3 py-1 text-sm bg-white/20 rounded-lg">
              + Agregar Subproceso
          </button>
        </div>
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
                {(sp.tecnicas || []).length} técnicas asignadas
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubprocesoActivo(sp);
                    setMostrarEditarSubproceso(true);
                  }}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Editar
                </button>

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
            </div>
          ))}
        </div>
      )}

      {/*Modal que crear un nuevo subproceso*/}
      {mostrarModal && (
        <ModalNuevoSubproceso
          idProceso={proceso.id}
          stakeholders={stakeholders}
          onClose={() => setMostrarModal(false)}
          onGuardar={(subproceso) => {
            if (!onAgregarSubproceso) return;
            onAgregarSubproceso(proceso.id, subproceso);
            setMostrarModal(false);
          }}
        />
      )}

      {/* Modal editar subproceso */}
      {mostrarEditarSubproceso && subprocesoActivo && (
        <ModalNuevoSubproceso
          modo="editar"
          idProceso={proceso.id}
          stakeholders={stakeholders}
          subprocesoInicial={subprocesoActivo}
          onClose={() => {
            setMostrarEditarSubproceso(false);
            setSubprocesoActivo(null);
          }}
          onGuardar={(subproceso) => {
            onEditarSubproceso?.(proceso.id, subprocesoActivo.id, subproceso);
            setMostrarEditarSubproceso(false);
            setSubprocesoActivo(null);
          }}
        />
      )}

      {/* Modal asigna tecnicas a un subproceso */}
      {mostrarTecnicas && subprocesoActivo && (
        <ModalAsignarTecnicas
          tecnicasIniciales={(subprocesoActivo.tecnicas || []).map((t) => (typeof t === "string" ? t : (t?.nombre ?? t)))}
          idSubproceso={subprocesoActivo.id}
          onClose={() => setMostrarTecnicas(false)}
          onGuardar={(tecnicas) => {
            onAsignarTecnicas(proceso.id, subprocesoActivo.id, tecnicas);
            setMostrarTecnicas(false);
          }}
        />
      )}
    </div>
  );
}