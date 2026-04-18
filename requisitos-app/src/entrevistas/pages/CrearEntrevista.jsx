import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CrearEntrevista() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [nuevoFormulario, setNuevoFormulario] = useState({
    titulo: "",
    entrevistador: "",
    entrevistado: "",
    notas: "",
    proceso: "",
    subproceso: "",
    preguntas: [""],
  });

  const handleAgregarEntrevista = async() => {
    /*
    if (
      nuevoFormulario.titulo.trim() &&
      nuevoFormulario.preguntas.some((p) => p.trim())
    ) {
      try {
        const response = await fetch(`http://localhost:5000/entrevistas/crear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoFormulario),
        });

        if (response.ok) {
          console.log("Entrevista creada exitosamente");
          navegar(`/app/proyectos/${id}/entrevistas`);
        } else {
          console.error("Error al crear la entrevista");
        }
      } catch (error) {
        console.error("Error al crear la entrevista:", error);
      }

      */
      console.log("Crear entrevista:", nuevoFormulario);
      navegar(`/app/proyectos/${id}/entrevistas`);
    
  };

  const agregarPregunta = () => {
    setNuevoFormulario({
      ...nuevoFormulario,
      preguntas: [...nuevoFormulario.preguntas, ""],
    });
  };

  const actualizarPregunta = (index, valor) => {
    const nuevasPreguntas = [...nuevoFormulario.preguntas];
    nuevasPreguntas[index] = valor;
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
          onClick={() => navegar(`/app/proyectos/${id}/entrevistas`)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Entrevista</h1>
          <p className="text-gray-600 mt-1">
            Primero crea la entrevista. Luego podrás anotar las respuestas y subir archivos.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título de la Entrevista <span className="text-red-500">*</span>
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
              placeholder="Ej: Entrevista con usuario final"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entrevistador <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nuevoFormulario.entrevistador}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  entrevistador: e.target.value,
                })
              }
              placeholder="Tu nombre"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entrevistado <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nuevoFormulario.entrevistado}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  entrevistado: e.target.value,
                })
              }
              placeholder="Nombre del entrevistado"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas / Contexto
          </label>
          <textarea
            value={nuevoFormulario.notas}
            onChange={(e) =>
              setNuevoFormulario({
                ...nuevoFormulario,
                notas: e.target.value,
              })
            }
            placeholder="Contexto o notas adicionales sobre la entrevista"
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Preguntas de la Entrevista <span className="text-red-500">*</span>
            </label>
            <button
              onClick={agregarPregunta}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              + Añadir Pregunta
            </button>
          </div>
          <div className="space-y-2">
            {nuevoFormulario.preguntas.map((pregunta, index) => (
              <input
                key={index}
                type="text"
                value={pregunta}
                onChange={(e) => actualizarPregunta(index, e.target.value)}
                placeholder={`Pregunta ${index + 1}`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleAgregarEntrevista}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition"
          >
            Crear Entrevista
          </button>
          <button
            onClick={() => navegar(`/app/proyectos/${id}/entrevistas`)}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
