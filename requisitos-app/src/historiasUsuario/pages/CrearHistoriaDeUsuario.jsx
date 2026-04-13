import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CrearHistoriaDeUsuario() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [nuevoFormulario, setNuevoFormulario] = useState({
    titulo: "",
    rol: "",
    accion: "",
    beneficio: "",
    proceso: "",
    subproceso: "",
    prioridad: "media",
    estimacion: "",
    criterios: [""],
  });

  const handleAgregarHistoria = () => {
    if (
      nuevoFormulario.titulo.trim() &&
      nuevoFormulario.rol.trim() &&
      nuevoFormulario.accion.trim() &&
      nuevoFormulario.beneficio.trim() &&
      nuevoFormulario.prioridad.trim()
    ) {
      console.log("Crear historia de usuario:", nuevoFormulario);
      navegar(`/app/proyectos/${id}/requerimientos/historias-usuario`);
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
    if (nuevoFormulario.criterios.length > 1) {
      const nuevosCriterios = nuevoFormulario.criterios.filter(
        (_, i) => i !== index
      );
      setNuevoFormulario({
        ...nuevoFormulario,
        criterios: nuevosCriterios,
      });
    }
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
            <input
              type="text"
              value={nuevoFormulario.proceso}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  proceso: e.target.value,
                })
              }
              placeholder="Selecciona un proceso"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subproceso
            </label>
            <input
              type="text"
              value={nuevoFormulario.subproceso}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  subproceso: e.target.value,
                })
              }
              placeholder="Selecciona un subproceso"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
