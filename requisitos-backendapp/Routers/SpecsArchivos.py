import io
import zipfile
from flask import Blueprint, send_file
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from db import engine

from Models.Proyectos import Proyecto
from Models.Stakeholders import Stakeholders
from Models.Proceso import Proceso
from Models.Subproceso import Subproceso
from Models.Entrevistas import Entrevistas
from Models.EntrevistasPreguntas import EntrevistaPreguntas
from Models.Encuestas import Encuestas
from Models.EncuestaPreguntas import EncuestaPreguntas
from Models.EncuestaOpciones import EncuestaOpciones
from Models.EncuestaRespuestas import EncuestaRespuestas
from Models.Observaciones import Observaciones
from Models.HistoriaUsuario import HistoriaUsuario
from Models.Focus_Group import FocusGroup
from Models.FocusGroupParticipante import FocusGroupParticipante
from Models.FocusGroupTema import FocusGroupTema
from Models.AnalisisDocumento import AnalisisDocumento
from Models.HallazgoAnalisis import HallazgoAnalisis
from Models.DocumentoAnalizado import DocumentoAnalizado
from Models.Seguimiento import Seguimiento
from Models.SeguimientoPaso import SeguimientoPaso
from Models.SeguimientoProblema import SeguimientoProblema
from Models.SeguimientoMetrica import SeguimientoMetrica
from Models.Diagrama import Diagrama
from Models.ClaseNodo import ClaseNodo
from Models.ClaseArista import ClaseArista
from Models.CasoUsoNodo import CasoUsoNodo
from Models.CasoUsoArista import CasoUsoArista
from Models.PaqueteNodo import PaqueteNodo
from Models.PaqueteNodoElemento import PaqueteNodoElemento
from Models.SeqParticipante import SeqParticipante
from Models.SeqMensaje import SeqMensaje
from Models.ProyectoSpecsTecnicas import ProyectoSpecsTecnicas

specs_archivos_bp = Blueprint('specs_archivos', __name__)

#  MAPEO DE VERBOS A MÉTODOS HTTP 
VERBOS_HTTP = {
    'registrar': 'POST', 'crear': 'POST', 'agregar': 'POST', 'nuevo': 'POST',
    'añadir': 'POST', 'insertar': 'POST', 'guardar': 'POST',
    'ver': 'GET', 'consultar': 'GET', 'listar': 'GET', 'buscar': 'GET',
    'obtener': 'GET', 'mostrar': 'GET', 'visualizar': 'GET', 'revisar': 'GET',
    'editar': 'PUT', 'modificar': 'PUT', 'actualizar': 'PUT', 'cambiar': 'PUT',
    'eliminar': 'DELETE', 'borrar': 'DELETE', 'cancelar': 'DELETE',
    'autorizar': 'PATCH', 'aprobar': 'PATCH', 'rechazar': 'PATCH',
}

SUSTANTIVOS_RECURSOS = {
    'producto': 'productos', 'productos': 'productos',
    'venta': 'ventas', 'ventas': 'ventas',
    'usuario': 'usuarios', 'usuarios': 'usuarios',
    'proveedor': 'proveedores', 'proveedores': 'proveedores',
    'inventario': 'inventario',
    'entrada': 'entradas', 'entradas': 'entradas',
    'merma': 'mermas', 'mermas': 'mermas',
    'reporte': 'reportes', 'reportes': 'reportes',
    'categoria': 'categorias', 'categorías': 'categorias',
    'pedido': 'pedidos', 'pedidos': 'pedidos',
    'stock': 'stock',
    'factura': 'facturas', 'facturas': 'facturas',
    'cliente': 'clientes', 'clientes': 'clientes',
    'empleado': 'empleados', 'empleados': 'empleados',
    'orden': 'ordenes', 'ordenes': 'ordenes',
    'pago': 'pagos', 'pagos': 'pagos',
}

def inferir_endpoint(accion, recurso_principal=None):
    accion_lower = accion.lower()
    metodo = 'GET'
    for verbo, http in VERBOS_HTTP.items():
        if verbo in accion_lower:
            metodo = http
            break
    recurso = recurso_principal or 'recursos'
    for sustantivo, plural in SUSTANTIVOS_RECURSOS.items():
        if sustantivo in accion_lower:
            recurso = plural
            break
    if metodo in ('PUT', 'PATCH', 'DELETE'):
        ruta = f'/api/{recurso}/{{id}}'
    else:
        ruta = f'/api/{recurso}'
    return metodo, ruta


def get_subproceso(session, id_subproceso):
    if not id_subproceso:
        return None
    sp = session.get(Subproceso, id_subproceso)
    return sp.nombre if sp else None


def get_stakeholder(session, id_stakeholder):
    if not id_stakeholder:
        return None
    sh = session.get(Stakeholders, id_stakeholder)
    return sh.nombre if sh else None


def get_proceso(session, id_proceso):
    if not id_proceso:
        return None
    p = session.get(Proceso, id_proceso)
    return p.nombre if p else None


#  GENERADORES 

