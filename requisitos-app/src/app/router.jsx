import { createBrowserRouter, Navigate } from "react-router-dom"
import Login from "../auth/pages/Login"
import Proyectos from "../proyectos/pages/Proyectos";
import Layout from "./layout";
import NuevoProyecto from "../proyectos/pages/NuevoProyecto";

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
                path: "proyectos/nuevo",
                element: <NuevoProyecto />,
            }
        ]
    }
])