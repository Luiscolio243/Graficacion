// Modal para registrar un nuevo TI

import { useState } from "react";

export default function ModalNuevoTI({ onClose, onGuardar, roles = [] }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    id_rol: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">

        <h2 className="text-lg font-semibold">
          Nueva persona de TI
        </h2>

        {/* Campos */}
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className="input"
        />

        <input
          name="apellido"
          placeholder="Apellido"
          value={form.apellido}
          onChange={handleChange}
          className="input"
        />

        <input
          name="email"
          placeholder="Correo electrónico (login)"
          value={form.email}
          onChange={handleChange}
          className="input"
        />

        <select
          name="id_rol"
          onChange={handleChange}
          className="input"
          value={form.id_rol}
        >
          <option value="">Selecciona un rol</option>
          {roles.map((r) => (
            <option key={r.id_rol} value={r.id_rol}>
              {r.nombre}
            </option>
          ))}
        </select>

        {/* Acciones */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancelar
          </button>

          <button
            onClick={() =>
              onGuardar({
                ...form,
                id_rol: form.id_rol ? Number(form.id_rol) : "",
              })
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}