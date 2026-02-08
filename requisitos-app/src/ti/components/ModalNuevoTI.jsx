// Modal para registrar un nuevo TI

import { useState } from "react";

export default function ModalNuevoTI({ onClose, onGuardar }) {
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    rol: "",
    tipo: "Interno",
    correo: "",
    telefono: "",
    organizacion: "",
    notas: "",
  });

  // Ejemplo de roles (luego son los de back)
  const [roles, setRoles] = useState([
    "Usuario clave",
    "Sponsor",
    "Analista",
  ]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const agregarRol = (nuevoRol) => {
    setRoles([...roles, nuevoRol.nombre]);
    setForm({ ...form, rol: nuevoRol.nombre });
    setMostrarModalRol(false);
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
          onChange={handleChange}
          className="input"
        />

        <input
          name="apellidos"
          placeholder="Apellidos"
          onChange={handleChange}
          className="input"
        />

        <input
          name="correo"
          placeholder="Correo electrónico"
          onChange={handleChange}
          className="input"
        />

        <input
          name="telefono"
          placeholder="Teléfono"
          onChange={handleChange}
          className="input"
        />

        <select
          name="tipo"
          onChange={handleChange}
          className="input"
        >
          <option>Interno</option>
          <option>Externo</option>
        </select>

        <input
          name="organizacion"
          placeholder="Organización / Empresa"
          onChange={handleChange}
          className="input"
        />

        {/* Rol y boton para crear uno nuevo */}
        <div className="flex gap-2">
            <select
              name="rol"
              className="input flex-1"
              value={form.rol}
              onChange={handleChange}
            >
              <option value="">Selecciona un rol</option>
              {roles.map((rol, i) => (
                <option key={i}>{rol}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setMostrarModalRol(true)}
              className="px-3 border border-gray-300 rounded-lg text-sm"
            >
              + Rol
            </button>
        </div>

        <textarea
          name="notas"
          placeholder="Notas adicionales"
          onChange={handleChange}
          className="input"
        />

        {/* Acciones */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancelar
          </button>

          <button
            onClick={() => onGuardar(form)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}