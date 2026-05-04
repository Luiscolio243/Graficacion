import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MiniMap,
  Controls,
  Background,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSearchParams, useNavigate } from 'react-router-dom';

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const styles = `
  /* ── Forma de carpeta UML ── */
  .pkg-node { display:inline-block; font-family:'Courier New',monospace; font-size:11px; }

  .pkg-top-row { display:flex; align-items:flex-end; }

  .pkg-tab-shape {
    width:72px; height:20px; flex-shrink:0;
    background:#1d4ed8;
    border:1.5px solid #1e40af;
    border-bottom:none;
    border-radius:5px 5px 0 0;
  }

  .pkg-body {
    background:rgba(37,99,235,0.18);
    border:1.5px solid #2563eb;
    border-radius:0 5px 5px 5px;
    padding:12px 14px 10px 14px;
    min-width:180px; min-height:55px;
  }

  .pkg-body-name {
    font-weight:bold; font-size:12px;
    color:#bfdbfe; margin-bottom:8px;
  }

  .pkg-class-item {
    background:rgba(37,99,235,0.15);
    border:1px solid #3b82f6; border-radius:3px;
    padding:2px 8px; margin:2px 0;
    color:#93c5fd; font-size:10px;
  }
  .pkg-empty { color:#374151; font-size:9px; font-style:italic; }

  /* Seleccionado */
  .pkg-node.selected .pkg-tab-shape { border-color:#60a5fa; background:#2563eb; }
  .pkg-node.selected .pkg-body {
    border-color:#60a5fa;
    box-shadow:0 0 0 2px rgba(96,165,250,0.3);
  }

  /* ── Barra de herramientas ── */
  .pkg-toolbar { display:flex; gap:8px; flex-wrap:wrap; align-items:center;
    background:#161821; border:1px solid #3a3f5c; border-radius:8px;
    padding:8px 12px; font-family:'Courier New',monospace; }
  .pkg-btn { font-size:11px; padding:5px 12px; border-radius:5px;
    border:1px solid #3a3f5c; background:#1e2030; color:#e2e8f0; cursor:pointer; }
  .pkg-btn:hover { background:#2d3148; }
  .pkg-btn.back-btn { color:#a0aec0; }
  .pkg-btn.back-btn:hover { color:#e2e8f0; }
  .pkg-btn.export-btn { background:#0F6E56; border-color:#1D9E75; color:#9FE1CB; }
  .pkg-btn.export-btn:hover { background:#1D9E75; }
  .pkg-btn.export-btn:disabled { opacity:0.5; cursor:wait; }
  .pkg-label { font-size:10px; color:#718096; letter-spacing:.5px; }
  .pkg-sep { width:1px; height:18px; background:#3a3f5c; }
  .pkg-title { font-size:12px; padding:4px 8px; border-radius:5px;
    border:1px solid #3a3f5c; background:#1e2030; color:#e2e8f0;
    font-family:'Courier New',monospace; min-width:160px; }
  .pkg-title:focus { outline:none; border-color:#2563eb; }

  /* ── Panel lateral ── */
  .pkg-panel { background:#161821; border:1px solid #3a3f5c; border-radius:8px;
    padding:12px; font-family:'Courier New',monospace; width:220px;
    display:flex; flex-direction:column; gap:8px; max-height:85vh; overflow-y:auto; }
  .pkg-panel h4 { font-size:11px; color:#e2e8f0; margin-bottom:2px; }
  .pkg-pf { display:flex; flex-direction:column; gap:3px; }
  .pkg-pf label { font-size:9px; color:#718096; }
  .pkg-pf input { width:100%; padding:3px 6px; border-radius:4px;
    border:1px solid #3a3f5c; background:#1e2030; color:#e2e8f0;
    font-size:11px; font-family:'Courier New',monospace; box-sizing:border-box; }
  .pkg-pf input:focus { outline:none; border-color:#2563eb; }
  .pkg-row-list { display:flex; flex-direction:column; gap:3px; margin-top:4px; }
  .pkg-prow { display:flex; gap:3px; align-items:center; }
  .pkg-prow input { flex:1; min-width:0; padding:2px 4px; font-size:10px;
    border-radius:3px; border:1px solid #3a3f5c; background:#1e2030;
    color:#e2e8f0; font-family:inherit; }
  .pkg-prow input:focus { outline:none; border-color:#2563eb; }
  .pkg-dx { background:none; border:none; color:#718096; cursor:pointer; font-size:13px; padding:0 2px; }
  .pkg-dx:hover { color:#fc8181; }
  .pkg-add { font-size:10px; color:#60a5fa; background:none; border:none; cursor:pointer; padding:2px 0; font-family:inherit; }
  .pkg-del { margin-top:4px; padding:5px; border-radius:4px; border:1px solid #fc8181;
    background:none; color:#fc8181; cursor:pointer; width:100%; font-family:inherit; font-size:10px; }
  .pkg-del:hover { background:rgba(252,129,129,0.1); }
`;

