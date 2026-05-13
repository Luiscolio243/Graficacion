// Pantalla de Procesos

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ListaProcesos from "../components/ListaProcesos";
import ModalNuevoProceso from "../components/ModalNuevoProceso";

export default function Procesos() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mostrarNuevoProceso, setMostrarNuevoProceso] = useState(false);
  const [mostrarEditarProceso, setMostrarEditarProceso] = useState(false);
  const [procesoActivo, setProcesoActivo] = useState(null);
  const [procesos, setProcesos] = useState([]);
  const [equipoTI, setEquipoTI] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      if (!id) return;
      try {
        const [resProcesos, resTI, resStakeholders] = await Promise.all([
          fetch(`http://127.0.0.1:5000/procesos/${id}`),
          fetch(`http://127.0.0.1:5000/ti/${id}`),
          fetch(`http://127.0.0.1:5000/stakeholders/${id}`),
        ]);
        if (resProcesos.ok) {
          const data = await resProcesos.json();
          setProcesos(data.map(p => ({
            ...p,
            id: p.id_proceso,
            subprocesos: (p.subprocesos || []).map(sp => ({
              ...sp,
              id: sp.id_subproceso,
            }))
          })));
        }
        if (resTI.ok) {
          const data = await resTI.json();
          setEquipoTI(data);
        }
        if (resStakeholders.ok) {
          const data = await resStakeholders.json();
          setStakeholders(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  const onAgregarSubproceso = (idProceso, subproceso) => {
    setProcesos((prev) =>
      prev.map((p) =>
        p.id === idProceso
          ? {
              ...p,
              subprocesos: [
                ...(p.subprocesos || []),
                { ...subproceso, tecnicas: subproceso.tecnicas || [] },
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
              subprocesos: (p.subprocesos || []).map((sp) =>
                sp.id === idSubproceso
                  ? { ...sp, tecnicas }
                  : sp
              ),
            }
          : p
      )
    );
  };

  const onEditarSubproceso = (idProceso, idSubproceso, subprocesoActualizado) => {
    setProcesos((prev) =>
      prev.map((p) =>
        p.id === idProceso
          ? {
              ...p,
              subprocesos: (p.subprocesos || []).map((sp) =>
                sp.id === idSubproceso ? { ...sp, ...subprocesoActualizado } : sp
              ),
            }
          : p
      )
    );
  };

  if (loading) {
    return <div className="text-gray-500">Cargando procesos...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Botón de regreso */}
      <button
        onClick={() => navigate(`/app/proyectos/${id}`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver al proyecto
      </button>

      {/* Encabezado */}
      <div className="flex justify-between items-end pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Procesos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Define los procesos, subprocesos y las técnicas a aplicar</p>
        </div>
        <button
          onClick={() => setMostrarNuevoProceso(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700
                     text-white rounded-md text-sm font-medium transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Agregar Proceso
        </button>
      </div>

      {/* Lista */}
      <ListaProcesos
        procesos={procesos}
        stakeholders={stakeholders}
        onAgregarSubproceso={onAgregarSubproceso}
        onAsignarTecnicas={onAsignarTecnicas}
        onEditarProceso={(p) => {
          setProcesoActivo(p);
          setMostrarEditarProceso(true);
        }}
        onEditarSubproceso={onEditarSubproceso}
      />

      {/* Modal */}
      {mostrarNuevoProceso && (
        <ModalNuevoProceso
          listaTI={equipoTI}
          idProyecto={id}
          onClose={() => setMostrarNuevoProceso(false)}
          onGuardar={async (nuevoProceso) => {
            try {
              const res = await fetch("http://127.0.0.1:5000/procesos/crear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id_proyecto: parseInt(id, 10),
                  nombre: nuevoProceso.nombre,
                  descripcion: nuevoProceso.descripcion,
                  objetivo: nuevoProceso.objetivo || null,
                  area: nuevoProceso.area || null,
                  responsableId: nuevoProceso.responsableId ? parseInt(nuevoProceso.responsableId, 10) : null,
                }),
              });
              if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Error al crear proceso");
              }
              const data = await res.json();
              setProcesos([
                ...procesos,
                {
                  id: data.id_proceso,
                  nombre: data.nombre,
                  descripcion: nuevoProceso.descripcion,
                  area: nuevoProceso.area,
                  responsableId: nuevoProceso.responsableId,
                  subprocesos: [],
                },
              ]);
              setMostrarNuevoProceso(false);
            } catch (e) {
              console.error(e);
              alert(e.message || "Error al crear el proceso");
            }
          }}
        />
      )}

      {/* Modal editar proceso */}
      {mostrarEditarProceso && procesoActivo && (
        <ModalNuevoProceso
          modo="editar"
          procesoInicial={procesoActivo}
          listaTI={equipoTI}
          onClose={() => {
            setMostrarEditarProceso(false);
            setProcesoActivo(null);
          }}
          onGuardar={async (cambios) => {
            try {
              const res = await fetch(`http://127.0.0.1:5000/procesos/${procesoActivo.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  nombre: cambios.nombre,
                  descripcion: cambios.descripcion,
                  objetivo: cambios.objetivo || null,
                  area: cambios.area || null,
                  responsableId: cambios.responsableId ? parseInt(cambios.responsableId, 10) : null,
                }),
              });
              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Error al editar proceso");
              }
              const data = await res.json();
              setProcesos((prev) =>
                prev.map((p) =>
                  p.id === procesoActivo.id ? { ...p, ...data.proceso } : p
                )
              );
              setMostrarEditarProceso(false);
              setProcesoActivo(null);
            } catch (e) {
              console.error(e);
              alert(e.message || "Error al editar el proceso");
            }
          }}
        />
      )}
    </div>
  );
}