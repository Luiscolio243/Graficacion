import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link2, ChevronUp, ChevronDown } from "lucide-react";

export default function Cuestionarios() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [cuestionarios, setCuestionarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerEncuestas = async () => {
      try {
        const response = await fetch(`http://localhost:5000/encuestas/obtener/${id}`);
        if (!response.ok) throw new Error("Error al obtener las encuestas");
        const data = await response.json();
        setCuestionarios(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerEncuestas();
  }, [id]);

  const estadisticas = {
    total: cuestionarios.length,
    borradores: cuestionarios.filter((c) => (c.estado ?? "borrador") === "borrador").length,
    activas: cuestionarios.filter((c) => c.estado === "activa").length,
    cerradas: cuestionarios.filter((c) => c.estado === "cerrada").length,
  };

  const eliminarCuestionario = (id_encuesta) => {
    setCuestionarios(cuestionarios.filter((c) => c.id_encuesta !== id_encuesta));
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navegar(`/app/proyectos/${id}`)}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          ← Atrás
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Cuestionarios</h1>
          <p className="text-gray-600 mt-1">Diseña y gestiona cuestionarios</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/cuestionarios/crear`)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          + Nuevo Cuestionario
        </button>
      </div>

      {/* Estadísticas de la encuesta */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <TarjetaEstadistica titulo="Total"      cantidad={estadisticas.total}     color="blue"    />
        <TarjetaEstadistica titulo="Borradores" cantidad={estadisticas.borradores} color="gray"    />
        <TarjetaEstadistica titulo="Activas"    cantidad={estadisticas.activas}   color="blue"    />
        <TarjetaEstadistica titulo="Cerradas"   cantidad={estadisticas.cerradas}  color="emerald" />
      </div>

      {/* Estado de carga para mostrar al usuario que se estan cargando los usuarios */}
      {cargando && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">Cargando cuestionarios...</p>
        </div>
      )}

      {/* Error en caso de que ocurra alguno  en la carga de cuestionarios */}
      {error && (
        <div className="bg-red-50 rounded-xl p-6 text-center border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Listas agrupadas por estado de la encuesta */}
      {!cargando && !error && (
        <>
          {["cerrada", "activa", "borrador"].map((estado) => {
            const filtradas = cuestionarios.filter(
              (c) => (c.estado ?? "borrador") === estado
            );
            if (filtradas.length === 0) return null;

            const etiquetas = {
              cerrada: "Cerradas",
              activa: "Activas",
              borrador: "Borradores",
            };

            return (
              <div key={estado}>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {etiquetas[estado]} ({filtradas.length})
                </h2>
                <div className="grid gap-4">
                  {filtradas.map((cuestionario) => (
                    <TarjetaCuestionario
                      key={cuestionario.id_encuesta}
                      cuestionario={cuestionario}
                      onEliminar={eliminarCuestionario}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {cuestionarios.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <p className="text-gray-500 text-lg">
                No hay cuestionarios aún. Crea uno para comenzar.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
//Otros componentes que se usan en el principal de cuestionarios 

function TarjetaEstadistica({ titulo, cantidad, color }) {
  const colores = {
    blue:    "bg-blue-50 border-blue-200",
    gray:    "bg-gray-50 border-gray-200",
    emerald: "bg-emerald-50 border-emerald-200",
  };

  return (
    <div className={`rounded-xl border ${colores[color]} p-6`}>
      <h3 className="text-gray-700 text-sm font-medium mb-2">{titulo}</h3>
      <h2 className="text-4xl font-bold text-gray-900">{cantidad}</h2>
    </div>
  );
}

function TarjetaCuestionario({ cuestionario, onEliminar }) {
  const navegar = useNavigate();
  const { id } = useParams();
  const estado = cuestionario.estado ?? "borrador";

  const [mostrarLinks, setMostrarLinks] = useState(false);
  const [stakeholders, setStakeholders] = useState([]);
  const [copiado, setCopiado] = useState(null); // id del stakeholder cuyo link se copió

  const esEstado = {
    cerrada:  "border-emerald-200 bg-emerald-50",
    activa:   "border-blue-200 bg-blue-50",
    borrador: "border-gray-200 bg-gray-50",
  };

  const etiquetaColor = {
    cerrada:  "bg-emerald-100 text-emerald-800",
    activa:   "bg-blue-100 text-blue-800",
    borrador: "bg-gray-100 text-gray-800",
  };

  const handleMostrarLinks = async () => {
    // Solo carga stakeholders la primera vez
    if (stakeholders.length === 0) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://127.0.0.1:5000/stakeholders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStakeholders(data);
        }
      } catch (e) {
        console.error("Error al cargar stakeholders:", e);
      }
    }
    setMostrarLinks(!mostrarLinks);
  };

  const copiarLink = (id_stakeholder) => {
    const link = `${window.location.origin}/responder/encuesta/${cuestionario.id_encuesta}/stakeholder/${id_stakeholder}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiado(id_stakeholder);
      setTimeout(() => setCopiado(null), 2000); // resetea después de 2 seg
    });
  };

  return (
    <div className={`rounded-xl border ${esEstado[estado]} p-6 space-y-4`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {cuestionario.titulo}
          </h3>
          <p className="text-gray-700 text-sm mb-3">
            {cuestionario.descripcion ?? "Sin descripción"}
          </p>
          {cuestionario.fecha_creacion && (
            <div className="flex gap-4 text-sm text-gray-600 mb-3">
              <span>{cuestionario.fecha_creacion}</span>
              {cuestionario.num_participantes !== undefined && (
                <span>{cuestionario.num_participantes} participantes</span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navegar(`/app/proyectos/${id}/requerimientos/cuestionarios/${cuestionario.id_encuesta}/resultados`)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition text-sm font-medium"
          >
            Ver
          </button>
          <button
            onClick={() => onEliminar(cuestionario.id_encuesta)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-white rounded-lg transition text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <button
          onClick={() => navegar(`/app/proyectos/${id}/requerimientos/cuestionarios/${cuestionario.id_encuesta}/resultados`)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          Ver Resultados
        </button>
        <button
          onClick={handleMostrarLinks}
          className="flex-1 border border-green-600 text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg font-medium transition"
        >
          <span className="flex items-center gap-2 justify-center">
            <Link2 size={15} />
            {mostrarLinks ? "Ocultar Links" : "Compartir Links"}
            {mostrarLinks ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </button>
        <span className={`px-4 py-2 rounded-lg font-medium text-sm ${etiquetaColor[estado]}`}>
          {estado.charAt(0).toUpperCase() + estado.slice(1)}
        </span>
      </div>

      {/* Panel de links por stakeholder */}
      {mostrarLinks && (
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Copia el link para cada stakeholder:
          </p>
          {stakeholders.length === 0 ? (
            <p className="text-sm text-gray-400">No hay stakeholders en este proyecto.</p>
          ) : (
            stakeholders.map((s) => (
              <div
                key={s.id_stakeholder}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.nombre}</p>
                  <p className="text-xs text-gray-400 truncate max-w-xs">
                    {`${window.location.origin}/responder/encuesta/${cuestionario.id_encuesta}/stakeholder/${s.id_stakeholder}`}
                  </p>
                </div>
                <button
                  onClick={() => copiarLink(s.id_stakeholder)}
                  className={`ml-4 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    copiado === s.id_stakeholder
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {copiado === s.id_stakeholder ? "¡Copiado!" : "Copiar"}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}