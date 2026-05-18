import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5000";

// Stack fijo — no editable por el usuario
const STACK_PREDETERMINADO = {
  frontend_framework:     "React",
  frontend_libreria_ui:   "Tailwind CSS",
  frontend_manejo_estado: "useState/useContext",
  backend_lenguaje:       "Python",
  backend_framework:      "Flask",
  backend_tipo_api:       "REST",
  bd_motor:               "PostgreSQL",
  bd_orm:                 "SQLAlchemy",
  seg_autenticacion:      "JWT",
  seg_cifrado:            "bcrypt",
  infra_despliegue:       "VPS/Servidor propio",
  infra_contenedores:     "Ninguno",
};

const FORM_VACIO = {
  ...STACK_PREDETERMINADO,
  seg_roles:                 "",
  restricciones_adicionales: "",
};

const STACK_INFO = [
  { label: "Frontend",        valor: "React + Tailwind CSS + useState/useContext" },
  { label: "Backend",         valor: "Python + Flask + API REST" },
  { label: "Base de datos",   valor: "PostgreSQL + SQLAlchemy" },
  { label: "Seguridad",       valor: "JWT + bcrypt" },
  { label: "Infraestructura", valor: "VPS/Servidor propio" },
];

export default function SpecsTecnicas() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm]           = useState(FORM_VACIO);
  const [cargando, setCargando]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado]   = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    fetch(`${API}/proyectos/${id}/specs-tecnicas`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          // Mantener stack predeterminado, solo tomar roles y restricciones de la BD
          setForm({
            ...STACK_PREDETERMINADO,
            seg_roles:               data.seg_roles || "",
            restricciones_adicionales: data.restricciones_adicionales || "",
          });
        }
        setCargando(false);
      })
      .catch(() => {
        setError("No se pudo conectar al servidor");
        setCargando(false);
      });
  }, [id]);

  function onChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function guardar() {
    setGuardando(true);
    try {
      const res = await fetch(`${API}/proyectos/${id}/specs-tecnicas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { alert("Error al guardar"); return; }
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } catch {
      alert("No se pudo conectar al servidor");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <div className="text-gray-500 p-8">Cargando...</div>;
  if (error)    return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/app/proyectos/${id}`)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
        >
          ← Atrás
        </button>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Especificaciones Técnicas</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Define los roles y restricciones del sistema para la generación del código
          </p>
        </div>
      </div>

      {/* Stack fijo — solo informativo */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-semibold text-indigo-700">Stack tecnológico</h2>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
            Predeterminado
          </span>
        </div>
        <p className="text-xs text-indigo-500 mb-4">
          El stack tecnológico está fijo para garantizar compatibilidad con los specs generados.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STACK_INFO.map((item) => (
            <div key={item.label} className="bg-white rounded-lg px-4 py-3 border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-0.5">
                {item.label}
              </p>
              <p className="text-sm text-gray-800 font-medium">{item.valor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roles — editable */}
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
        <h2 className="font-semibold text-rose-700 mb-1">Roles del sistema</h2>
        <p className="text-xs text-rose-400 mb-3">
          Define quiénes van a usar el sistema y qué puede hacer cada uno
        </p>
        <label className="text-xs font-medium text-gray-600">
          Un rol por línea — incluye nombre y descripción breve
        </label>
        <textarea
          value={form.seg_roles || ""}
          onChange={(e) => onChange("seg_roles", e.target.value)}
          rows={4}
          placeholder={"Ej:\nAdministrador — acceso total al sistema\nCliente — puede ver y comprar productos\nVendedor — gestiona su inventario"}
          className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-400 bg-white resize-none"
        />
      </div>

      {/* Restricciones adicionales — editable */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="font-semibold text-gray-700 mb-1">Restricciones y notas adicionales</h2>
        <p className="text-xs text-gray-400 mb-3">
          Reglas de negocio, restricciones técnicas o cualquier nota importante para el desarrollo
        </p>
        <textarea
          value={form.restricciones_adicionales || ""}
          onChange={(e) => onChange("restricciones_adicionales", e.target.value)}
          rows={5}
          placeholder={"Ej:\nLas contraseñas deben tener mínimo 8 caracteres.\nEl sistema debe funcionar en dispositivos móviles.\nUn vendedor solo puede ver sus propios pedidos."}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white resize-none"
        />
      </div>

      {/* Botón guardar */}
      <div className="flex items-center gap-4 pb-8">
        <button
          onClick={guardar}
          disabled={guardando}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar especificaciones"}
        </button>
        {guardado && (
          <span className="text-sm text-green-600 font-medium">✓ Guardado correctamente</span>
        )}
      </div>
    </div>
  );
}