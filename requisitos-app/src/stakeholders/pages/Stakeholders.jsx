// Pantalla principal de stakeholders 
// Aqui se listan y se agregar nuevos stakeholders

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ListaStakeholders from "../components/ListaStakeholders";
import ModalNuevoStakeholder from "../components/ModalNuevoStakeholder";
import ModalNuevoRol from "../components/ModalRol";

export default function Stakeholders() {
  const { id } = useParams();
  const navigate = useNavigate();

  // controla el modal de nuevo stakeholder
  const [mostrarNuevoStakeholder, setMostrarNuevoStakeholder] = useState(false);
  const [mostrarEditarStakeholder, setMostrarEditarStakeholder] = useState(false);
  const [stakeholderActivo, setStakeholderActivo] = useState(null);

  // controla el modal de nuevo rol
  const [mostrarNuevoRol, setMostrarNuevoRol] = useState(false);

  // estados para los datos
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerStakeholders = async () => {
      try {
        const listaStakeholders = [];

        // Obtener Product Owner
        const responsePO = await fetch(`http://127.0.0.1:5000/productowner/${id}`);
        if (responsePO.ok) {
          const dataPO = await responsePO.json();
          listaStakeholders.push({
            nombre: dataPO.nombre,
            apellidos: "",
            rol: "Product Owner",
            tipo: "Interno",
            correo: dataPO.correo || "Correo no disponible",
            organizacion: "",
          });
        }

        // Obtener Tech Leader
        const responseTL = await fetch(`http://127.0.0.1:5000/tech_leaders/${id}`);
        if (responseTL.ok) {
          const dataTL = await responseTL.json();
          listaStakeholders.push({
            nombre: dataTL.nombre,
            apellidos: "",
            rol: "Tech Leader",
            tipo: "Interno",
            correo: dataTL.correo || "Correo no disponible",
            organizacion: "",
          });
        }

        const responseStakeholders = await fetch(`http://127.0.0.1:5000/stakeholders/${id}`);
      if (responseStakeholders.ok) {
        const dataStakeholders = await responseStakeholders.json();
        
        dataStakeholders.forEach(s => {
          listaStakeholders.push({
            id_stakeholder: s.id_stakeholder,
            nombre: s.nombre,
            apellidos: "",
            rol: s.rol,
            tipo: s.tipo,
            correo: s.email,
            organizacion: s.organizacion || "",
          });
        });
      }

        setStakeholders(listaStakeholders);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerStakeholders();
  }, [id]);

  if (loading) {
    return <div className="text-gray-500">Cargando stakeholders...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Botón de regreso */}
      <button
        onClick={() => navigate(`/app/proyectos/${id}`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver al proyecto
      </button>

      {/* Encabezado */}
      <div className="flex justify-between items-end pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Stakeholders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Personas involucradas en el proyecto</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMostrarNuevoRol(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300
                       rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Nuevo Rol
          </button>
          <button
            onClick={() => setMostrarNuevoStakeholder(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700
                       text-white rounded-md text-sm font-medium transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Nuevo Stakeholder
          </button>
        </div>
      </div>

      {/* Lista o estado vacío */}
      <ListaStakeholders
        stakeholders={stakeholders}
        onEditar={(s) => {
          setStakeholderActivo(s);
          setMostrarEditarStakeholder(true);
        }}
      />

      {/* modal del stakeholder */}
      {mostrarNuevoStakeholder && (
        <ModalNuevoStakeholder
          idProyecto={id}
          onClose={() => setMostrarNuevoStakeholder(false)}
          onGuardar={(nuevo) => {
            setStakeholders([...stakeholders, nuevo]);
            setMostrarNuevoStakeholder(false);
          }}
        />
      )}

      {/* modal editar stakeholder */}
      {mostrarEditarStakeholder && stakeholderActivo && (
        <ModalNuevoStakeholder
          idProyecto={id}
          modo="editar"
          stakeholderInicial={stakeholderActivo}
          onClose={() => {
            setMostrarEditarStakeholder(false);
            setStakeholderActivo(null);
          }}
          onGuardar={(actualizado) => {
            setStakeholders((prev) =>
              prev.map((s) =>
                s.id_stakeholder === actualizado.id_stakeholder ? actualizado : s
              )
            );
            setMostrarEditarStakeholder(false);
            setStakeholderActivo(null);
          }}
        />
      )}

      {/* modal de rol */}
      {mostrarNuevoRol && (
        <ModalNuevoRol
          onClose={() => setMostrarNuevoRol(false)} //se ejecuta esta funcion cuando se cierra el modal
          onGuardar={(rol) => { //guarda el rol
            console.log("Rol guardado:", rol); //lo imprime en cosola
            setMostrarNuevoRol(false); //se cierra el modal
          }}
        />
      )}
    </div>
  );
}