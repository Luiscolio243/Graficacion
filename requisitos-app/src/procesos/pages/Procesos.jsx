import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ListaProcesos from "../components/ListaProcesos";
import ModalNuevoProceso from "../components/ModalNuevoProceso";

const BASE_URL = "http://127.0.0.1:5000";

export default function Procesos() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [procesos,    setProcesos]    = useState([]);
  const [equipoTI,    setEquipoTI]    = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [error,       setError]       = useState(null);

  const [mostrarNuevo,  setMostrarNuevo]  = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [procesoActivo, setProcesoActivo] = useState(null);

  const [modalEliminarProceso,    setModalEliminarProceso]    = useState(null); // id_proceso
  const [modalEliminarSubproceso, setModalEliminarSubproceso] = useState(null); // { id_proceso, id_subproceso }

  useEffect(() => {
    const cargar = async () => {
      if (!id) return;
      try {
        const [resProcesos, resTI, resStakeholders] = await Promise.all([
          fetch(`${BASE_URL}/procesos/${id}`),
          fetch(`${BASE_URL}/ti/${id}`),
          fetch(`${BASE_URL}/stakeholders/${id}`),
        ]);
        if (!resProcesos.ok) throw new Error("Error al cargar procesos");
        const dataProcesos = await resProcesos.json();
        setProcesos(dataProcesos.map((p) => ({
          ...p,
          id: p.id_proceso,
          subprocesos: (p.subprocesos || []).map((sp) => ({ ...sp, id: sp.id_subproceso })),
        })));
        if (resTI.ok)           setEquipoTI(await resTI.json());
        if (resStakeholders.ok) setStakeholders(await resStakeholders.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const onAgregarSubproceso = (idProceso, subproceso) => {
    setProcesos((prev) =>
      prev.map((p) =>
        p.id === idProceso
          ? { ...p, subprocesos: [...(p.subprocesos || []), { ...subproceso, tecnicas: subproceso.tecnicas || [] }] }
          : p
      )
    );
  };

  const onAsignarTecnicas = (idProceso, idSubproceso, tecnicas) => {
    setProcesos((prev) =>
      prev.map((p) =>
        p.id === idProceso
          ? { ...p, subprocesos: (p.subprocesos || []).map((sp) => sp.id === idSubproceso ? { ...sp, tecnicas } : sp) }
          : p
      )
    );
  };

  const onEditarSubproceso = (idProceso, idSubproceso, subprocesoActualizado) => {
    setProcesos((prev) =>
      prev.map((p) =>
        p.id === idProceso
          ? { ...p, subprocesos: (p.subprocesos || []).map((sp) => sp.id === idSubproceso ? { ...sp, ...subprocesoActualizado } : sp) }
          : p
      )
    );
  };

  const ejecutarEliminarProceso = async () => {
    try {
      const res = await fetch(`${BASE_URL}/procesos/eliminar/${modalEliminarProceso}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar proceso");
      setProcesos((prev) => prev.filter((p) => p.id !== modalEliminarProceso));
      setModalEliminarProceso(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const ejecutarEliminarSubproceso = async () => {
    const { id_proceso, id_subproceso } = modalEliminarSubproceso;
    try {
      const res = await fetch(`${BASE_URL}/subprocesos/eliminar/${id_subproceso}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar subproceso");
      setProcesos((prev) =>
        prev.map((p) =>
          p.id === id_proceso
            ? { ...p, subprocesos: (p.subprocesos || []).filter((sp) => sp.id !== id_subproceso) }
            : p
        )
      );
      setModalEliminarSubproceso(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const totalSubprocesos = procesos.reduce((acc, p) => acc + (p.subprocesos || []).length, 0);
  const totalTecnicas    = procesos.reduce(
    (acc, p) => acc + (p.subprocesos || []).reduce((a, sp) => a + (sp.tecnicas || []).length, 0), 0
  );

  const botonAtras = (
    <button
      onClick={() => navigate(`/app/proyectos/${id}`)}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Volver al proyecto
    </button>
  );

  if (cargando) return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {botonAtras}
      <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
        Cargando procesos...
      </div>
    </div>
  );

  if (error) return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {botonAtras}
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
    </div>
  );

  return (
    <div className="space-y-7 max-w-4xl mx-auto">

      {botonAtras}

      {/* Encabezado */}
      <div className="flex items-end justify-between pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Procesos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Define los procesos, subprocesos y técnicas a aplicar</p>
        </div>
        <button
          onClick={() => setMostrarNuevo(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700
                     text-white rounded-lg text-sm font-medium transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Agregar Proceso
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Procesos</p>
          <p className="text-3xl font-bold text-gray-700">{procesos.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Subprocesos</p>
          <p className="text-3xl font-bold text-indigo-700">{totalSubprocesos}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Técnicas asignadas</p>
          <p className="text-3xl font-bold text-teal-700">{totalTecnicas}</p>
        </div>
      </div>

      {/* Lista */}
      <ListaProcesos
        procesos={procesos}
        stakeholders={stakeholders}
        onAgregarSubproceso={onAgregarSubproceso}
        onAsignarTecnicas={onAsignarTecnicas}
        onEditarProceso={(p) => { setProcesoActivo(p); setMostrarEditar(true); }}
        onEditarSubproceso={onEditarSubproceso}
        onEliminarProceso={setModalEliminarProceso}
        onEliminarSubproceso={setModalEliminarSubproceso}
      />

      {/* Modal: Nuevo proceso */}
      {mostrarNuevo && (
        <ModalNuevoProceso
          listaTI={equipoTI}
          onClose={() => setMostrarNuevo(false)}
          onGuardar={async (form) => {
            const res = await fetch(`${BASE_URL}/procesos/crear`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id_proyecto:  parseInt(id, 10),
                nombre:       form.nombre,
                descripcion:  form.descripcion || null,
                area:         form.area || null,
                responsableId: form.responsableId ? parseInt(form.responsableId, 10) : null,
              }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error || "Error al crear proceso");
            }
            const data = await res.json();
            setProcesos((prev) => [
              ...prev,
              {
                id:           data.id_proceso,
                nombre:       data.nombre,
                descripcion:  form.descripcion,
                area:         form.area,
                responsableId: form.responsableId,
                subprocesos:  [],
              },
            ]);
            setMostrarNuevo(false);
          }}
        />
      )}

      {/* Modal: Editar proceso */}
      {mostrarEditar && procesoActivo && (
        <ModalNuevoProceso
          modo="editar"
          procesoInicial={procesoActivo}
          listaTI={equipoTI}
          onClose={() => { setMostrarEditar(false); setProcesoActivo(null); }}
          onGuardar={async (cambios) => {
            const res = await fetch(`${BASE_URL}/procesos/${procesoActivo.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nombre:       cambios.nombre,
                descripcion:  cambios.descripcion || null,
                area:         cambios.area || null,
                responsableId: cambios.responsableId ? parseInt(cambios.responsableId, 10) : null,
              }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error || "Error al editar proceso");
            }
            const data = await res.json();
            setProcesos((prev) =>
              prev.map((p) => p.id === procesoActivo.id ? { ...p, ...data.proceso } : p)
            );
            setMostrarEditar(false);
            setProcesoActivo(null);
          }}
        />
      )}

      {/* Modal: Confirmar eliminar proceso */}
      {modalEliminarProceso && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">¿Eliminar proceso?</h2>
              <p className="text-sm text-gray-500 mt-2">Se eliminarán también todos sus subprocesos y técnicas asignadas.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalEliminarProceso(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminarProceso}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar eliminar subproceso */}
      {modalEliminarSubproceso && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">¿Eliminar subproceso?</h2>
              <p className="text-sm text-gray-500 mt-2">Se eliminarán también las técnicas asignadas a este subproceso.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalEliminarSubproceso(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminarSubproceso}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
