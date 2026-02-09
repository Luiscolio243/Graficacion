// Modal para registrar un nuevo proceso 

import { useState } from "react";

export default function ModalNuevoProceso({ onClose, onGuardar, listaTI = [] }) {

  const [proceso, setProceso] = useState({
    nombre: "",
    descripcion: "",
    area: "",
    responsableId: "",
  });

  const handleChange = (e) => {
    setProceso({
      ...proceso,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg space-y-8">

        {/* Título */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Nuevo Proceso
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Define la información principal del proceso de negocio
          </p>
        </div>

        {/* Nombre */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del proceso *
            </label>
            <input
              name="nombre"
              placeholder="Ej. Gestión de almacén"
              onChange={handleChange}
              className="input mt-1"
            />
          </div>

        {/* Descripcion */}
        <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              name="descripcion"
              placeholder="Describe brevemente el proceso..."
              onChange={handleChange}
              rows={3}
              className="input mt-1 resize-none"
            />
          </div>
        </div>

        {/* Area responsable */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            Responsabilidad
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Área responsable
            </label>
            <input
              name="area"
              placeholder="Ej. Operaciones, Ventas, TI"
              onChange={handleChange}
              className="input mt-1"
            />
          </div>

            {/* Responsable */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                Responsable del proceso
                </label>
                <select
                name="responsableId"
                onChange={handleChange}
                className="input mt-1"
                >
                <option value="">
                    Selecciona un responsable
                </option>
                {listaTI.map((persona, index) => (
                    <option key={index} value={index}>
                    {persona.nombre} {persona.apellidos}
                    </option>
                ))}
                </select>
            </div>
            </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm">
            Cancelar
          </button>

          <button
            onClick={() => onGuardar(proceso)}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium">
            Agregar proceso
          </button>
        </div>
      </div>
    </div>
  );
}