def gen_00_indice(proyecto, archivos_presentes):
    L = []
    L.append(f"# SPECS MAESTRO — {proyecto.nombre}")
    L.append("")
    L.append("## Instrucciones para la IA")
    L.append("")
    L.append("Lee todos los archivos de este paquete **EN EL ORDEN indicado** antes de")
    L.append("generar cualquier código. Cada archivo contiene información específica")
    L.append("del sistema a desarrollar. No omitas ningún archivo.")
    L.append("")
    L.append("## Orden de lectura")
    L.append("")
    orden = [
        ("01_INFO_PROYECTO.md",   "Información general del proyecto, organización, stakeholders y procesos."),
        ("02_REQUERIMIENTOS.md",  "Historias de usuario con criterios de aceptación. Define QUÉ debe hacer el sistema."),
        ("03_EVIDENCIA.md",       "Evidencia recopilada: entrevistas, cuestionarios, observaciones, focus groups, documentos y seguimiento transaccional. Define el CONTEXTO del negocio."),
        ("04_DIAGRAMA_CLASES.md", "Modelo de datos completo con clases, atributos, métodos y relaciones. Define la ESTRUCTURA de la base de datos."),
        ("05_DIAGRAMAS_UML.md",   "Diagramas de casos de uso, secuencias y paquetes. Define los FLUJOS y ARQUITECTURA del sistema."),
        ("06_BACKEND_SPECS.md",   "Stack, seguridad, y contrato exacto de API con endpoints, bodies y responses."),
        ("07_FRONTEND_SPECS.md",  "Stack, sistema de diseño, pantallas, navegación y componentes del frontend."),
    ]
    for i, (archivo, desc) in enumerate(orden, 1):
        presente = archivo in archivos_presentes
        estado = "✓" if presente else "⚠ SIN DATOS"
        L.append(f"{i}. **{archivo}** [{estado}]")
        L.append(f"   {desc}")
        L.append("")
    L.append("---")
    L.append("")
    L.append("## Notas importantes")
    L.append("")
    L.append("- Respeta el stack definido en `06_BACKEND_SPECS.md` y `07_FRONTEND_SPECS.md`.")
    L.append("- Genera código funcional y completo, **no pseudocódigo**.")
    L.append("- Usa los nombres de clases y atributos **exactamente** como aparecen en `04_DIAGRAMA_CLASES.md`.")
    L.append("- Implementa **TODOS** los casos de uso de `05_DIAGRAMAS_UML.md`.")
    L.append("- Los criterios de aceptación de `02_REQUERIMIENTOS.md` son requisitos obligatorios.")
    L.append("- La evidencia de `03_EVIDENCIA.md` contiene reglas de negocio implícitas.")
    L.append("- Los endpoints de `06_BACKEND_SPECS.md` son el **contrato exacto** entre frontend y backend.")
    L.append("- El frontend debe consumir los endpoints con los nombres de campos tal como están definidos.")
    L.append("")
    L.append("## Checklist de integración obligatorio")
    L.append("")
    L.append("Antes de considerar el sistema completo, verifica que:")
    L.append("")
    L.append("- [ ] El backend corre en `http://localhost:5000`")
    L.append("- [ ] El frontend corre en `http://localhost:5173`")
    L.append("- [ ] El frontend consume el backend en `http://localhost:5000/api` — **nunca en su propio puerto**")
    L.append("- [ ] El frontend usa una sola constante `API_URL` en todos los archivos de servicios")
    L.append("- [ ] El endpoint `POST /api/auth/login` responde correctamente con `email` y `password`")
    L.append("- [ ] El token JWT se guarda en localStorage y se envía en cada request protegido")
    L.append("- [ ] Las rutas protegidas redirigen al login si no hay token")
    L.append("- [ ] CORS está configurado en el backend para aceptar requests de `http://localhost:5173`")
    L.append("- [ ] Las tablas de la BD coinciden exactamente con los modelos del backend")
    L.append("- [ ] Existe al menos un usuario de prueba por cada rol definido en los specs")
    L.append("- [ ] El `seed_db.py` crea los usuarios de prueba con contraseñas hasheadas correctamente")
    L.append("- [ ] Correr `flask routes` y verificar que **todos** los endpoints del contrato de API están registrados")
    L.append("- [ ] Todos los blueprints están registrados en `app.py` con el prefijo `/api`")
    L.append("- [ ] Cada endpoint de escritura hace `db.session.commit()` explícitamente")
    L.append("- [ ] Cada módulo del frontend tiene su endpoint del backend funcionando y conectado")
    L.append("- [ ] Al crear/editar un registro, la lista se actualiza automáticamente en el frontend")
    L.append("- [ ] No existen endpoints con lógica vacía o `return []` sin datos reales")
    L.append("- [ ] El campo `user_id` en el JWT es consistente en todo el backend")
    L.append("- [ ] Los endpoints que leen el usuario del token NO devuelven 422 con token válido")
    L.append("- [ ] `requirements.txt` incluye tanto `psycopg2-binary>=2.9.9` como `pg8000>=1.30.0`")
    L.append("")
    L.append("## Comandos para levantar el sistema")
    L.append("")
    L.append("> La IA debe generar estos scripts y documentarlos en el `README.md`.")
    L.append("")
    L.append("### Paso 1 — Crear la base de datos (una sola vez)")
    L.append("```bash")
    L.append("createdb nombre_bd")
    L.append("# O desde psql: CREATE DATABASE nombre_bd;")
    L.append("```")
    L.append("")
    L.append("### Paso 2 — Configurar el `.env`")
    L.append("```")
    L.append("DATABASE_URL=postgresql://usuario:password@localhost:5432/nombre_bd")
    L.append("SECRET_KEY=clave_secreta_aqui")
    L.append("```")
    L.append("")
    L.append("### Paso 3 — Instalar dependencias (script automático)")
    L.append("```bash")
    L.append("# Windows:")
    L.append("setup.bat")
    L.append("# Linux/Mac:")
    L.append("bash setup.sh")
    L.append("```")
    L.append("")
    L.append("### Paso 4 — Crear tablas")
    L.append("```bash")
    L.append("# Estos 3 comandos deben correrse EN ORDEN:")
    L.append("flask db init")
    L.append("flask db migrate -m \"initial\"")
    L.append("flask db upgrade")
    L.append("```")
    L.append("")
    L.append("### Paso 5 — Datos de prueba")
    L.append("```bash")
    L.append("python seed_db.py")
    L.append("```")
    L.append("")
    L.append("### Paso 6 — Levantar backend")
    L.append("```bash")
    L.append("python run.py")
    L.append("```")
    L.append("")
    L.append("### Frontend — en otra terminal")
    L.append("```bash")
    L.append("npm install && npm run dev")
    L.append("```")
    L.append("")
    L.append("### Usuarios de prueba")
    L.append("El `seed_db.py` imprime en consola los usuarios y contraseñas al terminar.")
    return "\n".join(L)


def gen_01_info_proyecto(session, proyecto, id_proyecto):
    L = []
    L.append("# Información del proyecto")
    L.append("")
    L.append("| Campo | Valor |")
    L.append("|-------|-------|")
    L.append(f"| Nombre | {proyecto.nombre} |")
    L.append(f"| Organización | {proyecto.organizacion or 'N/A'} |")
    L.append(f"| Descripción | {proyecto.descripcion or 'N/A'} |")
    L.append(f"| Objetivo general | {proyecto.objetivo_general or 'N/A'} |")
    L.append(f"| Fecha inicio | {proyecto.fecha_inicio.isoformat() if proyecto.fecha_inicio else 'N/A'} |")
    L.append(f"| Fecha fin | {proyecto.fecha_fin.isoformat() if proyecto.fecha_fin else 'N/A'} |")
    L.append(f"| Estado | {proyecto.estado} |")
    L.append("")
    L.append("## Stakeholders")
    L.append("")
    stakeholders = session.scalars(
        select(Stakeholders).where(Stakeholders.id_proyecto == id_proyecto)
    ).all()
    if not stakeholders:
        L.append("_Sin stakeholders registrados._")
    else:
        L.append("| Nombre | Rol | Tipo | Email |")
        L.append("|--------|-----|------|-------|")
        for s in stakeholders:
            L.append(f"| {s.nombre} | {s.rol or 'N/A'} | {s.tipo or 'N/A'} | {s.email or 'N/A'} |")
    L.append("")
    L.append("## Procesos y subprocesos")
    L.append("")
    procesos = session.scalars(
        select(Proceso).where(Proceso.id_proyecto == id_proyecto)
    ).all()
    if not procesos:
        L.append("_Sin procesos registrados._")
    else:
        for i, p in enumerate(procesos, 1):
            L.append(f"### {i}. {p.nombre}")
            if p.descripcion:
                L.append(f"**Descripción:** {p.descripcion}")
            if p.objetivo:
                L.append(f"**Objetivo:** {p.objetivo}")
            subprocesos = session.scalars(
                select(Subproceso).where(Subproceso.id_proceso == p.id_proceso)
            ).all()
            for sp in subprocesos:
                L.append(f"- {sp.nombre}{f': {sp.descripcion}' if sp.descripcion else ''}")
            L.append("")
    return "\n".join(L)


def gen_02_requerimientos(session, id_proyecto):
    L = []
    L.append("# Requerimientos funcionales")
    L.append("")
    L.append("> Formato: Como [rol], quiero [acción], para que [beneficio]")
    L.append("")
    historias = session.scalars(
        select(HistoriaUsuario).where(HistoriaUsuario.id_proyecto == id_proyecto)
    ).all()
    if not historias:
        L.append("_Sin historias de usuario registradas._")
        L.append("")
        L.append("> **NOTA PARA LA IA:** Infiere los requerimientos a partir de la evidencia en")
        L.append("> `03_EVIDENCIA.md` y los diagramas en `04_DIAGRAMA_CLASES.md` y `05_DIAGRAMAS_UML.md`.")
        return "\n".join(L)
    for i, h in enumerate(historias, 1):
        L.append(f"## RF-{str(i).zfill(3)}: {h.titulo}")
        L.append("")
        L.append(f"**Historia:** Como {h.rol}, quiero {h.accion}, para que {h.beneficio}")
        L.append("")
        L.append(f"**Prioridad:** {h.prioridad}{f'  |  **Estimación:** {h.estimacion}' if h.estimacion else ''}")
        sp = get_subproceso(session, h.id_subproceso)
        if sp:
            L.append(f"**Subproceso:** {sp}")
        if h.criterios:
            L.append("")
            L.append("**Criterios de aceptación:**")
            for c in h.criterios:
                L.append(f"- {c}")
        L.append("")
        L.append("---")
        L.append("")
    return "\n".join(L)


