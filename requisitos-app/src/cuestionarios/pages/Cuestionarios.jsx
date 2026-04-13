import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Cuestionarios() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [cuestionarios, setCuestionarios] = useState([]);

  const estadisticas = {
    total: cuestionarios.length,
    borradores: cuestionarios.filter((c) => c.estado === "borrador").length,
    activas: cuestionarios.filter((c) => c.estado === "activa").length,
    cerradas: cuestionarios.filter((c) => c.estado === "cerrada").length,
  };

  const eliminarCuestionario = (id) => {
    setCuestionarios(cuestionarios.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con botón atrás */}
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

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <TarjetaEstadistica
          titulo="Total"
          cantidad={estadisticas.total}
          color="blue"
        />
        <TarjetaEstadistica
          titulo="Borradores"
          cantidad={estadisticas.borradores}
          color="gray"
        />
        <TarjetaEstadistica
          titulo="Activas"
          cantidad={estadisticas.activas}
          color="blue"
        />
        <TarjetaEstadistica
          titulo="Cerradas"
          cantidad={estadisticas.cerradas}
          color="emerald"
        />
      </div>

      {/* Cuestionarios cerrados */}
      {cuestionarios.filter((c) => c.estado === "cerrada").length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Cerradas ({estadisticas.cerradas})
          </h2>
          <div className="grid gap-4">
            {cuestionarios
              .filter((c) => c.estado === "cerrada")
              .map((cuestionario) => (
                <TarjetaCuestionario
                  key={cuestionario.id}
                  cuestionario={cuestionario}
                  onEliminar={eliminarCuestionario}
                />
              ))}
          </div>
        </div>
      )}

      {/* Cuestionarios activos */}
      {cuestionarios.filter((c) => c.estado === "activa").length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Activas ({estadisticas.activas})
          </h2>
          <div className="grid gap-4">
            {cuestionarios
              .filter((c) => c.estado === "activa")
              .map((cuestionario) => (
                <TarjetaCuestionario
                  key={cuestionario.id}
                  cuestionario={cuestionario}
                  onEliminar={eliminarCuestionario}
                />
              ))}
          </div>
        </div>
      )}

      {/* Cuestionarios borradores */}
      {cuestionarios.filter((c) => c.estado === "borrador").length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Borradores ({estadisticas.borradores})
          </h2>
          <div className="grid gap-4">
            {cuestionarios
              .filter((c) => c.estado === "borrador")
              .map((cuestionario) => (
                <TarjetaCuestionario
                  key={cuestionario.id}
                  cuestionario={cuestionario}
                  onEliminar={eliminarCuestionario}
                />
              ))}
          </div>
        </div>
      )}

      {cuestionarios.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">
            No hay cuestionarios aún. Crea uno para comenzar.
          </p>
        </div>
      )}
    </div>
  );
}

/* COMPONENTES */

function TarjetaEstadistica({ titulo, cantidad, color }) {
  const colores = {
    blue: "bg-blue-50 border-blue-200",
    gray: "bg-gray-50 border-gray-200",
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
  const esEstado = {
    cerrada: "border-emerald-200 bg-emerald-50",
    activa: "border-blue-200 bg-blue-50",
    borrador: "border-gray-200 bg-gray-50",
  };

  const etiquetaColor = {
    cerrada: "bg-emerald-100 text-emerald-800",
    activa: "bg-blue-100 text-blue-800",
    borrador: "bg-gray-100 text-gray-800",
  };

  return (
    <div
      className={`rounded-xl border ${esEstado[cuestionario.estado]} p-6 space-y-4`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {cuestionario.titulo}
          </h3>
          <p className="text-gray-700 text-sm mb-3">
            {cuestionario.descripcion}
          </p>
          <div className="flex gap-4 text-sm text-gray-600 mb-3">
            <span>{cuestionario.fecha}</span>
            <span>{cuestionario.participantes} participantes</span>
          </div>
          <p className="text-sm text-gray-600">
            Preguntas: {cuestionario.preguntas}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition text-sm font-medium">
            Ver
          </button>
          <button
            onClick={() => onEliminar(cuestionario.id)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-white rounded-lg transition text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition">
          Ver Resultados
        </button>
        <span className={`px-4 py-2 rounded-lg font-medium text-sm ${etiquetaColor[cuestionario.estado]}`}>
          {cuestionario.estado.charAt(0).toUpperCase() + cuestionario.estado.slice(1)}
        </span>
      </div>
    </div>
  );
}
