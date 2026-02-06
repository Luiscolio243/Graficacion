
// Sidebar que esta a la izquierda
// Por mientras solo puse el modulo de proyectos, despues se sabra si haremos mas modulos (yo creo que si)

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen px-4 py-6">
      
      <div className="mb-10">
        <p className="text-xs text-gray-500">
          Gestión de requisitos
        </p>
      </div>

      {/* Navegación principal en los modulos*/}
      <nav>
        {/* Aqui van los modulos, despues pongo simbolo bonito de los modulos */}
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium">
            Proyectos
        </button>
      </nav>

    </aside>
  );
}