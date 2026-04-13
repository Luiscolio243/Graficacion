import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Requerimientos() {
  const { id } = useParams();
  const navegar = useNavigate();

  const modulos = [
    {
      titulo: "Entrevistas",
      descripcion: "Recopilación de información mediante conversaciones directas",
      color: "blue",
      ruta: `/app/proyectos/${id}/entrevistas`,
    },
    {
      titulo: "Cuestionarios",
      descripcion: "Formularios estructurados para obtener datos cuantitativos",
      color: "indigo",
      ruta: `/app/proyectos/${id}/requerimientos/cuestionarios`,
    },
    {
      titulo: "Observaciones",
      descripcion: "Registro de procesos y comportamientos en el entorno actual",
      color: "emerald",
      ruta: `/app/proyectos/${id}/requerimientos/observaciones`,
    },
    {
      titulo: "Historias de Usuario",
      descripcion: "Descripción de funcionalidades desde la perspectiva del usuario",
      color: "rose",
      ruta: `/app/proyectos/${id}/requerimientos/historias-usuario`,
    },
    {
      titulo: "Focus Group",
      descripcion: "Sesiones colaborativas de análisis con múltiples stakeholders",
      color: "amber",
      ruta: `/app/proyectos/${id}/requerimientos/focus-groups`,
    },
    {
      titulo: "Seguimiento Transaccional",
      descripcion: "Monitoreo de transacciones y flujos de datos del sistema",
      color: "cyan",
      ruta: `/app/proyectos/${id}/requerimientos/seguimiento-transaccional`,
    },
  ];

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Requerimientos</h1>
          <p className="text-gray-500 mt-1">
            Documentación de requerimientos del proyecto
          </p>
        </div>
      </div>

      {/* Grid de módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modulos.map((modulo, index) => (
          <TarjetaModulo
            key={index}
            titulo={modulo.titulo}
            descripcion={modulo.descripcion}
            color={modulo.color}
            onClick={() => navegar(modulo.ruta)}
          />
        ))}
      </div>
    </div>
  );
}

/* COMPONENTES */

function TarjetaModulo({ titulo, descripcion, color = "indigo", onClick }) {
  const estilosPorColor = {
    indigo: {
      fondo: "bg-indigo-50",
      borde: "border-indigo-200",
      textoTitulo: "text-indigo-700",
      punto: "bg-indigo-500",
    },
    blue: {
      fondo: "bg-blue-50",
      borde: "border-blue-200",
      textoTitulo: "text-blue-700",
      punto: "bg-blue-500",
    },
    emerald: {
      fondo: "bg-emerald-50",
      borde: "border-emerald-200",
      textoTitulo: "text-emerald-700",
      punto: "bg-emerald-500",
    },
    rose: {
      fondo: "bg-rose-50",
      borde: "border-rose-200",
      textoTitulo: "text-rose-700",
      punto: "bg-rose-500",
    },
    amber: {
      fondo: "bg-amber-50",
      borde: "border-amber-200",
      textoTitulo: "text-amber-700",
      punto: "bg-amber-500",
    },
    cyan: {
      fondo: "bg-cyan-50",
      borde: "border-cyan-200",
      textoTitulo: "text-cyan-700",
      punto: "bg-cyan-500",
    },
  };

  const estilos = estilosPorColor[color] || estilosPorColor.indigo;

  return (
    <div
      onClick={onClick}
      className={`
        ${estilos.fondo} ${estilos.borde}
        border rounded-xl p-5
        cursor-pointer
        transition hover:shadow-md h-full
      `}
    >
      {/* Encabezado del módulo */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${estilos.punto}`} />
        <h3 className={`font-medium ${estilos.textoTitulo}`}>
          {titulo}
        </h3>
      </div>

      {/* Descripción */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {descripcion}
      </p>
    </div>
  );
}
