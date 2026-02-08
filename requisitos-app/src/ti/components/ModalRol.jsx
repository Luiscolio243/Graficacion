// Modal para registrar roles de stakeholders o TI

import { useState } from "react";

export default function ModalNuevoRol({ onClose, onGuardar }) {
  const [rol, setRol] = useState({
    nombre: "",
    descripcion: "",
    tipo: "Stakeholder", // o TI
  });

  const handleChange = (e) => {
    setRol({
      ...rol,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">

        <h2 className="text-lg font-semibold">
          Nuevo Rol
        </h2>

        <input
          name="nombre"
          placeholder="Nombre del rol (ej. Usuario clave)"
          onChange={handleChange}
          className="input"
        />

        <textarea
          name="descripcion"
          placeholder="Descripción del rol"
          onChange={handleChange}
          className="input"
        />

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancelar
          </button>

          <button
            onClick={() => onGuardar(rol)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}