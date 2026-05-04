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

// ─── ESTILOS (idénticos al diagrama de clases + forma de carpeta) ─────────────
const styles = `
  .class-node { background:#1e2030; border:1.5px solid #3a3f5c; border-radius:6px;
    min-width:200px; font-family:'Courier New',monospace; font-size:11px; }
  .class-node.selected { border-color:#378ADD; box-shadow:0 0 0 2px rgba(55,138,221,0.25); }
  .node-head { padding:7px 10px; border-bottom:1px solid #3a3f5c; text-align:center; }
  .node-stereotype { font-size:9px; color:#718096; letter-spacing:1px; }
  .node-name { font-size:12px; font-weight:bold; color:#e2e8f0; }
  .node-package .node-head { background:rgba(55,138,221,0.07); }
  .node-package .node-name { color:#63b3ed; }
  .node-section { padding:4px 10px; border-bottom:1px solid #2d3148; min-height:22px; }
  .node-section:last-child { border-bottom:none; }
  .node-row { display:flex; align-items:center; gap:4px; padding:1.5px 0; }
  .row-icon { width:10px; font-size:10px; flex-shrink:0; color:#378ADD; }
  .row-name { flex:1; color:#e2e8f0; }

  /* Forma de carpeta UML */
  .pkg-wrapper { display:inline-block; }
  .pkg-folder-row { display:flex; }
  .pkg-tab { width:72px; height:18px; background:#1e2030;
    border:1.5px solid #3a3f5c; border-bottom:none; border-radius:4px 4px 0 0; }
  .pkg-wrapper.selected .pkg-tab { border-color:#378ADD; }
  .pkg-wrapper.selected .class-node {
    border-color:#378ADD; box-shadow:0 0 0 2px rgba(55,138,221,0.25);
  }
  .pkg-wrapper .class-node { border-radius:0 4px 4px 4px; }

  /* Toolbar */
  .toolbar { display:flex; gap:8px; flex-wrap:wrap; align-items:center;
    background:#161821; border:1px solid #3a3f5c; border-radius:8px;
    padding:8px 12px; font-family:'Courier New',monospace; }
  .tb-btn { font-size:11px; padding:5px 12px; border-radius:5px;
    border:1px solid #3a3f5c; background:#1e2030; color:#e2e8f0; cursor:pointer; }
  .tb-btn:hover { background:#2d3148; }
  .tb-btn.back-btn { background:#1e2030; border-color:#3a3f5c; color:#a0aec0; }
  .tb-btn.back-btn:hover { background:#2d3148; color:#e2e8f0; }
  .tb-btn.export-btn { background:#0F6E56; border-color:#1D9E75; color:#9FE1CB; }
  .tb-btn.export-btn:hover { background:#1D9E75; }
  .tb-btn.export-btn:disabled { opacity:0.5; cursor:wait; }
  .tb-label { font-size:10px; color:#718096; letter-spacing:.5px; }
  .tb-sep { width:1px; height:18px; background:#3a3f5c; }
  .tb-title { font-size:12px; padding:4px 8px; border-radius:5px;
    border:1px solid #3a3f5c; background:#1e2030; color:#e2e8f0;
    font-family:'Courier New',monospace; min-width:160px; }
  .tb-title:focus { outline:none; border-color:#378ADD; }

  /* Panel lateral */
  .side-panel { background:#161821; border:1px solid #3a3f5c; border-radius:8px;
    padding:12px; font-family:'Courier New',monospace; width:220px;
    display:flex; flex-direction:column; gap:8px; max-height:85vh; overflow-y:auto; }
  .side-panel h4 { font-size:11px; color:#e2e8f0; margin-bottom:2px; }
  .pf { display:flex; flex-direction:column; gap:3px; }
  .pf label { font-size:9px; color:#718096; }
  .pf input { width:100%; padding:3px 6px; border-radius:4px;
    border:1px solid #3a3f5c; background:#1e2030; color:#e2e8f0;
    font-size:11px; font-family:'Courier New',monospace; box-sizing:border-box; }
  .pf input:focus { outline:none; border-color:#378ADD; }
  .row-list { display:flex; flex-direction:column; gap:3px; margin-top:4px; }
  .prow { display:flex; gap:3px; align-items:center; }
  .prow input { flex:1; min-width:0; padding:2px 4px; font-size:10px;
    border-radius:3px; border:1px solid #3a3f5c; background:#1e2030;
    color:#e2e8f0; font-family:inherit; }
  .prow input:focus { outline:none; border-color:#378ADD; }
  .prow .dx { background:none; border:none; color:#718096; cursor:pointer; font-size:13px; padding:0 2px; }
  .prow .dx:hover { color:#fc8181; }
  .p-add { font-size:10px; color:#63b3ed; background:none; border:none; cursor:pointer; padding:2px 0; font-family:inherit; }
  .p-del { margin-top:4px; padding:5px; border-radius:4px; border:1px solid #fc8181;
    background:none; color:#fc8181; cursor:pointer; width:100%; font-family:inherit; font-size:10px; }
  .p-del:hover { background:rgba(252,129,129,0.1); }
`;

