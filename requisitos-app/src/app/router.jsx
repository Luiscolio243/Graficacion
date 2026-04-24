import { createBrowserRouter, Navigate } from "react-router-dom"
import Login from "../auth/pages/Login"
import Proyectos from "../proyectos/pages/Proyectos";
import Layout from "./layout";
import NuevoProyecto from "../proyectos/pages/NuevoProyecto";
import EditarProyecto from "../proyectos/pages/EditarProyecto";
import ProyectoDashboard from "../proyectos/pages/ProyectoDashboard"
import Stakeholders from "../stakeholders/pages/Stakeholders";
import TI from "../ti/pages/ti";
import Procesos from "../procesos/pages/Procesos";
import Requerimientos from "../requerimientos/pages/Requerimientos";
import Entrevistas from "../entrevistas/pages/Entrevistas";
import CrearEntrevista from "../entrevistas/pages/CrearEntrevista";
import AnotarRespuestas from "../entrevistas/pages/AnotarRespuestas";
import Cuestionarios from "../cuestionarios/pages/Cuestionarios";
import CrearCuestionario from "../cuestionarios/pages/CrearCuestionario";
import VerResultados from "../cuestionarios/pages/VerResultados";
import Observaciones from "../observaciones/pages/Observaciones";
import CrearObservacion from "../observaciones/pages/CrearObservacion";
import HistoriasDeUsuario from "../historiasUsuario/pages/HistoriasDeUsuario";
import CrearHistoriaDeUsuario from "../historiasUsuario/pages/CrearHistoriaDeUsuario";
import FocusGroups from "../focusGroups/pages/FocusGroups";
import CrearFocusGroup from "../focusGroups/pages/CrearFocusGroup";
import SeguimientoTransaccional from "../seguimientoTransaccional/pages/SeguimientoTransaccional";
import CrearSeguimientoTransaccional from "../seguimientoTransaccional/pages/CrearSeguimientoTransaccional";
import SubirAudio from "../entrevistas/pages/SubirAudio";
import DetalleEntrevista from "../entrevistas/pages/DetalleEntrevista";
import DetalleObservacion from "../observaciones/pages/DetalleObservacion";
import EditarObservacion from "../observaciones/pages/EditarObservacion";

export const router = createBrowserRouter([
    {
        //Ruta raiz
        path: "/",
        element: <Navigate to="/login" />
    },
    {
        //Pantalla de inicio de seison
        path: "/login",
        element: <Login />
    },
    {
        //Rutas ya que inicio sesion el usuario
        path: "/app",
        element: <Layout />,
        children: [
            {
                //Modulo de proyectos
                path: "proyectos",
                element: <Proyectos />,
            },
            {
                //Pantalla para crear un proyecto
                path: "proyectos/nuevo",
                element: <NuevoProyecto />,
            },
            {
                //Dashboard de cada proyecto
                path: "proyectos/:id",
                element: <ProyectoDashboard />
            },
            {
                //Pantalla para editar un proyecto
                path: "proyectos/:id/editar",
                element: <EditarProyecto />
            },
            {
                //Stakeholders de cada proyecto
                path: "proyectos/:id/stakeholders",
                element: <Stakeholders />
            },
            {
                //TI de cada proyecto
                path: "proyectos/:id/TI",
                element: <TI />
            },
            {
                //Procesos de cada proyecto
                path: "proyectos/:id/procesos",
                element: <Procesos />
            },
            {
                //Requerimientos de cada proyecto
                path: "proyectos/:id/requerimientos",
                element: <Requerimientos />
            },
            {
                //Entrevistas de cada proyecto
                path: "proyectos/:id/entrevistas",
                element: <Entrevistas />
            },
            {
                //Crear nueva entrevista
                path: "proyectos/:id/entrevistas/crear",
                element: <CrearEntrevista />
            },
            {
                path: "proyectos/:id/entrevistas/:id_entrevista/audio",
                element: <SubirAudio />
            },
            {
                path: "proyectos/:id/entrevistas/:id_entrevista",
                element: <DetalleEntrevista />
            },
            {
                path: "proyectos/:id/entrevistas/:id_entrevista/respuestas",
                element: <AnotarRespuestas />
            },
            {
                //Cuestionarios de cada proyecto
                path: "proyectos/:id/requerimientos/cuestionarios",
                element: <Cuestionarios />
            },
            {
                //Crear nuevo cuestionario
                path: "proyectos/:id/requerimientos/cuestionarios/crear",
                element: <CrearCuestionario />
            },
            {
                //Ver resultados de cuestionario
                path: "proyectos/:id/requerimientos/cuestionarios/:idEncuesta/resultados",
                element: <VerResultados />
            },
            {
                //Observaciones de cada proyecto
                path: "proyectos/:id/requerimientos/observaciones",
                element: <Observaciones />
            },
            {
                //Crear nueva observación
                path: "proyectos/:id/requerimientos/observaciones/crear",
                element: <CrearObservacion />
            },
            {
                path: "proyectos/:id/requerimientos/observaciones/:id_observacion",
                element: <DetalleObservacion />
            },
            {
                path: "proyectos/:id/requerimientos/observaciones/:id_observacion/editar",
                element: <EditarObservacion />
            },
            {
                //Historias de usuario de cada proyecto
                path: "proyectos/:id/requerimientos/historias-usuario",
                element: <HistoriasDeUsuario />
            },
            {
                //Crear nueva historia de usuario
                path: "proyectos/:id/requerimientos/historias-usuario/crear",
                element: <CrearHistoriaDeUsuario />
            },
            {
                //Focus Groups de cada proyecto
                path: "proyectos/:id/requerimientos/focus-groups",
                element: <FocusGroups />
            },
            {
                //Crear nuevo focus group
                path: "proyectos/:id/requerimientos/focus-groups/crear",
                element: <CrearFocusGroup />
            },
            {
                //Seguimiento Transaccional de cada proyecto
                path: "proyectos/:id/requerimientos/seguimiento-transaccional",
                element: <SeguimientoTransaccional />
            },
            {
                //Crear nuevo seguimiento transaccional
                path: "proyectos/:id/requerimientos/seguimiento-transaccional/crear",
                element: <CrearSeguimientoTransaccional />
            }
        ]
    }
])