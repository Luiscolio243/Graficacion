import { useState } from "react";

export default function ModalNuevoSubproceso({
  onClose,
  onGuardar,
}) {
  //alamcena los campos del formulario
  const [subproceso, setSubproceso] = useState({
    nombre: "",
    descripcion: "",
  });

  //cambios de cualquier input del formularios
  const handleChange = (e) => {
    setSubproceso({
      ...subproceso,//se mantiene el estado anterior
      [e.target.name]: e.target.value, // se actualiza el estado que e corresponde
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Nuevo Subproceso
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Define una actividad específica dentro del proceso
          </p>
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre del subproceso *
          </label>
          <input
            name="nombre"
            placeholder="Ej. Alta de productos"
            className="input mt-1"
            onChange={handleChange}
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            name="descripcion"
            rows={3}
            placeholder="Describe brevemente qué se hace en este subproceso"
            className="input mt-1 resize-none"
            onChange={handleChange}
          />
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => {
                if(!subproceso.nombre.trim()) return;
                onGuardar(subproceso);
            }}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium"
          >
            Crear subproceso
          </button>
        </div>
      </div>
    </div>
  );
}