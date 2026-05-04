import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow, useNodesState, useEdgesState, addEdge,
  Handle, Position, MiniMap, Controls, Background, Panel,
  useReactFlow, ReactFlowProvider, NodeResizer,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';

const API = "http://localhost:5000";

//  ESTILOS 
const styles = `
  /* ── Actor node ── */
  .actor-node { display:flex; flex-direction:column; align-items:center;
    gap:4px; padding:8px 12px; cursor:pointer; user-select:none; }
  .actor-node.selected .actor-svg circle,
  .actor-node.selected .actor-svg line { stroke:#60a5fa; }
  .actor-name { font-size:11px; color:#e2e8f0; font-family:'Courier New',monospace;
    text-align:center; max-width:90px; word-break:break-word; }

  /* ── UseCase node ── */
  .usecase-node { position:relative; display:flex; align-items:center;
    justify-content:center; cursor:pointer; user-select:none; }
  .usecase-ellipse { fill:#1e2030; stroke:#3a3f5c; stroke-width:1.5; }
  .usecase-node.selected .usecase-ellipse { stroke:#60a5fa; filter:drop-shadow(0 0 4px rgba(96,165,250,0.3)); }
  .usecase-text { font-size:11px; fill:#e2e8f0; font-family:'Courier New',monospace;
    text-anchor:middle; dominant-baseline:middle; pointer-events:none; }

  /* ── System node ── */
  .system-node { background:rgba(30,32,48,0.4); border:1.5px dashed #4a5568;
    border-radius:6px; position:relative; min-width:180px; min-height:120px; }
  .system-node.selected { border-color:#60a5fa; }
  .system-label { position:absolute; top:8px; left:12px;
    font-size:10px; color:#718096; font-family:'Courier New',monospace;
    letter-spacing:.5px; pointer-events:none; }
  .system-name { position:absolute; top:24px; left:12px;
    font-size:12px; color:#a0aec0; font-family:'Courier New',monospace;
    font-weight:bold; pointer-events:none; }

  /* ── Toolbar ── */
  .toolbar { display:flex; gap:8px; flex-wrap:wrap; align-items:center;
    background:#161821; border:1px solid #3a3f5c; border-radius:8px;
    padding:8px 12px; font-family:'Courier New',monospace; }
  .tb-btn { font-size:11px; padding:5px 12px; border-radius:5px;
    border:1px solid #3a3f5c; background:#1e2030; color:#e2e8f0; cursor:pointer; }
  .tb-btn:hover { background:#2d3148; }
  .tb-btn.back-btn { color:#a0aec0; }
  .tb-btn.back-btn:hover { color:#e2e8f0; }
  .tb-btn.save-btn { background:#185FA5; border-color:#378ADD; color:#B5D4F4; }
  .tb-btn.save-btn:hover { background:#378ADD; }
  .tb-btn.save-btn:disabled { opacity:0.5; cursor:wait; }
  .tb-btn.export-btn { background:#0F6E56; border-color:#1D9E75; color:#9FE1CB; }
  .tb-btn.export-btn:hover { background:#1D9E75; }
  .tb-btn.export-btn:disabled { opacity:0.5; cursor:wait; }
  .tb-label { font-size:10px; color:#718096; letter-spacing:.5px; }
  .tb-sep { width:1px; height:18px; background:#3a3f5c; }
  .tb-title { font-size:12px; padding:4px 8px; border-radius:5px;
    border:1px solid #3a3f5c; background:#1e2030; color:#e2e8f0;
    font-family:'Courier New',monospace; min-width:160px; }
  .tb-title:focus { outline:none; border-color:#378ADD; }
  .tb-saved { font-size:10px; color:#68d391; }

  /* ── Side panel ── */
  .side-panel { background:#161821; border:1px solid #3a3f5c; border-radius:8px;
    padding:12px; font-family:'Courier New',monospace; width:210px;
    display:flex; flex-direction:column; gap:8px; max-height:85vh; overflow-y:auto; }
  .side-panel h4 { font-size:11px; color:#e2e8f0; margin-bottom:2px; }
  .pf { display:flex; flex-direction:column; gap:3px; }
  .pf label { font-size:9px; color:#718096; }
  .pf input, .pf select { width:100%; padding:3px 6px; border-radius:4px;
    border:1px solid #3a3f5c; background:#1e2030; color:#e2e8f0;
    font-size:11px; font-family:'Courier New',monospace; }
  .p-del { margin-top:4px; padding:5px; border-radius:4px; border:1px solid #fc8181;
    background:none; color:#fc8181; cursor:pointer; width:100%; font-family:inherit; font-size:10px; }
  .p-del:hover { background:rgba(252,129,129,0.1); }

  /* ── Edge labels ── */
  .react-flow__edge-label { background: #1e2030 !important; color: #e2e8f0 !important;
    padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace;
    font-size: 10px; }
  .react-flow__edge-textwrapper { background: transparent !important; }
`;

