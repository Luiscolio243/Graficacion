// Modal para registrar un nuevo stakeholder

import { useState } from "react";

export default function ModalNuevoStakeholder({
  onClose,
  onGuardar,
  idProyecto,
  modo = "crear",
  stakeholderInicial = null,
}) {
  const [form, setForm] = useState({
    nombre: stakeholderInicial?.nombre || "",
    apellidos: stakeholderInicial?.apellidos || "",
    rol: stakeholderInicial?.rol || "",
    tipo: stakeholderInicial?.tipo || "Interno",
    correo: stakeholderInicial?.correo || stakeholderInicial?.email || "",
    telefono: stakeholderInicial?.telefono || "",
    organizacion: stakeholderInicial?.organizacion || "",
    notas: stakeholderInicial?.notas || "",
  });

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const roles = ["Usuario clave", "Sponsor", "Analista"];

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
          {modo === "editar" ? "Editar Stakeholder" : "Nuevo Stakeholder"}
        </h2>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Campos */}
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className="input"
        />

        <input
          name="apellidos"
          placeholder="Apellidos"
          value={form.apellidos}
          onChange={handleChange}
          className="input"
        />

        <input
          name="correo"
          placeholder="Correo electrónico"
          value={form.correo}
          onChange={handleChange}
          className="input"
        />

        <input
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          className="input"
        />

        <select
          name="tipo"
          value={form.tipo}
          onChange={handleChange}
          className="input"
        >
          <option>Interno</option>
          <option>Externo</option>
        </select>

        <input
          name="organizacion"
          placeholder="Organización / Empresa"
          value={form.organizacion}
          onChange={handleChange}
          className="input"
        />

        <select
          name="rol"
          className="input"
          value={form.rol}
          onChange={handleChange}
        >
          <option value="">Selecciona un rol</option>
          {roles.map((rol, i) => (
            <option key={i} value={rol}>{rol}</option>
          ))}
        </select>

        <textarea
          name="notas"
          placeholder="Notas adicionales"
          value={form.notas}
          onChange={handleChange}
          className="input"
        />

        {/* Acciones */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={guardando}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancelar
          </button>

          <button
            disabled={guardando}
            onClick={async () => {
              setError(null);
              setGuardando(true);
              try {
                const url =
                  modo === "editar"
                    ? `http://127.0.0.1:5000/stakeholders/${stakeholderInicial?.id_stakeholder}`
                    : "http://127.0.0.1:5000/stakeholders/agregar";

                const res = await fetch(url, {
                  method: modo === "editar" ? "PUT" : "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(
                    modo === "editar"
                      ? { ...form }
                      : { id_proyecto: idProyecto, ...form }
                  ),
                });
                if (!res.ok) {
                  const err = await res.json();
                  throw new Error(err.error || "Error al guardar");
                }
                const data = await res.json();
                const sh = data.stakeholder;
                onGuardar({
                  id_stakeholder: sh.id_stakeholder,
                  nombre: sh.nombre,
                  apellidos: "",
                  rol: sh.rol,
                  tipo: sh.tipo,
                  correo: sh.email,
                  telefono: sh.telefono,
                  organizacion: sh.organizacion || "",
                });
              } catch (e) {
                setError(e.message);
              } finally {
                setGuardando(false);
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-70"
          >
            {guardando ? "Guardando..." : modo === "editar" ? "Guardar cambios" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}