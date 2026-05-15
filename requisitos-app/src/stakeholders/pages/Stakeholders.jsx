import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ListaStakeholders from "../components/ListaStakeholders";
import ModalNuevoStakeholder from "../components/ModalNuevoStakeholder";
import ModalNuevoRol from "../components/ModalRol";

const BASE_URL = "http://127.0.0.1:5000";

export default function Stakeholders() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [stakeholders,          setStakeholders]          = useState([]);
  const [roles,                 setRoles]                 = useState([]);
  const [cargando,              setCargando]              = useState(true);
  const [error,                 setError]                 = useState(null);

  const [mostrarNuevo,          setMostrarNuevo]          = useState(false);
  const [mostrarEditar,         setMostrarEditar]         = useState(false);
  const [stakeholderActivo,     setStakeholderActivo]     = useState(null);
  const [mostrarNuevoRol,       setMostrarNuevoRol]       = useState(false);
  const [modalEliminar,         setModalEliminar]         = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const lista = [];

        // Product Owner
        const resPO = await fetch(`${BASE_URL}/productowner/${id}`);
        if (resPO.ok) {
          const po = await resPO.json();
          lista.push({ nombre: po.nombre, apellidos: "", rol: "Product Owner", tipo: "Interno", correo: po.correo || "" });
        }

        // Tech Leader
        const resTL = await fetch(`${BASE_URL}/tech_leaders/${id}`);
        if (resTL.ok) {
          const tl = await resTL.json();
          lista.push({ nombre: tl.nombre, apellidos: "", rol: "Tech Leader", tipo: "Interno", correo: tl.correo || "" });
        }

        // Stakeholders del proyecto
        const resSH = await fetch(`${BASE_URL}/stakeholders/${id}`);
        if (resSH.ok) {
          const data = await resSH.json();
          data.forEach((s) =>
            lista.push({
              id_stakeholder: s.id_stakeholder,
              nombre:         s.nombre,
              apellidos:      "",
              rol:            s.rol,
              tipo:           s.tipo,
              correo:         s.email,
              telefono:       s.telefono,
              organizacion:   s.organizacion || "",
            })
          );
        }

        setStakeholders(lista);

        // Roles disponibles
        const resRoles = await fetch(`${BASE_URL}/roles/obtener`);
        if (resRoles.ok) setRoles(await resRoles.json());

      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const ejecutarEliminar = async () => {
    try {
      const res = await fetch(`${BASE_URL}/stakeholders/eliminar/${modalEliminar}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setStakeholders((prev) => prev.filter((s) => s.id_stakeholder !== modalEliminar));
      setModalEliminar(null);
    } catch (e) {
      alert(e.message);
    }
  };

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
        Cargando stakeholders...
      </div>
    </div>
  );

  if (error) return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {botonAtras}
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
    </div>
  );

  const soloStakeholders = stakeholders.filter((s) => !!s.id_stakeholder);

  return (
    <div className="space-y-7 max-w-4xl mx-auto">

      {botonAtras}

      {/* Encabezado */}
      <div className="flex items-end justify-between pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Stakeholders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Personas involucradas en el proyecto</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarNuevoRol(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300
                       rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            + Nuevo Rol
          </button>
          <button
            onClick={() => setMostrarNuevo(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700
                       text-white rounded-lg text-sm font-medium transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Nuevo Stakeholder
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-700">{stakeholders.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Internos</p>
          <p className="text-3xl font-bold text-indigo-700">
            {stakeholders.filter((s) => s.tipo === "Interno").length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Externos</p>
          <p className="text-3xl font-bold text-teal-700">
            {stakeholders.filter((s) => s.tipo === "Externo").length}
          </p>
        </div>
      </div>

      {/* Lista */}
      <ListaStakeholders
        stakeholders={stakeholders}
        onEditar={(s) => { setStakeholderActivo(s); setMostrarEditar(true); }}
        onEliminar={setModalEliminar}
      />

      {/* Modal: Nuevo stakeholder */}
      {mostrarNuevo && (
        <ModalNuevoStakeholder
          idProyecto={id}
          rolesDisponibles={roles}
          onClose={() => setMostrarNuevo(false)}
          onGuardar={(nuevo) => {
            setStakeholders((prev) => [...prev, nuevo]);
            setMostrarNuevo(false);
          }}
        />
      )}

      {/* Modal: Editar stakeholder */}
      {mostrarEditar && stakeholderActivo && (
        <ModalNuevoStakeholder
          idProyecto={id}
          modo="editar"
          stakeholderInicial={stakeholderActivo}
          rolesDisponibles={roles}
          onClose={() => { setMostrarEditar(false); setStakeholderActivo(null); }}
          onGuardar={(actualizado) => {
            setStakeholders((prev) =>
              prev.map((s) => s.id_stakeholder === actualizado.id_stakeholder ? actualizado : s)
            );
            setMostrarEditar(false);
            setStakeholderActivo(null);
          }}
        />
      )}

      {/* Modal: Nuevo rol — agrega el rol a la lista compartida */}
      {mostrarNuevoRol && (
        <ModalNuevoRol
          onClose={() => setMostrarNuevoRol(false)}
          onGuardar={(nuevoRol) => {
            setRoles((prev) => [
              ...prev,
              { id_rol: nuevoRol.id_rol ?? nuevoRol.id, nombre: nuevoRol.nombre, descripcion: nuevoRol.descripcion },
            ]);
            setMostrarNuevoRol(false);
          }}
        />
      )}

      {/* Modal: Confirmar eliminar */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">¿Eliminar stakeholder?</h2>
              <p className="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalEliminar(null)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminar}
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
