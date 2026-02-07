// Layout de la app, aqui es donde va el contenido de los proyectos 

import Sidebar from "../component/Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Contenido*/}
      <main className="flex-1 px-10 py-8">
        <div className="max-w-7xl mx-auto">
            {children}
            <Outlet />  
        </div>
      </main>
    </div>
  );
}