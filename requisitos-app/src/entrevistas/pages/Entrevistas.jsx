import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Entrevistas() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [entrevistas, setEntrevistas] = useState([]);

  const estadisticas = {
    total: entrevistas.length,
    realizadas: entrevistas.filter((e) => e.estado === "realizada").length,
    pendientes: entrevistas.filter((e) => e.estado === "pendiente").length,
  };

  const eliminarEntrevista = (id) => {
    setEntrevistas(entrevistas.filter((e) => e.id !== id));
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
          <h1 className="text-3xl font-bold text-gray-900">Entrevistas</h1>
          <p className="text-gray-600 mt-1">Gestiona las entrevistas y sus respuestas</p>
        </div>
        <button
          onClick={() => navegar(`/app/proyectos/${id}/entrevistas/crear`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          + Nueva Entrevista
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TarjetaEstadistica
          titulo="Total"
          cantidad={estadisticas.total}
          color="blue"
        />
        <TarjetaEstadistica
          titulo="Realizadas"
          cantidad={estadisticas.realizadas}
          color="emerald"
        />
        <TarjetaEstadistica
          titulo="Pendientes"
          cantidad={estadisticas.pendientes}
          color="orange"
        />
      </div>

      {/* Lista de entrevistas realizadas */}
      {entrevistas.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span>Realizadas</span>
            <h2 className="text-lg font-bold text-gray-900">
              ({estadisticas.realizadas})
            </h2>
          </div>

          <div className="grid gap-4">
            {entrevistas
              .filter((e) => e.estado === "realizada")
              .map((entrevista) => (
                <TarjetaEntrevista
                  key={entrevista.id}
                  entrevista={entrevista}
                  onEliminar={eliminarEntrevista}
                />
              ))}
          </div>
        </div>
      )}

      {/* Lista de entrevistas pendientes */}
      {entrevistas.filter((e) => e.estado === "pendiente").length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Pendientes ({estadisticas.pendientes})
            </h2>
          </div>

          <div className="grid gap-4">
            {entrevistas
              .filter((e) => e.estado === "pendiente")
              .map((entrevista) => (
                <TarjetaEntrevista
                  key={entrevista.id}
                  entrevista={entrevista}
                  onEliminar={eliminarEntrevista}
                />
              ))}
          </div>
        </div>
      )}

      {entrevistas.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-lg">
            No hay entrevistas aún. Crea una para comenzar.
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
    emerald: "bg-emerald-50 border-emerald-200",
    orange: "bg-orange-50 border-orange-200",
  };

  return (
    <div className={`rounded-xl border ${colores[color]} p-6`}>
      <h3 className="text-gray-700 text-sm font-medium mb-2">{titulo}</h3>
      <h2 className="text-4xl font-bold text-gray-900">{cantidad}</h2>
    </div>
  );
}

function TarjetaEntrevista({ entrevista, onEliminar }) {
  const esEstado = {
    realizada: "border-emerald-200 bg-emerald-50",
    pendiente: "border-orange-200 bg-orange-50",
  };

  return (
    <div
      className={`rounded-xl border ${esEstado[entrevista.estado]} p-6 space-y-4`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {entrevista.titulo}
          </h3>
          <div className="flex gap-4 text-sm text-gray-600 mb-3">
            <span>{entrevista.fecha}</span>
            <span>{entrevista.entrevistador}</span>
          </div>
          <p className="text-gray-700 font-medium">
            Entrevistado: {entrevista.entrevistado}
          </p>
          <p className="text-sm text-gray-600">
            Preguntas: {entrevista.preguntas}{" "}
            <span className="text-emerald-600 font-medium">
              Con respuestas
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition text-sm font-medium">
            Ver
          </button>
          <button
            onClick={() => onEliminar(entrevista.id)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-white rounded-lg transition text-sm font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <button className="w-full border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2">
          Subir archivo (grabación/documento)
        </button>
      </div>

      <div className="flex gap-3">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2">
          Anotar Respuestas
        </button>
        <span
          className={`px-4 py-2 rounded-lg font-medium text-sm ${
            entrevista.estado === "realizada"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {entrevista.estado === "realizada" ? "Realizada" : "Pendiente"}
        </span>
      </div>
    </div>
  );
}