//  HANDLE STYLE 
const hStyle = { background: '#378ADD', width: 7, height: 7 };

//  NODO ACTOR 
function ActorNode({ data, selected }) {
  return (
    <div className={`actor-node${selected ? ' selected' : ''}`}>
      <Handle type="target" position={Position.Top}    id="t" style={hStyle} />
      <Handle type="source" position={Position.Bottom} id="b" style={hStyle} />
      <Handle type="target" position={Position.Left}   id="l" style={hStyle} />
      <Handle type="source" position={Position.Right}  id="r" style={hStyle} />
      <svg className="actor-svg" width="36" height="54" viewBox="0 0 36 54">
        {/* cabeza */}
        <circle cx="18" cy="9" r="7" fill="none" stroke="#718096" strokeWidth="1.5" />
        {/* cuerpo */}
        <line x1="18" y1="16" x2="18" y2="36" stroke="#718096" strokeWidth="1.5" />
        {/* brazos */}
        <line x1="4"  y1="24" x2="32" y2="24" stroke="#718096" strokeWidth="1.5" />
        {/* pierna izq */}
        <line x1="18" y1="36" x2="6"  y2="52" stroke="#718096" strokeWidth="1.5" />
        {/* pierna der */}
        <line x1="18" y1="36" x2="30" y2="52" stroke="#718096" strokeWidth="1.5" />
      </svg>
      <div className="actor-name">{data.nombre}</div>
    </div>
  );
}

