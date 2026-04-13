import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CrearSeguimientoTransaccional() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [nuevoFormulario, setNuevoFormulario] = useState({
    titulo: "",
    transaccionId: "",
    nombreProceso: "",
    procesoVinculado: "",
    subproceso: "",
    pasos: [
      {
        nombre: "",
        duracion: "",
      },
    ],
    problemas: [""],
    metricas: [
      {
        nombre: "",
        valor: "",
      },
    ],
  });

  const handleAgregarSeguimiento = () => {
    if (
      nuevoFormulario.titulo.trim() &&
      nuevoFormulario.transaccionId.trim() &&
      nuevoFormulario.nombreProceso.trim() &&
      nuevoFormulario.procesoVinculado.trim() &&
      nuevoFormulario.pasos.some((p) => p.nombre.trim())
    ) {
      console.log("Crear seguimiento transaccional:", nuevoFormulario);
      navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional`);
    }
  };

  const agregarPaso = () => {
    setNuevoFormulario({
      ...nuevoFormulario,
      pasos: [...nuevoFormulario.pasos, { nombre: "", duracion: "" }],
    });
  };

  const actualizarPaso = (index, campo, valor) => {
    const nuevosPasos = [...nuevoFormulario.pasos];
    nuevosPasos[index] = {
      ...nuevosPasos[index],
      [campo]: valor,
    };
    setNuevoFormulario({
      ...nuevoFormulario,
      pasos: nuevosPasos,
    });
  };

  const eliminarPaso = (index) => {
    if (nuevoFormulario.pasos.length > 1) {
      const nuevosPasos = nuevoFormulario.pasos.filter(
        (_, i) => i !== index
      );
      setNuevoFormulario({
        ...nuevoFormulario,
        pasos: nuevosPasos,
      });
    }
  };

  const agregarProblema = () => {
    setNuevoFormulario({
      ...nuevoFormulario,
      problemas: [...nuevoFormulario.problemas, ""],
    });
  };

  const actualizarProblema = (index, valor) => {
    const nuevosProblemas = [...nuevoFormulario.problemas];
    nuevosProblemas[index] = valor;
    setNuevoFormulario({
      ...nuevoFormulario,
      problemas: nuevosProblemas,
    });
  };

  const eliminarProblema = (index) => {
    if (nuevoFormulario.problemas.length > 1) {
      const nuevosProblemas = nuevoFormulario.problemas.filter(
        (_, i) => i !== index
      );
      setNuevoFormulario({
        ...nuevoFormulario,
        problemas: nuevosProblemas,
      });
    }
  };

  const agregarMetrica = () => {
    setNuevoFormulario({
      ...nuevoFormulario,
      metricas: [...nuevoFormulario.metricas, { nombre: "", valor: "" }],
    });
  };

  const actualizarMetrica = (index, campo, valor) => {
    const nuevasMetricas = [...nuevoFormulario.metricas];
    nuevasMetricas[index] = {
      ...nuevasMetricas[index],
      [campo]: valor,
    };
    setNuevoFormulario({
      ...nuevoFormulario,
      metricas: nuevasMetricas,
    });
  };

  const eliminarMetrica = (index) => {
    if (nuevoFormulario.metricas.length > 0) {
      const nuevasMetricas = nuevoFormulario.metricas.filter(
        (_, i) => i !== index
      );
      setNuevoFormulario({
        ...nuevoFormulario,
        metricas: nuevasMetricas,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con botón atrás */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional`)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Seguimiento Transaccional
          </h1>
          <p className="text-gray-600 mt-1">(1)</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título del Seguimiento <span className="text-red-500">*</span>
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
            placeholder="Ej: Seguimiento de Orden #12345"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID de Transacción <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nuevoFormulario.transaccionId}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  transaccionId: e.target.value,
                })
              }
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
              value={nuevoFormulario.nombreProceso}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  nombreProceso: e.target.value,
                })
              }
              placeholder="Ej: Procesamiento de Orden de Compra"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proceso Vinculado
            </label>
            <input
              type="text"
              value={nuevoFormulario.procesoVinculado}
              onChange={(e) =>
                setNuevoFormulario({
                  ...nuevoFormulario,
                  procesoVinculado: e.target.value,
                })
              }
              placeholder="Ej: Cotización"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Pasos del Proceso <span className="text-red-500">*</span>
            </label>
            <button
              onClick={agregarPaso}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              + Agregar paso
            </button>
          </div>
          <div className="space-y-3">
            {nuevoFormulario.pasos.map((paso, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm font-bold text-gray-700">
                    Paso {index + 1}
                  </p>
                  {nuevoFormulario.pasos.length > 1 && (
                    <button
                      onClick={() => eliminarPaso(index)}
                      className="text-red-500 hover:text-red-700 font-medium text-sm"
                    >
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
                  type="text"
                  value={paso.duracion}
                  onChange={(e) => actualizarPaso(index, "duracion", e.target.value)}
                  placeholder="Duración (ej: 2min, 1h)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Problemas Identificados (opcional)
            </label>
            <button
              onClick={agregarProblema}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
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
                  <button
                    onClick={() => eliminarProblema(index)}
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
              Métricas (opcional)
            </label>
            <button
              onClick={agregarMetrica}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              + Agregar métrica
            </button>
          </div>
          <div className="space-y-3">
            {nuevoFormulario.metricas.map((metrica, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <input
                    type="text"
                    value={metrica.nombre}
                    onChange={(e) => actualizarMetrica(index, "nombre", e.target.value)}
                    placeholder="Nombre de la métrica"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={metrica.valor}
                    onChange={(e) => actualizarMetrica(index, "valor", e.target.value)}
                    placeholder="Valor"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                {nuevoFormulario.metricas.length > 0 && (
                  <button
                    onClick={() => eliminarMetrica(index)}
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
