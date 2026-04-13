import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CrearObservacion() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [nuevoFormulario, setNuevoFormulario] = useState({
    titulo: "",
    observaciones: "",
    puntos: [],
    proceso: "",
    subproceso: "",
  });

  const handleAgregarObservacion = () => {
    if (
      nuevoFormulario.titulo.trim() &&
      nuevoFormulario.observaciones.trim()
    ) {
      console.log("Crear observación:", nuevoFormulario);
      navegar(`/app/proyectos/${id}/requerimientos/observaciones`);
    }
  };

  const agregarPunto = () => {
    setNuevoFormulario({
      ...nuevoFormulario,
      puntos: [...nuevoFormulario.puntos, ""],
    });
  };

  const actualizarPunto = (index, valor) => {
    const nuevosPuntos = [...nuevoFormulario.puntos];
    nuevosPuntos[index] = valor;
    setNuevoFormulario({
      ...nuevoFormulario,
      puntos: nuevosPuntos,
    });
  };

  const eliminarPunto = (index) => {
    if (nuevoFormulario.puntos.length > 0) {
      const nuevosPuntos = nuevoFormulario.puntos.filter(
        (_, i) => i !== index
      );
      setNuevoFormulario({
        ...nuevoFormulario,
        puntos: nuevosPuntos,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con botón atrás */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/observaciones`)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nota Rápida</h1>
          <p className="text-gray-600 mt-1">
            Registra observaciones y hallazgos de campo
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
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
            placeholder="Ej: Observación en recepción"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones <span className="text-red-500">*</span>
          </label>
          <textarea
            value={nuevoFormulario.observaciones}
            onChange={(e) =>
              setNuevoFormulario({
                ...nuevoFormulario,
                observaciones: e.target.value,
              })
            }
            placeholder="Escribe tus observaciones aquí..."
            rows="6"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Hallazgos o Puntos Clave (Opcional)
            </label>
            <button
              onClick={agregarPunto}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              + Añadir
            </button>
          </div>
          <div className="space-y-2">
            {nuevoFormulario.puntos.map((punto, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={punto}
                  onChange={(e) => actualizarPunto(index, e.target.value)}
                  placeholder={`Punto ${index + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {nuevoFormulario.puntos.length > 0 && (
                  <button
                    onClick={() => eliminarPunto(index)}
                    className="px-3 py-2 text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proceso <span className="text-red-500">*</span>
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subproceso (opcional)
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleAgregarObservacion}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition"
          >
            Guardar Nota
          </button>
          <button
            onClick={() => navegar(`/app/proyectos/${id}/requerimientos/observaciones`)}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
