import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CrearSeguimientoTransaccional() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [nuevoFormulario, setNuevoFormulario] = useState({
    titulo: "",
    id_transaccion: "",
    nombre_proceso: "",
    id_proceso: "",
    id_subproceso: "",
    pasos: [{ nombre: "", duracion_min: "" }],
    problemas: [""],
    metricas: [{ nombre: "", valor: "" }],
  });

  const handleAgregarSeguimiento = async () => {
    if (
      nuevoFormulario.titulo.trim() &&
      nuevoFormulario.id_transaccion.trim() &&
      nuevoFormulario.nombre_proceso.trim() &&
      nuevoFormulario.pasos.some((p) => p.nombre.trim())
    ) {
      try {
        const body = {
          titulo:         nuevoFormulario.titulo,
          id_transaccion: nuevoFormulario.id_transaccion,
          nombre_proceso: nuevoFormulario.nombre_proceso,
          id_proceso:     nuevoFormulario.id_proceso     || null,
          id_subproceso:  nuevoFormulario.id_subproceso  || null,
          pasos: nuevoFormulario.pasos
            .filter((p) => p.nombre.trim())
            .map((p, i) => ({
              nombre:      p.nombre,
              duracion_min: Number(p.duracion_min) || null,
              orden:        i + 1,
            })),
          problemas: nuevoFormulario.problemas
            .filter((p) => p.trim())
            .map((p) => ({ descripcion: p })),  // ← convierte string a objeto
          metricas: nuevoFormulario.metricas
            .filter((m) => m.nombre.trim())
            .map((m) => ({
              nombre: m.nombre,
              valor:  m.valor,
            })),
        };

        const response = await fetch(
          `http://localhost:5000/seguimientos/crear/${id}`,  // ← id_proyecto en la URL
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        if (response.ok) {
          console.log("Seguimiento creado exitosamente");
          navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional`);
        } else {
          const err = await response.json();
          console.error("Error del servidor:", err);
          alert("Error al crear el seguimiento. Revisa los datos.");
        }
      } catch (error) {
        console.error("Error de red:", error);
        alert("No se pudo conectar con el servidor.");
      }
    } else {
      alert("Por favor, completa el título, ID de transacción, nombre del proceso y al menos un paso.");
    }
  };

  // ── Pasos ──
  const agregarPaso = () =>
    setNuevoFormulario({ ...nuevoFormulario, pasos: [...nuevoFormulario.pasos, { nombre: "", duracion_min: "" }] });

  const actualizarPaso = (index, campo, valor) => {
    const nuevosPasos = [...nuevoFormulario.pasos];
    nuevosPasos[index] = { ...nuevosPasos[index], [campo]: valor };
    setNuevoFormulario({ ...nuevoFormulario, pasos: nuevosPasos });
  };

  const eliminarPaso = (index) => {
    if (nuevoFormulario.pasos.length > 1)
      setNuevoFormulario({ ...nuevoFormulario, pasos: nuevoFormulario.pasos.filter((_, i) => i !== index) });
  };

  // ── Problemas ──
  const agregarProblema = () =>
    setNuevoFormulario({ ...nuevoFormulario, problemas: [...nuevoFormulario.problemas, ""] });

  const actualizarProblema = (index, valor) => {
    const nuevosProblemas = [...nuevoFormulario.problemas];
    nuevosProblemas[index] = valor;
    setNuevoFormulario({ ...nuevoFormulario, problemas: nuevosProblemas });
  };

  const eliminarProblema = (index) => {
    if (nuevoFormulario.problemas.length > 1)
      setNuevoFormulario({ ...nuevoFormulario, problemas: nuevoFormulario.problemas.filter((_, i) => i !== index) });
  };

  // ── Métricas ──
  const agregarMetrica = () =>
    setNuevoFormulario({ ...nuevoFormulario, metricas: [...nuevoFormulario.metricas, { nombre: "", valor: "" }] });

  const actualizarMetrica = (index, campo, valor) => {
    const nuevasMetricas = [...nuevoFormulario.metricas];
    nuevasMetricas[index] = { ...nuevasMetricas[index], [campo]: valor };
    setNuevoFormulario({ ...nuevoFormulario, metricas: nuevasMetricas });
  };

  const eliminarMetrica = (index) => {
    if (nuevoFormulario.metricas.length > 0)
      setNuevoFormulario({ ...nuevoFormulario, metricas: nuevoFormulario.metricas.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional`)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seguimiento Transaccional</h1>
          <p className="text-gray-600 mt-1">Registra y da seguimiento a una transacción</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título del Seguimiento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={nuevoFormulario.titulo}
            onChange={(e) => setNuevoFormulario({ ...nuevoFormulario, titulo: e.target.value })}
            placeholder="Ej: Seguimiento de Orden #12345"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* ID Transacción + Nombre Proceso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID de Transacción <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nuevoFormulario.id_transaccion}
              onChange={(e) => setNuevoFormulario({ ...nuevoFormulario, id_transaccion: e.target.value })}
              placeholder="Ej: TXN-2025-001"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Proceso <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nuevoFormulario.nombre_proceso}
              onChange={(e) => setNuevoFormulario({ ...nuevoFormulario, nombre_proceso: e.target.value })}
              placeholder="Ej: Procesamiento de Orden de Compra"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Proceso Vinculado + Subproceso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Proceso Vinculado
            </label>
            <input
              type="number"
              value={nuevoFormulario.id_proceso}
              onChange={(e) => setNuevoFormulario({ ...nuevoFormulario, id_proceso: e.target.value })}
              placeholder="ID numérico del proceso"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Subproceso
            </label>
            <input
              type="number"
              value={nuevoFormulario.id_subproceso}
              onChange={(e) => setNuevoFormulario({ ...nuevoFormulario, id_subproceso: e.target.value })}
              placeholder="ID numérico del subproceso"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Pasos */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Pasos del Proceso <span className="text-red-500">*</span>
            </label>
            <button onClick={agregarPaso} className="text-red-600 hover:text-red-700 font-medium text-sm">
              + Agregar paso
            </button>
          </div>
          <div className="space-y-3">
            {nuevoFormulario.pasos.map((paso, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold text-gray-700">Paso {index + 1}</p>
                  {nuevoFormulario.pasos.length > 1 && (
                    <button onClick={() => eliminarPaso(index)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                      Eliminar
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={paso.nombre}
                  onChange={(e) => actualizarPaso(index, "nombre", e.target.value)}
                  placeholder="Nombre del paso"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="number"
                  value={paso.duracion_min}
                  onChange={(e) => actualizarPaso(index, "duracion_min", e.target.value)}
                  placeholder="Duración en minutos (ej: 30)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Problemas */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Problemas Identificados (opcional)
            </label>
            <button onClick={agregarProblema} className="text-red-600 hover:text-red-700 font-medium text-sm">
              + Agregar problema
            </button>
          </div>
          <div className="space-y-2">
            {nuevoFormulario.problemas.map((problema, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={problema}
                  onChange={(e) => actualizarProblema(index, e.target.value)}
                  placeholder={`Problema ${index + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {nuevoFormulario.problemas.length > 1 && (
                  <button onClick={() => eliminarProblema(index)} className="px-3 py-2 text-red-500 hover:text-red-700 text-sm font-medium">
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Métricas */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Métricas (opcional)
            </label>
            <button onClick={agregarMetrica} className="text-red-600 hover:text-red-700 font-medium text-sm">
              + Agregar métrica
            </button>
          </div>
          <div className="space-y-3">
            {nuevoFormulario.metricas.map((metrica, index) => (
              <div key={index} className="flex gap-2 items-end">
                <input
                  type="text"
                  value={metrica.nombre}
                  onChange={(e) => actualizarMetrica(index, "nombre", e.target.value)}
                  placeholder="Nombre de la métrica"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  value={metrica.valor}
                  onChange={(e) => actualizarMetrica(index, "valor", e.target.value)}
                  placeholder="Valor"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {nuevoFormulario.metricas.length > 0 && (
                  <button onClick={() => eliminarMetrica(index)} className="px-3 py-2 text-red-500 hover:text-red-700 text-sm font-medium">
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleAgregarSeguimiento}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition"
          >
            Crear Seguimiento Transaccional
          </button>
          <button
            onClick={() => navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional`)}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}