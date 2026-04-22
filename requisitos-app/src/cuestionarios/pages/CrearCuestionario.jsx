import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CrearCuestionario() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [nuevoFormulario, setNuevoFormulario] = useState({
    titulo: "",
    descripcion: "",
    participantesEsperados: "",
    proceso: "",
    subproceso: "",
    preguntas: [
      {
        texto: "",
        tipo: "abierta",
        opciones: [],
      },
    ],
  });

  const handleAgregarCuestionario = async () => {
    if (
      nuevoFormulario.titulo.trim() &&
      nuevoFormulario.preguntas.some((p) => p.texto.trim())
    ) {
      console.log("Crear cuestionario:", nuevoFormulario);
      //NUevo

      try{
        const response = await fetch(`http://localhost:5000/encuestas/crear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_proyecto: Number(id),
            titulo: nuevoFormulario.titulo,
            descripcion: nuevoFormulario.descripcion,
            num_participantes: Number(nuevoFormulario.participantesEsperados) || 0,
            id_subproceso: nuevoFormulario.id_subproceso || null, // necesitas un selector real
            preguntas: nuevoFormulario.preguntas.map((p, i) => ({
              pregunta: p.texto,
              tipo: p.tipo === "opcionMultiple" ? "opcion_multiple" : p.tipo,
              orden: i + 1,
              ...(p.tipo === "opcionMultiple" && { opciones: p.opciones || [] }),
          })),
        }),
      });

        if (response.ok) {
          console.log("Cuestionario creado exitosamente");
        } else {
          console.error("Error al crear el cuestionario");
        }
      } catch(error){
        console.error("Error al crear el cuestionario:", error);
      }

      //nuevo

      navegar(`/app/proyectos/${id}/requerimientos/cuestionarios`);
    }
    else{
      alert("Por favor, completa el título y al menos una pregunta para crear el cuestionario.");
    }
  };

  const agregarPregunta = () => {
    setNuevoFormulario({
      ...nuevoFormulario,
      preguntas: [...nuevoFormulario.preguntas, { texto: "", tipo: "abierta", opciones: [] }],
    });
  };

  const actualizarPregunta = (index, campo, valor) => {
    const nuevasPreguntas = [...nuevoFormulario.preguntas];
    nuevasPreguntas[index] = {
      ...nuevasPreguntas[index],
      [campo]: valor,
    };
    setNuevoFormulario({
      ...nuevoFormulario,
      preguntas: nuevasPreguntas,
    });
  };

  const eliminarPregunta = (index) => {
    if (nuevoFormulario.preguntas.length > 1) {
      const nuevasPreguntas = nuevoFormulario.preguntas.filter(
        (_, i) => i !== index
      );
      setNuevoFormulario({
        ...nuevoFormulario,
        preguntas: nuevasPreguntas,
      });
    }
  };

  const agregarOpcion = (indexPregunta) => {
    const nuevasPreguntas = [...nuevoFormulario.preguntas];
    if (!nuevasPreguntas[indexPregunta].opciones) {
      nuevasPreguntas[indexPregunta].opciones = [];
    }
    nuevasPreguntas[indexPregunta].opciones.push("");
    setNuevoFormulario({
      ...nuevoFormulario,
      preguntas: nuevasPreguntas,
    });
  };

  const actualizarOpcion = (indexPregunta, indexOpcion, valor) => {
    const nuevasPreguntas = [...nuevoFormulario.preguntas];
    nuevasPreguntas[indexPregunta].opciones[indexOpcion] = valor;
    setNuevoFormulario({
      ...nuevoFormulario,
      preguntas: nuevasPreguntas,
    });
  };

  const eliminarOpcion = (indexPregunta, indexOpcion) => {
    const nuevasPreguntas = [...nuevoFormulario.preguntas];
    nuevasPreguntas[indexPregunta].opciones = nuevasPreguntas[
      indexPregunta
    ].opciones.filter((_, i) => i !== indexOpcion);
    setNuevoFormulario({
      ...nuevoFormulario,
      preguntas: nuevasPreguntas,
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con botón atrás */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/cuestionarios`)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Crear Nuevo Cuestionario
          </h1>
          <p className="text-gray-600 mt-1">
            Diseña preguntas y gestiona las respuestas de los participantes
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título de la Encuesta <span className="text-red-500">*</span>
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
              placeholder="Ej: Encuesta de satisfacción"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Participantes Esperados
            </label>
            <input
              type="number"
              value={nuevoFormulario.participantesEsperados}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  participantesEsperados: e.target.value,
                })
              }
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            value={nuevoFormulario.descripcion}
            onChange={(e) =>
              setNuevoFormulario({
                ...nuevoFormulario,
                descripcion: e.target.value,
              })
            }
            placeholder="Objetivo de la encuesta"
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Preguntas <span className="text-red-500">*</span>
            </label>
            <button
              onClick={agregarPregunta}
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              + Añadir Pregunta
            </button>
          </div>
          <div className="space-y-4">
            {nuevoFormulario.preguntas.map((pregunta, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Pregunta {index + 1}
                  </label>
                  {nuevoFormulario.preguntas.length > 1 && (
                    <button
                      onClick={() => eliminarPregunta(index)}
                      className="text-red-500 hover:text-red-700 font-medium text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={pregunta.texto}
                  onChange={(e) =>
                    actualizarPregunta(index, "texto", e.target.value)
                  }
                  placeholder="Escribe la pregunta"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Tipo de Pregunta
                  </label>
                  <select
                    value={pregunta.tipo}
                    onChange={(e) =>
                      actualizarPregunta(index, "tipo", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="abierta">Abierta</option>
                    <option value="opcionMultiple">Opción Múltiple</option>
                    <option value="escala">Escala</option>
                    <option value="siNo">Sí / No</option>
                  </select>
                </div>

                {pregunta.tipo === "opcionMultiple" && (
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Opciones de Respuesta
                      </label>
                      <button
                        onClick={() => agregarOpcion(index)}
                        className="text-green-600 hover:text-green-700 font-medium text-sm"
                      >
                        + Agregar Opción
                      </button>
                    </div>
                    <div className="space-y-2">
                      {pregunta.opciones && pregunta.opciones.length > 0 ? (
                        pregunta.opciones.map((opcion, indexOpcion) => (
                          <div key={indexOpcion} className="flex gap-2">
                            <input
                              type="text"
                              value={opcion}
                              onChange={(e) =>
                                actualizarOpcion(index, indexOpcion, e.target.value)
                              }
                              placeholder={`Opción ${indexOpcion + 1}`}
                              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                              onClick={() => eliminarOpcion(index, indexOpcion)}
                              className="text-red-500 hover:text-red-700 font-medium text-sm px-2"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No hay opciones aún. Añade una para empezar.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleAgregarCuestionario}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition"
          >
            Guardar Cuestionario
          </button>
          <button
            onClick={() => navegar(`/app/proyectos/${id}/requerimientos/cuestionarios`)}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
