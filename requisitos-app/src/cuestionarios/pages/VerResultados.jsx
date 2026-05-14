import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:5000";

const TIPO_LABEL = {
  abierta:        "Abierta",
  opcion_multiple:"Opción múltiple",
  escala:         "Escala 1-5",
  si_no:          "Sí / No",
};

export default function VerResultados() {
  const { id, idEncuesta } = useParams();
  const navegar = useNavigate();
  const [cuestionario, setCuestionario] = useState(null);
  const [respuestas,   setRespuestas]   = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    const obtener = async () => {
      try {
        const [resCuest, resResp] = await Promise.all([
          fetch(`${BASE_URL}/encuestas/${idEncuesta}`),
          fetch(`${BASE_URL}/respuestas/obtener/${idEncuesta}`),
        ]);
        if (!resCuest.ok) throw new Error("Error al obtener el cuestionario");
        if (!resResp.ok)  throw new Error("Error al obtener las respuestas");
        setCuestionario(await resCuest.json());
        setRespuestas(await resResp.json() || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    obtener();
  }, [idEncuesta]);

  const botonAtras = (
    <button
      onClick={() => navegar(`/app/proyectos/${id}/requerimientos/cuestionarios`)}
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors duration-150"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Volver a Cuestionarios
    </button>
  );

  if (cargando) return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {botonAtras}
      <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 border-t-green-500 animate-spin" />
        Cargando resultados...
      </div>
    </div>
  );

  if (error || !cuestionario) return (
    <div className="space-y-7 max-w-4xl mx-auto">
      {botonAtras}
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {error ?? "No se encontró el cuestionario"}
      </div>
    </div>
  );

  const respondentes   = new Set(respuestas.map((r) => r.id_stakeholder)).size;
  const tasaRespuesta  = cuestionario.num_participantes
    ? Math.min(100, Math.round((respondentes / cuestionario.num_participantes) * 100))
    : 0;

  return (
    <div className="space-y-7 max-w-4xl mx-auto">

      {/* Botón de regreso */}
      {botonAtras}

      {/* Encabezado */}
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{cuestionario.titulo}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{cuestionario.descripcion}</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          titulo="Respondentes"
          valor={respondentes}
          sub={cuestionario.num_participantes > 0 ? `de ${cuestionario.num_participantes} esperados` : "sin cupo definido"}
          color="blue"
        />
        <StatCard
          titulo="Preguntas"
          valor={cuestionario.preguntas?.length ?? 0}
          color="gray"
        />
        <StatCard
          titulo="Tasa de respuesta"
          valor={`${tasaRespuesta}%`}
          barra={tasaRespuesta}
          color="emerald"
        />
      </div>

      {/* Preguntas y resultados */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
        {cuestionario.preguntas && cuestionario.preguntas.length > 0 ? (
          cuestionario.preguntas.map((pregunta, idx) => (
            <PreguntaResultados
              key={pregunta.id_pregunta}
              pregunta={pregunta}
              numero={idx + 1}
              respuestas={respuestas.filter((r) => r.id_pregunta === pregunta.id_pregunta)}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-12">No hay preguntas en este cuestionario</p>
        )}
      </div>

    </div>
  );
}

/* ── Stat Card ──────────────────────────────────────── */
function StatCard({ titulo, valor, sub, barra, color }) {
  const colors = {
    blue:    { bg: "bg-blue-50",    text: "text-blue-600",    num: "text-blue-700",    bar: "bg-blue-500"    },
    gray:    { bg: "bg-gray-100",   text: "text-gray-500",    num: "text-gray-700",    bar: "bg-gray-400"    },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", num: "text-emerald-700", bar: "bg-emerald-500" },
  };
  const c = colors[color];
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{titulo}</p>
      <p className={`text-3xl font-bold ${c.num}`}>{valor}</p>
      {sub  && <p className={`text-xs mt-1 ${c.text}`}>{sub}</p>}
      {barra != null && (
        <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
          <div className={`${c.bar} h-1.5 rounded-full transition-all`} style={{ width: `${barra}%` }} />
        </div>
      )}
    </div>
  );
}

/* ── Pregunta Resultados ────────────────────────────── */
function PreguntaResultados({ pregunta, numero, respuestas }) {
  const total = respuestas.length;

  const renderContenido = () => {
    if (pregunta.tipo === "opcion_multiple") {
      return (
        <div className="space-y-3">
          {pregunta.opciones && pregunta.opciones.length > 0 ? (
            pregunta.opciones.map((opcion, i) => {
              const count = respuestas.filter((r) => r.respuesta === opcion).length;
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700">{opcion}</span>
                    <span className="font-medium text-gray-900">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-gray-400">Sin opciones definidas</p>
          )}
        </div>
      );
    }

    if (pregunta.tipo === "si_no") {
      const si  = respuestas.filter((r) => ["sí","si","Sí","Si","SI"].includes(r.respuesta)).length;
      const no  = respuestas.filter((r) => ["no","No","NO"].includes(r.respuesta)).length;
      return (
        <div className="space-y-2">
          {[
            { label: "Sí", count: si, color: "bg-emerald-500" },
            { label: "No", count: no, color: "bg-red-400"     },
          ].map((item) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-medium text-gray-900">{item.count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (pregunta.tipo === "escala") {
      const valores  = respuestas.map((r) => Number(r.respuesta)).filter((v) => !isNaN(v));
      const promedio = valores.length > 0
        ? (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1)
        : "—";
      return (
        <div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-gray-900">{promedio}</span>
            <span className="text-xs text-gray-400">/ 5 promedio</span>
          </div>
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5].map((n) => {
              const count = valores.filter((v) => v === n).length;
              const pct   = valores.length > 0 ? Math.round((count / valores.length) * 100) : 0;
              return (
                <div key={n} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-3">{n}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Abierta
    if (respuestas.length === 0)
      return <p className="text-xs text-gray-400 italic">Sin respuestas aún</p>;
    return (
      <div className="space-y-2">
        {respuestas.map((r, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700">
            {r.respuesta || <span className="italic text-gray-400">Sin respuesta</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="px-6 py-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-[11px] font-bold flex items-center justify-center">
            {numero}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{pregunta.pregunta}</h3>
            <span className="text-[11px] text-gray-400 mt-0.5 block">
              {TIPO_LABEL[pregunta.tipo] ?? pregunta.tipo}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {total} {total === 1 ? "respuesta" : "respuestas"}
        </span>
      </div>
      {renderContenido()}
    </div>
  );
}
