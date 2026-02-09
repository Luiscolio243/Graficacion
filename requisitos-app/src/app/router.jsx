import { createBrowserRouter, Navigate } from "react-router-dom"
import Login from "../auth/pages/Login"
import Proyectos from "../proyectos/pages/Proyectos";
import Layout from "./layout";
import NuevoProyecto from "../proyectos/pages/NuevoProyecto";
import ProyectoDashboard from "../proyectos/pages/ProyectoDashboard"
import Stakeholders from "../stakeholders/pages/Stakeholders";
import TI from "../ti/pages/ti";
import Procesos from "../procesos/pages/Procesos";

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
            }
        ]
    }
])