import { useNavigate } from "react-router-dom";

const diagramas = [
  {
    titulo: "Diagrama de Paquetes",
    descripcion: "Organización de clases y componentes en grupos o módulos del sistema",
    color: "violet",
    ruta: "/app/diagramas/paquetes",
  },
  {
    titulo: "Diagrama de Clases",
    descripcion: "Estructura estática del sistema con clases, atributos, métodos y relaciones",
    color: "blue",
    ruta: "/app/diagramas/clases",
  },
  {
    titulo: "Diagrama de Secuencias",
    descripcion: "Interacción entre objetos a lo largo del tiempo mediante mensajes ordenados",
    color: "emerald",
    ruta: "/app/diagramas/secuencias",
  },
  {
    titulo: "Diagrama de Casos de Uso",
    descripcion: "Funcionalidades del sistema desde la perspectiva de los actores externos",
    color: "amber",
    ruta: "/app/diagramas/casos-uso",
  },
];

const estilosPorColor = {
  violet: {
    fondo: "bg-violet-50",
    borde: "border-violet-200",
    textoTitulo: "text-violet-700",
    punto: "bg-violet-500",
    badge: "bg-violet-100 text-violet-600",
  },
  blue: {
    fondo: "bg-blue-50",
    borde: "border-blue-200",
    textoTitulo: "text-blue-700",
    punto: "bg-blue-500",
    badge: "",
  },
  emerald: {
    fondo: "bg-emerald-50",
    borde: "border-emerald-200",
    textoTitulo: "text-emerald-700",
    punto: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-600",
  },
  amber: {
    fondo: "bg-amber-50",
    borde: "border-amber-200",
    textoTitulo: "text-amber-700",
    punto: "bg-amber-500",
    badge: "bg-amber-100 text-amber-600",
  },
};

export default function MenuDiagramas() {
  const navegar = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Diagramas UML</h1>
        <p className="text-gray-500 mt-1">
          Herramientas de modelado y diseño del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {diagramas.map((diagrama, index) => {
          const estilos = estilosPorColor[diagrama.color];
          const disponible = diagrama.ruta !== null;

          return (
            <div
              key={index}
              onClick={() => navegar(diagrama.ruta)}
              className={`
                ${estilos.fondo} ${estilos.borde}
                border rounded-xl p-5
                cursor-pointer
                transition hover:shadow-md
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${estilos.punto}`} />
                  <h3 className={`font-medium ${estilos.textoTitulo}`}>
                    {diagrama.titulo}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {diagrama.descripcion}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