// ─── NODO PAQUETE ─────────────────────────────────────────────────────────────
function PackageNode({ data, selected }) {
  const { name, classes = [] } = data;
  const hStyle = { background: '#2563eb', width: 8, height: 8 };

  return (
    <div className={`pkg-node${selected ? ' selected' : ''}`}>
      <Handle type="target" position={Position.Top}    id="t" style={hStyle} />
      <Handle type="source" position={Position.Bottom} id="b" style={hStyle} />
      <Handle type="target" position={Position.Left}   id="l" style={hStyle} />
      <Handle type="source" position={Position.Right}  id="r" style={hStyle} />

      {/* Pestaña superior (carpeta UML) */}
      <div className="pkg-top-row">
        <div className="pkg-tab-shape" />
      </div>

      {/* Cuerpo del paquete */}
      <div className="pkg-body">
        <div className="pkg-body-name">{name}</div>
        {classes.length === 0 ? (
          <div className="pkg-empty">— sin elementos —</div>
        ) : (
          classes.map((cls, i) => (
            <div className="pkg-class-item" key={i}>{cls}</div>
          ))
        )}
      </div>
    </div>
  );
}

const nodeTypes = { packageNode: PackageNode };

// ─── ESTILOS DE DEPENDENCIAS ──────────────────────────────────────────────────
const edgeStyleMap = {
  use:    { style: { stroke: '#93c5fd', strokeWidth: 1.5, strokeDasharray: '7,4' }, markerEnd: { type: 'arrowclosed', color: '#93c5fd' }, label: '«use»' },
  import: { style: { stroke: '#6ee7b7', strokeWidth: 1.5, strokeDasharray: '7,4' }, markerEnd: { type: 'arrowclosed', color: '#6ee7b7' }, label: '«import»' },
  merge:  { style: { stroke: '#a78bfa', strokeWidth: 1.5, strokeDasharray: '7,4' }, markerEnd: { type: 'arrowclosed', color: '#a78bfa' }, label: '«merge»' },
  access: { style: { stroke: '#fbbf24', strokeWidth: 1.5, strokeDasharray: '7,4' }, markerEnd: { type: 'arrowclosed', color: '#fbbf24' }, label: '«access»' },
};

