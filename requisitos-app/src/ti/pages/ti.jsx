// Pantalla principal de TI
// Aqui se listan y se agregar nuevos TI

import { useState } from "react";
import ListaTI from "../components/ListaTI";
import ModalNuevoTI from "../components/ModalNuevoTI";
import ModalNuevoRol from "../components/ModalRol";

export default function TI() {

  // controla el modal de nuevo stakeholder
  const [mostrarNuevoTI, setMostrarNuevoTI] = useState(false);

  // controla el modal de nuevo rol
  const [mostrarNuevoRol, setMostrarNuevoRol] = useState(false);

  // datos de prueba
  const [ti, setTI] = useState([]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Equipo de TI
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
            onClick={() => setMostrarNuevoTI(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          >
            + Nuevo Integrante de TI
          </button>
        </div>
      </div>

      {/* Lista o estado vacío */}
      <ListaTI ti={ti} />

      {/* modal del stakeholder */}
      {mostrarNuevoTI && (
        <ModalNuevoTI
          onClose={() => setMostrarNuevoTI(false)}
          onGuardar={(nuevo) => {
            setTI([...stakeholders, nuevo]);
            setMostrarNuevoTI(false);
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