def gen_03_evidencia(session, id_proyecto):
    L = []
    L.append("# Evidencia recopilada")
    L.append("")

    L.append("## Entrevistas")
    L.append("")
    entrevistas = session.scalars(
        select(Entrevistas).where(Entrevistas.id_proyecto == id_proyecto)
    ).all()
    if not entrevistas:
        L.append("_Sin entrevistas registradas._")
    else:
        for i, e in enumerate(entrevistas, 1):
            L.append(f"### Entrevista {i}: {e.titulo or 'Sin título'}")
            L.append("")
            L.append(f"- **Stakeholder:** {get_stakeholder(session, e.id_stakeholder) or 'N/A'}")
            L.append(f"- **Objetivo:** {e.objetivo or 'N/A'}")
            L.append(f"- **Lugar:** {e.lugar or 'N/A'}  |  **Fecha:** {e.fecha_programada.isoformat() if e.fecha_programada else 'N/A'}")
            sp = get_subproceso(session, e.id_subproceso)
            if sp:
                L.append(f"- **Subproceso:** {sp}")
            preguntas = session.scalars(
                select(EntrevistaPreguntas)
                .where(EntrevistaPreguntas.id_entrevista == e.id_entrevista)
                .order_by(EntrevistaPreguntas.orden)
            ).all()
            if preguntas:
                L.append("")
                for j, pr in enumerate(preguntas, 1):
                    L.append(f"**P{j}:** {pr.pregunta}")
                    L.append(f"**R:** {pr.respuesta or 'Sin respuesta'}")
                    L.append("")
            L.append("---")
            L.append("")

    L.append("## Cuestionarios")
    L.append("")
    encuestas = session.scalars(
        select(Encuestas).where(Encuestas.id_proyecto == id_proyecto)
    ).all()
    if not encuestas:
        L.append("_Sin cuestionarios registrados._")
    else:
        for i, enc in enumerate(encuestas, 1):
            L.append(f"### Cuestionario {i}: {enc.titulo}")
            L.append("")
            L.append(f"- **Descripción:** {enc.descripcion or 'N/A'}")
            L.append(f"- **Participantes:** {enc.num_participantes}")
            sp = get_subproceso(session, enc.id_subproceso)
            if sp:
                L.append(f"- **Subproceso:** {sp}")
            L.append("")
            preguntas = session.scalars(
                select(EncuestaPreguntas)
                .where(EncuestaPreguntas.id_encuesta == enc.id_encuesta)
                .order_by(EncuestaPreguntas.orden)
            ).all()
            for j, preg in enumerate(preguntas, 1):
                L.append(f"**P{j} [{preg.tipo}]:** {preg.pregunta}")
                opciones = session.scalars(
                    select(EncuestaOpciones)
                    .where(EncuestaOpciones.id_pregunta == preg.id_pregunta)
                    .order_by(EncuestaOpciones.orden)
                ).all()
                respuestas = session.scalars(
                    select(EncuestaRespuestas)
                    .where(EncuestaRespuestas.id_pregunta == preg.id_pregunta)
                ).all()
                total = len(respuestas)
                if preg.tipo in ('opcion_multiple', 'si_no') and opciones:
                    conteo = {}
                    for r in respuestas:
                        conteo[r.respuesta or ''] = conteo.get(r.respuesta or '', 0) + 1
                    for op in opciones:
                        cant = conteo.get(op.opcion, 0)
                        pct = round(cant / total * 100, 1) if total > 0 else 0
                        L.append(f"- {op.opcion}: **{cant}** respuestas ({pct}%)")
                else:
                    for r in respuestas:
                        if r.respuesta:
                            L.append(f"- {r.respuesta}")
                L.append("")
            L.append("---")
            L.append("")

    L.append("## Observaciones")
    L.append("")
    observaciones = session.scalars(
        select(Observaciones).where(Observaciones.id_proyecto == id_proyecto)
    ).all()
    if not observaciones:
        L.append("_Sin observaciones registradas._")
    else:
        for i, o in enumerate(observaciones, 1):
            L.append(f"### Observación {i}")
            L.append("")
            L.append(f"- **Lugar:** {o.lugar}  |  **Fecha:** {o.fecha_observacion.isoformat() if o.fecha_observacion else 'N/A'}  |  **Duración:** {o.duracion_minutos or 'N/A'} min")
            sp = get_subproceso(session, o.id_subproceso)
            if sp:
                L.append(f"- **Subproceso:** {sp}")
            L.append(f"- **Descripción:** {o.descripcion}")
            if o.problema_detectado:
                L.append(f"- **Problema detectado:** {o.problema_detectado}")
            if o.contexto:
                L.append(f"- **Contexto:** {o.contexto}")
            L.append("")

    L.append("## Focus groups")
    L.append("")
    fgs = session.scalars(
        select(FocusGroup).where(FocusGroup.id_proyecto == id_proyecto)
    ).all()
    if not fgs:
        L.append("_Sin focus groups registrados._")
    else:
        for i, fg in enumerate(fgs, 1):
            L.append(f"### Focus group {i}: {fg.titulo}")
            L.append("")
            L.append(f"- **Objetivo:** {fg.objetivo or 'N/A'}")
            L.append(f"- **Lugar:** {fg.lugar or 'N/A'}  |  **Fecha:** {fg.fecha.isoformat() if fg.fecha else 'N/A'}")
            sp = get_subproceso(session, fg.id_subproceso)
            if sp:
                L.append(f"- **Subproceso:** {sp}")
            participantes = session.scalars(
                select(FocusGroupParticipante)
                .where(FocusGroupParticipante.id_focus_group == fg.id_focus_group)
            ).all()
            nombres = [get_stakeholder(session, p.id_stakeholder) for p in participantes]
            nombres = [n for n in nombres if n]
            if nombres:
                L.append(f"- **Participantes:** {', '.join(nombres)}")
            temas = session.scalars(
                select(FocusGroupTema)
                .where(FocusGroupTema.id_focus_group == fg.id_focus_group)
                .order_by(FocusGroupTema.orden)
            ).all()
            if temas:
                L.append("")
                L.append("**Temas:**")
                for t in temas:
                    L.append(f"- **{t.tema}**")
                    if t.conclusiones:
                        L.append(f"  - Conclusión: {t.conclusiones}")
            if fg.conclusiones:
                L.append("")
                L.append("**Conclusiones generales:**")
                for c in fg.conclusiones:
                    L.append(f"- {c}")
            L.append("")

    L.append("## Análisis de documentos")
    L.append("")
    analisis = session.scalars(
        select(AnalisisDocumento).where(AnalisisDocumento.id_proyecto == id_proyecto)
    ).all()
    if not analisis:
        L.append("_Sin análisis de documentos registrados._")
    else:
        for i, an in enumerate(analisis, 1):
            L.append(f"### Análisis {i}: {an.titulo}")
            L.append("")
            L.append(f"- **Tipo:** {an.tipo_documento}  |  **Fuente:** {an.fuente}")
            p = get_proceso(session, an.id_proceso)
            sp = get_subproceso(session, an.id_subproceso)
            if p:
                L.append(f"- **Proceso:** {p}")
            if sp:
                L.append(f"- **Subproceso:** {sp}")
            hallazgos = session.scalars(
                select(HallazgoAnalisis)
                .where(HallazgoAnalisis.id_analisis == an.id_analisis)
                .order_by(HallazgoAnalisis.orden)
            ).all()
            if hallazgos:
                L.append("")
                L.append("**Hallazgos:**")
                for h in hallazgos:
                    L.append(f"- {h.descripcion}")
            if an.recomendaciones:
                L.append("")
                L.append(f"**Recomendaciones:** {an.recomendaciones}")
            L.append("")

    L.append("## Seguimiento transaccional")
    L.append("")
    seguimientos = session.scalars(
        select(Seguimiento).where(Seguimiento.id_proyecto == id_proyecto)
    ).all()
    if not seguimientos:
        L.append("_Sin seguimientos registrados._")
    else:
        for i, seg in enumerate(seguimientos, 1):
            L.append(f"### Seguimiento {i}: {seg.titulo} `[{seg.id_transaccion}]`")
            L.append("")
            L.append(f"- **Proceso:** {seg.nombre_proceso}")
            pasos = session.scalars(
                select(SeguimientoPaso)
                .where(SeguimientoPaso.id_seguimiento == seg.id_seguimiento)
                .order_by(SeguimientoPaso.orden)
            ).all()
            if pasos:
                L.append("")
                L.append("**Pasos:**")
                for paso in pasos:
                    L.append(f"{paso.orden}. {paso.nombre}{f' ({paso.duracion_min} min)' if paso.duracion_min else ''}")
            metricas = session.scalars(
                select(SeguimientoMetrica)
                .where(SeguimientoMetrica.id_seguimiento == seg.id_seguimiento)
            ).all()
            if metricas:
                L.append("")
                L.append("**Métricas:**")
                for m in metricas:
                    L.append(f"- {m.nombre}: `{m.valor}`")
            problemas = session.scalars(
                select(SeguimientoProblema)
                .where(SeguimientoProblema.id_seguimiento == seg.id_seguimiento)
            ).all()
            if problemas:
                L.append("")
                L.append("**Problemas detectados:**")
                for prob in problemas:
                    L.append(f"- {prob.descripcion}")
            L.append("")

    return "\n".join(L)


