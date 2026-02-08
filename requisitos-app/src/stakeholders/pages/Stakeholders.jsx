// Pantalla principal de stakeholders 
// Aqui se listan y se agregar nuevos stakeholders

import { useState } from "react";
import ListaStakeholders from "../components/ListaStakeholders";
import ModalNuevoStakeholder from "../components/ModalNuevoStakeholder";
import ModalNuevoRol from "../components/ModalRol";

export default function Stakeholders() {

  // controla el modal de nuevo stakeholder
  const [mostrarNuevoStakeholder, setMostrarNuevoStakeholder] = useState(false);

  // controla el modal de nuevo rol
  const [mostrarNuevoRol, setMostrarNuevoRol] = useState(false);

  // datos de prueba
  const [stakeholders, setStakeholders] = useState([]);

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