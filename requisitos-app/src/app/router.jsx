import { createBrowserRouter, Navigate } from "react-router-dom"
import Login from "../auth/pages/Login"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/login" />
    },
    {
        path: "/login",
        element: <Login />
    }
])