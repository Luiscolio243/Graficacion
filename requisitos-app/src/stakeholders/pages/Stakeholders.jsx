// Pantalla principal de stakeholders 
// Aqui se listan y se agregar nuevos stakeholders

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ListaStakeholders from "../components/ListaStakeholders";
import ModalNuevoStakeholder from "../components/ModalNuevoStakeholder";
import ModalNuevoRol from "../components/ModalRol";

export default function Stakeholders() {
  const { id } = useParams(); // id del proyecto

  // controla el modal de nuevo stakeholder
  const [mostrarNuevoStakeholder, setMostrarNuevoStakeholder] = useState(false);

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
            correo: "Correo no disponible",
            organizacion: ""
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
            correo: "Correo no disponible",
            organizacion: ""
          });
        }

        const responseStakeholders = await fetch(`http://127.0.0.1:5000/stakeholders/${id}`);
      if (responseStakeholders.ok) {
        const dataStakeholders = await responseStakeholders.json();
        
        dataStakeholders.forEach(s => {
          listaStakeholders.push({
            nombre: s.nombre,
            apellidos: "", 
            rol: s.rol,
            tipo: s.tipo,
            correo: s.email,
            organizacion: "" 
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

      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Stakeholders
          </h1>
          <p className="text-sm text-gray-500">
            Personas involucradas en el proyecto
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMostrarNuevoRol(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            + Nuevo Rol
          </button>

          <button
            onClick={() => setMostrarNuevoStakeholder(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          >
            + Nuevo Stakeholder
          </button>
        </div>
      </div>

      {/* Lista o estado vacío */}
      <ListaStakeholders stakeholders={stakeholders} />

      {/* modal del stakeholder */}
      {mostrarNuevoStakeholder && (
        <ModalNuevoStakeholder
          onClose={() => setMostrarNuevoStakeholder(false)}
          onGuardar={(nuevo) => {
            setStakeholders([...stakeholders, nuevo]);
            setMostrarNuevoStakeholder(false);
          }}
        />
      )}

      {/* modal de rol */}
      {mostrarNuevoRol && (
        <ModalNuevoRol
          onClose={() => setMostrarNuevoRol(false)}
          onGuardar={(rol) => {
            console.log("Rol guardado:", rol);
            setMostrarNuevoRol(false);
          }}
        />
      )}
    </div>
  );
}