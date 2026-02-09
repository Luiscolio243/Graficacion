import { useNavigate } from "react-router-dom";
import { useState } from "react";


export default function NuevoProyecto() {
  const navigate = useNavigate();

  const [mostrarToast, setMostrarToast] = useState(false);


  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [organizacion, setOrganizacion] = useState("");

  const [poNombre, setPoNombre] = useState("");
  const [poApellidos, setPoApellidos] = useState("");
  const [poEmail, setPoEmail] = useState("");
  const [poTelefono, setPoTelefono] = useState("");

  const [ltNombre, setLtNombre] = useState("");
  const [ltApellidos, setLtApellidos] = useState("");
  const [ltEmail, setLtEmail] = useState("");
  const [ltTelefono, setLtTelefono] = useState("");

  const crearProyecto = async () => {
    try {
    const proyecto = {
      nombre,
      descripcion,
      objetivo,
      organizacion,
      productOwner: {
        nombre: poNombre,
        apellidos: poApellidos,
        email: poEmail,
        telefono: poTelefono
      },
      liderTecnico: {
        nombre: ltNombre,
        apellidos: ltApellidos,
        email: ltEmail,
        telefono: ltTelefono
      }
    };

    const response = await fetch("http://127.0.0.1:5000/proyectos/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proyecto)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al crear proyecto");
    }

    const data = await response.json();
    console.log("Proyecto creado exitosamente:", data);

    setMostrarToast(true);

setTimeout(() => {
  navigate("/app/proyectos");
}, 2000);


  } catch (error) {
    console.error("Error al crear proyecto:", error.message);
  }
  };

  {mostrarToast && (
  <div className="fixed bottom-5 right-5 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
    <span>✔</span>
    <span>Proyecto creado correctamente</span>
  </div>
)}


  return (
    <div className="flex justify-center">
        <div className="w-full max-w-3xl space-y-8">

        {/* Boton de volver */}
        <button
            onClick={() => navigate("/app/proyectos")}
            className="text-sm text-gray-500 hover:underline"
        >
            ← Volver a proyectos
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
            
            </div>
            <div>
            <h2 className="text-xl font-semibold">Crear Nuevo Proyecto</h2>
            <p className="text-sm text-gray-500">
                Define los detalles básicos de tu proyecto
            </p>
            </div>
        </div>

        {/* FOormularioo */}
        <div className="bg-white rounded-2xl p-8 space-y-8 shadow-sm border border-gray-200">

            {/* Iinfo del proyecto */}
            <section>
            <h3 className="font-medium mb-4">Información del Proyecto</h3>

            <div className="space-y-4">
                <Campo label="Nombre del Proyecto *" placeholder="Ej: Sistema de Gestión empresarial" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                <CampoArea label="Descripción" placeholder="Describe brevemente de qué se trata el proyecto..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                <CampoArea label="Objetivo General" placeholder="¿Qué problema busca resolver este proyecto?" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
                <Campo label="Organización" placeholder="Ej: Empresa..." value={organizacion} onChange={(e) => setOrganizacion(e.target.value)} />
            </div>
            </section>

            {/* Product owner */}
            <section>
            <h3 className="font-medium mb-4">Product Owner</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Campo label="Nombre" value={poNombre} onChange={(e) => setPoNombre(e.target.value)} />
                <Campo label="Apellidos" value={poApellidos} onChange={(e) => setPoApellidos(e.target.value)} />
                <Campo label="Correo electrónico" type="email" value={poEmail} onChange={(e) => setPoEmail(e.target.value)} />
                <Campo label="Teléfono" value={poTelefono} onChange={(e) => setPoTelefono(e.target.value)} />
            </div>
            </section>

            {/* Tec lider*/}
            <section>
            <h3 className="font-medium mb-4">Líder Técnico</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Campo label="Nombre" value={ltNombre} onChange={(e) => setLtNombre(e.target.value)} />
                <Campo label="Apellidos" value={ltApellidos} onChange={(e) => setLtApellidos(e.target.value)} />
                <Campo label="Correo electrónico" type="email" value={ltEmail} onChange={(e) => setLtEmail(e.target.value)} />
                <Campo label="Teléfono" value={ltTelefono} onChange={(e) => setLtTelefono(e.target.value)} />
            </div>
            </section>

            {/* Boton de crear proyecto o no */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
                onClick={() => navigate("/app/proyectos")}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-100 transition"
            >
                Cancelar
            </button>
            <button 
                onClick={crearProyecto}
                className="px-6 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition">
                Crear Proyecto
            </button>
            </div>

        </div>
        </div>
    </div>
  );
}

/*componentes del formulario*/
function Campo({ label, placeholder = "", type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange} // actualiza estado al escribir
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
}

function CampoArea({ label, placeholder = "", value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        rows={3}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
}