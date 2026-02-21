// Pantalla principal de TI
// Aqui se listan y se agregar nuevos TI

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ListaTI from "../components/ListaTI";
import ModalNuevoTI from "../components/ModalNuevoTI";
import ModalNuevoRol from "../components/ModalRol";

export default function TI() {
  const { id } = useParams(); // id del proyecto

  // controla el modal de nuevo stakeholder
  const [mostrarNuevoTI, setMostrarNuevoTI] = useState(false);

  // controla el modal de nuevo rol
  const [mostrarNuevoRol, setMostrarNuevoRol] = useState(false);

  // estados para los datos
  const [ti, setTI] = useState([]); //lista de los integrantes
  const [roles, setRoles] = useState([]); //lista de los roles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // carga de los datos
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true); //pone el estado de carga
        setError(null); //limpia los errores de antes
        
        //peticiones 
        const [respTI, respRoles] = await Promise.all([
          fetch(`http://127.0.0.1:5000/ti/${id}`), //obtiene los integrantes de ti
          fetch(`http://127.0.0.1:5000/roles/obtener`), //obtiene los roles
        ]);

        //se muestra el mensaje si el backend manda error
        if (!respTI.ok) throw new Error("Error al obtener equipo de TI");
        if (!respRoles.ok) throw new Error("Error al obtener roles");

        //convierte la respuesta http
        const dataTI = await respTI.json();
        const dataRoles = await respRoles.json();

        //guarda los datos
        setTI(dataTI);
        setRoles(dataRoles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [id]); //si cambia de id de proyecto se cambia la pantalla

  const crearIntegrante = async (form) => {
    const response = await fetch(`http://127.0.0.1:5000/ti/${id}/crear`, { //envia datos al back
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        id_rol: form.id_rol,
      }),
    });

    //si el back manda error 
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al crear integrante TI");
    }

    return await response.json();
  };

  if (loading) return <div className="text-gray-500">Cargando equipo de TI...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

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
          roles={roles}
          onGuardar={async (nuevo) => {
            try {
              const data = await crearIntegrante(nuevo);
              setTI([data.personal_ti, ...ti]);
              setMostrarNuevoTI(false);

              if (data.usuario_creado && data.password_temporal) {
                alert(
                  `Usuario creado para ${data.personal_ti.usuario.email}\n\nPassword temporal: ${data.password_temporal}\n\nGuárdalo ahora.`
                );
              }
            } catch (err) {
              alert(err.message);
            }
          }}
        />
      )}

      {/* modal de rol */}
      {mostrarNuevoRol && (
        <ModalNuevoRol
          onClose={() => setMostrarNuevoRol(false)}
          onGuardar={(rol) => {
            // agrega el rol nuevo al selector del modal de alta
            const normalizado = {
              id_rol: rol.id_rol ?? rol.id,
              nombre: rol.nombre,
              descripcion: rol.descripcion,
            };
            setRoles((prev) => [normalizado, ...prev]);
            setMostrarNuevoRol(false);
          }}
        />
      )}
    </div>
  );
}