def gen_04_diagrama_clases(session):
    L = []
    L.append("# Diagrama de clases — Modelo de datos")
    L.append("")
    L.append("> **INSTRUCCIÓN PARA LA IA:** Usa estas clases como base para el modelo de la base de datos.")
    L.append("> Cada clase es una tabla. Los atributos son columnas. Las relaciones definen llaves foráneas.")
    L.append("")
    diagramas = session.scalars(
        select(Diagrama).where(Diagrama.tipo == 'clases')
    ).all()
    if not diagramas:
        L.append("_Sin diagramas de clases registrados._")
        L.append("")
        L.append("> **NOTA:** Infiere el modelo de datos a partir de las historias de usuario y casos de uso.")
        return "\n".join(L)
    for diag in diagramas:
        L.append(f"## {diag.nombre}")
        if diag.descripcion:
            L.append(f"_{diag.descripcion}_")
        L.append("")
        nodos = session.scalars(
            select(ClaseNodo).where(ClaseNodo.id_diagrama == diag.id_diagrama)
        ).all()
        mapa_nodos = {n.node_id: n.nombre for n in nodos}
        for n in nodos:
            tipo_label = {'class': 'Clase', 'abstract': 'Clase abstracta', 'interface': 'Interfaz'}.get(n.tipo, n.tipo)
            L.append(f"### {tipo_label}: `{n.nombre}`")
            L.append("")
            if n.atributos:
                L.append("**Atributos:**")
                L.append("")
                L.append("| Visibilidad | Nombre | Tipo |")
                L.append("|-------------|--------|------|")
                for a in n.atributos:
                    vis = {'+': 'public', '-': 'private', '#': 'protected'}.get(a.visibilidad, a.visibilidad)
                    L.append(f"| {vis} | `{a.nombre}` | `{a.tipo_dato}` |")
                L.append("")
            if n.metodos:
                L.append("**Métodos:**")
                L.append("")
                L.append("| Visibilidad | Nombre | Retorna | Abstracto |")
                L.append("|-------------|--------|---------|-----------|")
                for m in n.metodos:
                    vis = {'+': 'public', '-': 'private', '#': 'protected'}.get(m.visibilidad, m.visibilidad)
                    abstracto = "Sí" if m.es_abstracto else "No"
                    L.append(f"| {vis} | `{m.nombre}()` | `{m.tipo_dato}` | {abstracto} |")
                L.append("")
        aristas = session.scalars(
            select(ClaseArista).where(ClaseArista.id_diagrama == diag.id_diagrama)
        ).all()
        if aristas:
            L.append("**Relaciones:**")
            L.append("")
            tipo_rel = {
                'herencia': 'hereda de', 'implementa': 'implementa',
                'composicion': 'composición con', 'agregacion': 'agregación con',
                'asociacion': 'se asocia con', 'assoc': 'se asocia con',
            }
            for a in aristas:
                origen = mapa_nodos.get(a.id_source, a.id_source)
                destino = mapa_nodos.get(a.id_target, a.id_target)
                rel = tipo_rel.get(a.tipo, a.tipo)
                etiqueta = f" — _{a.etiqueta}_" if a.etiqueta else ""
                L.append(f"- `{origen}` {rel} `{destino}`{etiqueta}")
            L.append("")
    return "\n".join(L)


def gen_05_diagramas_uml(session):
    L = []
    L.append("# Diagramas UML")
    L.append("")

    L.append("## Casos de uso")
    L.append("")
    L.append("> **INSTRUCCIÓN PARA LA IA:** Implementa TODOS los casos de uso listados.")
    L.append("")
    diag_cu = session.scalars(select(Diagrama).where(Diagrama.tipo == 'casos_uso')).all()
    if not diag_cu:
        L.append("_Sin diagramas de casos de uso registrados._")
    else:
        for diag in diag_cu:
            L.append(f"### {diag.nombre}")
            nodos = session.scalars(select(CasoUsoNodo).where(CasoUsoNodo.id_diagrama == diag.id_diagrama)).all()
            aristas = session.scalars(select(CasoUsoArista).where(CasoUsoArista.id_diagrama == diag.id_diagrama)).all()
            mapa = {n.node_id: n.nombre for n in nodos}
            actores  = [n for n in nodos if n.tipo == 'actor']
            casos    = [n for n in nodos if n.tipo == 'useCase']
            sistemas = [n for n in nodos if n.tipo == 'system']
            if sistemas:
                L.append(f"**Sistema(s):** {', '.join(s.nombre for s in sistemas)}")
            if actores:
                L.append(f"**Actores:** {', '.join(a.nombre for a in actores)}")
            if casos:
                L.append("")
                L.append("**Casos de uso:**")
                for c in casos:
                    L.append(f"- {c.nombre}")
            if aristas:
                L.append("")
                L.append("**Relaciones:**")
                for a in aristas:
                    origen  = mapa.get(a.id_source, a.id_source)
                    destino = mapa.get(a.id_target, a.id_target)
                    tipo    = {'assoc': 'asociación', 'include': '«include»', 'extend': '«extend»', 'generalize': 'generalización'}.get(a.tipo, a.tipo)
                    L.append(f"- `{origen}` → [{tipo}] → `{destino}`")
            L.append("")

    L.append("## Diagramas de secuencia")
    L.append("")
    L.append("> **INSTRUCCIÓN PARA LA IA:** Implementa los flujos de mensajes exactamente como están definidos.")
    L.append("")
    diag_seq = session.scalars(select(Diagrama).where(Diagrama.tipo == 'secuencia')).all()
    if not diag_seq:
        L.append("_Sin diagramas de secuencia registrados._")
    else:
        for diag in diag_seq:
            L.append(f"### {diag.nombre}")
            participantes = session.scalars(
                select(SeqParticipante).where(SeqParticipante.id_diagrama == diag.id_diagrama).order_by(SeqParticipante.orden)
            ).all()
            mensajes = session.scalars(
                select(SeqMensaje).where(SeqMensaje.id_diagrama == diag.id_diagrama).order_by(SeqMensaje.orden)
            ).all()
            mapa = {p.id_nodo: p.nombre for p in participantes}
            if participantes:
                L.append(f"**Participantes:** {', '.join(f'`{p.nombre}` [{p.tipo}]' for p in participantes)}")
            if mensajes:
                L.append("")
                L.append("**Flujo de mensajes:**")
                L.append("")
                for m in mensajes:
                    self_msg = " _(self)_" if m.es_self else ""
                    L.append(f"{m.orden}. `{mapa.get(m.source_id, m.source_id)}` → `{mapa.get(m.target_id, m.target_id)}`: **{m.contenido}** [{m.tipo}]{self_msg}")
            L.append("")

    L.append("## Diagramas de paquetes")
    L.append("")
    L.append("> **INSTRUCCIÓN PARA LA IA:** Usa esta estructura para organizar los módulos del sistema.")
    L.append("")
    diag_paq = session.scalars(select(Diagrama).where(Diagrama.tipo == 'paquetes')).all()
    if not diag_paq:
        L.append("_Sin diagramas de paquetes registrados._")
    else:
        for diag in diag_paq:
            L.append(f"### {diag.nombre}")
            nodos = session.scalars(select(PaqueteNodo).where(PaqueteNodo.id_diagrama == diag.id_diagrama)).all()
            for n in nodos:
                L.append(f"**Paquete: `{n.nombre}`**")
                try:
                    elementos = session.scalars(
                        select(PaqueteNodoElemento).where(PaqueteNodoElemento.id_paquete_nodo == n.id_paquete_nodo).order_by(PaqueteNodoElemento.orden)
                    ).all()
                    for e in elementos:
                        L.append(f"- `{e.nombre}`")
                except Exception:
                    pass
                L.append("")
    return "\n".join(L)


