import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

export default function CrearEntrevista() {
  const { id }  = useParams();
  const navegar = useNavigate();

  const [form, setForm] = useState({
    titulo:           "",
    entrevistador:    "",
    entrevistado:     "",
    notas:            "",
    proceso:          "",
    subproceso:       "",
    fecha_programada: "",
    preguntas:        [""],
  });

  const [entrevistadores, setEntrevistadores] = useState([]);
  const [stakeholders,    setStakeholders]    = useState([]);
  const [procesos,        setProcesos]        = useState([]);
  const [guardando,       setGuardando]       = useState(false);

  useEffect(() => {
    const token   = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${BASE_URL}/ti/${id}`, { headers })
      .then((r) => r.ok ? r.json() : []).then(setEntrevistadores).catch(() => {});
    fetch(`${BASE_URL}/stakeholders/${id}`, { headers })
      .then((r) => r.ok ? r.json() : []).then(setStakeholders).catch(() => {});
    fetch(`${BASE_URL}/procesos/${id}`, { headers })
      .then((r) => r.ok ? r.json() : []).then(setProcesos).catch(() => {});
  }, [id]);

  const subprocesosFiltrados =
    procesos.find((p) => String(p.id_proceso) === String(form.proceso))?.subprocesos || [];

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const agregarPregunta = () => set("preguntas", [...form.preguntas, ""]);

  const actualizarPregunta = (index, valor) => {
    const copia = [...form.preguntas];
    copia[index] = valor;
    set("preguntas", copia);
  };

  const eliminarPregunta = (index) => {
    if (form.preguntas.length === 1) return;
    set("preguntas", form.preguntas.filter((_, i) => i !== index));
  };

  const handleGuardar = async () => {
    if (!form.titulo.trim())     return alert("El título es obligatorio.");
    if (!form.entrevistador)     return alert("Selecciona un entrevistador.");
    if (!form.entrevistado)      return alert("Selecciona un entrevistado.");

    setGuardando(true);
    try {
      const token   = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

      const res = await fetch(`${BASE_URL}/entrevistas/crear`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id_proyecto:      parseInt(id),
          titulo:           form.titulo,
          id_entrevistador: parseInt(form.entrevistador),
          id_stakeholder:   parseInt(form.entrevistado),
          objetivo:         form.notas || null,
          id_subproceso:    form.subproceso ? parseInt(form.subproceso) : null,
          fecha_programada: form.fecha_programada || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        return alert(err.error || "Error al crear la entrevista.");
      }

      const { entrevista } = await res.json();

      for (const pregunta of form.preguntas.filter((p) => p.trim())) {
        await fetch(`${BASE_URL}/preguntas/agregar`, {
          method: "POST",
          headers,
          body: JSON.stringify({ id_entrevista: entrevista.id_entrevista, pregunta, origen: "manual" }),
        });
      }

      navegar(`/app/proyectos/${id}/entrevistas`);
    } catch (e) {
      alert("Error de conexión con el servidor.");
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-7 max-w-3xl mx-auto">

      {/* Botón de regreso */}
      <button
        onClick={() => navegar(`/app/proyectos/${id}/entrevistas`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver a Entrevistas
      </button>

      {/* Encabezado */}
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Nueva Entrevista</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Completa la información y agrega las preguntas de la entrevista
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">

        {/* Sección: Información general */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Información general</p>

          <div>
            <label className={labelCls}>Título <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              placeholder="Ej: Entrevista con usuario final"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Entrevistador <span className="text-red-500">*</span></label>
              <select value={form.entrevistador} onChange={(e) => set("entrevistador", e.target.value)} className={inputCls}>
                <option value="">Seleccionar</option>
                {entrevistadores.map((e) => (
                  <option key={e.usuario.id_usuario} value={e.usuario.id_usuario}>
                    {e.usuario.nombre} {e.usuario.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Entrevistado <span className="text-red-500">*</span></label>
              <select value={form.entrevistado} onChange={(e) => set("entrevistado", e.target.value)} className={inputCls}>
                <option value="">Seleccionar</option>
                {stakeholders.map((s) => (
                  <option key={s.id_stakeholder} value={s.id_stakeholder}>{s.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Fecha programada
                <span className="ml-1 text-gray-400 normal-case font-normal">(opcional)</span>
              </label>
              <input
                type="datetime-local"
                value={form.fecha_programada}
                onChange={(e) => set("fecha_programada", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Notas / Contexto</label>
            <textarea
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
              placeholder="Contexto o notas adicionales sobre la entrevista"
              rows={3}
              className={inputCls}
            />
          </div>
        </div>

        {/* Sección: Proceso */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Proceso relacionado</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Proceso</label>
              <select
                value={form.proceso}
                onChange={(e) => set("proceso", e.target.value) || set("subproceso", "")}
                className={inputCls}
              >
                <option value="">Sin proceso</option>
                {procesos.map((p) => (
                  <option key={p.id_proceso} value={p.id_proceso}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Subproceso</label>
              <select
                value={form.subproceso}
                onChange={(e) => set("subproceso", e.target.value)}
                disabled={!form.proceso}
                className={inputCls + " disabled:opacity-50"}
              >
                <option value="">{form.proceso ? "Sin subproceso" : "Elige un proceso primero"}</option>
                {subprocesosFiltrados.map((sp) => (
                  <option key={sp.id_subproceso} value={sp.id_subproceso}>{sp.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sección: Preguntas */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Preguntas</p>
            <button
              type="button"
              onClick={agregarPregunta}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              + Añadir pregunta
            </button>
          </div>

          <div className="space-y-2">
            {form.preguntas.map((pregunta, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold
                                 flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={pregunta}
                  onChange={(e) => actualizarPregunta(index, e.target.value)}
                  placeholder={`Pregunta ${index + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {form.preguntas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarPregunta(index)}
                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pb-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/entrevistas`)}
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg
                     text-sm font-medium hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                     text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          {guardando ? "Creando..." : "Crear Entrevista"}
        </button>
      </div>
    </div>
  );
}