//  NODO CASO DE USO 
function UseCaseNode({ data, selected }) {
  const W = 160, H = 54;
  const words = (data.nombre || '').split(' ');
  const lines = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > 18) {
      if (current) lines.push(current.trim());
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  }
  if (current) lines.push(current.trim());
  const lineH = 13;
  const totalH = lines.length * lineH;
  const startY = H / 2 - totalH / 2 + lineH / 2;

  return (
    <div className={`usecase-node${selected ? ' selected' : ''}`} style={{ width: W, height: H }}>
      <Handle type="target" position={Position.Top}    id="t" style={{ ...hStyle, left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="b" style={{ ...hStyle, left: '50%' }} />
      <Handle type="target" position={Position.Left}   id="l" style={{ ...hStyle, top: '50%' }} />
      <Handle type="source" position={Position.Right}  id="r" style={{ ...hStyle, top: '50%' }} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <ellipse
          cx={W/2} cy={H/2} rx={W/2 - 2} ry={H/2 - 2}
          style={{
            fill: '#1e2030',
            stroke: selected ? '#60a5fa' : '#3a3f5c',
            strokeWidth: 1.5,
          }}
        />
        {lines.map((line, i) => (
          <text
            key={i}
            x={W/2} y={startY + i * lineH}
            style={{
              fontSize: '11px',
              fill: '#e2e8f0',
              fontFamily: "'Courier New', monospace",
              textAnchor: 'middle',
              dominantBaseline: 'middle',
            }}
          >
            {line}
          </text>
        ))}
      </svg>
    </div>
  );
}

//  NODO SISTEMA (BOUNDARY) 
function SystemNode({ data, selected }) {
  return (
    <div className={`system-node${selected ? ' selected' : ''}`}
      style={{ width: '100%', height: '100%' }}>
      <NodeResizer
        isVisible={selected}
        minWidth={180}
        minHeight={120}
        lineStyle={{ borderColor: '#378ADD' }}
        handleStyle={{ background: '#378ADD', width: 8, height: 8 }}
      />
      <Handle type="target" position={Position.Top}    id="t" style={hStyle} />
      <Handle type="source" position={Position.Bottom} id="b" style={hStyle} />
      <Handle type="target" position={Position.Left}   id="l" style={hStyle} />
      <Handle type="source" position={Position.Right}  id="r" style={hStyle} />
      <span className="system-label">«system»</span>
      <span className="system-name">{data.nombre}</span>
    </div>
  );
}

const nodeTypes = {
  actor:   ActorNode,
  useCase: UseCaseNode,
  system:  SystemNode,
};

//  ESTILOS DE ARISTAS 
const edgeStyleMap = {
  assoc:      { style: { stroke: '#718096', strokeWidth: 1.5 },
                markerEnd: { type: 'arrowclosed', color: '#718096' }, label: '',
                labelStyle: { fill: '#e2e8f0', fontFamily: 'Courier New', fontSize: 10 },
                labelBgStyle: { fill: '#1e2030', fillOpacity: 1 } },
  include:    { style: { stroke: '#63b3ed', strokeWidth: 1.5, strokeDasharray: '6,4' },
                markerEnd: { type: 'arrowclosed', color: '#63b3ed' }, label: '«include»',
                labelStyle: { fill: '#63b3ed', fontFamily: 'Courier New', fontSize: 10 },
                labelBgStyle: { fill: '#1e2030', fillOpacity: 1 } },
  extend:     { style: { stroke: '#f6ad55', strokeWidth: 1.5, strokeDasharray: '6,4' },
                markerEnd: { type: 'arrowclosed', color: '#f6ad55' }, label: '«extend»',
                labelStyle: { fill: '#f6ad55', fontFamily: 'Courier New', fontSize: 10 },
                labelBgStyle: { fill: '#1e2030', fillOpacity: 1 } },
  generalize: { style: { stroke: '#a78bfa', strokeWidth: 1.5 },
                markerEnd: { type: 'arrowclosed', color: '#a78bfa' }, label: '',
                labelStyle: { fill: '#e2e8f0', fontFamily: 'Courier New', fontSize: 10 },
                labelBgStyle: { fill: '#1e2030', fillOpacity: 1 } },
};

//  HELPER PDF 
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

//  EDITOR 
function DiagramEditor({ initNodes, initEdges, nombreInicial, diagramaId, tipo }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [selectedId, setSelectedId] = useState(null);
  const [edgeType, setEdgeType]     = useState('assoc');
  const [guardando, setGuardando]   = useState(false);
  const [guardado, setGuardado]     = useState(false);
  const [exporting, setExporting]   = useState(false);
  const [nombre, setNombre]         = useState(nombreInicial || 'Nuevo diagrama');
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const { fitView }                 = useReactFlow();
  const flowRef                     = useRef(null);
  const navigate                    = useNavigate();

  // Inyectar estilos
  useEffect(() => {
    const tag = document.createElement('style');
    tag.textContent = styles;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  // Ctrl+S
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); guardar(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nodes, edges, nombre]);

  //  Guardar 
  async function guardar() {
    if (!diagramaId) return;
    setGuardando(true);
    try {
        const nodosParaGuardar = nodes.map((n) => {
        if (n.type === 'system') {
            const ancho = n.measured?.width  || n.style?.width  || 300;
            const alto  = n.measured?.height || n.style?.height || 200;
            return {
            ...n,
            data: { ...n.data, ancho, alto },
            };
        }
        return n;
        });

        const res = await fetch(`${API}/diagramas/${diagramaId}/casos-uso`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, nodos: nodosParaGuardar, aristas: edges }),
        });
        if (!res.ok) { alert('Error al guardar'); return; }
        setGuardado(true);
        setTimeout(() => setGuardado(false), 2500);
    } catch {
        alert('No se pudo conectar al servidor');
    } finally {
        setGuardando(false);
    }
    }

  //  Exportar PDF 
  async function exportPDF() {
  setExporting(true);
  setSelectedId(null);
  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

    fitView({ padding: 0.1, duration: 0 });
    await new Promise((r) => setTimeout(r, 800));

    const ocultar = document.querySelectorAll(
      '.react-flow__handle, .react-flow__resize-control, .react-flow__panel, .react-flow__minimap, .react-flow__controls'
    );
    ocultar.forEach((el) => (el.style.visibility = 'hidden'));
    await new Promise((r) => setTimeout(r, 100));

    const dataUrl = await toPng(flowRef.current, {
      backgroundColor: '#0f1117',
      pixelRatio: 2,
    });

    ocultar.forEach((el) => (el.style.visibility = ''));

    const { jsPDF } = window.jspdf;
    const w = flowRef.current.offsetWidth;
    const h = flowRef.current.offsetHeight;
    const pdf = new jsPDF({
      orientation: w > h ? 'landscape' : 'portrait',
      unit: 'px',
      format: [w, h],
    });
    pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
    pdf.save(`${nombre}.pdf`);
  } catch (e) {
    console.error('Export error:', e);
    alert('Error al exportar: ' + e.message);
  } finally {
    setExporting(false);
  }
}

  //  Conectar nodos 
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      ...(edgeStyleMap[edgeType] || edgeStyleMap.assoc),
      data: { edgeType },
    }, eds));
  }, [setEdges, edgeType]);

  const onNodeClick  = useCallback((_, node) => setSelectedId(node.id), []);
  const onPaneClick = useCallback(() => {
    setSelectedId(null);
    setSelectedEdgeId(null);
    }, []);
  const onEdgeClick = useCallback((_, edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedId(null);
    }, []);

  //  Agregar nodos 
  function addNode(tipo) {
    const id = 'n' + Date.now();
    const base = { x: 120 + Math.random() * 300, y: 80 + Math.random() * 200 };
    const defaults = {
        actor:   { nombre: 'Actor' },
        useCase: { nombre: 'Caso de uso' },
        system:  { nombre: 'Sistema', ancho: 300, alto: 200 },
    };
    setNodes((nds) => [...nds, {
        id,
        type: tipo,
        position: base,
        data: defaults[tipo] || { nombre: 'Nodo' },
        ...(tipo === 'system' ? {
            style: { width: 300, height: 200 },
            zIndex: -1,
        } : {}),
    }]);
  }

  //  Editar nodo seleccionado 
  function upd(patch) {
    setNodes((nds) => nds.map((n) => n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n));
  }

  function deleteNode() {
    setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setSelectedId(null);
  }

  function deleteEdge() {
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
    }

  const sel = nodes.find((n) => n.id === selectedId);

  //  Etiqueta del panel según tipo 
  const tipoLabel = { actor: 'Actor', useCase: 'Caso de uso', system: 'Sistema' };

  return (
    <div ref={flowRef} style={{ width: '100vw', height: '100vh', background: '#0f1117' }}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} onNodeClick={onNodeClick} onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes} fitView deleteKeyCode="Delete"
        style={{ background: '#0f1117' }}
      >
        <Background color="#2d3148" gap={24} size={1} />
        <Controls style={{ background: '#1e2030', border: '1px solid #3a3f5c', borderRadius: 6 }} />
        <MiniMap style={{ background: '#1e2030', border: '1px solid #3a3f5c' }} nodeColor="#3a3f5c" />

        {/*  TOOLBAR  */}
        <Panel position="top-left">
          <div className="toolbar">
            <button className="tb-btn back-btn" onClick={() => navigate(`/app/diagramas/${tipo || 'casos-uso'}`)}>
              ← Volver
            </button>
            <div className="tb-sep" />
            <input
              className="tb-title"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del diagrama"
            />
            <button className="tb-btn save-btn" onClick={guardar} disabled={guardando}>
              {guardando ? '...' : ' Guardar'}
            </button>
            {guardado && <span className="tb-saved">✓ Guardado</span>}
            <div className="tb-sep" />
            <span className="tb-label">AGREGAR</span>
            <button className="tb-btn" onClick={() => addNode('actor')}>+ Actor</button>
            <button className="tb-btn" onClick={() => addNode('useCase')}>+ Caso de uso</button>
            <button className="tb-btn" onClick={() => addNode('system')}>+ Sistema</button>
            <div className="tb-sep" />
            <span className="tb-label">RELACIÓN</span>
            <select className="tb-btn" value={edgeType} onChange={(e) => setEdgeType(e.target.value)}>
              <option value="assoc">Asociación →</option>
              <option value="include">Include «include»</option>
              <option value="extend">Extend «extend»</option>
              <option value="generalize">Generalización ▷</option>
            </select>
            <div className="tb-sep" />
            <button className="tb-btn export-btn" onClick={exportPDF} disabled={exporting}>
              {exporting ? ' Exportando...' : '⬇ PDF'}
            </button>
          </div>
        </Panel>

        {/*  PANEL DE EDICIÓN  */}
        {sel && (
          <Panel position="top-right">
            <div className="side-panel">
              <h4>Editar {tipoLabel[sel.data.tipo] || sel.type}</h4>
              <div className="pf">
                <label>Nombre</label>
                <input
                  value={sel.data.nombre}
                  onChange={(e) => upd({ nombre: e.target.value })}
                />
              </div>
              {sel.type === 'system' && (
                <>
                  <div className="pf">
                    <label>Ancho (px)</label>
                    <input
                      type="number"
                      value={sel.style?.width || 300}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 300;
                        setNodes((nds) => nds.map((n) =>
                          n.id === selectedId ? { ...n, style: { ...n.style, width: v }, data: { ...n.data, ancho: v } } : n
                        ));
                      }}
                    />
                  </div>
                  <div className="pf">
                    <label>Alto (px)</label>
                    <input
                      type="number"
                      value={sel.style?.height || 200}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 200;
                        setNodes((nds) => nds.map((n) =>
                          n.id === selectedId ? { ...n, style: { ...n.style, height: v }, data: { ...n.data, alto: v } } : n
                        ));
                      }}
                    />
                  </div>
                </>
              )}
              <button className="p-del" onClick={deleteNode}>
                Eliminar {tipoLabel[sel.data.tipo] || 'nodo'}
              </button>
            </div>
          </Panel>
        )}

        {selectedEdgeId && (
            <Panel position="top-right">
                <div className="side-panel">
                <h4>Relación seleccionada</h4>
                <button className="p-del" onClick={deleteEdge}>
                    Eliminar relación
                </button>
                </div>
            </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

//  LOADER + PROVIDER 
export default function CasosUsoDiagram() {
  const [searchParams] = useSearchParams();
  const id   = searchParams.get('id');
  const tipo = searchParams.get('tipo') || 'casos-uso';

  const [initData, setInitData] = useState(null);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!id) { setInitData({ nodes: [], edges: [], nombre: 'Nuevo diagrama' }); return; }

    fetch(`${API}/diagramas/${id}/casos-uso`)
      .then((r) => r.json())
      .then((data) => {
        console.log('Nodos del backend:', data.nodos);
        // Re-aplicar estilos visuales a las aristas al cargar
        const aristas = (data.aristas || []).map((a) => ({
          ...a,
          type: 'smoothstep',
          ...(edgeStyleMap[a.data?.edgeType] || edgeStyleMap.assoc),
        }));
        // Re-aplicar style a nodos system
        const nodos = (data.nodos || []).map((n) => {
            const nodo = {
                ...n,
                type: n.type || n.data?.tipo || 'useCase',
            };
            if (nodo.type === 'system') {
                return {
                ...nodo,
                style: { width: n.data?.ancho || 300, height: n.data?.alto || 200 },
                zIndex: -1,
                };
            }
            return nodo;
        });
        setInitData({ nodes: nodos, edges: aristas, nombre: data.nombre || 'Nuevo diagrama' });
      })
      .catch(() => setError('No se pudo cargar el diagrama'));
  }, [id]);

  if (error) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:'#0f1117', color:'#fc8181', fontFamily:'monospace' }}>
      {error}
    </div>
  );

  if (!initData) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', background:'#0f1117', color:'#718096', fontFamily:'monospace' }}>
      Cargando diagrama...
    </div>
  );

  return (
    <ReactFlowProvider>
      <DiagramEditor
        initNodes={initData.nodes}
        initEdges={initData.edges}
        nombreInicial={initData.nombre}
        diagramaId={id}
        tipo={tipo}
      />
    </ReactFlowProvider>
  );
}