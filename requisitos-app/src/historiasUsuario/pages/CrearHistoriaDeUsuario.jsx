import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

export default function CrearHistoriaDeUsuario() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [procesos, setProcesos] = useState([]);
  const [subprocesosFiltrados, setSubprocesosFiltrados] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const [nuevoFormulario, setNuevoFormulario] = useState({
    titulo: "",
    rol: "",
    accion: "",
    beneficio: "",
    id_proceso: "",
    id_subproceso: "",
    prioridad: "media",
    estimacion: "",
    criterios: [""],
  });

  useEffect(() => {
    fetch(`${BASE_URL}/procesos/${id}`)
      .then(r => r.ok ? r.json() : [])
      .then(setProcesos)
      .catch(() => {});
  }, [id]);

  const handleCambiarProceso = (e) => {
    const idProceso = e.target.value;
    const proceso = procesos.find(p => String(p.id_proceso) === String(idProceso));
    setSubprocesosFiltrados(proceso?.subprocesos || []);
    setNuevoFormulario({ ...nuevoFormulario, id_proceso: idProceso, id_subproceso: "" });
  };

  const handleAgregarHistoria = async () => {
    if (!nuevoFormulario.titulo.trim() || !nuevoFormulario.rol.trim() ||
        !nuevoFormulario.accion.trim() || !nuevoFormulario.beneficio.trim()) {
      alert("Completa los campos obligatorios.");
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch(`${BASE_URL}/historias-usuario/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_proyecto: parseInt(id),
          id_subproceso: nuevoFormulario.id_subproceso ? parseInt(nuevoFormulario.id_subproceso) : null,
          titulo: nuevoFormulario.titulo,
          rol: nuevoFormulario.rol,
          accion: nuevoFormulario.accion,
          beneficio: nuevoFormulario.beneficio,
          prioridad: nuevoFormulario.prioridad,
          estimacion: nuevoFormulario.estimacion || null,
          criterios: nuevoFormulario.criterios.filter(c => c.trim()),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear");
      }
      navegar(`/app/proyectos/${id}/requerimientos/historias-usuario`);
    } catch (e) {
      alert(e.message);
    } finally {
      setGuardando(false);
    }
  };

  const agregarCriterio = () => {
    setNuevoFormulario({
      ...nuevoFormulario,
      criterios: [...nuevoFormulario.criterios, ""],
    });
  };

  const actualizarCriterio = (index, valor) => {
    const nuevosCriterios = [...nuevoFormulario.criterios];
    nuevosCriterios[index] = valor;
    setNuevoFormulario({
      ...nuevoFormulario,
      criterios: nuevosCriterios,
    });
  };

  const eliminarCriterio = (index) => {
    if (nuevoFormulario.criterios.length > 1)
      setNuevoFormulario({
        ...nuevoFormulario,
        criterios: nuevoFormulario.criterios.filter((_, i) => i !== index),
      });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con botón atrás */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/historias-usuario`)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Historias de Usuario
          </h1>
          <p className="text-gray-600 mt-1">(2)</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título de la Historia <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nuevoFormulario.titulo}
            onChange={(e) =>
              setNuevoFormulario({
                ...nuevoFormulario,
                titulo: e.target.value,
              })
            }
            placeholder="Ej: Registro de usuario en el sistema"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proceso
            </label>
            <select
              value={nuevoFormulario.id_proceso}
              onChange={handleCambiarProceso}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Selecciona un proceso</option>
              {procesos.map(p => (
                <option key={p.id_proceso} value={p.id_proceso}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subproceso
            </label>
            <select
              value={nuevoFormulario.id_subproceso}
              onChange={e => setNuevoFormulario({ ...nuevoFormulario, id_subproceso: e.target.value })}
              disabled={!nuevoFormulario.id_proceso}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {nuevoFormulario.id_proceso ? "Selecciona un subproceso" : "Primero elige un proceso"}
              </option>
              {subprocesosFiltrados.map(sp => (
                <option key={sp.id_subproceso} value={sp.id_subproceso}>{sp.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-bold text-indigo-600">
            Formato: Como [rol], quiero [acción], para que [beneficio]
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Como... (rol del usuario) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nuevoFormulario.rol}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  rol: e.target.value,
                })
              }
              placeholder="Ej: usuario del sistema"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quiero... (acción que desea realizar) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nuevoFormulario.accion}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  accion: e.target.value,
                })
              }
              placeholder="Ej: poder restablecer mi contraseña"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Para que... (beneficio o valor) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nuevoFormulario.beneficio}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  beneficio: e.target.value,
                })
              }
              placeholder="Ej: pueda acceder nuevamente a mi cuenta"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad <span className="text-red-500">*</span>
            </label>
            <select
              value={nuevoFormulario.prioridad}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  prioridad: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimación (opcional)
            </label>
            <input
              type="text"
              value={nuevoFormulario.estimacion}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  estimacion: e.target.value,
                })
              }
              placeholder="Ej: 5 puntos, 2 días, etc."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Criterios de Aceptación <span className="text-red-500">*</span>
            </label>
            <button
              onClick={agregarCriterio}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              + Agregar criterio
            </button>
          </div>
          <div className="space-y-2">
            {nuevoFormulario.criterios.map((criterio, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={criterio}
                  onChange={(e) => actualizarCriterio(index, e.target.value)}
                  placeholder={`Criterio ${index + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {nuevoFormulario.criterios.length > 1 && (
                  <button
                    onClick={() => eliminarCriterio(index)}
                    className="px-3 py-2 text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleAgregarHistoria}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition"
          >
            Crear Historia de Usuario
          </button>
          <button
            onClick={() => navegar(`/app/proyectos/${id}/requerimientos/historias-usuario`)}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
