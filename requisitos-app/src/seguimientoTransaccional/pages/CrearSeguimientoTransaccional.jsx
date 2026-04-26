import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

export default function CrearSeguimientoTransaccional() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [procesos, setProcesos] = useState([]);
  const [subprocesosFiltrados, setSubprocesosFiltrados] = useState([]);
  const [equipoTI, setEquipoTI] = useState([]);
  const [guardando, setGuardando] = useState(false);

  const [formulario, setFormulario] = useState({
    titulo: "",
    nombre_proceso: "",
    id_proceso: "",
    id_subproceso: "",
    id_responsable: "",
    pasos: [{ nombre: "", duracion_min: "" }],
    problemas: [""],
    metricas: [{ nombre: "", valor: "" }],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${BASE_URL}/procesos/${id}`, { headers })
      .then(r => r.ok ? r.json() : []).then(setProcesos).catch(() => {});

    fetch(`${BASE_URL}/ti/${id}`, { headers })
      .then(r => r.ok ? r.json() : []).then(setEquipoTI).catch(() => {});
  }, [id]);

  const handleCambiarProceso = (e) => {
    const idProceso = e.target.value;
    const proceso = procesos.find(p => String(p.id_proceso) === String(idProceso));
    setSubprocesosFiltrados(proceso?.subprocesos || []);
    // Autocompletar nombre_proceso
    setFormulario({
      ...formulario,
      id_proceso: idProceso,
      id_subproceso: "",
      nombre_proceso: proceso?.nombre || "",
    });
  };

  // ── Pasos ──
  const agregarPaso = () =>
    setFormulario({ ...formulario, pasos: [...formulario.pasos, { nombre: "", duracion_min: "" }] });

  const actualizarPaso = (index, campo, valor) => {
    const nuevos = [...formulario.pasos];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setFormulario({ ...formulario, pasos: nuevos });
  };

  const eliminarPaso = (index) => {
    if (formulario.pasos.length > 1)
      setFormulario({ ...formulario, pasos: formulario.pasos.filter((_, i) => i !== index) });
  };

  // ── Problemas ──
  const agregarProblema = () =>
    setFormulario({ ...formulario, problemas: [...formulario.problemas, ""] });

  const actualizarProblema = (index, valor) => {
    const nuevos = [...formulario.problemas];
    nuevos[index] = valor;
    setFormulario({ ...formulario, problemas: nuevos });
  };

  const eliminarProblema = (index) => {
    if (formulario.problemas.length > 1)
      setFormulario({ ...formulario, problemas: formulario.problemas.filter((_, i) => i !== index) });
  };

  // ── Métricas ──
  const agregarMetrica = () =>
    setFormulario({ ...formulario, metricas: [...formulario.metricas, { nombre: "", valor: "" }] });

  const actualizarMetrica = (index, campo, valor) => {
    const nuevas = [...formulario.metricas];
    nuevas[index] = { ...nuevas[index], [campo]: valor };
    setFormulario({ ...formulario, metricas: nuevas });
  };

  const eliminarMetrica = (index) => {
    if (formulario.metricas.length > 1)
      setFormulario({ ...formulario, metricas: formulario.metricas.filter((_, i) => i !== index) });
  };

  const handleGuardar = async () => {
    if (!formulario.titulo.trim() || !formulario.id_proceso || !formulario.pasos.some(p => p.nombre.trim())) {
      alert("Completa el título, proceso y al menos un paso.");
      return;
    }
    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/seguimientos/crear/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          titulo:         formulario.titulo,
          nombre_proceso: formulario.nombre_proceso,
          id_proceso:     formulario.id_proceso ? parseInt(formulario.id_proceso) : null,
          id_subproceso:  formulario.id_subproceso ? parseInt(formulario.id_subproceso) : null,
          id_responsable: formulario.id_responsable ? parseInt(formulario.id_responsable) : null,
          pasos: formulario.pasos
            .filter(p => p.nombre.trim())
            .map((p, i) => ({
              nombre:      p.nombre,
              duracion_min: Number(p.duracion_min) || null,
              orden:        i + 1,
            })),
          problemas: formulario.problemas
            .filter(p => p.trim())
            .map(p => ({ descripcion: p })),
          metricas: formulario.metricas
            .filter(m => m.nombre.trim())
            .map(m => ({ nombre: m.nombre, valor: m.valor })),
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional`)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seguimiento Transaccional</h1>
          <p className="text-gray-600 mt-1">Registra y da seguimiento a una transacción</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título del Seguimiento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formulario.titulo}
            onChange={e => setFormulario({ ...formulario, titulo: e.target.value })}
            placeholder="Ej: Seguimiento de salida de merma"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* ID Transacción — solo informativo */}
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-xs font-medium text-red-700">ID de Transacción</p>
          <p className="text-sm text-red-600 mt-0.5">
            Se generará automáticamente al guardar — formato: <span className="font-mono font-bold">TXN-{new Date().getFullYear()}-XXX</span>
          </p>
        </div>

        {/* Responsable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
          <select
            value={formulario.id_responsable}
            onChange={e => setFormulario({ ...formulario, id_responsable: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="">Selecciona un responsable</option>
            {equipoTI.map(e => (
              <option key={e.usuario.id_usuario} value={e.usuario.id_usuario}>
                {e.usuario.nombre} {e.usuario.apellido}
              </option>
            ))}
          </select>
        </div>

        {/* Proceso / Subproceso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proceso <span className="text-red-500">*</span>
            </label>
            <select
              value={formulario.id_proceso}
              onChange={handleCambiarProceso}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="">Selecciona un proceso</option>
              {procesos.map(p => (
                <option key={p.id_proceso} value={p.id_proceso}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subproceso</label>
            <select
              value={formulario.id_subproceso}
              onChange={e => setFormulario({ ...formulario, id_subproceso: e.target.value })}
              disabled={!formulario.id_proceso}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {formulario.id_proceso ? "Selecciona un subproceso" : "Primero elige un proceso"}
              </option>
              {subprocesosFiltrados.map(sp => (
                <option key={sp.id_subproceso} value={sp.id_subproceso}>{sp.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pasos */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Pasos del Proceso <span className="text-red-500">*</span>
            </label>
            <button onClick={agregarPaso} className="text-red-600 hover:text-red-700 font-medium text-sm">
              + Agregar paso
            </button>
          </div>
          <div className="space-y-3">
            {formulario.pasos.map((paso, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-gray-700">Paso {index + 1}</p>
                  {formulario.pasos.length > 1 && (
                    <button onClick={() => eliminarPaso(index)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                      Eliminar
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={paso.nombre}
                  onChange={e => actualizarPaso(index, "nombre", e.target.value)}
                  placeholder="Nombre del paso"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="number"
                  value={paso.duracion_min}
                  onChange={e => actualizarPaso(index, "duracion_min", e.target.value)}
                  placeholder="Duración en minutos (opcional)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Problemas */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Problemas Identificados <span className="text-gray-400 font-normal text-xs">(opcional)</span>
            </label>
            <button onClick={agregarProblema} className="text-red-600 hover:text-red-700 font-medium text-sm">
              + Agregar problema
            </button>
          </div>
          <div className="space-y-2">
            {formulario.problemas.map((problema, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={problema}
                  onChange={e => actualizarProblema(index, e.target.value)}
                  placeholder={`Problema ${index + 1}`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {formulario.problemas.length > 1 && (
                  <button onClick={() => eliminarProblema(index)} className="px-3 py-2 text-red-500 hover:text-red-700 text-sm font-medium">
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Métricas */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Métricas <span className="text-gray-400 font-normal text-xs">(opcional)</span>
            </label>
            <button onClick={agregarMetrica} className="text-red-600 hover:text-red-700 font-medium text-sm">
              + Agregar métrica
            </button>
          </div>
          <div className="space-y-3">
            {formulario.metricas.map((metrica, index) => (
              <div key={index} className="flex gap-2 items-end">
                <input
                  type="text"
                  value={metrica.nombre}
                  onChange={e => actualizarMetrica(index, "nombre", e.target.value)}
                  placeholder="Nombre (ej: Tiempo real)"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  value={metrica.valor}
                  onChange={e => actualizarMetrica(index, "valor", e.target.value)}
                  placeholder="Valor (ej: 4.5 horas)"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {formulario.metricas.length > 1 && (
                  <button onClick={() => eliminarMetrica(index)} className="px-3 py-2 text-red-500 hover:text-red-700 text-sm font-medium">
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition"
          >
            {guardando ? "Creando..." : "Crear Seguimiento Transaccional"}
          </button>
          <button
            onClick={() => navegar(`/app/proyectos/${id}/requerimientos/seguimiento-transaccional`)}
            className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}