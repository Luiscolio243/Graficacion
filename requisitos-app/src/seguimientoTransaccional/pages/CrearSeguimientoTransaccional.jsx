import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

export default function CrearSeguimientoTransaccional() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [procesos,   setProcesos]   = useState([]);
  const [equipoTI,   setEquipoTI]   = useState([]);
  const [guardando,  setGuardando]  = useState(false);

  const [form, setForm] = useState({
    titulo:         "",
    id_proceso:     "",
    id_subproceso:  "",
    nombre_proceso: "",
    id_responsable: "",
    pasos:          [{ nombre: "", duracion_min: "" }],
    problemas:      [""],
    metricas:       [{ nombre: "", valor: "" }],
  });

  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  useEffect(() => {
    fetch(`${BASE_URL}/procesos/${id}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setProcesos)
      .catch(() => {});

    const token = localStorage.getItem("token");
    fetch(`${BASE_URL}/ti/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then(setEquipoTI)
      .catch(() => {});
  }, [id]);

  const subprocesosFiltrados =
    procesos.find((p) => String(p.id_proceso) === String(form.id_proceso))?.subprocesos || [];

  const handleCambiarProceso = (e) => {
    const proc = procesos.find((p) => String(p.id_proceso) === e.target.value);
    setForm((prev) => ({
      ...prev,
      id_proceso:     e.target.value,
      id_subproceso:  "",
      nombre_proceso: proc?.nombre || "",
    }));
  };

  // ── Pasos ──
  const agregarPaso = () => set("pasos", [...form.pasos, { nombre: "", duracion_min: "" }]);

  const actualizarPaso = (idx, campo, valor) =>
    set("pasos", form.pasos.map((p, i) => i === idx ? { ...p, [campo]: valor } : p));

  const eliminarPaso = (idx) => {
    if (form.pasos.length > 1)
      set("pasos", form.pasos.filter((_, i) => i !== idx));
  };

  // ── Problemas ──
  const agregarProblema  = () => set("problemas", [...form.problemas, ""]);

  const actualizarProblema = (idx, valor) =>
    set("problemas", form.problemas.map((p, i) => i === idx ? valor : p));

  const eliminarProblema = (idx) => {
    if (form.problemas.length > 1)
      set("problemas", form.problemas.filter((_, i) => i !== idx));
  };

  // ── Métricas ──
  const agregarMetrica = () => set("metricas", [...form.metricas, { nombre: "", valor: "" }]);

  const actualizarMetrica = (idx, campo, valor) =>
    set("metricas", form.metricas.map((m, i) => i === idx ? { ...m, [campo]: valor } : m));

  const eliminarMetrica = (idx) => {
    if (form.metricas.length > 1)
      set("metricas", form.metricas.filter((_, i) => i !== idx));
  };

  const handleGuardar = async () => {
    if (!form.titulo.trim())
      return alert("El título es obligatorio.");
    if (!form.id_proceso)
      return alert("Selecciona un proceso.");
    if (!form.pasos.some((p) => p.nombre.trim()))
      return alert("Agrega al menos un paso con nombre.");

    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/seguimientos/crear/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo:         form.titulo,
          nombre_proceso: form.nombre_proceso,
          id_proceso:     form.id_proceso ? parseInt(form.id_proceso) : null,
          id_subproceso:  form.id_subproceso ? parseInt(form.id_subproceso) : null,
          id_responsable: form.id_responsable ? parseInt(form.id_responsable) : null,
          pasos: form.pasos
            .filter((p) => p.nombre.trim())
            .map((p, i) => ({
              nombre:       p.nombre,
              duracion_min: Number(p.duracion_min) || null,
              orden:        i + 1,
            })),
          problemas: form.problemas
            .filter((p) => p.trim())
            .map((p) => ({ descripcion: p })),
          metricas: form.metricas
            .filter((m) => m.nombre.trim())
            .map((m) => ({ nombre: m.nombre, valor: m.valor })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear");
      }
      navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional`);
    } catch (e) {
      alert(e.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-7 max-w-3xl mx-auto">

      {/* Botón de regreso */}
      <button
        onClick={() => navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver a Seguimiento Transaccional
      </button>

      {/* Encabezado */}
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Nuevo Seguimiento Transaccional</h1>
        <p className="text-sm text-gray-500 mt-0.5">Registra los pasos, métricas y problemas de un proceso</p>
      </div>

      {/* Formulario */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">

        {/* Información general */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Información general</p>

          <div>
            <label className={labelCls}>Título <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              placeholder="Ej: Seguimiento de salida de merma"
              className={inputCls}
            />
          </div>

          {/* ID Transacción — informativo */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
            <p className="text-xs font-medium text-indigo-700">ID de Transacción</p>
            <p className="text-sm text-indigo-600 mt-0.5">
              Se generará automáticamente —{" "}
              <span className="font-mono font-bold">TXN-{new Date().getFullYear()}-XXX</span>
            </p>
          </div>

          <div>
            <label className={labelCls}>
              Responsable <span className="text-gray-400 font-normal normal-case">(opcional)</span>
            </label>
            <select
              value={form.id_responsable}
              onChange={(e) => set("id_responsable", e.target.value)}
              className={inputCls}
            >
              <option value="">Sin responsable asignado</option>
              {equipoTI.map((e) => (
                <option key={e.usuario.id_usuario} value={e.usuario.id_usuario}>
                  {e.usuario.nombre} {e.usuario.apellido}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Proceso relacionado */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Proceso relacionado</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Proceso <span className="text-red-500">*</span></label>
              <select value={form.id_proceso} onChange={handleCambiarProceso} className={inputCls}>
                <option value="">Selecciona un proceso</option>
                {procesos.map((p) => (
                  <option key={p.id_proceso} value={p.id_proceso}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Subproceso</label>
              <select
                value={form.id_subproceso}
                onChange={(e) => set("id_subproceso", e.target.value)}
                disabled={!form.id_proceso}
                className={inputCls + " disabled:opacity-50"}
              >
                <option value="">{form.id_proceso ? "Sin subproceso" : "Elige un proceso primero"}</option>
                {subprocesosFiltrados.map((sp) => (
                  <option key={sp.id_subproceso} value={sp.id_subproceso}>{sp.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pasos */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Pasos del proceso <span className="text-red-500">*</span>
            </p>
            <button
              type="button"
              onClick={agregarPaso}
              className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors"
            >
              + Agregar paso
            </button>
          </div>
          <div className="space-y-3">
            {form.pasos.map((paso, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-2.5 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-gray-600">Paso {idx + 1}</span>
                  </div>
                  {form.pasos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarPaso(idx)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={paso.nombre}
                  onChange={(e) => actualizarPaso(idx, "nombre", e.target.value)}
                  placeholder="Nombre del paso"
                  className={inputCls}
                />
                <input
                  type="number"
                  value={paso.duracion_min}
                  onChange={(e) => actualizarPaso(idx, "duracion_min", e.target.value)}
                  placeholder="Duración en minutos (opcional)"
                  className={inputCls}
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Métricas */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Métricas <span className="text-gray-400 font-normal normal-case text-[10px]">(opcional)</span>
            </p>
            <button
              type="button"
              onClick={agregarMetrica}
              className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors"
            >
              + Agregar métrica
            </button>
          </div>
          <div className="space-y-2">
            {form.metricas.map((metrica, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={metrica.nombre}
                  onChange={(e) => actualizarMetrica(idx, "nombre", e.target.value)}
                  placeholder="Nombre (ej: Tiempo real)"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  value={metrica.valor}
                  onChange={(e) => actualizarMetrica(idx, "valor", e.target.value)}
                  placeholder="Valor (ej: 4.5 horas)"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {form.metricas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarMetrica(idx)}
                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Problemas identificados */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Problemas identificados <span className="text-gray-400 font-normal normal-case text-[10px]">(opcional)</span>
            </p>
            <button
              type="button"
              onClick={agregarProblema}
              className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors"
            >
              + Agregar problema
            </button>
          </div>
          <div className="space-y-2">
            {form.problemas.map((problema, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v6M8 11v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <input
                  type="text"
                  value={problema}
                  onChange={(e) => actualizarProblema(idx, e.target.value)}
                  placeholder={`Problema ${idx + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {form.problemas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarProblema(idx)}
                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional`)}
          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          {guardando ? "Guardando..." : "Crear Seguimiento"}
        </button>
      </div>
    </div>
  );
}
