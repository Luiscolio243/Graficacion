import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow, useNodesState, useEdgesState, addEdge,
  Handle, Position, MiniMap, Controls, Background, Panel,
  useReactFlow, ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSearchParams, useNavigate } from 'react-router-dom';
 
const API = "http://localhost:5000";
 

const styles = `
  .class-node { background:#1e2030; border:1.5px solid #3a3f5c; border-radius:6px;
    min-width:200px; font-family:'Courier New',monospace; font-size:11px; }
  .class-node.selected { border-color:#378ADD; box-shadow:0 0 0 2px rgba(55,138,221,0.25); }
  .node-head { padding:7px 10px; border-bottom:1px solid #3a3f5c; text-align:center; }
  .node-stereotype { font-size:9px; color:#718096; letter-spacing:1px; }
  .node-name { font-size:12px; font-weight:bold; color:#e2e8f0; }
  .node-abstract .node-head { background:rgba(167,139,250,0.07); }
  .node-abstract .node-name { font-style:italic; color:#a78bfa; }
  .node-interface .node-head { background:rgba(55,138,221,0.07); }
  .node-interface .node-name { color:#63b3ed; }
  .node-class .node-head { background:rgba(237,137,54,0.06); }
  .node-section { padding:4px 10px; border-bottom:1px solid #2d3148; min-height:22px; }
  .node-section:last-child { border-bottom:none; }
  .node-row { display:flex; align-items:center; gap:4px; padding:1.5px 0; }
  .vis { width:10px; font-size:10px; flex-shrink:0; }
  .vis-pub { color:#68d391; } .vis-pri { color:#fc8181; } .vis-pro { color:#f6ad55; }
  .row-name { flex:1; color:#e2e8f0; }
  .row-method { flex:1; color:#fbd38d; }
  .row-type { color:#76e4f7; font-size:9px; margin-left:auto; }
  .abs-method { font-style:italic; color:#a78bfa; }
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
  .side-panel { background:#161821; border:1px solid #3a3f5c; border-radius:8px;
    padding:12px; font-family:'Courier New',monospace; width:220px;
    display:flex; flex-direction:column; gap:8px; max-height:85vh; overflow-y:auto; }
  .side-panel h4 { font-size:11px; color:#e2e8f0; margin-bottom:2px; }
  .pf { display:flex; flex-direction:column; gap:3px; }
  .pf label { font-size:9px; color:#718096; }
  .pf input, .pf select { width:100%; padding:3px 6px; border-radius:4px;
    border:1px solid #3a3f5c; background:#1e2030; color:#e2e8f0;
    font-size:11px; font-family:'Courier New',monospace; }
  .row-list { display:flex; flex-direction:column; gap:3px; margin-top:4px; }
  .prow { display:flex; gap:3px; align-items:center; }
  .prow input { flex:1; min-width:0; padding:2px 4px; font-size:10px;
    border-radius:3px; border:1px solid #3a3f5c; background:#1e2030; color:#e2e8f0; font-family:inherit; }
  .prow select { width:28px; padding:2px; font-size:10px; border-radius:3px;
    border:1px solid #3a3f5c; background:#1e2030; color:#e2e8f0; }
  .prow .dx { background:none; border:none; color:#718096; cursor:pointer; font-size:13px; padding:0 2px; }
  .prow .dx:hover { color:#fc8181; }
  .p-add { font-size:10px; color:#63b3ed; background:none; border:none; cursor:pointer; padding:2px 0; font-family:inherit; }
  .p-del { margin-top:4px; padding:5px; border-radius:4px; border:1px solid #fc8181;
    background:none; color:#fc8181; cursor:pointer; width:100%; font-family:inherit; font-size:10px; }
  .p-del:hover { background:rgba(252,129,129,0.1); }
`;
 

