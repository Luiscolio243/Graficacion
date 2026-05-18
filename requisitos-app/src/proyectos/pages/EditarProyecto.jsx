import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const BASE_URL = "http://127.0.0.1:5000";

const ESTADOS = ["En progreso", "Completado", "Pausado", "Cancelado", "Planeación"];

const inputCls =
  "w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none " +
  "focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

export default function EditarProyecto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading,   setLoading]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState(null);
  const [exito,     setExito]     = useState(false);

  const [nombre,       setNombre]       = useState("");
  const [descripcion,  setDescripcion]  = useState("");
  const [objetivo,     setObjetivo]     = useState("");
  const [organizacion, setOrganizacion] = useState("");
  const [fechaInicio,  setFechaInicio]  = useState("");
  const [estado,       setEstado]       = useState("En progreso");

  const [poNombre,    setPoNombre]    = useState("");
  const [poApellidos, setPoApellidos] = useState("");
  const [poEmail,     setPoEmail]     = useState("");
  const [poTelefono,  setPoTelefono]  = useState("");

  const [ltNombre,    setLtNombre]    = useState("");
  const [ltApellidos, setLtApellidos] = useState("");
  const [ltEmail,     setLtEmail]     = useState("");
  const [ltTelefono,  setLtTelefono]  = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const [respProyecto, respPO, respTL] = await Promise.all([
          fetch(`${BASE_URL}/proyectos/${id}`),
          fetch(`${BASE_URL}/productowner/${id}`),
          fetch(`${BASE_URL}/tech_leaders/${id}`),
        ]);

        if (!respProyecto.ok) throw new Error("Error al obtener el proyecto");
        const data = await respProyecto.json();

        setNombre(data.nombre || "");
        setDescripcion(data.descripcion || "");
        setObjetivo(data.objetivo || "");
        setOrganizacion(data.organizacion || "");
        setFechaInicio(data.fecha_inicio || "");
        setEstado(data.estado || "En progreso");

        if (respPO.ok) {
          const po = await respPO.json();
          const partes = (po.nombre || "").split(" ");
          setPoNombre(partes[0] || "");
          setPoApellidos(partes.slice(1).join(" ") || "");
          setPoEmail(po.correo || "");
          setPoTelefono(po.telefono || "");
        }

        if (respTL.ok) {
          const tl = await respTL.json();
          const partes = (tl.nombre || "").split(" ");
          setLtNombre(partes[0] || "");
          setLtApellidos(partes.slice(1).join(" ") || "");
          setLtEmail(tl.correo || "");
          setLtTelefono(tl.telefono || "");
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  const guardarCambios = async () => {
    if (!nombre.trim()) return setError("El nombre del proyecto es obligatorio.");
    setError(null);
    setGuardando(true);
    try {
      const res = await fetch(`${BASE_URL}/proyectos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre, descripcion, objetivo, organizacion, fechaInicio, estado,
          productOwner: { nombre: poNombre, apellidos: poApellidos, email: poEmail, telefono: poTelefono },
          liderTecnico: { nombre: ltNombre, apellidos: ltApellidos, email: ltEmail, telefono: ltTelefono },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al guardar cambios");
      }
      setExito(true);
      setTimeout(() => navigate(`/app/proyectos/${id}`), 1200);
    } catch (e) {
      setError(e.message || "Error al editar proyecto");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-7">
      <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
        Cargando proyecto...
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-7">

      {/* Botón atrás */}
      <button
        onClick={() => navigate(`/app/proyectos/${id}`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver al proyecto
      </button>

      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
          {nombre ? nombre[0].toUpperCase() : "P"}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Editar Proyecto</h1>
          <p className="text-sm text-gray-500 mt-0.5">Actualiza los detalles básicos de tu proyecto</p>
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M8 5v3M8 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      {/* Éxito */}
      {exito && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Cambios guardados. Redirigiendo...
        </div>
      )}

      {/* ── Sección: Información general ───────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h7v2H2v-2z" fill="currentColor" opacity="0.8"/>
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-gray-700">Información del Proyecto</h2>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className={labelCls}>Nombre del Proyecto <span className="text-red-500 normal-case font-normal">*</span></label>
            <input
              value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Sistema de Gestión Empresarial"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Descripción</label>
            <textarea
              rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)}
              placeholder="Describe brevemente de qué se trata el proyecto..."
              className={inputCls + " resize-none"}
            />
          </div>

          <div>
            <label className={labelCls}>Objetivo General</label>
            <textarea
              rows={3} value={objetivo} onChange={e => setObjetivo(e.target.value)}
              placeholder="¿Qué problema busca resolver este proyecto?"
              className={inputCls + " resize-none"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Organización</label>
              <input
                value={organizacion} onChange={e => setOrganizacion(e.target.value)}
                placeholder="Ej: Empresa S.A. de C.V."
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Fecha de Inicio</label>
              <input
                type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Estado</label>
            <select value={estado} onChange={e => setEstado(e.target.value)} className={inputCls}>
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Sección: Product Owner ──────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-gray-700">Product Owner</h2>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nombre</label>
              <input value={poNombre} onChange={e => setPoNombre(e.target.value)} placeholder="Nombre" className={inputCls}/>
            </div>
            <div>
              <label className={labelCls}>Apellidos</label>
              <input value={poApellidos} onChange={e => setPoApellidos(e.target.value)} placeholder="Apellidos" className={inputCls}/>
            </div>
            <div>
              <label className={labelCls}>Correo electrónico</label>
              <input type="email" value={poEmail} onChange={e => setPoEmail(e.target.value)} placeholder="correo@empresa.com" className={inputCls}/>
            </div>
            <div>
              <label className={labelCls}>Teléfono</label>
              <input value={poTelefono} onChange={e => setPoTelefono(e.target.value)} placeholder="Ej: 6681234567" className={inputCls}/>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sección: Líder Técnico ──────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M12 2l1.5 1.5L10 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-gray-700">Líder Técnico</h2>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nombre</label>
              <input value={ltNombre} onChange={e => setLtNombre(e.target.value)} placeholder="Nombre" className={inputCls}/>
            </div>
            <div>
              <label className={labelCls}>Apellidos</label>
              <input value={ltApellidos} onChange={e => setLtApellidos(e.target.value)} placeholder="Apellidos" className={inputCls}/>
            </div>
            <div>
              <label className={labelCls}>Correo electrónico</label>
              <input type="email" value={ltEmail} onChange={e => setLtEmail(e.target.value)} placeholder="correo@empresa.com" className={inputCls}/>
            </div>
            <div>
              <label className={labelCls}>Teléfono</label>
              <input value={ltTelefono} onChange={e => setLtTelefono(e.target.value)} placeholder="Ej: 6681234567" className={inputCls}/>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 pb-8">
        <button
          onClick={() => navigate(`/app/proyectos/${id}`)}
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          onClick={guardarCambios}
          disabled={guardando || exito}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
        >
          {guardando ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Guardando...
            </>
          ) : exito ? (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Guardado
            </>
          ) : "Guardar cambios"}
        </button>
      </div>

    </div>
  );
}