def gen_06_backend(tecnicas, session=None, id_proyecto=None):
    L = []
    L.append("# Especificaciones técnicas — Backend")
    L.append("")
    L.append("> **INSTRUCCIÓN PARA LA IA:** Genera el backend con exactamente el stack y")
    L.append("> las configuraciones definidas. El contrato de API es obligatorio.")
    L.append("")
    if not tecnicas:
        L.append("_Sin especificaciones técnicas definidas._")
        return "\n".join(L)

    L.append("## Stack tecnológico")
    L.append("")
    L.append(f"- **Lenguaje:** {tecnicas.backend_lenguaje or 'N/A'}")
    L.append(f"- **Framework:** {tecnicas.backend_framework or 'N/A'}")
    L.append(f"- **Tipo de API:** {tecnicas.backend_tipo_api or 'N/A'}")
    L.append(f"- **Motor BD:** {tecnicas.bd_motor or 'N/A'}")
    L.append(f"- **ORM:** {tecnicas.bd_orm or 'N/A'}")
    L.append("")
    L.append("## Configuración del servidor")
    L.append("")
    L.append("- **Puerto del backend:** `5000`")
    L.append("- **URL base de la API:** `http://localhost:5000/api`")
    L.append("- **Todos los endpoints tienen el prefijo `/api`**")
    L.append("- Ejemplo: login → `POST http://localhost:5000/api/auth/login`")
    L.append("- CORS debe estar configurado para aceptar requests de `http://localhost:5173`")
    L.append("")

    L.append("## Seguridad y autenticación")
    L.append("")
    L.append(f"- **Autenticación:** {tecnicas.seg_autenticacion or 'N/A'}")
    L.append(f"- **Cifrado de contraseñas:** {tecnicas.seg_cifrado or 'N/A'}")
    if tecnicas.seg_roles:
        L.append("")
        L.append("**Roles del sistema:**")
        for rol in tecnicas.seg_roles.split('\n'):
            if rol.strip():
                L.append(f"- {rol.strip()}")
    L.append("")
    L.append("**Implementación correcta del JWT — CRÍTICO:**")
    L.append("")
    L.append("El token debe generarse con el `id` del usuario como campo principal:")
    L.append("```python")
    L.append("# Al generar el token (login):")
    L.append("payload = {")
    L.append('    "user_id": usuario.id,  # usar SIEMPRE "user_id"')
    L.append('    "rol": usuario.rol,')
    L.append('    "exp": datetime.utcnow() + timedelta(hours=24)')
    L.append("}")
    L.append("token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')")
    L.append("```")
    L.append("")
    L.append("El middleware debe extraer el `user_id` del token exactamente así:")
    L.append("```python")
    L.append("# Middleware de autenticación:")
    L.append("def token_required(f):")
    L.append("    @wraps(f)")
    L.append("    def decorated(*args, **kwargs):")
    L.append("        token = request.headers.get('Authorization', '').replace('Bearer ', '')")
    L.append("        if not token:")
    L.append("            return jsonify({'error': 'Token requerido'}), 401")
    L.append("        try:")
    L.append("            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])")
    L.append("            current_user_id = data['user_id']  # mismo campo que al generar")
    L.append("        except:")
    L.append("            return jsonify({'error': 'Token inválido'}), 401")
    L.append("        return f(current_user_id, *args, **kwargs)")
    L.append("    return decorated")
    L.append("```")
    L.append("")
    L.append("**El campo `user_id` debe ser consistente en TODO el backend.**")
    L.append("Si el token usa `user_id`, todos los endpoints deben leer `user_id`.")
    L.append("Un campo inconsistente causa error 422 en endpoints que leen el usuario del token.")
    L.append("")

    L.append("## Contrato de API — Endpoints")
    L.append("")
    L.append("> Estos endpoints son el **contrato exacto** entre frontend y backend.")
    L.append("> El frontend debe consumirlos con los nombres de campos exactamente como están aquí.")
    L.append("> **No cambies nombres de campos.** Un campo llamado `email` en el backend debe llamarse `email` en el frontend.")
    L.append("")

    # Auth siempre presente
    L.append("### `POST /api/auth/login`")
    L.append("")
    L.append("**Request body:**")
    L.append("```json")
    L.append("{")
    L.append('  "email": "string",')
    L.append('  "password": "string"')
    L.append("}")
    L.append("```")
    L.append("")
    L.append("**Response 200:**")
    L.append("```json")
    L.append("{")
    L.append('  "token": "string (JWT)",')
    L.append('  "user": {')
    L.append('    "id": "integer",')
    L.append('    "nombre": "string",')
    L.append('    "email": "string",')
    L.append('    "rol": "string"')
    L.append('  }')
    L.append("}")
    L.append("```")
    L.append("")
    L.append("**Response 401:**")
    L.append('```json')
    L.append('{ "error": "Credenciales inválidas" }')
    L.append("```")
    L.append("")
    L.append("---")
    L.append("")

    L.append("### `POST /api/auth/logout`")
    L.append("")
    L.append("**Header requerido:** `Authorization: Bearer <token>`")
    L.append("")
    L.append("**Response 200:**")
    L.append('```json')
    L.append('{ "message": "Sesión cerrada correctamente" }')
    L.append("```")
    L.append("")
    L.append("---")
    L.append("")

    # Endpoints inferidos de historias + clases
    if session and id_proyecto:
        historias = session.scalars(
            select(HistoriaUsuario).where(HistoriaUsuario.id_proyecto == id_proyecto)
        ).all()

        nodos_clases = session.scalars(select(ClaseNodo)).all()
        mapa_clases = {}
        for n in nodos_clases:
            mapa_clases[n.nombre.lower()] = n

        if historias:
            endpoints_por_recurso = {}
            for h in historias:
                metodo, ruta = inferir_endpoint(h.accion)
                recurso = ruta.split('/')[2] if len(ruta.split('/')) > 2 else 'recursos'
                if recurso not in endpoints_por_recurso:
                    endpoints_por_recurso[recurso] = []
                # Evitar duplicados de método+ruta
                ya_existe = any(ep['metodo'] == metodo and ep['ruta'] == ruta for ep in endpoints_por_recurso[recurso])
                if not ya_existe:
                    endpoints_por_recurso[recurso].append({
                        'metodo': metodo,
                        'ruta': ruta,
                        'historia': h,
                    })

            for recurso, eps in endpoints_por_recurso.items():
                singular = recurso[:-1] if recurso.endswith('s') else recurso
                clase = mapa_clases.get(singular) or mapa_clases.get(recurso)

                for ep in eps:
                    h = ep['historia']
                    L.append(f"### `{ep['metodo']} {ep['ruta']}`")
                    L.append(f"_{h.titulo}_")
                    L.append("")
                    L.append(f"- **Rol requerido:** {h.rol.capitalize()}")
                    L.append("- **Header:** `Authorization: Bearer <token>`")
                    L.append("")

                    if ep['metodo'] in ('POST', 'PUT') and clase and clase.atributos:
                        L.append("**Request body:**")
                        L.append("```json")
                        L.append("{")
                        campos = []
                        for a in clase.atributos:
                            nombre_lower = a.nombre.lower()
                            if nombre_lower in ('id', 'created_at', 'updated_at', 'fecha_creacion', 'fecha_actualizacion'):
                                continue
                            tipo = a.tipo_dato.lower()
                            if 'int' in tipo:
                                campos.append(f'  "{a.nombre}": integer')
                            elif 'float' in tipo or 'double' in tipo or 'decimal' in tipo:
                                campos.append(f'  "{a.nombre}": float')
                            elif 'bool' in tipo:
                                campos.append(f'  "{a.nombre}": boolean')
                            else:
                                campos.append(f'  "{a.nombre}": "string"')
                        L.append(",\n".join(campos))
                        L.append("}")
                        L.append("```")
                        L.append("")

                    codigo_ok = '201' if ep['metodo'] == 'POST' else '200'
                    L.append(f"**Response {codigo_ok}:**")
                    L.append("```json")
                    if ep['metodo'] == 'DELETE':
                        L.append(f'{{ "message": "{singular.capitalize()} eliminado correctamente" }}')
                    elif ep['metodo'] == 'POST':
                        L.append(f'{{ "message": "{singular.capitalize()} creado correctamente", "id": integer }}')
                    elif ep['metodo'] in ('PUT', 'PATCH'):
                        L.append(f'{{ "message": "{singular.capitalize()} actualizado correctamente" }}')
                    else:
                        L.append(f'[ {{ /* campos del {singular} */ }} ]')
                    L.append("```")
                    L.append("")

                    if h.criterios:
                        L.append("**Validaciones requeridas:**")
                        for c in h.criterios:
                            L.append(f"- {c}")
                        L.append("")

                    L.append("**Response 422 — Error de validación:**")
                    L.append("```json")
                    L.append('{ "error": "string", "details": {} }')
                    L.append("```")
                    L.append("")
                    L.append("---")
                    L.append("")

    L.append("## Instrucciones de implementación")
    L.append("")
    L.append("1. Estructura el proyecto en carpetas por módulo/feature.")
    L.append("2. Manejo de errores en **todos** los endpoints.")
    L.append("3. Valida los datos de entrada antes de procesar.")
    L.append("4. Protege los endpoints con autenticación.")
    L.append("5. Implementa control de acceso por rol en cada endpoint.")
    L.append("6. Usa el ORM para todas las operaciones de BD.")
    L.append("7. Implementa migraciones.")
    L.append("8. Archivo `.env` para variables de entorno.")
    L.append("9. Los modelos deben basarse **exactamente** en `04_DIAGRAMA_CLASES.md`.")
    L.append("10. Los nombres de campos del contrato de API son **exactos e inamovibles**.")
    L.append("11. Registra **todos** los blueprints en `app.py` — verifica que ninguno quede sin registrar.")
    L.append("12. Todos los blueprints deben tener el prefijo `/api` — ejemplo: `app.register_blueprint(productos_bp, url_prefix='/api')`.")
    L.append("13. Después de generar, corre `flask routes` y verifica que cada endpoint del contrato esté registrado.")
    L.append("14. Cada endpoint de escritura debe hacer `db.session.commit()` explícitamente.")
    L.append("15. **No dejes endpoints con lógica vacía**, `pass` o `return []` sin datos reales.")
    L.append("")

    L.append("## Verificación de endpoints")
    L.append("")
    L.append("Después de generar el backend, verifica que:")
    L.append("")
    L.append("- Corre `flask routes` — cada endpoint del contrato de API debe aparecer en la lista")
    L.append("- El endpoint de login acepta `email` y `password` — **no** `username`")
    L.append("- CORS permite requests desde `http://localhost:5173` y `http://localhost:5174`")
    L.append("- Todos los endpoints protegidos rechazan requests sin token con `401`")
    L.append("- Los endpoints GET devuelven datos reales de la BD, no arrays vacíos")
    L.append("- Los endpoints POST/PUT hacen `db.session.commit()` y devuelven el registro creado/actualizado")
    L.append("- Prueba cada endpoint con un cliente HTTP antes de dar el backend por completo")
    L.append("- El campo `user_id` en el token JWT es consistente en **todo** el backend")
    L.append("- Los endpoints que leen el usuario del token no devuelven 422 con token válido")
    L.append("")
    L.append("## Dependencias de PostgreSQL")
    L.append("")
    L.append("El `requirements.txt` debe incluir **ambos** drivers obligatoriamente:")
    L.append("```")
    L.append("psycopg2-binary>=2.9.9")
    L.append("pg8000>=1.30.0")
    L.append("```")
    L.append("")
    L.append("- Instalar con: `pip install -r requirements.txt --only-binary=:all:`")
    L.append("- Si psycopg2 falla, SQLAlchemy usará pg8000 automáticamente")
    L.append("- Cadena de conexión con psycopg2: `postgresql+psycopg2://usuario:pass@localhost:5432/bd`")
    L.append("- Cadena de conexión con pg8000: `postgresql+pg8000://usuario:pass@localhost:5432/bd`")
    L.append("- **IMPORTANTE:** Si el proyecto tiene nombres con acentos o caracteres especiales")
    L.append("  usar `postgresql+pg8000://...` en el `DATABASE_URL` del `.env`")
    L.append("")
    L.append("## Script de instalación automática")
    L.append("")
    L.append("Genera un script `setup.bat` (Windows) y `setup.sh` (Linux/Mac) que haga")
    L.append("automáticamente los pasos que NO dependen de la base de datos:")
    L.append("")
    L.append("**El script `setup.bat` / `setup.sh` debe hacer:**")
    L.append("1. Crear el entorno virtual: `python -m venv venv`")
    L.append("2. Activar el entorno virtual")
    L.append("3. Instalar dependencias: `pip install -r requirements.txt --only-binary=:all:`")
    L.append("4. Copiar `.env.example` a `.env` si no existe")
    L.append("5. Mostrar mensaje indicando que el usuario debe configurar el `.env` y correr los comandos de BD")
    L.append("")
    L.append("**El script NO debe intentar correr migraciones ni seed automáticamente**")
    L.append("porque la BD debe existir y el `.env` debe estar configurado primero.")
    L.append("")
    L.append("## Comandos manuales del usuario — documentar en README.md")
    L.append("")
    L.append("> El `README.md` debe explicar estos pasos de forma clara y en orden.")
    L.append("> Son los únicos comandos que el usuario debe correr manualmente.")
    L.append("")
    L.append("**Paso 1 — Configurar la base de datos (una sola vez):**")
    L.append("```bash")
    L.append("# Crear la base de datos en PostgreSQL")
    L.append("createdb nombre_bd")
    L.append("# O desde psql: CREATE DATABASE nombre_bd;")
    L.append("```")
    L.append("")
    L.append("**Paso 2 — Configurar el archivo `.env`:**")
    L.append("```")
    L.append("DATABASE_URL=postgresql://usuario:password@localhost:5432/nombre_bd")
    L.append("SECRET_KEY=clave_secreta_aqui")
    L.append("```")
    L.append("")
    L.append("**Paso 3 — Correr el script de instalación:**")
    L.append("```bash")
    L.append("# Windows:")
    L.append("setup.bat")
    L.append("# Linux/Mac:")
    L.append("bash setup.sh")
    L.append("```")
    L.append("")
    L.append("**Paso 4 — Crear tablas en la BD:**")
    L.append("```bash")
    L.append("# Estos 3 comandos deben correrse EN ORDEN:")
    L.append("flask db init")
    L.append("flask db migrate -m \"initial\"")
    L.append("flask db upgrade")
    L.append("```")
    L.append("")
    L.append("**Paso 5 — Poblar con datos de prueba:**")
    L.append("```bash")
    L.append("python seed_db.py")
    L.append("```")
    L.append("")
    L.append("**Paso 6 — Levantar el servidor:**")
    L.append("```bash")
    L.append("python run.py")
    L.append("```")
    L.append("")
    L.append("> El `seed_db.py` debe imprimir en consola los usuarios y contraseñas de prueba al terminar.")
    L.append("")

    L.append("## Usuarios de prueba")
    L.append("")
    L.append("Genera un archivo `seed_db.py` que cree automáticamente un usuario de prueba")
    L.append("por cada rol definido en los specs. Las contraseñas deben estar hasheadas")
    L.append(f"con {tecnicas.seg_cifrado or 'bcrypt'} — **nunca en texto plano**.")
    L.append("")
    L.append("Usuarios de prueba a crear:")
    if tecnicas.seg_roles:
        for rol in tecnicas.seg_roles.split('\n'):
            if rol.strip():
                nombre_rol = rol.strip().split('—')[0].strip().split('-')[0].strip().lower().replace(' ', '_')
                L.append(f"- Email: `{nombre_rol}@test.com` | Password: `{nombre_rol}123` | Rol: `{nombre_rol}`")
    else:
        L.append("- Email: `admin@test.com` | Password: `admin123` | Rol: `admin`")
    L.append("")

    L.append("## Infraestructura")
    L.append("")
    L.append(f"- **Despliegue:** {tecnicas.infra_despliegue or 'N/A'}")
    L.append(f"- **Contenedores:** {tecnicas.infra_contenedores or 'N/A'}")
    L.append("")

    if tecnicas.restricciones_adicionales:
        L.append("## Restricciones adicionales")
        L.append("")
        L.append(tecnicas.restricciones_adicionales)
        L.append("")

    return "\n".join(L)


