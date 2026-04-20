import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

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

  //datos para los selects
  const [entrevistadores, setEntrevistadores] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [procesos, setProcesos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    //cargar equipo de ti del proyecto
    fetch(`${BASE_URL}/ti/${id}`, { headers })
      .then((r) => r.ok ? r.json() : [])
      .then(setEntrevistadores)
      .catch(() => {});

    // Cargar stakeholders del proyecto
    fetch(`${BASE_URL}/stakeholders/${id}`, { headers })
      .then((r) => r.ok ? r.json() : [])
      .then(setStakeholders)
      .catch(() => {});
 
    // Cargar procesos del proyecto (vienen con subprocesos anidados)
    fetch(`${BASE_URL}/procesos/${id}`, { headers })
      .then((r) => r.ok ? r.json() : [])
      .then(setProcesos)
      .catch(() => {});
  }, [id]);

  // Subprocesos del proceso seleccionado
  const subprocesosFiltrados =
    procesos.find((p) => String(p.id_proceso) === String(nuevoFormulario.proceso))
      ?.subprocesos || [];

  const handleAgregarEntrevista = async() => {
    if (!nuevoFormulario.titulo.trim()) return alert("El título es obligatorio.");
    if (!nuevoFormulario.entrevistador) return alert("Selecciona un entrevistador.");
    if (!nuevoFormulario.entrevistado) return alert("Selecciona un entrevistado.");
 
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
 
      // 1. Crear la entrevista
      const res = await fetch(`${BASE_URL}/entrevistas/crear`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id_proyecto: parseInt(id),
          titulo: nuevoFormulario.titulo,
          id_entrevistador: parseInt(nuevoFormulario.entrevistador),
          id_stakeholder: parseInt(nuevoFormulario.entrevistado),
          objetivo: nuevoFormulario.notas || null,
          id_subproceso: nuevoFormulario.subproceso ? parseInt(nuevoFormulario.subproceso) : null,
        }),
      });
 
      if (!res.ok) {
        const err = await res.json();
        return alert(err.error || "Error al crear la entrevista.");
      }
 
      const { entrevista } = await res.json();
 
      // 2. Agregar preguntas válidas
      for (const pregunta of nuevoFormulario.preguntas.filter((p) => p.trim())) {
        await fetch(`${BASE_URL}/preguntas/agregar`, {
          method: "POST",
          headers,
          body: JSON.stringify({ id_entrevista: entrevista.id_entrevista, pregunta, origen: "manual" }),
        });
      }
 
      navegar(`/app/proyectos/${id}/entrevistas`);
    } catch (e) {
      alert("Error de conexión con el servidor.");
      console.error(e);
    }
    
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
            <select
              value={nuevoFormulario.entrevistador}
              onChange={(e) =>
                setNuevoFormulario({ ...nuevoFormulario, entrevistador: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Tu nombre</option>
              {entrevistadores.map((e) => (
                <option key={e.usuario.id_usuario} value={e.usuario.id_usuario}>
                  {e.usuario.nombre} {e.usuario.apellido}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entrevistado <span className="text-red-500">*</span>
            </label>
            <select
              value={nuevoFormulario.entrevistado}
              onChange={(e) =>
                setNuevoFormulario({ ...nuevoFormulario, entrevistado: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Nombre del entrevistado</option>
              {stakeholders.map((s) => (
                <option key={s.id_stakeholder} value={s.id_stakeholder}>
                  {s.nombre}
                </option>
              ))}
            </select>
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
            <select
              value={nuevoFormulario.proceso}
              onChange={(e) =>
                // Al cambiar proceso se limpia el subproceso
                setNuevoFormulario({ ...nuevoFormulario, proceso: e.target.value, subproceso: "" })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Selecciona un proceso</option>
              {procesos.map((p) => (
                <option key={p.id_proceso} value={p.id_proceso}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subproceso
            </label>
            <select
              value={nuevoFormulario.subproceso}
              onChange={(e) =>
                setNuevoFormulario({ ...nuevoFormulario, subproceso: e.target.value })
              }
              disabled={!nuevoFormulario.proceso}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {nuevoFormulario.proceso ? "Selecciona un subproceso" : "Primero elige un proceso"}
              </option>
              {subprocesosFiltrados.map((sp) => (
                <option key={sp.id_subproceso} value={sp.id_subproceso}>
                  {sp.nombre}
                </option>
              ))}
            </select>
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
