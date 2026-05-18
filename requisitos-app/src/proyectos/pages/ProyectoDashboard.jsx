import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* Icons */
function IconFile()  { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M9 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V6L9 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 1v5h5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>; }
function IconCal()   { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 1.5v3M11 1.5v3M1.5 7h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IconOrg()   { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 14V6l6-4 6 4v8" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 14v-4h4v4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>; }
function IconMail()  { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IconPhone() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 2a1 1 0 011-1h2.5l1 3-1.5 1a8 8 0 004 4l1-1.5 3 1V12a1 1 0 01-1 1C5.1 13.5 2.5 7.9 3 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>; }
function IconEdit()  { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>; }
function IconArrow() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

function IconUsers() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="7.5" cy="7" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 17c0-3 2.5-5.5 5.5-5.5S13 14 13 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="14" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M16.5 17c0-2.2-1.1-4.1-2.8-5.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function IconCode()  { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6.5 7l-4 3 4 3M13.5 7l4 3-4 3M11.5 5l-3 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IconFlow()  { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="7.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="14" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="14" y="13" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><path d="M6 10h4.5V4.5H14M10.5 10V15.5H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function IconDoc()   { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 2H5a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V7l-4-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M12 2v5h5M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function IconUML()   { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="1" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="13" y="1" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="13" y="15" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M7 3h3.5v8H13M13 17h-2.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function IconSpecs() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 2h8l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M12 2v4h4M7 9h6M7 12h6M7 15h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }

/* Configuración de estado */
const STATUS_STYLE = {
  "En Progreso":   "bg-blue-500/20 text-blue-100 border border-blue-400/30",
  "En progreso":   "bg-blue-500/20 text-blue-100 border border-blue-400/30",
  "Planificación": "bg-amber-500/20 text-amber-100 border border-amber-400/30",
  "Completado":    "bg-emerald-500/20 text-emerald-100 border border-emerald-400/30",
};

/* Configuración de módulos */
const MODULO_CONFIG = {
  blue:    { icon: <IconUsers />, iconBg: "bg-blue-50",    iconText: "text-blue-600",    border: "border-blue-100",    cta: "text-blue-600"    },
  indigo:  { icon: <IconCode />,  iconBg: "bg-indigo-50",  iconText: "text-indigo-600",  border: "border-indigo-100",  cta: "text-indigo-600"  },
  emerald: { icon: <IconFlow />,  iconBg: "bg-emerald-50", iconText: "text-emerald-600", border: "border-emerald-100", cta: "text-emerald-600" },
  rose:    { icon: <IconDoc />,   iconBg: "bg-rose-50",    iconText: "text-rose-600",    border: "border-rose-100",    cta: "text-rose-600"    },
  violet:  { icon: <IconUML />,   iconBg: "bg-violet-50",  iconText: "text-violet-600",  border: "border-violet-100",  cta: "text-violet-600"  },
  amber:   { icon: <IconSpecs />, iconBg: "bg-amber-50",   iconText: "text-amber-600",   border: "border-amber-100",   cta: "text-amber-600"   },
};

/* Componente principal */
export default function ProyectoDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proyecto,     setProyecto]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [productOwner, setProductOwner] = useState(null);
  const [techLeader,   setTechLeader]   = useState(null);

  async function descargarSpecs() {
    try {
      const res = await fetch(`http://127.0.0.1:5000/proyectos/${id}/specs-archivos`);
      if (!res.ok) { alert("Error al generar specs"); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `specs_${proyecto.nombre}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 150);
    } catch {
      alert("No se pudo conectar al servidor");
    }
  }

  useEffect(() => {
    const obtenerProyecto = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/proyectos/${id}`);
        if (!res.ok) throw new Error("Error al obtener el proyecto");
        const data = await res.json();
        setProyecto(data);

        const resPO = await fetch(`http://127.0.0.1:5000/productowner/${id}`);
        if (resPO.ok) setProductOwner(await resPO.json());

        const resTL = await fetch(`http://127.0.0.1:5000/tech_leaders/${id}`);
        if (resTL.ok) setTechLeader(await resTL.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    obtenerProyecto();
  }, [id]);

  if (loading) return (
    <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
      Cargando proyecto...
    </div>
  );

  if (error) return (
    <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
  );

  if (!proyecto) return (
    <div className="text-gray-500 text-sm">No se encontró el proyecto.</div>
  );

  const statusStyle = STATUS_STYLE[proyecto.estado] ?? "bg-white/10 text-white border border-white/20";

  return (
    <div className="space-y-7 max-w-7xl mx-auto">

      {/* Botón de regreso */}
      <button
        onClick={() => navigate("/app/proyectos")}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver a proyectos
      </button>

      {/*  Banner */}
      <div className="bg-indigo-600 rounded-2xl px-7 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-1">
              Dashboard del proyecto
            </p>
            <h1 className="text-2xl font-bold text-white leading-tight">
              {proyecto.nombre}
            </h1>
            {proyecto.organizacion && (
              <p className="text-indigo-200 text-sm mt-1">{proyecto.organizacion}</p>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0 mt-1">
            <button
              onClick={() => navigate(`/app/proyectos/${id}/editar`)}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20
                         border border-white/20 text-white text-sm font-medium
                         px-3.5 py-1.5 rounded-lg transition-colors duration-150"
            >
              <IconEdit />
              Editar proyecto
            </button>
            <button
              onClick={descargarSpecs}
              className="inline-flex items-center gap-1.5 bg-white text-indigo-700 hover:bg-indigo-50
                         text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors duration-150"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Descargar Specs
            </button>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${statusStyle}`}>
              {proyecto.estado}
            </span>
          </div>
        </div>
      </div>

      {/* Información general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <InfoCard titulo="Descripción" icon={<IconFile />}>
          {proyecto.descripcion || "Sin descripción"}
        </InfoCard>
        <InfoCard titulo="Fecha de inicio" icon={<IconCal />}>
          {proyecto.fecha_inicio || "Por definir"}
        </InfoCard>
        <InfoCard titulo="Organización" icon={<IconOrg />}>
          {proyecto.organizacion || "Por definir"}
        </InfoCard>
      </div>

      {/* Personas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <PersonaCard titulo="Product Owner" persona={productOwner} accentColor="#4F46E5" />
        <PersonaCard titulo="Tech Leader"   persona={techLeader}   accentColor="#0D9488" />
      </div>

      {/* Módulos */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Módulos del proyecto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ModuloCard
            titulo="Stakeholders"
            descripcion="Gestión de personas relacionadas con el Product Owner"
            color="blue"
            onClick={() => navigate(`/app/proyectos/${id}/stakeholders`)}
          />
          <ModuloCard
            titulo="Equipo de TI"
            descripcion="Equipo técnico que trabaja con el Tech Leader"
            color="indigo"
            onClick={() => navigate(`/app/proyectos/${id}/TI`)}
          />
          <ModuloCard
            titulo="Procesos"
            descripcion="Definición de procesos y subprocesos del negocio"
            color="emerald"
            onClick={() => navigate(`/app/proyectos/${id}/procesos`)}
          />
          <ModuloCard
            titulo="Requerimientos"
            descripcion="Documentación de requerimientos del proyecto"
            color="rose"
            onClick={() => navigate(`/app/proyectos/${id}/requerimientos`)}
          />
          <ModuloCard
            titulo="Diagramas UML"
            descripcion="Clases, paquetes, secuencias y casos de uso del sistema"
            color="violet"
            onClick={() => navigate(`/app/proyectos/${id}/diagramas`)}
          />
          <ModuloCard
            titulo="Specs Técnicas"
            descripcion="Arquitectura, tecnologías y especificaciones del sistema"
            color="amber"
            onClick={() => navigate(`/app/proyectos/${id}/specs-tecnicas`)}
          />
        </div>
      </div>
    </div>
  );
}

/* Sub-componentes */

function InfoCard({ titulo, icon, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">
          {icon}
        </div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {titulo}
        </span>
      </div>
      <p className="text-sm text-gray-900 leading-relaxed">{children}</p>
    </div>
  );
}

function PersonaCard({ titulo, persona, accentColor }) {
  const initial = persona?.nombre?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="h-1" style={{ backgroundColor: accentColor }} />
      <div className="p-5 flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center
                     text-white font-bold text-lg flex-shrink-0 select-none"
          style={{ backgroundColor: accentColor }}
        >
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {titulo}
          </span>
          <p className="font-semibold text-gray-900 mt-0.5 mb-2.5 truncate">
            {persona?.nombre ?? "No asignado"}
          </p>
          {persona ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="text-gray-400"><IconMail /></span>
                <span className="truncate">{persona.correo}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="text-gray-400"><IconPhone /></span>
                <span>{persona.telefono}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Sin información de contacto</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ModuloCard({ titulo, descripcion, color, onClick }) {
  const c = MODULO_CONFIG[color] ?? MODULO_CONFIG.indigo;

  return (
    <div
      onClick={onClick}
      className={`bg-white border ${c.border} rounded-xl p-5 cursor-pointer
                  hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group`}
    >
      <div className={`w-10 h-10 rounded-lg ${c.iconBg} ${c.iconText}
                       flex items-center justify-center mb-3`}>
        {c.icon}
      </div>

      <h3 className="font-semibold text-gray-900 text-sm mb-1">{titulo}</h3>
      <p className="text-xs text-gray-400 leading-relaxed mb-4">{descripcion}</p>

      <div className={`flex items-center gap-1 text-xs font-semibold ${c.cta}
                       group-hover:gap-2 transition-all duration-150`}>
        Ver módulo
        <IconArrow />
      </div>
    </div>
  );
}