def gen_07_frontend(tecnicas):
    L = []
    L.append("# Especificaciones técnicas — Frontend")
    L.append("")
    L.append("> **INSTRUCCIÓN PARA LA IA:** Genera el frontend con exactamente el stack y")
    L.append("> las configuraciones definidas. Respeta el sistema de diseño al 100%.")
    L.append("")
    if not tecnicas:
        L.append("_Sin especificaciones técnicas definidas._")
        return "\n".join(L)

    L.append("## Stack tecnológico")
    L.append("")
    L.append(f"- **Framework:** {tecnicas.frontend_framework or 'N/A'}")
    L.append(f"- **Librería UI:** {tecnicas.frontend_libreria_ui or 'N/A'}")
    L.append(f"- **Manejo de estado:** {tecnicas.frontend_manejo_estado or 'N/A'}")
    L.append("")

    L.append("## Configuración de conexión al backend")
    L.append("")
    L.append("- **URL base del backend:** `http://localhost:5000/api`")
    L.append("- Centraliza esta URL en una variable de entorno: `VITE_API_URL=http://localhost:5000/api`")
    L.append("- **Nunca** uses el puerto de Vite (5173/5174) para llamar al backend")
    L.append("- Todos los servicios del frontend deben importar y usar `VITE_API_URL` como base")
    L.append("- Crea un archivo `.env` en la raíz del frontend con: `VITE_API_URL=http://localhost:5000/api`")
    L.append("")

    L.append("## Sistema de diseño — Referencia visual")
    L.append("")
    L.append("El frontend debe replicar la estética del dashboard de referencia (estilo 'azia').")
    L.append("Es un diseño administrativo moderno, limpio y profesional.")
    L.append("")
    L.append("### Paleta de colores")
    L.append("")
    L.append("| Token | Valor | Uso |")
    L.append("|-------|-------|-----|")
    L.append("| `--color-primary` | `#4F46E5` | Botones, links activos, badges |")
    L.append("| `--color-primary-hover` | `#4338CA` | Hover de botones primarios |")
    L.append("| `--color-secondary` | `#6366F1` | Variante más clara del primario |")
    L.append("| `--color-bg-page` | `#EEF0F8` | Fondo general de la app |")
    L.append("| `--color-bg-sidebar` | `#FFFFFF` | Fondo del sidebar |")
    L.append("| `--color-bg-card` | `#FFFFFF` | Fondo de cards |")
    L.append("| `--color-border` | `#E5E7EB` | Bordes de cards e inputs |")
    L.append("| `--color-text-primary` | `#111827` | Texto principal |")
    L.append("| `--color-text-secondary` | `#6B7280` | Texto secundario/muted |")
    L.append("| `--color-text-label` | `#9CA3AF` | Etiquetas uppercase |")
    L.append("| `--color-success` | `#10B981` | Éxito, positivo |")
    L.append("| `--color-danger` | `#EF4444` | Error, peligro |")
    L.append("| `--color-warning` | `#F59E0B` | Advertencia |")
    L.append("| `--color-info` | `#3B82F6` | Información |")
    L.append("")

    L.append("### Tipografía")
    L.append("")
    L.append("- **Fuente:** Inter (Google Fonts) o sistema sans-serif")
    L.append("- Título de página: 24px, weight 600")
    L.append("- Subtítulo: 14px, weight 400, color secundario")
    L.append("- Título de card: 13px, weight 700, UPPERCASE, letter-spacing 0.05em")
    L.append("- Contenido: 14px, weight 400")
    L.append("- Etiquetas: 11px, weight 600, UPPERCASE, color gris claro")
    L.append("- Números grandes: 28-32px, weight 700")
    L.append("")

    L.append("### Layout general")
    L.append("")
    L.append("- Sidebar fijo izquierda: 260px, fondo blanco, sombra derecha")
    L.append("- Header/topbar: fijo arriba, fondo blanco, barra de búsqueda central")
    L.append("- Área de contenido: fondo `#EEF0F8`, padding 24px, scroll independiente")
    L.append("- Grid: columnas responsivas (1 mobile, 2 tablet, 3-4 desktop)")
    L.append("")

    L.append("### Sidebar")
    L.append("")
    L.append("- Logo arriba a la izquierda")
    L.append("- Items: padding 10px 16px, border-radius 8px")
    L.append("- Activo: fondo `#EEF2FF`, texto `#4F46E5`, weight 600")
    L.append("- Inactivo: texto `#6B7280`, hover fondo `#F3F4F6`")
    L.append(f"- Íconos a la izquierda ({tecnicas.frontend_libreria_ui or 'librería de íconos'})")
    L.append("- Avatar de usuario abajo")
    L.append("")

    L.append("### Cards")
    L.append("")
    L.append("- Fondo blanco, border-radius 12px, border 1px solid `#E5E7EB`")
    L.append("- Sombra: `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`")
    L.append("- Padding: 20-24px, título UPPERCASE gris claro arriba")
    L.append("")

    L.append("### Tablas")
    L.append("")
    L.append("- Encabezados: fondo `#F9FAFB`, UPPERCASE, 11px")
    L.append("- Filas: fondo blanco, borde inferior `#F3F4F6`, hover `#F9FAFB`")
    L.append("- Paginación abajo")
    L.append("")

    L.append("### Formularios")
    L.append("")
    L.append("- Inputs: `border: 1px solid #D1D5DB`, border-radius 8px, padding 8px 12px")
    L.append("- Focus: `border-color: #4F46E5`, ring 2px `#EEF2FF`")
    L.append("- Labels: 13px, weight 500, `#374151`, margin-bottom 4px")
    L.append("- Placeholders: `#9CA3AF`")
    L.append("")

    L.append("### Botones")
    L.append("")
    L.append("| Tipo | Fondo | Texto | Hover |")
    L.append("|------|-------|-------|-------|")
    L.append("| Primario | `#4F46E5` | blanco | `#4338CA` |")
    L.append("| Secundario | blanco | `#374151` | `#F9FAFB` |")
    L.append("| Peligro | `#EF4444` | blanco | `#DC2626` |")
    L.append("")
    L.append("- Border-radius 8px, padding 8px 16px, font-size 14px, weight 500")
    L.append("- Todos con `transition: 150ms ease`")
    L.append("")

    L.append("### Badges")
    L.append("")
    L.append("- Border-radius 9999px (pill), padding 2px 10px, font-size 12px")
    L.append("- Éxito: fondo `#D1FAE5`, texto `#065F46`")
    L.append("- Pendiente: fondo `#FEF3C7`, texto `#92400E`")
    L.append("- Error: fondo `#FEE2E2`, texto `#991B1B`")
    L.append("- Info: fondo `#DBEAFE`, texto `#1E40AF`")
    L.append("")

    L.append("### Modales")
    L.append("")
    L.append("- Overlay: negro 50% opacidad")
    L.append("- Modal: blanco, border-radius 12px, max-width 480-640px")
    L.append("- Header con título y botón X, footer con botones a la derecha")
    L.append("")

    L.append("### Estados de carga y vacíos")
    L.append("")
    L.append("- Skeleton loaders para cards y tablas")
    L.append("- Spinner en botones durante peticiones")
    L.append("- Estado vacío: ícono grande centrado + texto + botón de acción")
    L.append("")

    L.append("### Responsive")
    L.append("")
    L.append("- Mobile (<768px): sidebar como drawer, 1 columna")
    L.append("- Tablet (768-1024px): sidebar colapsado, 2 columnas")
    L.append("- Desktop (>1024px): sidebar visible, 3-4 columnas")
    L.append("")

    L.append("## Estructura de pantallas")
    L.append("")
    L.append("Genera una pantalla por cada caso de uso de `05_DIAGRAMAS_UML.md`. Agrupa por actor/rol.")
    L.append("")
    L.append("**Pantallas obligatorias:**")
    L.append("- Login / autenticación — pantalla completa sin sidebar")
    L.append("- Dashboard principal por rol — con métricas y resumen")
    L.append("- Una pantalla por cada caso de uso del diagrama")
    L.append("- Pantalla 404 / no encontrado")
    L.append("")

    L.append("## Comunicación con el backend")
    L.append("")
    L.append(f"- **Tipo de API:** {tecnicas.backend_tipo_api or 'N/A'}")
    L.append(f"- **Autenticación:** {tecnicas.seg_autenticacion or 'N/A'}")
    L.append("- Envía el token en el header: `Authorization: Bearer <token>`")
    L.append("- Maneja estados: cargando, éxito, error en todas las peticiones")
    L.append("- Intercepta errores 401 y redirige al login")
    L.append("- Centraliza las llamadas al API en `/src/services/`")
    L.append("- Usa exactamente los nombres de campos definidos en `06_BACKEND_SPECS.md`")
    L.append("")
    L.append("## Comandos de instalación del frontend")
    L.append("")
    L.append("> Documenta estos comandos en el `README.md`. El usuario debe ejecutar el mínimo posible.")
    L.append("")
    L.append("```bash")
    L.append("# Instalar dependencias y levantar en desarrollo — UN solo comando:")
    L.append("npm install && npm run dev")
    L.append("")
    L.append("# Para producción:")
    L.append("npm run build")
    L.append("```")
    L.append("")
    L.append("Crea un archivo `.env` en la raíz del frontend con:")
    L.append("```")
    L.append("VITE_API_URL=http://localhost:5000/api")
    L.append("```")
    L.append("")

    L.append("## Instrucciones de implementación")
    L.append("")
    L.append("1. Un componente por cada pantalla principal.")
    L.append("2. Separa lógica de negocio de presentación.")
    L.append("3. Centraliza llamadas al API en `/src/services/`.")
    L.append("4. Manejo global de errores.")
    L.append("5. Protege rutas según el rol.")
    L.append("6. Aplica el sistema de diseño de forma consistente en **todas** las pantallas.")
    L.append("7. Formularios con validación para cada operación de escritura.")
    L.append("8. Confirmación para operaciones destructivas.")
    L.append("9. Sidebar + topbar + contenido en todas las pantallas autenticadas.")
    L.append("10. Login es la única pantalla sin sidebar.")
    L.append("")

    if tecnicas.restricciones_adicionales:
        L.append("## Restricciones adicionales")
        L.append("")
        L.append(tecnicas.restricciones_adicionales)
        L.append("")

    return "\n".join(L)


