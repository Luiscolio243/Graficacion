import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProyectoDashboard() {
  const { id } = useParams(); //esto es para el back
  const navigate = useNavigate();

  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [productOwner, setProductOwner] = useState(null);
  const [techLeader, setTechLeader] = useState(null);

   useEffect(() => {
    const obtenerProyecto = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/proyectos/${id}`);

        if (!response.ok) {
          throw new Error("Error al obtener el proyecto");
        }

        const data = await response.json();
        setProyecto(data);

        const responsePO = await fetch(`http://127.0.0.1:5000/productowner/${id}`);
      if (responsePO.ok) {
        const dataPO = await responsePO.json();
        setProductOwner(dataPO);
      }

      const responseTL = await fetch(`http://127.0.0.1:5000/tech_leaders/${id}`);
      if (responseTL.ok) {
        const dataTL = await responseTL.json();
        setTechLeader(dataTL);
      }


      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerProyecto();
  }, [id]); 

  if (loading) {
    return <div className="text-gray-500">Cargando proyecto...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!proyecto) {
    return <div className="text-gray-500">No se encontró el proyecto</div>;
  }


  return (
  <div className="space-y-8 max-w-7xl mx-auto">

    {/* Encabezado */}
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          {proyecto.nombre}
        </h1>
      </div>

      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        {proyecto.estado}
      </span>
    </div>

    {/* Información general del proyecto */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card titulo="Descripción">
        {proyecto.descripcion}
      </Card>

      {/* Estos campos aún no vienen de la API, 
          los dejaremos estáticos por ahora o mostrar "N/A" */}
      <Card titulo="Fecha de Inicio">
        Por definir
      </Card>

      <Card titulo="Organización">
        Por definir
      </Card>
    </div>

    {/* PO y Tech Leader */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {productOwner ? (
    <Persona
      titulo="Product Owner"
      nombre={productOwner.nombre}
      correo="Correo no disponible"
      telefono="Teléfono no disponible"
    />
  ) : (
    <Card titulo="Product Owner">
      No asignado
    </Card>
  )}

  {techLeader ? (
    <Persona
      titulo="Tech Leader"
      nombre={techLeader.nombre}
      correo="Correo no disponible"
      telefono="Teléfono no disponible"
    />
  ) : (
    <Card titulo="Tech Leader">
      No asignado
    </Card>
  )}
</div>

      {/* Módulos */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Módulos del Proyecto
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Modulo
            titulo="Stakeholders"
            descripcion="Gestión de personas relacionadas con el Product Owner"
            color="blue"
            onClick={() => navigate(`/app/proyectos/${id}/stakeholders`)}
          />

          <Modulo
            titulo="Equipo de TI"
            descripcion="Equipo técnico que trabaja con el Tech Leader"
            color="indigo"
          />

          <Modulo
            titulo="Procesos"
            descripcion="Definición de procesos y subprocesos del negocio"
            color="emerald"
          />
        </div>
      </div>
    </div>
  );

}

/* COMPONENTES */

function Card({ titulo, children }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{titulo}</h3>
      <p className="text-gray-900 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function Persona({ titulo, nombre, correo, telefono }) {
  return (
    <div className="
      bg-white rounded-xl p-6
      shadow-sm border border-gray-200
      flex items-start gap-4
    ">
      {/* Avatar */}
      <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
        {nombre ? nombre[0] : "?"}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {titulo}
        </h3>

        <p className="font-medium text-gray-900">{nombre || "No disponible"}</p>
        <p className="text-sm text-gray-500">{correo || "Correo no disponible"}</p>
        <p className="text-sm text-gray-500">{telefono || "Teléfono no disponible"}</p>
      </div>
    </div>
  );
}


function Modulo({ titulo, descripcion, color = "indigo", onClick }) {

  // Aqui pongo los estilos segun el color
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
  };

  // Selecciono el conjunto de estilos segn el color recibido
  // Si no existe por defecto se usara el color indigo
  const estilos = estilosPorColor[color] || estilosPorColor.indigo;

  return (
    <div
      onClick={onClick}
      className={`
        ${estilos.fondo} ${estilos.borde}
        border rounded-xl p-5
        cursor-pointer
        transition hover:shadow-md
      `}
    >
      {/* Encabezado del modulo */}
      <div className="flex items-center gap-2 mb-2">
        {/* Puntito de color para el modulo */}
        <span className={`w-2 h-2 rounded-full ${estilos.punto}`} />

        <h3 className={`font-medium ${estilos.textoTitulo}`}>
          {titulo}
        </h3>
      </div>

      {/* Descripcion del modulo */}
      <p className="text-sm text-gray-600">
        {descripcion}
      </p>
    </div>
  );
}