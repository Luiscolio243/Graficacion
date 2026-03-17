import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function EditarProyecto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [organizacion, setOrganizacion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [estado, setEstado] = useState("");

  const [poNombre, setPoNombre] = useState("");
  const [poApellidos, setPoApellidos] = useState("");
  const [poEmail, setPoEmail] = useState("");
  const [poTelefono, setPoTelefono] = useState("");

  const [ltNombre, setLtNombre] = useState("");
  const [ltApellidos, setLtApellidos] = useState("");
  const [ltEmail, setLtEmail] = useState("");
  const [ltTelefono, setLtTelefono] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);

        const [respProyecto, respPO, respTL] = await Promise.all([
          fetch(`http://127.0.0.1:5000/proyectos/${id}`),
          fetch(`http://127.0.0.1:5000/productowner/${id}`),
          fetch(`http://127.0.0.1:5000/tech_leaders/${id}`),
        ]);

        if (!respProyecto.ok) throw new Error("Error al obtener el proyecto");
        const data = await respProyecto.json();

        setNombre(data.nombre || "");
        setDescripcion(data.descripcion || "");
        setObjetivo(data.objetivo || "");
        setOrganizacion(data.organizacion || "");
        setFechaInicio(data.fecha_inicio || "");
        setEstado(data.estado || "");

        if (respPO.ok) {
          const po = await respPO.json();
          const partes = (po.nombre || "").split(" ");
          setPoNombre(partes[0] || "");
          setPoApellidos(partes.slice(1).join(" ") || "");
          setPoEmail(po.correo || "");
          setPoTelefono(po.telefono || "");
        }

        if (respTL.ok) {
          const tl = await respTL.json();
          const partes = (tl.nombre || "").split(" ");
          setLtNombre(partes[0] || "");
          setLtApellidos(partes.slice(1).join(" ") || "");
          setLtEmail(tl.correo || "");
          setLtTelefono(tl.telefono || "");
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [id]);

  const guardarCambios = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/proyectos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          descripcion,
          objetivo,
          organizacion,
          fechaInicio,
          estado,
          productOwner: {
            nombre: poNombre,
            apellidos: poApellidos,
            email: poEmail,
            telefono: poTelefono,
          },
          liderTecnico: {
            nombre: ltNombre,
            apellidos: ltApellidos,
            email: ltEmail,
            telefono: ltTelefono,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al guardar cambios");
      }

      navigate(`/app/proyectos/${id}`);
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al editar proyecto");
    }
  };

  if (loading) return <div className="text-gray-500">Cargando proyecto...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl space-y-8">
        <button
          onClick={() => navigate(`/app/proyectos/${id}`)}
          className="text-sm text-gray-500 hover:underline"
        >
          ← Volver al proyecto
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold"></div>
          <div>
            <h2 className="text-xl font-semibold">Editar Proyecto</h2>
            <p className="text-sm text-gray-500">
              Actualiza los detalles básicos de tu proyecto
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 space-y-8 shadow-sm border border-gray-200">
          <section>
            <h3 className="font-medium mb-4">Información del Proyecto</h3>

            <div className="space-y-4">
              <Campo
                label="Nombre del Proyecto *"
                placeholder="Ej: Sistema de Gestión empresarial"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <CampoArea
                label="Descripción"
                placeholder="Describe brevemente de qué se trata el proyecto..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
              <CampoArea
                label="Objetivo General"
                placeholder="¿Qué problema busca resolver este proyecto?"
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
              />
              <Campo
                label="Organización"
                placeholder="Ej: Empresa..."
                value={organizacion}
                onChange={(e) => setOrganizacion(e.target.value)}
              />
              <Campo
                label="Fecha de Inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
              <Campo
                label="Estado"
                placeholder="Ej: En progreso"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              />
            </div>
          </section>

          <section>
            <h3 className="font-medium mb-4">Product Owner</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo label="Nombre" value={poNombre} onChange={(e) => setPoNombre(e.target.value)} />
              <Campo label="Apellidos" value={poApellidos} onChange={(e) => setPoApellidos(e.target.value)} />
              <Campo label="Correo electrónico" type="email" value={poEmail} onChange={(e) => setPoEmail(e.target.value)} />
              <Campo label="Teléfono" value={poTelefono} onChange={(e) => setPoTelefono(e.target.value)} />
            </div>
          </section>

          <section>
            <h3 className="font-medium mb-4">Líder Técnico</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Campo label="Nombre" value={ltNombre} onChange={(e) => setLtNombre(e.target.value)} />
              <Campo label="Apellidos" value={ltApellidos} onChange={(e) => setLtApellidos(e.target.value)} />
              <Campo label="Correo electrónico" type="email" value={ltEmail} onChange={(e) => setLtEmail(e.target.value)} />
              <Campo label="Teléfono" value={ltTelefono} onChange={(e) => setLtTelefono(e.target.value)} />
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate(`/app/proyectos/${id}`)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              onClick={guardarCambios}
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        onChange={onChange}
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

