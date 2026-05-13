import { useState } from "react";
import ModalNuevoSubproceso from "../components/ModalNuevoSubproceso";
import ModalAsignarTecnicas from "./ModalAsignarTecnicas";

function ChevronIcon({ open }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 16 16" fill="none"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
      <path d="M7.5 1.5h4v4l-5.5 5.5a1 1 0 01-1.4 0L2 8.4a1 1 0 010-1.4L7.5 1.5z"
            stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="9.5" cy="4.5" r="0.7" fill="currentColor"/>
    </svg>
  );
}

export default function TarjetaProceso({
  proceso,
  stakeholders = [],
  onAgregarSubproceso,
  onAsignarTecnicas,
  onEditarProceso,
  onEditarSubproceso,
}) {
  const [mostrarModal,            setMostrarModal]            = useState(false);
  const [mostrarTecnicas,         setMostrarTecnicas]         = useState(false);
  const [subprocesoActivo,        setSubprocesoActivo]        = useState(null);
  const [mostrarEditarSubproceso, setMostrarEditarSubproceso] = useState(false);
  const [expandido,               setExpandido]               = useState(true);

  const subprocesos = proceso.subprocesos || [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

      {/* Encabezado del proceso */}
      <div className="flex justify-between items-center px-5 py-4 bg-indigo-600">
        <button
          type="button"
          className="flex items-center gap-2 text-left"
          onClick={() => setExpandido(!expandido)}
        >
          <div>
            <h3 className="font-semibold text-white text-sm">{proceso.nombre}</h3>
            <p className="text-indigo-200 text-xs mt-0.5">
              {subprocesos.length} {subprocesos.length === 1 ? "subproceso" : "subprocesos"}
            </p>
          </div>
          <span className="text-indigo-200 ml-1">
            <ChevronIcon open={expandido} />
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEditarProceso?.(proceso)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-white/15
                       hover:bg-white/25 rounded-lg transition-colors"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setMostrarModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-white
                       hover:bg-indigo-50 rounded-lg transition-colors"
          >
            + Subproceso
          </button>
        </div>
      </div>

      {/* Subprocesos */}
      {expandido && (
        subprocesos.length === 0 ? (
          <div className="px-5 py-6 text-center text-sm text-gray-400 border-t border-gray-100">
            Sin subprocesos. Agrega el primero.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {subprocesos.map((sp) => (
              <div key={sp.id} className="px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                <div className="w-0.5 self-stretch bg-indigo-200 rounded-full flex-shrink-0 mt-0.5" />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{sp.nombre}</p>
                  {sp.descripcion && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{sp.descripcion}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <TagIcon />
                      {(sp.tecnicas || []).length} técnicas
                    </span>
                    <button
                      type="button"
                      onClick={() => { setSubprocesoActivo(sp); setMostrarEditarSubproceso(true); }}
                      className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSubprocesoActivo(sp); setMostrarTecnicas(true); }}
                      className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Asignar técnicas
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal nuevo subproceso */}
      {mostrarModal && (
        <ModalNuevoSubproceso
          idProceso={proceso.id}
          stakeholders={stakeholders}
          onClose={() => setMostrarModal(false)}
          onGuardar={(subproceso) => {
            onAgregarSubproceso?.(proceso.id, subproceso);
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
          onClose={() => { setMostrarEditarSubproceso(false); setSubprocesoActivo(null); }}
          onGuardar={(subproceso) => {
            onEditarSubproceso?.(proceso.id, subprocesoActivo.id, subproceso);
            setMostrarEditarSubproceso(false);
            setSubprocesoActivo(null);
          }}
        />
      )}

      {/* Modal asignar técnicas */}
      {mostrarTecnicas && subprocesoActivo && (
        <ModalAsignarTecnicas
          tecnicasIniciales={(subprocesoActivo.tecnicas || []).map(
            (t) => (typeof t === "string" ? t : (t?.nombre ?? t))
          )}
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