// ─── CARGAR SCRIPT EXTERNO ────────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── EDITOR INTERNO ───────────────────────────────────────────────────────────
function PaquetesEditor({ initNodes, initEdges, nombreInicial, diagramaId, tipo }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [selectedId, setSelectedId] = useState(null);
  const [edgeType, setEdgeType]     = useState('use');
  const [exporting, setExporting]   = useState(false);
  const [nombre, setNombre]         = useState(nombreInicial || 'Nuevo diagrama');
  const { fitView }                 = useReactFlow();
  const flowRef                     = useRef(null);
  const navigate                    = useNavigate();

  useEffect(() => {
    const tag = document.createElement('style');
    tag.textContent = styles;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  // ─── AUTOGUARDADO ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!diagramaId) return;
    const storageKey = `diagramas_${tipo || 'paquetes'}`;
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const idx = stored.findIndex((d) => d.id === diagramaId);
    const entrada = {
      id: diagramaId, nombre, tipo: tipo || 'paquetes', nodes, edges,
      fechaCreacion: stored[idx]?.fechaCreacion || new Date().toISOString(),
      ultimaModificacion: new Date().toISOString(),
    };
    if (idx >= 0) stored[idx] = entrada;
    else stored.unshift(entrada);
    localStorage.setItem(storageKey, JSON.stringify(stored));
  }, [nodes, edges, nombre]);

  // ─── EXPORTAR PDF ─────────────────────────────────────────────────────────
  // Usa html-to-image en lugar de html2canvas porque html2canvas no captura
  // los elementos SVG de ReactFlow (las flechas de dependencia).
  async function exportPDF() {
    setExporting(true);
    setSelectedId(null);
    try {
      await loadScript('https://unpkg.com/html-to-image@1.11.11/dist/html-to-image.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

      fitView({ padding: 0.12, duration: 0 });
      await new Promise((r) => setTimeout(r, 400));

      const dataUrl = await window.htmlToImage.toPng(flowRef.current, {
        backgroundColor: '#0f1117',
        pixelRatio: 2,
        filter: (el) => {
          const cls = el.classList;
          if (!cls) return true;
          return !cls.contains('react-flow__panel') &&
                 !cls.contains('react-flow__minimap') &&
                 !cls.contains('react-flow__controls');
        },
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((r) => { img.onload = r; });

      const { jsPDF } = window.jspdf;
      const imgW = img.naturalWidth / 2;
      const imgH = img.naturalHeight / 2;
      const pdf = new jsPDF({ orientation: imgW > imgH ? 'landscape' : 'portrait', unit: 'px', format: [imgW, imgH] });
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgW, imgH);
      pdf.save(`${nombre}.pdf`);
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      alert('Error al exportar. Revisa la consola.');
    } finally {
      setExporting(false);
    }
  }

  // ─── LÓGICA ──────────────────────────────────────────────────────────────────
  const onConnect = useCallback((params) => {
    const extra = edgeStyleMap[edgeType] || edgeStyleMap.use;
    setEdges((eds) => addEdge({ ...params, type: 'smoothstep', ...extra }, eds));
  }, [setEdges, edgeType]);

  const onNodeClick = useCallback((_, node) => setSelectedId(node.id), []);
  const onPaneClick = useCallback(() => setSelectedId(null), []);

  function addPackage() {
    const id = 'p' + Date.now();
    setNodes((nds) => [...nds, {
      id, type: 'packageNode',
      position: { x: 100 + Math.random() * 300, y: 80 + Math.random() * 200 },
      data: { name: 'Paquete' + (nds.length + 1), classes: [] },
    }]);
  }

  function upd(patch) {
    setNodes((nds) => nds.map((n) => n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n));
  }

  const sel = nodes.find((n) => n.id === selectedId);

  function addCls()      { if (!sel) return; upd({ classes: [...(sel.data.classes || []), 'NuevaClase'] }); }
  function editCls(i, v) { if (!sel) return; upd({ classes: sel.data.classes.map((c, idx) => idx === i ? v : c) }); }
  function delCls(i)     { if (!sel) return; upd({ classes: sel.data.classes.filter((_, idx) => idx !== i) }); }

  function deleteNode() {
    setEdges((eds) => eds.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setSelectedId(null);
  }

  return (
    <div ref={flowRef} style={{ width: '100vw', height: '100vh', background: '#0f1117' }}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} onNodeClick={onNodeClick} onPaneClick={onPaneClick}
        nodeTypes={nodeTypes} fitView deleteKeyCode="Delete"
        style={{ background: '#0f1117' }}
      >
        <Background color="#2d3148" gap={24} size={1} />
        <Controls style={{ background: '#1e2030', border: '1px solid #3a3f5c', borderRadius: 6 }} />
        <MiniMap style={{ background: '#1e2030', border: '1px solid #3a3f5c' }} nodeColor="#1d4ed8" />

        {/* BARRA DE HERRAMIENTAS */}
        <Panel position="top-left">
          <div className="pkg-toolbar">
            {diagramaId && (
              <>
                <button className="pkg-btn back-btn" onClick={() => navigate(`/app/diagramas/${tipo || 'paquetes'}`)}>
                  ← Volver
                </button>
                <div className="pkg-sep" />
                <input
                  className="pkg-title"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del diagrama"
                />
                <div className="pkg-sep" />
              </>
            )}
            <span className="pkg-label">AGREGAR</span>
            <button className="pkg-btn" onClick={addPackage}>+ Paquete</button>
            <div className="pkg-sep" />
            <span className="pkg-label">DEPENDENCIA</span>
            <select className="pkg-btn" value={edgeType} onChange={(e) => setEdgeType(e.target.value)}>
              <option value="use">«use» ⤍</option>
              <option value="import">«import» ⤍</option>
              <option value="merge">«merge» ⤍</option>
              <option value="access">«access» ⤍</option>
            </select>
            <div className="pkg-sep" />
            <button className="pkg-btn export-btn" onClick={exportPDF} disabled={exporting}>
              {exporting ? '⏳ Exportando...' : '⬇ Exportar PDF'}
            </button>
          </div>
        </Panel>

        {/* PANEL DE EDICIÓN */}
        {sel && (
          <Panel position="top-right">
            <div className="pkg-panel">
              <h4>Editar paquete</h4>
              <div className="pkg-pf">
                <label>Nombre</label>
                <input value={sel.data.name} onChange={(e) => upd({ name: e.target.value })} />
              </div>
              <div className="pkg-pf">
                <label>Elementos del paquete</label>
                <div className="pkg-row-list">
                  {(sel.data.classes || []).map((cls, i) => (
                    <div className="pkg-prow" key={i}>
                      <input value={cls} onChange={(e) => editCls(i, e.target.value)} placeholder="NombreClase" />
                      <button className="pkg-dx" onClick={() => delCls(i)}>×</button>
                    </div>
                  ))}
                </div>
                <button className="pkg-add" onClick={addCls}>+ elemento</button>
              </div>
              <button className="pkg-del" onClick={deleteNode}>Eliminar paquete</button>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

// ─── EXPORT PRINCIPAL ─────────────────────────────────────────────────────────
export default function DiagramaPaquetes() {
  const [searchParams] = useSearchParams();
  const id   = searchParams.get('id');
  const tipo = searchParams.get('tipo') || 'paquetes';

  const [listo, setListo]                 = useState(false);
  const [initNodes, setInitNodes]         = useState([]);
  const [initEdges, setInitEdges]         = useState([]);
  const [nombreInicial, setNombreInicial] = useState('Nuevo diagrama');
  const [diagramaId, setDiagramaId]       = useState(null);

  useEffect(() => {
    if (id) {
      const storageKey = `diagramas_${tipo}`;
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const diagrama = stored.find((d) => d.id === id);
      if (diagrama) {
        setInitNodes(diagrama.nodes || []);
        setInitEdges(diagrama.edges || []);
        setNombreInicial(diagrama.nombre);
      }
      setDiagramaId(id);
    }
    setListo(true);
  }, []);

  if (!listo) return null;

  return (
    <ReactFlowProvider>
      <PaquetesEditor
        initNodes={initNodes}
        initEdges={initEdges}
        nombreInicial={nombreInicial}
        diagramaId={diagramaId}
        tipo={tipo}
      />
    </ReactFlowProvider>
  );
}
