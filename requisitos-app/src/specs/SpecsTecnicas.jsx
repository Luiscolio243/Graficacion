import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:5000";

const OPCIONES = {
  frontend_framework: ["React", "Vue", "Angular", "Next.js", "Svelte", "Otro"],
  frontend_libreria_ui: ["Tailwind CSS", "Material UI", "Ant Design", "Bootstrap", "Chakra UI", "Otro"],
  frontend_manejo_estado: ["useState/useContext", "Redux", "Zustand", "Pinia", "NgRx", "Otro"],
  backend_lenguaje: ["Python", "JavaScript/Node.js", "Java", "C#", "PHP", "Go", "Otro"],
  backend_framework: ["Flask", "FastAPI", "Django", "Express", "Spring Boot", "ASP.NET", "Otro"],
  backend_tipo_api: ["REST", "GraphQL", "gRPC", "SOAP", "Otro"],
  bd_motor: ["PostgreSQL", "MySQL", "SQLite", "MongoDB", "SQL Server", "Oracle", "Otro"],
  bd_orm: ["SQLAlchemy", "Prisma", "Sequelize", "Hibernate", "Entity Framework", "Mongoose", "Ninguno", "Otro"],
  seg_autenticacion: ["JWT", "OAuth 2.0", "Session/Cookies", "API Key", "Auth0", "Otro"],
  seg_cifrado: ["bcrypt", "Argon2", "SHA-256", "AES", "Otro"],
  infra_despliegue: ["VPS/Servidor propio", "AWS", "Google Cloud", "Azure", "Heroku", "Railway", "Vercel", "Otro"],
  infra_contenedores: ["Docker", "Docker Compose", "Kubernetes", "Ninguno", "Otro"],
};

const SECCIONES = [
  {
    titulo: "Frontend",
    color: "blue",
    campos: [
      { key: "frontend_framework",      label: "Framework" },
      { key: "frontend_libreria_ui",    label: "Librería UI" },
      { key: "frontend_manejo_estado",  label: "Manejo de estado" },
    ],
  },
  {
    titulo: "Backend",
    color: "indigo",
    campos: [
      { key: "backend_lenguaje",   label: "Lenguaje" },
      { key: "backend_framework",  label: "Framework" },
      { key: "backend_tipo_api",   label: "Tipo de API" },
    ],
  },
  {
    titulo: "Base de datos",
    color: "emerald",
    campos: [
      { key: "bd_motor", label: "Motor" },
      { key: "bd_orm",   label: "ORM" },
    ],
  },
  {
    titulo: "Seguridad",
    color: "rose",
    campos: [
      { key: "seg_autenticacion", label: "Autenticación" },
      { key: "seg_cifrado",       label: "Cifrado de contraseñas" },
    ],
  },
  {
    titulo: "Infraestructura",
    color: "amber",
    campos: [
      { key: "infra_despliegue",    label: "Despliegue" },
      { key: "infra_contenedores",  label: "Contenedores" },
    ],
  },
];

const estilosPorColor = {
  blue:    { borde: "border-blue-200",    titulo: "text-blue-700",    fondo: "bg-blue-50" },
  indigo:  { borde: "border-indigo-200",  titulo: "text-indigo-700",  fondo: "bg-indigo-50" },
  emerald: { borde: "border-emerald-200", titulo: "text-emerald-700", fondo: "bg-emerald-50" },
  rose:    { borde: "border-rose-200",    titulo: "text-rose-700",    fondo: "bg-rose-50" },
  amber:   { borde: "border-amber-200",   titulo: "text-amber-700",   fondo: "bg-amber-50" },
};

const FORM_VACIO = {
  frontend_framework: "",
  frontend_libreria_ui: "",
  frontend_manejo_estado: "",
  backend_lenguaje: "",
  backend_framework: "",
  backend_tipo_api: "",
  bd_motor: "",
  bd_orm: "",
  seg_autenticacion: "",
  seg_roles: "",
  seg_cifrado: "",
  infra_despliegue: "",
  infra_contenedores: "",
  restricciones_adicionales: "",
};

export default function SpecsTecnicas() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(FORM_VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/proyectos/${id}/specs-tecnicas`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({ ...FORM_VACIO, ...data });
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
            Define el stack tecnológico y requisitos técnicos para la generación del sistema
          </p>
        </div>
      </div>

      {/* Secciones */}
      {SECCIONES.map((sec) => {
        const est = estilosPorColor[sec.color];
        return (
          <div key={sec.titulo} className={`rounded-xl border ${est.borde} ${est.fondo} p-5`}>
            <h2 className={`font-semibold ${est.titulo} mb-4`}>{sec.titulo}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sec.campos.map((campo) => (
                <Campo
                  key={campo.key}
                  label={campo.label}
                  value={form[campo.key] || ""}
                  opciones={OPCIONES[campo.key] || []}
                  onChange={(v) => onChange(campo.key, v)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Roles (campo especial - texto libre) */}
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
        <h2 className="font-semibold text-rose-700 mb-4">Roles del sistema</h2>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            Lista los roles de usuario del sistema (ej: Administrador, Cliente, Vendedor)
          </label>
          <textarea
            value={form.seg_roles || ""}
            onChange={(e) => onChange("seg_roles", e.target.value)}
            rows={3}
            placeholder="Ej: Administrador — acceso total al sistema&#10;Cliente — puede ver y comprar productos&#10;Vendedor — gestiona su inventario"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white resize-none"
          />
        </div>
      </div>

      {/* Restricciones adicionales */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Restricciones y notas adicionales</h2>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            Cualquier restricción técnica, de negocio o nota importante para el desarrollo
          </label>
          <textarea
            value={form.restricciones_adicionales || ""}
            onChange={(e) => onChange("restricciones_adicionales", e.target.value)}
            rows={4}
            placeholder="Ej: El sistema debe soportar múltiples idiomas. Las contraseñas deben tener mínimo 8 caracteres. El sistema debe funcionar en dispositivos móviles..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white resize-none"
          />
        </div>
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

function Campo({ label, value, opciones, onChange }) {
  const [esOtro, setEsOtro] = useState(
    value !== "" && !opciones.includes(value) && value !== "Otro"
  );
  const [valorOtro, setValorOtro] = useState(
    value !== "" && !opciones.includes(value) ? value : ""
  );

  function handleSelect(v) {
    if (v === "Otro") {
      setEsOtro(true);
      onChange(valorOtro);
    } else {
      setEsOtro(false);
      onChange(v);
    }
  }

  function handleOtro(v) {
    setValorOtro(v);
    onChange(v);
  }

  const valorSelect = esOtro ? "Otro" : (opciones.includes(value) ? value : "");

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <select
        value={valorSelect}
        onChange={(e) => handleSelect(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white"
      >
        <option value="">Seleccionar...</option>
        {opciones.map((op) => (
          <option key={op} value={op}>{op}</option>
        ))}
      </select>
      {esOtro && (
        <input
          type="text"
          value={valorOtro}
          onChange={(e) => handleOtro(e.target.value)}
          placeholder={`Especifica el ${label.toLowerCase()}`}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white mt-1"
        />
      )}
    </div>
  );
}