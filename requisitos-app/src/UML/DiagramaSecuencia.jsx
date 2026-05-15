import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
 
const API = "http://localhost:5000";
 
// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const styles = `
  .seq-wrap { display:flex; flex-direction:column; height:100vh; background:#0f1117; font-family:'Courier New',monospace; overflow:hidden; }
 
  .seq-toolbar { display:flex; gap:6px; flex-wrap:wrap; align-items:center;
    background:#161821; border-bottom:1px solid #2d3148;
    padding:8px 12px; flex-shrink:0; }
  .tb { font-size:11px; padding:5px 12px; border-radius:5px;
    border:1px solid #3a3f5c; background:#1e2030; color:#e2e8f0; cursor:pointer; }
  .tb:hover { background:#2d3148; }
  .tb.save-btn { background:#185FA5; border-color:#378ADD; color:#B5D4F4; }
  .tb.save-btn:hover { background:#378ADD; }
  .tb.save-btn:disabled { opacity:.5; cursor:wait; }
  .tb.export-btn { background:#0F6E56; border-color:#1D9E75; color:#9FE1CB; }
  .tb.export-btn:hover { background:#1D9E75; }
  .tb-sep { width:1px; height:18px; background:#3a3f5c; }
  .tb-label { font-size:10px; color:#718096; letter-spacing:.5px; }
  .tb-title { font-size:12px; padding:4px 8px; border-radius:5px;
    border:1px solid #3a3f5c; background:#1e2030; color:#e2e8f0;
    font-family:'Courier New',monospace; min-width:160px; }
  .tb-title:focus { outline:none; border-color:#378ADD; }
  .tb-saved { font-size:10px; color:#68d391; }
 
  .seq-body { display:flex; flex:1; overflow:hidden; }
 
  /* Canvas */
  .seq-canvas { flex:1; overflow:auto; position:relative; }
  .seq-canvas-inner { position:relative; min-width:800px; }
 
  /* Participantes */
  .participants-bar { display:flex; align-items:flex-end; padding:20px 40px 0 40px;
    background:#161821; border-bottom:1px solid #2d3148; position:sticky; top:0; z-index:10; gap:0; }
  .participant-col { display:flex; flex-direction:column; align-items:center;
    width:160px; flex-shrink:0; cursor:grab; user-select:none; }
  .participant-col.dragging { opacity:.6; cursor:grabbing; }
  .participant-box { padding:6px 14px; border-radius:6px; font-size:11px; font-weight:bold;
    white-space:nowrap; border:1.5px solid; margin-bottom:0; position:relative; z-index:2; }
  .p-object { background:#161c2e; border-color:#378ADD; color:#63b3ed; }
  .p-actor  { background:#1e1830; border-color:#7F77DD; color:#a78bfa; border-radius:20px; }
  .p-boundary { background:#1a2618; border-color:#68d391; color:#68d391; }
  .p-control  { background:#2a1e10; border-color:#f6ad55; color:#f6ad55; }
  .p-entity   { background:#1e1830; border-color:#a78bfa; color:#a78bfa; border-radius:50% 50% 0 0 / 20px 20px 0 0; }
  .p-selected { box-shadow:0 0 0 2px rgba(55,138,221,.4); }
  .p-delete-btn { position:absolute; top:-8px; right:-8px; background:#2d1515;
    border:1px solid #fc8181; color:#fc8181; border-radius:50%;
    width:16px; height:16px; font-size:10px; cursor:pointer; display:flex;
    align-items:center; justify-content:center; line-height:1; }
  .lifeline-stub { width:1.5px; height:24px; background:#2d3148; margin:0 auto; }
 
  /* Mensajes */
  .messages-area { padding:0 40px 40px 40px; position:relative; min-height:400px; }
  .msg-row { display:flex; align-items:center; height:44px; position:relative; cursor:pointer; }
  .msg-row:hover .msg-bg { background:rgba(55,138,221,.04); }
  .msg-bg { position:absolute; inset:0; border-radius:4px; }
  .msg-num { width:22px; font-size:9px; color:#4a5568; flex-shrink:0; }
  .msg-arrow-wrap { position:absolute; display:flex; align-items:center; height:100%; }
  .msg-line { height:1.5px; }
  .msg-line.sync    { background:#378ADD; }
  .msg-line.async   { background:none; border-top:1.5px dashed #68d391; }
  .msg-line.return  { background:none; border-top:1.5px dashed #718096; }
  .msg-line.create  { background:#f6ad55; }
  .msg-line.destroy { background:#fc8181; }
  .arrowhead { width:0; height:0; border-top:5px solid transparent; border-bottom:5px solid transparent; flex-shrink:0; }
  .ah-sync    { border-left:8px solid #378ADD; }
  .ah-async   { border-left:8px solid #68d391; }
  .ah-create  { border-left:8px solid #f6ad55; }
  .ah-destroy { border-left:8px solid #fc8181; }
  .ah-return  { border-right:8px solid #718096; border-left:none; }
  .msg-label { position:absolute; font-size:10px; white-space:nowrap; pointer-events:none; }
  .msg-label.above { bottom:calc(50% + 2px); }
  .msg-label.below { top:calc(50% + 2px); color:#718096; }
  .msg-selected .msg-bg { background:rgba(55,138,221,.1); border:1px solid #378ADD; }
  .lifeline-line { position:absolute; width:1.5px; background:repeating-linear-gradient(
    to bottom,#2d3148 0,#2d3148 6px,transparent 6px,transparent 12px); top:0; }
 
  /* Panel lateral */
  .seq-side { width:230px; background:#161821; border-left:1px solid #2d3148;
    padding:12px; overflow-y:auto; flex-shrink:0; font-size:11px; }
  .seq-side h4 { font-size:11px; color:#e2e8f0; font-weight:500; margin-bottom:10px; }
  .pf { display:flex; flex-direction:column; gap:3px; margin-bottom:8px; }
  .pf label { font-size:9px; color:#718096; }
  .pf input, .pf select { padding:3px 6px; border-radius:4px; border:1px solid #3a3f5c;
    background:#1e2030; color:#e2e8f0; font-size:11px; font-family:inherit; width:100%; }
  .pf input:focus, .pf select:focus { outline:none; border-color:#378ADD; }
  .side-del { margin-top:6px; padding:5px; border-radius:4px; border:1px solid #fc8181;
    background:none; color:#fc8181; cursor:pointer; width:100%; font-family:inherit; font-size:10px; }
  .side-del:hover { background:rgba(252,129,129,.1); }
  .side-hint { font-size:10px; color:#4a5568; text-align:center; padding:20px 0; line-height:1.6; }
 
  /* Leyenda */
  .seq-legend { display:flex; gap:12px; padding:6px 40px; background:#161821;
    border-top:1px solid #2d3148; font-size:10px; color:#718096; flex-shrink:0; }
  .leg { display:flex; align-items:center; gap:5px; }
  .leg-line { width:24px; height:1.5px; }
`;
 
// ─── COLORES POR TIPO DE MENSAJE ──────────────────────────────────────────────
const MSG_COLORS = {
  sync:    '#378ADD',
  async:   '#68d391',
  return:  '#718096',
  create:  '#f6ad55',
  destroy: '#fc8181',
};
 
// ─── UTILIDADES ───────────────────────────────────────────────────────────────
function genId() { return 'p' + Date.now() + Math.random().toString(36).slice(2, 6); }
function genMsgId() { return 'm' + Date.now() + Math.random().toString(36).slice(2, 6); }
 
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}
 
const COL_WIDTH = 160;   // ancho de columna por participante
const COL_PAD   = 40;    // padding izquierdo del canvas
 
// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function SequenceDiagram() {
  const [searchParams] = useSearchParams();
  const id          = searchParams.get('id');
  const tipo        = searchParams.get('tipo') || 'secuencia';
  const idProyecto  = searchParams.get('id_proyecto');
 
  const [initData, setInitData] = useState(null);
  const [error, setError]       = useState(null);
 
  useEffect(() => {
  if (!id) {
    setTimeout(() => setInitData({ participantes: [], mensajes: [], nombre: 'Nuevo diagrama' }), 0);
    return;
  }
  fetch(`${API}/diagramas/${id}/secuencia`)
    .then(r => r.json())
    .then(data => setInitData({
      participantes: data.participantes || [],
      mensajes:      data.mensajes      || [],
      nombre:        data.nombre        || 'Nuevo diagrama',
    }))
    .catch(() => setError('No se pudo cargar el diagrama'));
}, [id]);
 
  if (error) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0f1117',color:'#fc8181',fontFamily:'monospace' }}>
      {error}
    </div>
  );
  if (!initData) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0f1117',color:'#718096',fontFamily:'monospace' }}>
      Cargando diagrama...
    </div>
  );
 
  return <DiagramEditor initData={initData} diagramaId={id} tipo={tipo} />;
}
 
// ─── EDITOR ───────────────────────────────────────────────────────────────────
function DiagramEditor({ initData, diagramaId, tipo }) {
  const navigate = useNavigate();
 
  const [participantes, setParticipantes] = useState(initData.participantes);
  const [mensajes,      setMensajes]      = useState(initData.mensajes);
  const [nombre,        setNombre]        = useState(initData.nombre);
  const [selP,          setSelP]          = useState(null);  // participante seleccionado
  const [selM,          setSelM]          = useState(null);  // mensaje seleccionado
  const [guardando,     setGuardando]     = useState(false);
  const [guardado,      setGuardado]      = useState(false);
  const [exporting,     setExporting]     = useState(false);
  const [msgTipo,       setMsgTipo]       = useState('sync');
  const canvasRef = useRef(null);
 
  // Inyectar estilos
  useEffect(() => {
    const tag = document.createElement('style');
    tag.textContent = styles;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);
 
  // Ctrl+S
  useEffect(() => {
    const onKey = e => { if ((e.ctrlKey||e.metaKey) && e.key==='s') { e.preventDefault(); guardar(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [participantes, mensajes, nombre]);
 
  // ─── GUARDAR ──────────────────────────────────────────────────────────────
  async function guardar() {
    if (!diagramaId) return;
    setGuardando(true);
    try {
      const res = await fetch(`${API}/diagramas/${diagramaId}/secuencia`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, participantes, mensajes }),
      });
      if (!res.ok) { alert('Error al guardar'); return; }
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } catch { alert('No se pudo conectar al servidor'); }
    finally { setGuardando(false); }
  }
 
  // ─── EXPORTAR PDF (render programático en canvas) ────────────────────────
  async function exportPDF() {
    setExporting(true);
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

      const SCALE  = 2;
      const BOX_H  = 30;
      const BOX_Y  = 20;
      const STUB   = 20;
      const HEADER = BOX_Y + BOX_H + STUB;
      const ROW_H  = 44;
      const W = COL_PAD * 2 + participantes.length * COL_WIDTH;
      const H = HEADER + mensajesOrdenados.length * ROW_H + COL_PAD;

      const cvs = document.createElement('canvas');
      cvs.width  = W * SCALE;
      cvs.height = H * SCALE;
      const ctx  = cvs.getContext('2d');
      ctx.scale(SCALE, SCALE);

      // Fondo
      ctx.fillStyle = '#0f1117';
      ctx.fillRect(0, 0, W, H);

      const TYPE_STYLE = {
        object:   { border:'#378ADD', bg:'#161c2e', text:'#63b3ed' },
        actor:    { border:'#7F77DD', bg:'#1e1830', text:'#a78bfa' },
        boundary: { border:'#68d391', bg:'#1a2618', text:'#68d391' },
        control:  { border:'#f6ad55', bg:'#2a1e10', text:'#f6ad55' },
        entity:   { border:'#a78bfa', bg:'#1e1830', text:'#a78bfa' },
      };
      const cx     = (idx) => COL_PAD + idx * COL_WIDTH + COL_WIDTH / 2;
      const cxById = (pid) => { const i = participantes.findIndex(p => p.id === pid); return i >= 0 ? cx(i) : 0; };
      const BOX_W  = 130;

      // Participantes + lifelines
      participantes.forEach((p, idx) => {
        const s = TYPE_STYLE[p.tipo] || TYPE_STYLE.object;
        const x = cx(idx);
        ctx.fillStyle   = s.bg;
        ctx.strokeStyle = s.border;
        ctx.lineWidth   = 1.5;
        ctx.beginPath(); ctx.rect(x - BOX_W / 2, BOX_Y, BOX_W, BOX_H); ctx.fill(); ctx.stroke();
        ctx.fillStyle    = s.text;
        ctx.font         = 'bold 11px "Courier New", monospace';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`:${p.nombre}`, x, BOX_Y + BOX_H / 2);
        ctx.strokeStyle = '#2d3148';
        ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.moveTo(x, BOX_Y + BOX_H); ctx.lineTo(x, H - COL_PAD / 2); ctx.stroke();
        ctx.setLineDash([]);
      });

      const MSG_C = { sync:'#378ADD', async:'#68d391', return:'#718096', create:'#f6ad55', destroy:'#fc8181' };

      // Mensajes
      mensajesOrdenados.forEach((m, i) => {
        const y     = HEADER + i * ROW_H + ROW_H / 2;
        const x1    = cxById(m.source_id);
        const x2    = cxById(m.target_id);
        const color = MSG_C[m.tipo] || '#718096';
        ctx.strokeStyle = color;
        ctx.fillStyle   = color;
        ctx.lineWidth   = 1.5;

        if (m.es_self) {
          ctx.setLineDash(m.tipo === 'return' ? [5, 3] : []);
          ctx.beginPath();
          ctx.moveTo(x1, y - 8); ctx.lineTo(x1 + 36, y - 8);
          ctx.lineTo(x1 + 36, y + 8); ctx.lineTo(x1 + 4, y + 8);
          ctx.stroke(); ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(x1 + 10, y + 3); ctx.lineTo(x1, y + 8); ctx.lineTo(x1 + 10, y + 13);
          ctx.closePath(); ctx.fill();
        } else {
          const goRight = x2 > x1;
          if (m.tipo === 'async' || m.tipo === 'return') ctx.setLineDash([5, 3]);
          const tip = goRight ? x2 - 8 : x2 + 8;
          ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(tip, y); ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath();
          if (goRight) {
            ctx.moveTo(x2 - 8, y - 5); ctx.lineTo(x2, y); ctx.lineTo(x2 - 8, y + 5);
          } else {
            ctx.moveTo(x2 + 8, y - 5); ctx.lineTo(x2, y); ctx.lineTo(x2 + 8, y + 5);
          }
          ctx.closePath(); ctx.fill();
        }

        const midX = m.es_self ? x1 + 22 : (x1 + x2) / 2;
        ctx.fillStyle    = color;
        ctx.font         = '10px "Courier New", monospace';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(m.contenido, midX, y - 2);
        ctx.fillStyle    = '#4a5568';
        ctx.font         = '9px monospace';
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i + 1}`, 6, y);
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: W > H ? 'landscape' : 'portrait', unit: 'px', format: [W, H] });
      pdf.addImage(cvs.toDataURL('image/png'), 'PNG', 0, 0, W, H);
      pdf.save(`${nombre}.pdf`);
    } catch (e) { console.error(e); alert('Error al exportar: ' + e.message); }
    finally { setExporting(false); }
  }
 
  // ─── PARTICIPANTES ────────────────────────────────────────────────────────
  function addParticipante(tipo_p) {
    const id = genId();
    const nombres = { actor:'Actor', object:'Objeto', boundary:'Boundary', control:'Control', entity:'Entity' };
    setParticipantes(prev => [...prev, {
      id, nombre: (nombres[tipo_p]||'Objeto') + (prev.length+1),
      tipo: tipo_p, orden: prev.length,
    }]);
  }
 
  function updateParticipante(id, patch) {
    setParticipantes(prev => prev.map(p => p.id===id ? {...p,...patch} : p));
  }
 
  function deleteParticipante(id) {
    setMensajes(prev => prev.filter(m => m.source_id!==id && m.target_id!==id));
    setParticipantes(prev => prev.filter(p => p.id!==id).map((p,i) => ({...p, orden:i})));
    if (selP===id) setSelP(null);
  }
 
  // Reordenar participante arrastrando
  function onDragStart(e, id) {
    e.dataTransfer.setData('dragId', id);
  }
  function onDrop(e, targetId) {
    e.preventDefault();
    const dragId = e.dataTransfer.getData('dragId');
    if (dragId === targetId) return;
    setParticipantes(prev => {
      const arr = [...prev];
      const fromIdx = arr.findIndex(p=>p.id===dragId);
      const toIdx   = arr.findIndex(p=>p.id===targetId);
      const [moved] = arr.splice(fromIdx,1);
      arr.splice(toIdx,0,moved);
      return arr.map((p,i) => ({...p, orden:i}));
    });
  }
 
  // ─── MENSAJES ─────────────────────────────────────────────────────────────
  function addMensaje() {
    if (participantes.length < 2) { alert('Necesitas al menos 2 participantes'); return; }
    const id = genMsgId();
    const src = participantes[0].id;
    const tgt = participantes[1].id;
    setMensajes(prev => [...prev, {
      id, source_id: src, target_id: tgt,
      contenido: 'mensaje()', tipo: msgTipo,
      orden: prev.length, es_self: false,
    }]);
  }
 
  function updateMensaje(id, patch) {
    setMensajes(prev => prev.map(m => {
      if (m.id !== id) return m;
      const updated = {...m, ...patch};
      updated.es_self = updated.source_id === updated.target_id;
      return updated;
    }));
  }
 
  function deleteMensaje(id) {
    setMensajes(prev => prev.filter(m=>m.id!==id).map((m,i)=>({...m,orden:i})));
    if (selM===id) setSelM(null);
  }
 
  function moverMensaje(id, dir) {
    setMensajes(prev => {
      const arr = [...prev].sort((a,b)=>a.orden-b.orden);
      const idx = arr.findIndex(m=>m.id===id);
      const newIdx = idx+dir;
      if (newIdx<0||newIdx>=arr.length) return prev;
      [arr[idx].orden, arr[newIdx].orden] = [arr[newIdx].orden, arr[idx].orden];
      return arr.sort((a,b)=>a.orden-b.orden);
    });
  }
 
  // ─── RENDER CANVAS ────────────────────────────────────────────────────────
  // Centro X de cada participante
  function centerX(participanteId) {
    const idx = participantes.findIndex(p=>p.id===participanteId);
    if (idx<0) return 0;
    return COL_PAD + idx*COL_WIDTH + COL_WIDTH/2;
  }
 
  const canvasWidth = COL_PAD*2 + participantes.length*COL_WIDTH;
  const canvasHeight = 80 + mensajes.length*44 + 60;
 
  const mensajesOrdenados = [...mensajes].sort((a,b)=>a.orden-b.orden);
 
  const selParticipante = participantes.find(p=>p.id===selP);
  const selMensaje      = mensajes.find(m=>m.id===selM);
 
  return (
    <div className="seq-wrap">
 
      {/* TOOLBAR */}
      <div className="seq-toolbar">
        <button className="tb" onClick={() => navigate(idProyecto ? `/app/proyectos/${idProyecto}/diagramas/${tipo}` : `/app/proyectos`)}>← Volver</button>
        <div className="tb-sep" />
        <input className="tb-title" value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre del diagrama" />
        <button className="tb save-btn" onClick={guardar} disabled={guardando}>
          {guardando ? '...' : '💾 Guardar'}
        </button>
        {guardado && <span className="tb-saved">✓ Guardado</span>}
        <div className="tb-sep" />
        <span className="tb-label">PARTICIPANTE</span>
        <button className="tb" onClick={() => addParticipante('actor')}>+ Actor</button>
        <button className="tb" onClick={() => addParticipante('object')}>+ Objeto</button>
        <button className="tb" onClick={() => addParticipante('boundary')}>+ Boundary</button>
        <button className="tb" onClick={() => addParticipante('control')}>+ Control</button>
        <div className="tb-sep" />
        <span className="tb-label">MENSAJE</span>
        <select className="tb" value={msgTipo} onChange={e=>setMsgTipo(e.target.value)}>
          <option value="sync">Síncrono →</option>
          <option value="async">Asíncrono --{'>'}</option>
          <option value="return">Retorno ←</option>
          <option value="create">Crear ○→</option>
          <option value="destroy">Destruir ✕</option>
        </select>
        <button className="tb" onClick={addMensaje}>+ Mensaje</button>
        <div className="tb-sep" />
        <button className="tb export-btn" onClick={exportPDF} disabled={exporting}>
          {exporting ? '⏳...' : '⬇ PDF'}
        </button>
      </div>
 
      <div className="seq-body">
 
        {/* CANVAS */}
        <div className="seq-canvas">
          <div className="seq-canvas-inner" ref={canvasRef} style={{ width: canvasWidth }}>
 
            {/* Fila de participantes */}
            <div className="participants-bar" style={{ width: canvasWidth }}>
              {participantes.map((p) => (
                <div
                  key={p.id}
                  className={`participant-col${selP===p.id?' p-selected':''}`}
                  draggable
                  onDragStart={e=>onDragStart(e,p.id)}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={e=>onDrop(e,p.id)}
                  onClick={()=>{ setSelP(p.id); setSelM(null); }}
                >
                  <div className={`participant-box p-${p.tipo}${selP===p.id?' p-selected':''}`}>
                    {p.tipo==='actor'?'':''}:{p.nombre}
                    <button className="p-delete-btn" onClick={e=>{e.stopPropagation();deleteParticipante(p.id);}}>×</button>
                  </div>
                  <div className="lifeline-stub" />
                </div>
              ))}
            </div>
 
            {/* Líneas de vida y mensajes */}
            <div className="messages-area" style={{ width: canvasWidth }}>
 
              {/* Líneas de vida */}
              {participantes.map((p, idx) => (
                <div key={p.id} className="lifeline-line" style={{
                  left: COL_PAD + idx*COL_WIDTH + COL_WIDTH/2 - 0.75,
                  height: canvasHeight,
                }} />
              ))}
 
              {/* Mensajes */}
              {mensajesOrdenados.map((m) => {
                const x1 = centerX(m.source_id);
                const x2 = centerX(m.target_id);
                const goRight  = x2 >= x1;
                const left     = Math.min(x1, x2) - COL_PAD;
                const width    = Math.max(Math.abs(x2-x1), 60);
                const color    = MSG_COLORS[m.tipo] || '#718096';
 
                return (
                  <div
                    key={m.id}
                    className={`msg-row${selM===m.id?' msg-selected':''}`}
                    onClick={()=>{ setSelM(m.id); setSelP(null); }}
                  >
                    <div className="msg-bg" />
                    <div className="msg-num">{m.orden+1}</div>
 
                    <div className="msg-arrow-wrap" style={{ left, width }}>
                      {/* Flecha hacia la derecha */}
                      {goRight && !m.es_self && (
                        <>
                          <div className={`msg-line ${m.tipo}`} style={{ flex:1, ...(m.tipo==='sync'||m.tipo==='create'||m.tipo==='destroy'?{background:color}:{borderTopColor:color}) }} />
                          <div className="arrowhead" style={{ borderLeft:`8px solid ${color}`, borderRight:'none' }} />
                        </>
                      )}
                      {/* Flecha hacia la izquierda */}
                      {!goRight && !m.es_self && (
                        <>
                          <div className="arrowhead" style={{ borderRight:`8px solid ${color}`, borderLeft:'none' }} />
                          <div className={`msg-line ${m.tipo}`} style={{ flex:1, ...(m.tipo==='sync'||m.tipo==='create'||m.tipo==='destroy'?{background:color}:{borderTopColor:color}) }} />
                        </>
                      )}
                      {/* Mensaje a sí mismo */}
                      {m.es_self && (
                        <svg width="60" height="28" style={{ overflow:'visible', marginLeft:4 }}>
                          <path d={`M0,0 L40,0 L40,20 L0,20`} fill="none" stroke={color} strokeWidth="1.5"
                            strokeDasharray={m.tipo==='return'?'5,3':'none'} />
                          <polygon points="0,14 0,26 8,20" fill={color} />
                        </svg>
                      )}
 
                      {/* Etiqueta encima */}
                      <div className="msg-label above" style={{ color, left: width/2, transform:'translateX(-50%)' }}>
                        {m.contenido}
                      </div>
                    </div>
                  </div>
                );
              })}
 
            </div>
          </div>
        </div>
 
        {/* PANEL LATERAL */}
        <div className="seq-side">
 
          {/* Editar participante seleccionado */}
          {selParticipante && (
            <>
              <h4>Participante</h4>
              <div className="pf">
                <label>Nombre</label>
                <input value={selParticipante.nombre}
                  onChange={e=>updateParticipante(selParticipante.id, { nombre: e.target.value })} />
              </div>
              <div className="pf">
                <label>Tipo</label>
                <select value={selParticipante.tipo} onChange={e=>updateParticipante(selParticipante.id, { tipo: e.target.value })}>
                  <option value="object">Objeto</option>
                  <option value="actor">Actor</option>
                  <option value="boundary">Boundary</option>
                  <option value="control">Control</option>
                  <option value="entity">Entity</option>
                </select>
              </div>
              <button className="side-del" onClick={()=>deleteParticipante(selParticipante.id)}>
                Eliminar participante
              </button>
            </>
          )}
 
          {/* Editar mensaje seleccionado */}
          {selMensaje && (
            <>
              <h4>Mensaje #{selMensaje.orden+1}</h4>
              <div className="pf">
                <label>Contenido</label>
                <input value={selMensaje.contenido} onChange={e=>updateMensaje(selMensaje.id,{contenido:e.target.value})} />
              </div>
              <div className="pf">
                <label>Tipo</label>
                <select value={selMensaje.tipo} onChange={e=>updateMensaje(selMensaje.id,{tipo:e.target.value})}>
                  <option value="sync">Síncrono</option>
                  <option value="async">Asíncrono</option>
                  <option value="return">Retorno</option>
                  <option value="create">Crear</option>
                  <option value="destroy">Destruir</option>
                </select>
              </div>
              <div className="pf">
                <label>Origen</label>
                <select value={selMensaje.source_id} onChange={e=>updateMensaje(selMensaje.id,{source_id:e.target.value})}>
                  {participantes.map(p=><option key={p.id} value={p.id}>:{p.nombre}</option>)}
                </select>
              </div>
              <div className="pf">
                <label>Destino</label>
                <select value={selMensaje.target_id} onChange={e=>updateMensaje(selMensaje.id,{target_id:e.target.value})}>
                  {participantes.map(p=><option key={p.id} value={p.id}>:{p.nombre}</option>)}
                </select>
              </div>
              <div className="pf">
                <label>Orden</label>
                <div style={{display:'flex',gap:4}}>
                  <button className="tb" style={{flex:1}} onClick={()=>moverMensaje(selMensaje.id,-1)}>↑</button>
                  <span style={{color:'#e2e8f0',padding:'4px 8px'}}>{selMensaje.orden+1}</span>
                  <button className="tb" style={{flex:1}} onClick={()=>moverMensaje(selMensaje.id,1)}>↓</button>
                </div>
              </div>
              <button className="side-del" onClick={()=>deleteMensaje(selMensaje.id)}>
                Eliminar mensaje
              </button>
            </>
          )}
 
          {!selParticipante && !selMensaje && (
            <div className="side-hint">
              Clic en un participante o mensaje para editarlo
            </div>
          )}
 
        </div>
      </div>
 
      {/* LEYENDA */}
      <div className="seq-legend">
        <div className="leg"><div className="leg-line" style={{background:'#378ADD'}} /><span>Síncrono</span></div>
        <div className="leg"><div className="leg-line" style={{background:'none',borderTop:'1.5px dashed #68d391'}} /><span>Asíncrono</span></div>
        <div className="leg"><div className="leg-line" style={{background:'none',borderTop:'1.5px dashed #718096'}} /><span>Retorno</span></div>
        <div className="leg"><div className="leg-line" style={{background:'#f6ad55'}} /><span>Crear</span></div>
        <div className="leg"><div className="leg-line" style={{background:'#fc8181'}} /><span>Destruir</span></div>
        <span style={{marginLeft:'auto',fontSize:10,color:'#4a5568'}}>Arrastra participantes para reordenar · Ctrl+S para guardar</span>
      </div>
 
    </div>
  );
}
