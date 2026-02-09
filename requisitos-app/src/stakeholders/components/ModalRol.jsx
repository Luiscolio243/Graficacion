// Modal para registrar roles de stakeholders o TI

import { useState } from "react";

export default function ModalNuevoRol({ onClose, onGuardar }) {
  const [rol, setRol] = useState({
    nombre: "",
    descripcion: "",
    tipo: "Stakeholder", // o TI
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setRol({
      ...rol,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuardar = async () => {
    if (!rol.nombre.trim()) {
      setError("El nombre del rol es obligatorio");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/roles/agregar", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: rol.nombre,
          descripcion: rol.descripcion,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el rol');
      }

      const data = await response.json();
      
      // Llamar callback con el rol guardado
      onGuardar(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          value={rol.nombre}
          onChange={handleChange}
          className="input w-full"
        />

        <textarea
          name="descripcion"
          placeholder="Descripción del rol"
          value={rol.descripcion}
          onChange={handleChange}
          className="input w-full"
          rows="3"
        />

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
  onClick={handleGuardar}
  disabled={loading}
  className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
>
  {loading ? 'Guardando...' : 'Guardar'}
</button>
        </div>
      </div>
    </div>
  );
}