#  ENDPOINT 

@specs_archivos_bp.route('/proyectos/<int:id_proyecto>/specs-archivos', methods=['GET'])
def descargar_specs(id_proyecto):
    try:
        with Session(engine) as session:
            proyecto = session.get(Proyecto, id_proyecto)
            if not proyecto:
                return {"error": "Proyecto no encontrado"}, 404

            tecnicas = session.scalar(
                select(ProyectoSpecsTecnicas)
                .where(ProyectoSpecsTecnicas.id_proyecto == id_proyecto)
            )

            contenidos = {
                "01_INFO_PROYECTO.md":   gen_01_info_proyecto(session, proyecto, id_proyecto),
                "02_REQUERIMIENTOS.md":  gen_02_requerimientos(session, id_proyecto),
                "03_EVIDENCIA.md":       gen_03_evidencia(session, id_proyecto),
                "04_DIAGRAMA_CLASES.md": gen_04_diagrama_clases(session),
                "05_DIAGRAMAS_UML.md":   gen_05_diagramas_uml(session),
                "06_BACKEND_SPECS.md":   gen_06_backend(tecnicas, session, id_proyecto),
                "07_FRONTEND_SPECS.md":  gen_07_frontend(tecnicas),
            }

            archivos_presentes = set(contenidos.keys())
            contenidos["00_INDICE.md"] = gen_00_indice(proyecto, archivos_presentes)

            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
                for nombre, contenido in contenidos.items():
                    zf.writestr(nombre, contenido.encode('utf-8'))

            zip_buffer.seek(0)
            nombre_zip = f"specs_{proyecto.nombre.replace(' ', '_')}.zip"

            return send_file(
                zip_buffer,
                mimetype='application/zip',
                as_attachment=True,
                download_name=nombre_zip,
            )

    except SQLAlchemyError as e:
        return {"error": str(e)}, 500