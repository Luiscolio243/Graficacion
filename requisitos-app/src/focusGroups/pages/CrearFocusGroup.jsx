import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CrearFocusGroup() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [nuevoFormulario, setNuevoFormulario] = useState({
    titulo: "",
    moderador: "",
    tipoMedia: "",
    objetivo: "",
    transcripcion: "",
    proceso: "",
    subproceso: "",
    participantes: [""],
    conclusiones: [""],
  });

  const handleAgregarFocusGroup = () => {
    if (
      nuevoFormulario.titulo.trim() &&
      nuevoFormulario.moderador.trim() &&
      nuevoFormulario.objetivo.trim() &&
      nuevoFormulario.proceso.trim() &&
      nuevoFormulario.participantes.some((p) => p.trim())
    ) {
      console.log("Crear focus group:", nuevoFormulario);
      navegar(`/app/proyectos/${id}/requerimientos/focus-groups`);
    }
  };

  const agregarParticipante = () => {
    setNuevoFormulario({
      ...nuevoFormulario,
      participantes: [...nuevoFormulario.participantes, ""],
    });
  };

  const actualizarParticipante = (index, valor) => {
    const nuevosParticipantes = [...nuevoFormulario.participantes];
    nuevosParticipantes[index] = valor;
    setNuevoFormulario({
      ...nuevoFormulario,
      participantes: nuevosParticipantes,
    });
  };

  const eliminarParticipante = (index) => {
    if (nuevoFormulario.participantes.length > 1) {
      const nuevosParticipantes = nuevoFormulario.participantes.filter(
        (_, i) => i !== index
      );
      setNuevoFormulario({
        ...nuevoFormulario,
        participantes: nuevosParticipantes,
      });
    }
  };

  const agregarConclusión = () => {
    setNuevoFormulario({
      ...nuevoFormulario,
      conclusiones: [...nuevoFormulario.conclusiones, ""],
    });
  };

  const actualizarConclusión = (index, valor) => {
    const nuevasConclusiones = [...nuevoFormulario.conclusiones];
    nuevasConclusiones[index] = valor;
    setNuevoFormulario({
      ...nuevoFormulario,
      conclusiones: nuevasConclusiones,
    });
  };

  const eliminarConclusión = (index) => {
    if (nuevoFormulario.conclusiones.length > 1) {
      const nuevasConclusiones = nuevoFormulario.conclusiones.filter(
        (_, i) => i !== index
      );
      setNuevoFormulario({
        ...nuevoFormulario,
        conclusiones: nuevasConclusiones,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con botón atrás */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/focus-groups`)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Registrar Nuevo Focus Group
          </h1>
          <p className="text-gray-600 mt-1">
            Documenta los resultados de la sesión
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título del Focus Group <span className="text-red-500">*</span>
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
            placeholder="Ej: Focus group sobre usabilidad"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moderador <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nuevoFormulario.moderador}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  moderador: e.target.value,
                })
              }
              placeholder="Nombre del moderador"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Media
            </label>
            <input
              type="text"
              value={nuevoFormulario.tipoMedia}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  tipoMedia: e.target.value,
                })
              }
              placeholder="Ej: Presencial, Virtual, Híbrido"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Objetivo <span className="text-red-500">*</span>
          </label>
          <textarea
            value={nuevoFormulario.objetivo}
            onChange={(e) =>
              setNuevoFormulario({
                ...nuevoFormulario,
                objetivo: e.target.value,
              })
            }
            placeholder="Objetivo del focus group"
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transcripción / Notas
          </label>
          <textarea
            value={nuevoFormulario.transcripcion}
            onChange={(e) =>
              setNuevoFormulario({
                ...nuevoFormulario,
                transcripcion: e.target.value,
              })
            }
            placeholder="Transcripción de la sesión o notas principales"
            rows="4"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Participantes <span className="text-red-500">*</span>
            </label>
            <button
              onClick={agregarParticipante}
              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              + Añadir Participante
            </button>
          </div>
          <div className="space-y-2">
            {nuevoFormulario.participantes.map((participante, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={participante}
                  onChange={(e) => actualizarParticipante(index, e.target.value)}
                  placeholder={`Participante ${index + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {nuevoFormulario.participantes.length > 1 && (
                  <button
                    onClick={() => eliminarParticipante(index)}
                    className="px-3 py-2 text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Conclusiones
            </label>
            <button
              onClick={agregarConclusión}
              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              + Añadir Conclusión
            </button>
          </div>
          <div className="space-y-2">
            {nuevoFormulario.conclusiones.map((conclusion, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={conclusion}
                  onChange={(e) => actualizarConclusión(index, e.target.value)}
                  placeholder={`Conclusión ${index + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {nuevoFormulario.conclusiones.length > 1 && (
                  <button
                    onClick={() => eliminarConclusión(index)}
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
            onClick={handleAgregarFocusGroup}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium transition"
          >
            Guardar Focus Group
          </button>
          <button
            onClick={() => navegar(`/app/proyectos/${id}/requerimientos/focus-groups`)}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
