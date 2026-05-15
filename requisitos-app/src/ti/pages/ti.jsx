import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ListaTI from "../components/ListaTI";
import ModalNuevoTI from "../components/ModalNuevoTI";
import ModalNuevoRol from "../components/ModalRol";

const BASE_URL = "http://127.0.0.1:5000";

export default function TI() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [ti,            setTI]            = useState([]);
  const [roles,         setRoles]         = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [error,         setError]         = useState(null);

  const [mostrarNuevo,  setMostrarNuevo]  = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [tiActivo,      setTiActivo]      = useState(null);
  const [mostrarRol,    setMostrarRol]    = useState(false);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [passwordInfo,  setPasswordInfo]  = useState(null); // { email, password }

  useEffect(() => {
    const cargar = async () => {
      try {
        const [respTI, respRoles] = await Promise.all([
          fetch(`${BASE_URL}/ti/${id}`),
          fetch(`${BASE_URL}/roles/obtener`),
        ]);
        if (!respTI.ok)    throw new Error("Error al obtener equipo de TI");
        if (!respRoles.ok) throw new Error("Error al obtener roles");
        setTI(await respTI.json());
        setRoles(await respRoles.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const crearIntegrante = async (form) => {
    const res = await fetch(`${BASE_URL}/ti/${id}/crear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre:   form.nombre,
        apellido: form.apellido,
        email:    form.email,
        id_rol:   form.id_rol,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Error al crear integrante TI");
    }
    return await res.json();
  };

  const ejecutarEliminar = async () => {
    try {
      const res = await fetch(`${BASE_URL}/ti/eliminar/${modalEliminar}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      setTI((prev) => prev.filter((x) => x.id_personal_ti !== modalEliminar));
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
        Cargando equipo de TI...
      </div>
    </div>
  );

  if (error) return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {botonAtras}
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
    </div>
  );

  const activos   = ti.filter((x) => x.activo !== false).length;
  const inactivos = ti.length - activos;

  return (
    <div className="space-y-7 max-w-4xl mx-auto">

      {botonAtras}

      {/* Encabezado */}
      <div className="flex items-end justify-between pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Equipo de TI</h1>
          <p className="text-sm text-gray-500 mt-0.5">Integrantes técnicos del proyecto</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMostrarRol(true)}
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
            Nuevo Integrante
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total</p>
          <p className="text-3xl font-bold text-gray-700">{ti.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Activos</p>
          <p className="text-3xl font-bold text-indigo-700">{activos}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Roles disponibles</p>
          <p className="text-3xl font-bold text-teal-700">{roles.length}</p>
        </div>
      </div>

      {/* Lista */}
      <ListaTI
        ti={ti}
        onEditar={(persona) => { setTiActivo(persona); setMostrarEditar(true); }}
        onEliminar={setModalEliminar}
      />

      {/* Modal: Nuevo integrante */}
      {mostrarNuevo && (
        <ModalNuevoTI
          roles={roles}
          onClose={() => setMostrarNuevo(false)}
          onGuardar={async (form) => {
            const data = await crearIntegrante(form);
            setTI((prev) => [data.personal_ti, ...prev]);
            setMostrarNuevo(false);
            if (data.usuario_creado && data.password_temporal) {
              setPasswordInfo({ email: data.personal_ti.usuario.email, password: data.password_temporal });
            }
          }}
        />
      )}

      {/* Modal: Editar integrante */}
      {mostrarEditar && tiActivo && (
        <ModalNuevoTI
          modo="editar"
          tiInicial={tiActivo}
          roles={roles}
          onClose={() => { setMostrarEditar(false); setTiActivo(null); }}
          onGuardar={async (cambios) => {
            const res = await fetch(`${BASE_URL}/ti/editar/${tiActivo.id_personal_ti}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nombre:   cambios.nombre,
                apellido: cambios.apellido,
                email:    cambios.email,
                id_rol:   cambios.id_rol,
              }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error || "Error al editar integrante TI");
            }
            const data = await res.json();
            setTI((prev) =>
              prev.map((x) => x.id_personal_ti === data.personal_ti.id_personal_ti ? data.personal_ti : x)
            );
            setMostrarEditar(false);
            setTiActivo(null);
          }}
        />
      )}

      {/* Modal: Nuevo rol */}
      {mostrarRol && (
        <ModalNuevoRol
          onClose={() => setMostrarRol(false)}
          onGuardar={(rol) => {
            setRoles((prev) => [...prev, { id_rol: rol.id_rol ?? rol.id, nombre: rol.nombre, descripcion: rol.descripcion }]);
            setMostrarRol(false);
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
              <h2 className="text-lg font-bold text-gray-900">¿Eliminar integrante?</h2>
              <p className="text-sm text-gray-500 mt-2">Se eliminará del equipo TI de este proyecto. El usuario del sistema no se elimina.</p>
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

      {/* Modal: Contraseña temporal */}
      {passwordInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mx-auto">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">Usuario creado</h2>
              <p className="text-sm text-gray-500 mt-1">
                Se creó un acceso para <span className="font-medium text-gray-800">{passwordInfo.email}</span>
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Contraseña temporal</p>
              <p className="font-mono text-lg font-bold text-indigo-700 tracking-widest">{passwordInfo.password}</p>
            </div>
            <p className="text-xs text-gray-400 text-center">Copia esta contraseña ahora — no se mostrará de nuevo.</p>
            <button
              onClick={() => setPasswordInfo(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
