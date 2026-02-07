import { useNavigate } from "react-router-dom";

export default function NuevoProyecto() {
  const navigate = useNavigate();

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
                <Campo label="Nombre del Proyecto *" placeholder="Ej: Sistema de Gestión empresarial" />
                <CampoArea label="Descripción" placeholder="Describe brevemente de qué se trata el proyecto..." />
                <CampoArea label="Objetivo General" placeholder="¿Qué problema busca resolver este proyecto?" />
                <Campo label="Organización" placeholder="Ej: Empresa..." />
            </div>
            </section>

            {/* Product owner */}
            <section>
            <h3 className="font-medium mb-4">Product Owner</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Campo label="Nombre" />
                <Campo label="Apellidos" />
                <Campo label="Correo electrónico" type="email" />
                <Campo label="Teléfono" />
            </div>
            </section>

            {/* Tec lider*/}
            <section>
            <h3 className="font-medium mb-4">Líder Técnico</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Campo label="Nombre" />
                <Campo label="Apellidos" />
                <Campo label="Correo electrónico" type="email" />
                <Campo label="Teléfono" />
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
            <button className="px-6 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition">
                Crear Proyecto
            </button>
            </div>

        </div>
        </div>
    </div>
  );
}

/*componentes del formulario*/
function Campo({ label, placeholder = "", type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
}

function CampoArea({ label, placeholder = "" }) {
  return (
    <div>
      <label className="block text-sm font-medium text gray-700 mb-1">
        {label}
      </label>
      <textarea
        rows={3}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
}