// ─── NODO PAQUETE ─────────────────────────────────────────────────────────────
function PackageNode({ data, selected }) {
  const { name, classes = [] } = data;
  const hStyle = { background: '#378ADD', width: 8, height: 8 };

  return (
    <div className={`pkg-wrapper${selected ? ' selected' : ''}`}>
      <Handle type="target" position={Position.Top}    id="t" style={hStyle} />
      <Handle type="source" position={Position.Bottom} id="b" style={hStyle} />
      <Handle type="target" position={Position.Left}   id="l" style={hStyle} />
      <Handle type="source" position={Position.Right}  id="r" style={hStyle} />

      {/* Pestaña superior de la carpeta */}
      <div className="pkg-folder-row">
        <div className="pkg-tab" />
      </div>

      {/* Cuerpo — misma clase que las clases para herencia de estilos */}
      <div className="class-node node-package">
        <div className="node-head">
          <div className="node-stereotype">«package»</div>
          <div className="node-name">{name}</div>
        </div>
        <div className="node-section">
          {classes.length === 0
            ? <div style={{ color: '#4a5568', fontSize: 9, fontStyle: 'italic' }}>— sin elementos —</div>
            : classes.map((cls, i) => (
              <div className="node-row" key={i}>
                <span className="row-icon">□</span>
                <span className="row-name">{cls}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

const nodeTypes = { packageNode: PackageNode };

// ─── ESTILOS DE DEPENDENCIAS (flechas punteadas UML) ─────────────────────────
const edgeStyleMap = {
  use:    { style: { stroke: '#63b3ed', strokeWidth: 1.5, strokeDasharray: '7,4' }, markerEnd: { type: 'arrowclosed', color: '#63b3ed' }, label: '«use»' },
  import: { style: { stroke: '#68d391', strokeWidth: 1.5, strokeDasharray: '7,4' }, markerEnd: { type: 'arrowclosed', color: '#68d391' }, label: '«import»' },
  merge:  { style: { stroke: '#a78bfa', strokeWidth: 1.5, strokeDasharray: '7,4' }, markerEnd: { type: 'arrowclosed', color: '#a78bfa' }, label: '«merge»' },
  access: { style: { stroke: '#f6ad55', strokeWidth: 1.5, strokeDasharray: '7,4' }, markerEnd: { type: 'arrowclosed', color: '#f6ad55' }, label: '«access»' },
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

  // ─── EXPORTAR PDF (usa html-to-image para capturar el SVG de las flechas) ──
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
      position: { x: 120 + Math.random() * 280, y: 80 + Math.random() * 200 },
      data: { name: 'Paquete' + (nds.length + 1), classes: [] },
    }]);
  }

  function upd(patch) {
    setNodes((nds) => nds.map((n) => n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n));
  }

  const sel = nodes.find((n) => n.id === selectedId);

  function addEl()       { if (!sel) return; upd({ classes: [...(sel.data.classes || []), 'NuevoElemento'] }); }
  function editEl(i, v)  { if (!sel) return; upd({ classes: sel.data.classes.map((c, idx) => idx === i ? v : c) }); }
  function delEl(i)      { if (!sel) return; upd({ classes: sel.data.classes.filter((_, idx) => idx !== i) }); }
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
        <MiniMap style={{ background: '#1e2030', border: '1px solid #3a3f5c' }} nodeColor="#1e2030" />

        {/* TOOLBAR */}
        <Panel position="top-left">
          <div className="toolbar">
            {diagramaId && (
              <>
                <button className="tb-btn back-btn" onClick={() => navigate(`/app/diagramas/${tipo || 'paquetes'}`)}>
                  ← Volver
                </button>
                <div className="tb-sep" />
                <input
                  className="tb-title"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del diagrama"
                />
                <div className="tb-sep" />
              </>
            )}
            <span className="tb-label">AGREGAR</span>
            <button className="tb-btn" onClick={addPackage}>+ Paquete</button>
            <div className="tb-sep" />
            <span className="tb-label">DEPENDENCIA</span>
            <select className="tb-btn" value={edgeType} onChange={(e) => setEdgeType(e.target.value)}>
              <option value="use">«use» ⤍</option>
              <option value="import">«import» ⤍</option>
              <option value="merge">«merge» ⤍</option>
              <option value="access">«access» ⤍</option>
            </select>
            <div className="tb-sep" />
            <button className="tb-btn export-btn" onClick={exportPDF} disabled={exporting}>
              {exporting ? '⏳ Exportando...' : '⬇ Exportar PDF'}
            </button>
          </div>
        </Panel>

        {/* PANEL LATERAL DE EDICIÓN */}
        {sel && (
          <Panel position="top-right">
            <div className="side-panel">
              <h4>Editar paquete</h4>
              <div className="pf">
                <label>Nombre</label>
                <input value={sel.data.name} onChange={(e) => upd({ name: e.target.value })} />
              </div>
              <div className="pf">
                <label>Elementos</label>
                <div className="row-list">
                  {(sel.data.classes || []).map((cls, i) => (
                    <div className="prow" key={i}>
                      <input value={cls} onChange={(e) => editEl(i, e.target.value)} placeholder="NombreClase" />
                      <button className="dx" onClick={() => delEl(i)}>×</button>
                    </div>
                  ))}
                </div>
                <button className="p-add" onClick={addEl}>+ elemento</button>
              </div>
              <button className="p-del" onClick={deleteNode}>Eliminar paquete</button>
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