function ClassNode({ data, selected }) {
  const { type = 'class', name, attrs = [], methods = [] } = data;
  const stereo = type === 'interface' ? '«interface»' : type === 'abstract' ? '«abstract»' : '';
  const vc = (v) => v === '+' ? 'vis-pub' : v === '-' ? 'vis-pri' : 'vis-pro';
  const hStyle = { background: '#378ADD', width: 8, height: 8 };
 
  return (
    <div className={`class-node node-${type}${selected ? ' selected' : ''}`}>
      <Handle type="target" position={Position.Top}    id="t" style={hStyle} />
      <Handle type="source" position={Position.Bottom} id="b" style={hStyle} />
      <Handle type="target" position={Position.Left}   id="l" style={hStyle} />
      <Handle type="source" position={Position.Right}  id="r" style={hStyle} />
      <div className="node-head">
        {stereo && <div className="node-stereotype">{stereo}</div>}
        <div className="node-name">{name}</div>
      </div>
      <div className="node-section">
        {attrs.length === 0
          ? <div style={{ color: '#4a5568', fontSize: 9, fontStyle: 'italic' }}>— sin atributos —</div>
          : attrs.map((a, i) => (
            <div className="node-row" key={i}>
              <span className={`vis ${vc(a.v)}`}>{a.v}</span>
              <span className="row-name">{a.n}</span>
              <span className="row-type">: {a.t}</span>
            </div>
          ))}
      </div>
      <div className="node-section">
        {methods.length === 0
          ? <div style={{ color: '#4a5568', fontSize: 9, fontStyle: 'italic' }}>— sin métodos —</div>
          : methods.map((m, i) => (
            <div className={`node-row${m.ab ? ' abs-method' : ''}`} key={i}>
              <span className={`vis ${vc(m.v)}`}>{m.v}</span>
              <span className="row-method">{m.n}</span>
              <span className="row-type">: {m.t}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
 
const nodeTypes = { classNode: ClassNode };
 
const edgeStyleMap = {
  inherit:   { style: { stroke: '#a78bfa', strokeWidth: 1.5 }, markerEnd: { type: 'arrowclosed', color: '#a78bfa' }, label: '' },
  implement: { style: { stroke: '#63b3ed', strokeWidth: 1.5, strokeDasharray: '6,4' }, markerEnd: { type: 'arrowclosed', color: '#63b3ed' }, label: '«implements»' },
  compose:   { style: { stroke: '#68d391', strokeWidth: 1.5 }, markerEnd: { type: 'arrowclosed', color: '#68d391' }, label: '◆' },
  aggregate: { style: { stroke: '#63b3ed', strokeWidth: 1.5 }, markerEnd: { type: 'arrowclosed', color: '#63b3ed' }, label: '◇' },
  assoc:     { style: { stroke: '#718096', strokeWidth: 1.5 }, markerEnd: { type: 'arrowclosed', color: '#718096' }, label: '' },
};
 
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}
 

function DiagramEditor({ initNodes, initEdges, nombreInicial, diagramaId, tipo }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [selectedId, setSelectedId] = useState(null);
  const [edgeType, setEdgeType]     = useState('inherit');
  const [exporting, setExporting]   = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [guardado, setGuardado]     = useState(false);
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
 
  async function guardar() {
    if (!diagramaId) return;
    setGuardando(true);
    try {
      const res = await fetch(`${API}/diagramas/${diagramaId}/clases`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, nodos: nodes, aristas: edges }),
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

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); guardar(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nodes, edges, nombre]);
 
  async function exportPDF() {
    setExporting(true); setSelectedId(null);
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      fitView({ padding: 0.12, duration: 0 });
      await new Promise((r) => setTimeout(r, 350));
      const canvas = await window.html2canvas(flowRef.current, {
        backgroundColor: '#0f1117', scale: 2, useCORS: true, logging: false,
        ignoreElements: (el) =>
          el.classList?.contains('react-flow__panel') ||
          el.classList?.contains('react-flow__minimap') ||
          el.classList?.contains('react-flow__controls'),
      });
      const { jsPDF } = window.jspdf;
      const imgW = canvas.width / 2, imgH = canvas.height / 2;
      const pdf = new jsPDF({ orientation: imgW > imgH ? 'landscape' : 'portrait', unit: 'px', format: [imgW, imgH] });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, imgH);
      pdf.save(`${nombre}.pdf`);
    } catch { alert('Error al exportar'); }
    finally { setExporting(false); }
  }
 

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, type: 'smoothstep', ...(edgeStyleMap[edgeType] || edgeStyleMap.assoc) }, eds));
  }, [setEdges, edgeType]);
 
  const onNodeClick = useCallback((_, node) => setSelectedId(node.id), []);
  const onPaneClick = useCallback(() => setSelectedId(null), []);
 
  function addNode(type) {
    const id = 'n' + Date.now();
    const names = { class: 'Clase', abstract: 'Base', interface: 'IServicio' };
    setNodes((nds) => [...nds, {
      id, type: 'classNode',
      position: { x: 120 + Math.random() * 280, y: 80 + Math.random() * 200 },
      data: { type, name: (names[type] || 'Clase') + (nds.length + 1),
        attrs: [{ v: '-', n: 'id', t: 'int' }],
        methods: [{ v: '+', n: 'toString()', t: 'String', ab: false }] },
    }]);
  }
 
  function upd(patch) {
    setNodes((nds) => nds.map((n) => n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n));
  }
 
  const sel = nodes.find((n) => n.id === selectedId);
 
  function addAttr()           { if (!sel) return; upd({ attrs:   [...sel.data.attrs,   { v: '-', n: 'attr',     t: 'String' }] }); }
  function addMethod()         { if (!sel) return; upd({ methods: [...sel.data.methods, { v: '+', n: 'metodo()', t: 'void', ab: false }] }); }
  function editAttr(i, k, v)   { if (!sel) return; upd({ attrs:   sel.data.attrs.map((a, idx)   => idx === i ? { ...a, [k]: v } : a) }); }
  function editMethod(i, k, v) { if (!sel) return; upd({ methods: sel.data.methods.map((m, idx) => idx === i ? { ...m, [k]: v } : m) }); }
  function delAttr(i)          { if (!sel) return; upd({ attrs:   sel.data.attrs.filter((_, idx) => idx !== i) }); }
  function delMethod(i)        { if (!sel) return; upd({ methods: sel.data.methods.filter((_, idx) => idx !== i) }); }
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
        <MiniMap style={{ background: '#1e2030', border: '1px solid #3a3f5c' }} nodeColor="#3a3f5c" />
 
        <Panel position="top-left">
          <div className="toolbar">
            <button className="tb-btn back-btn" onClick={() => navigate(`/app/diagramas/${tipo || 'clases'}`)}>
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
              {guardando ? '...' : '💾 Guardar'}
            </button>
            {guardado && <span className="tb-saved">✓ Guardado</span>}
            <div className="tb-sep" />
            <span className="tb-label">AGREGAR</span>
            <button className="tb-btn" onClick={() => addNode('class')}>+ Clase</button>
            <button className="tb-btn" onClick={() => addNode('abstract')}>+ Abstracta</button>
            <button className="tb-btn" onClick={() => addNode('interface')}>+ Interfaz</button>
            <div className="tb-sep" />
            <span className="tb-label">RELACIÓN</span>
            <select className="tb-btn" value={edgeType} onChange={(e) => setEdgeType(e.target.value)}>
              <option value="inherit">Herencia ▷</option>
              <option value="implement">Implementa ⤍</option>
              <option value="compose">Composición ◆</option>
              <option value="aggregate">Agregación ◇</option>
              <option value="assoc">Asociación →</option>
            </select>
            <div className="tb-sep" />
            <button className="tb-btn export-btn" onClick={exportPDF} disabled={exporting}>
              {exporting ? '⏳ Exportando...' : '⬇ PDF'}
            </button>
          </div>
        </Panel>
 
        {sel && (
          <Panel position="top-right">
            <div className="side-panel">
              <h4>Editar clase</h4>
              <div className="pf">
                <label>Nombre</label>
                <input value={sel.data.name} onChange={(e) => upd({ name: e.target.value })} />
              </div>
              <div className="pf">
                <label>Tipo</label>
                <select value={sel.data.type} onChange={(e) => upd({ type: e.target.value })}>
                  <option value="class">Clase</option>
                  <option value="abstract">Abstracta</option>
                  <option value="interface">Interfaz</option>
                </select>
              </div>
              <div className="pf">
                <label>Atributos</label>
                <div className="row-list">
                  {sel.data.attrs.map((a, i) => (
                    <div className="prow" key={i}>
                      <select value={a.v} onChange={(e) => editAttr(i, 'v', e.target.value)}>
                        <option value="-">-</option><option value="+">+</option><option value="#">#</option>
                      </select>
                      <input value={a.n} onChange={(e) => editAttr(i, 'n', e.target.value)} placeholder="nombre" />
                      <input value={a.t} onChange={(e) => editAttr(i, 't', e.target.value)} placeholder="tipo" style={{ width: 52 }} />
                      <button className="dx" onClick={() => delAttr(i)}>×</button>
                    </div>
                  ))}
                </div>
                <button className="p-add" onClick={addAttr}>+ atributo</button>
              </div>
              <div className="pf">
                <label>Métodos</label>
                <div className="row-list">
                  {sel.data.methods.map((m, i) => (
                    <div className="prow" key={i}>
                      <select value={m.v} onChange={(e) => editMethod(i, 'v', e.target.value)}>
                        <option value="+">+</option><option value="-">-</option><option value="#">#</option>
                      </select>
                      <input value={m.n} onChange={(e) => editMethod(i, 'n', e.target.value)} placeholder="método()" />
                      <input value={m.t} onChange={(e) => editMethod(i, 't', e.target.value)} placeholder="tipo" style={{ width: 52 }} />
                      <button className="dx" onClick={() => delMethod(i)}>×</button>
                    </div>
                  ))}
                </div>
                <button className="p-add" onClick={addMethod}>+ método</button>
              </div>
              <button className="p-del" onClick={deleteNode}>Eliminar clase</button>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
 
export default function ClassDiagram() {
  const [searchParams] = useSearchParams();
  const id   = searchParams.get('id');
  const tipo = searchParams.get('tipo') || 'clases';
 
  const [initData, setInitData] = useState(null);
  const [error, setError]       = useState(null);
 
  useEffect(() => {
    if (!id) { setInitData({ nodes: [], edges: [], nombre: 'Nuevo diagrama' }); return; }
 
    fetch(`${API}/diagramas/${id}/clases`)
      .then((r) => r.json())
      .then((data) => {
        // Reaplicar estilos visuales a las aristas al cargar
        const aristas = (data.aristas || []).map((a) => ({
          ...a,
          type: 'smoothstep',
          ...(edgeStyleMap[a.data?.edgeType] || edgeStyleMap.assoc),
        }));
        setInitData({ nodes: data.nodos || [], edges: aristas, nombre: data.nombre || 'Nuevo diagrama' });
      })
      .catch(() => setError('No se pudo cargar el diagrama'));
  }, [id]);
 
  if (error) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f1117', color:'#fc8181', fontFamily:'monospace' }}>
      {error}
    </div>
  );
 
  if (!initData) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f1117', color:'#718096', fontFamily:'monospace' }}>
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
 