import { useNavigate } from "react-router-dom";
import { useState } from "react";

const API = "http://127.0.0.1:5000";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

function IconFolder() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function IconCode() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M14 6l-4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function NuevoProyecto() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "", descripcion: "", objetivo: "", organizacion: "", fechaInicio: "",
  });
  const [po, setPo] = useState({ nombre: "", apellidos: "", email: "", telefono: "" });
  const [lt, setLt] = useState({ nombre: "", apellidos: "", email: "", telefono: "" });

  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState(null);
  const [exito,     setExito]     = useState(false);

  const setF  = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setPO = (k, v) => setPo(p =>  ({ ...p, [k]: v }));
  const setLT = (k, v) => setLt(p =>  ({ ...p, [k]: v }));

  const crearProyecto = async () => {
    if (!form.nombre.trim()) { setError("El nombre del proyecto es obligatorio."); return; }

    setError(null);
    setGuardando(true);
    try {
      const userStorage = localStorage.getItem("user");
      const user = userStorage ? JSON.parse(userStorage) : null;
      if (!user) throw new Error("Usuario no autenticado");

      const body = {
        nombre:       form.nombre,
        descripcion:  form.descripcion,
        objetivo:     form.objetivo,
        organizacion: form.organizacion,
        id_usuario:   user.id,
        fechaInicio:  form.fechaInicio,
        productOwner: { nombre: po.nombre, apellidos: po.apellidos, email: po.email, telefono: po.telefono },
        liderTecnico: { nombre: lt.nombre, apellidos: lt.apellidos, email: lt.email, telefono: lt.telefono },
      };

      const res = await fetch(`${API}/proyectos/crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || err.error || "Error al crear el proyecto");
      }

      setExito(true);
      setTimeout(() => navigate("/app/proyectos"), 1800);
    } catch (e) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7">

      {/* Toast de éxito */}
      {exito && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl animate-pulse">
          <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <IconCheck />
          </span>
          <span className="text-sm font-medium">Proyecto creado correctamente</span>
        </div>
      )}

      {/* Volver */}
      <button
        onClick={() => navigate("/app/proyectos")}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver a proyectos
      </button>

      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
          <IconFolder />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Nuevo Proyecto</h1>
          <p className="text-sm text-gray-500 mt-0.5">Completa la información para crear el proyecto</p>
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-red-500 flex-shrink-0 mt-0.5">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M8 5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── Sección 1: Info del proyecto ── */}
      <SeccionCard
        numero="1"
        titulo="Información del Proyecto"
        descripcion="Datos generales que identifican al proyecto"
        icon={<IconFolder />}
        color="indigo"
      >
        <div className="space-y-4">
          <Campo
            label={<>Nombre del proyecto <span className="text-red-500">*</span></>}
            placeholder="Ej: Sistema de Gestión Empresarial"
            value={form.nombre}
            onChange={e => setF("nombre", e.target.value)}
            autoFocus
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo
              label="Organización"
              placeholder="Ej: Empresa ABC S.A."
              value={form.organizacion}
              onChange={e => setF("organizacion", e.target.value)}
            />
            <Campo
              label="Fecha de inicio"
              type="date"
              value={form.fechaInicio}
              onChange={e => setF("fechaInicio", e.target.value)}
            />
          </div>
          <CampoArea
            label="Descripción"
            placeholder="Describe brevemente de qué se trata el proyecto..."
            value={form.descripcion}
            onChange={e => setF("descripcion", e.target.value)}
          />
          <CampoArea
            label="Objetivo general"
            placeholder="¿Qué problema busca resolver este proyecto?"
            value={form.objetivo}
            onChange={e => setF("objetivo", e.target.value)}
          />
        </div>
      </SeccionCard>

      {/* ── Sección 2: Product Owner ── */}
      <SeccionCard
        numero="2"
        titulo="Product Owner"
        descripcion="Responsable del producto y representante del cliente"
        icon={<IconUser />}
        color="blue"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Nombre"              placeholder="Ej: Ana"         value={po.nombre}    onChange={e => setPO("nombre",    e.target.value)} />
          <Campo label="Apellidos"           placeholder="Ej: Martínez"    value={po.apellidos} onChange={e => setPO("apellidos", e.target.value)} />
          <Campo label="Correo electrónico"  type="email" placeholder="correo@ejemplo.com" value={po.email}    onChange={e => setPO("email",    e.target.value)} />
          <Campo label="Teléfono"            placeholder="Ej: 6681234567"  value={po.telefono}  onChange={e => setPO("telefono",  e.target.value)} />
        </div>
      </SeccionCard>

      {/* ── Sección 3: Líder Técnico ── */}
      <SeccionCard
        numero="3"
        titulo="Líder Técnico"
        descripcion="Responsable técnico del equipo de desarrollo"
        icon={<IconCode />}
        color="violet"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Nombre"              placeholder="Ej: Carlos"      value={lt.nombre}    onChange={e => setLT("nombre",    e.target.value)} />
          <Campo label="Apellidos"           placeholder="Ej: López"       value={lt.apellidos} onChange={e => setLT("apellidos", e.target.value)} />
          <Campo label="Correo electrónico"  type="email" placeholder="correo@ejemplo.com" value={lt.email}    onChange={e => setLT("email",    e.target.value)} />
          <Campo label="Teléfono"            placeholder="Ej: 6681234567"  value={lt.telefono}  onChange={e => setLT("telefono",  e.target.value)} />
        </div>
      </SeccionCard>

      {/* Footer de acciones */}
      <div className="flex justify-end gap-3 pb-8">
        <button
          onClick={() => navigate("/app/proyectos")}
          disabled={guardando}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={crearProyecto}
          disabled={guardando || exito}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white transition flex items-center gap-2"
        >
          {guardando ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Creando...
            </>
          ) : exito ? (
            <>
              <IconCheck />
              Creado
            </>
          ) : (
            "Crear Proyecto"
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Sub-componentes ─────────────────────────────── */

const COLOR_MAP = {
  indigo: { dot: "bg-indigo-500", badge: "bg-indigo-100 text-indigo-700", iconBg: "bg-indigo-50 text-indigo-600", border: "border-indigo-100" },
  blue:   { dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700",     iconBg: "bg-blue-50 text-blue-600",     border: "border-blue-100"   },
  violet: { dot: "bg-violet-500", badge: "bg-violet-100 text-violet-700", iconBg: "bg-violet-50 text-violet-600", border: "border-violet-100" },
};

function SeccionCard({ numero, titulo, descripcion, icon, color, children }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.indigo;
  return (
    <div className={`bg-white border ${c.border} rounded-2xl overflow-hidden shadow-sm`}>
      {/* Header de sección */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
        <span className={`w-7 h-7 rounded-full ${c.badge} text-xs font-bold flex items-center justify-center flex-shrink-0`}>
          {numero}
        </span>
        <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{titulo}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{descripcion}</p>
        </div>
      </div>
      {/* Contenido */}
      <div className="px-6 py-5">
        {children}
      </div>
    </div>
  );
}

function Campo({ label, placeholder = "", type = "text", value, onChange, autoFocus }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        className={inputCls}
      />
    </div>
  );
}

function CampoArea({ label, placeholder = "", value, onChange }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <textarea
        rows={3}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputCls + " resize-none"}
      />
    </div>
  );
}
