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

SEP  = '═' * 70
SEP2 = '─' * 70


def sep(titulo):
    return f"\n{SEP}\n  {titulo}\n{SEP}\n"


def sub(titulo):
    return f"\n── {titulo} {'─' * max(0, 60 - len(titulo))}\n"


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

# GENERADORES DE CADA ARCHIVO

def gen_00_indice(proyecto, archivos_presentes):
    L = []
    L.append("╔══════════════════════════════════════════════════════════════════════╗")
    L.append(f"║  SPECS MAESTRO — {proyecto.nombre[:50]:<50} ║")
    L.append("╚══════════════════════════════════════════════════════════════════════╝")
    L.append("")
    L.append("INSTRUCCIONES PARA LA IA:")
    L.append("─" * 70)
    L.append("Lee todos los archivos de este paquete EN EL ORDEN indicado antes de")
    L.append("generar cualquier código. Cada archivo contiene información específica")
    L.append("del sistema a desarrollar. No omitas ningún archivo.")
    L.append("")
    L.append("ORDEN DE LECTURA:")
    L.append("")
    orden = [
        ("01_INFO_PROYECTO.txt",    "Información general del proyecto, organización, stakeholders y procesos."),
        ("02_REQUERIMIENTOS.txt",   "Historias de usuario con criterios de aceptación. Define QUÉ debe hacer el sistema."),
        ("03_EVIDENCIA.txt",        "Evidencia recopilada: entrevistas, cuestionarios, observaciones, focus groups, documentos y seguimiento transaccional. Define el CONTEXTO del negocio."),
        ("04_DIAGRAMA_CLASES.txt",  "Modelo de datos completo con clases, atributos, métodos y relaciones. Define la ESTRUCTURA de la base de datos."),
        ("05_DIAGRAMAS_UML.txt",    "Diagramas de casos de uso, secuencias y paquetes. Define los FLUJOS y ARQUITECTURA del sistema."),
        ("06_BACKEND_SPECS.txt",    "Especificaciones técnicas del backend: stack, seguridad, autenticación, estructura de endpoints y reglas de negocio."),
        ("07_FRONTEND_SPECS.txt",   "Especificaciones técnicas del frontend: stack, diseño, pantallas, navegación y componentes."),
    ]
    for i, (archivo, desc) in enumerate(orden, 1):
        presente = archivo in archivos_presentes
        estado = "✓" if presente else "⚠ SIN DATOS"
        L.append(f"  {i}. {archivo} [{estado}]")
        L.append(f"     {desc}")
        L.append("")
    L.append("─" * 70)
    L.append("NOTAS IMPORTANTES:")
    L.append("  - Respeta el stack tecnológico definido en 06 y 07.")
    L.append("  - Genera código funcional y completo, no pseudocódigo.")
    L.append("  - Usa los nombres de clases y atributos tal como aparecen en 04.")
    L.append("  - Implementa TODOS los casos de uso definidos en 05.")
    L.append("  - Los criterios de aceptación de 02 son requisitos obligatorios.")
    L.append("  - La evidencia de 03 contiene reglas de negocio implícitas — respétalas.")
    return "\n".join(L)


def gen_01_info_proyecto(session, proyecto, id_proyecto):
    L = []
    L.append(sep("1. INFORMACIÓN DEL PROYECTO"))
    L.append(f"Nombre:           {proyecto.nombre}")
    L.append(f"Organización:     {proyecto.organizacion or 'N/A'}")
    L.append(f"Descripción:      {proyecto.descripcion or 'N/A'}")
    L.append(f"Objetivo general: {proyecto.objetivo_general or 'N/A'}")
    L.append(f"Fecha inicio:     {proyecto.fecha_inicio.isoformat() if proyecto.fecha_inicio else 'N/A'}")
    L.append(f"Fecha fin:        {proyecto.fecha_fin.isoformat() if proyecto.fecha_fin else 'N/A'}")
    L.append(f"Estado:           {proyecto.estado}")

    # Stakeholders
    L.append(sep("2. STAKEHOLDERS"))
    stakeholders = session.scalars(
        select(Stakeholders).where(Stakeholders.id_proyecto == id_proyecto)
    ).all()
    if not stakeholders:
        L.append("Sin stakeholders registrados.")
    else:
        for s in stakeholders:
            L.append(f"  • {s.nombre} — Rol: {s.rol or 'N/A'} | Tipo: {s.tipo or 'N/A'} | Email: {s.email or 'N/A'}")

    # Procesos
    L.append(sep("3. PROCESOS Y SUBPROCESOS"))
    procesos = session.scalars(
        select(Proceso).where(Proceso.id_proyecto == id_proyecto)
    ).all()
    if not procesos:
        L.append("Sin procesos registrados.")
    else:
        for i, p in enumerate(procesos, 1):
            L.append(f"{i}. {p.nombre}")
            if p.descripcion:
                L.append(f"   Descripción: {p.descripcion}")
            if p.objetivo:
                L.append(f"   Objetivo: {p.objetivo}")
            subprocesos = session.scalars(
                select(Subproceso).where(Subproceso.id_proceso == p.id_proceso)
            ).all()
            for sp in subprocesos:
                L.append(f"   • {sp.nombre}{f': {sp.descripcion}' if sp.descripcion else ''}")
            L.append("")

    return "\n".join(L)


def gen_02_requerimientos(session, id_proyecto):
    L = []
    L.append(sep("REQUERIMIENTOS FUNCIONALES"))
    L.append("Formato: Como [rol], quiero [acción], para que [beneficio]")
    L.append("")

    historias = session.scalars(
        select(HistoriaUsuario).where(HistoriaUsuario.id_proyecto == id_proyecto)
    ).all()

    if not historias:
        L.append("Sin historias de usuario registradas.")
        L.append("")
        L.append("NOTA PARA LA IA: No hay requerimientos formales definidos.")
        L.append("Infiere los requerimientos a partir de la evidencia en 03_EVIDENCIA.txt")
        L.append("y los diagramas en 04 y 05.")
        return "\n".join(L)

    for i, h in enumerate(historias, 1):
        L.append(f"RF-{str(i).zfill(3)}: {h.titulo}")
        L.append(f"  Historia:   Como {h.rol}, quiero {h.accion}, para que {h.beneficio}")
        L.append(f"  Prioridad:  {h.prioridad}{f' | Estimación: {h.estimacion}' if h.estimacion else ''}")
        sp = get_subproceso(session, h.id_subproceso)
        if sp:
            L.append(f"  Subproceso: {sp}")
        if h.criterios:
            L.append("  Criterios de aceptación:")
            for c in h.criterios:
                L.append(f"    - {c}")
        L.append("")

    return "\n".join(L)


def gen_03_evidencia(session, id_proyecto):
    L = []

    # Entrevistas
    L.append(sep("ENTREVISTAS"))
    entrevistas = session.scalars(
        select(Entrevistas).where(Entrevistas.id_proyecto == id_proyecto)
    ).all()
    if not entrevistas:
        L.append("Sin entrevistas registradas.")
    else:
        for i, e in enumerate(entrevistas, 1):
            L.append(sub(f"Entrevista {i}: {e.titulo or 'Sin título'}"))
            L.append(f"Stakeholder: {get_stakeholder(session, e.id_stakeholder) or 'N/A'}")
            L.append(f"Objetivo:    {e.objetivo or 'N/A'}")
            L.append(f"Lugar:       {e.lugar or 'N/A'} | Fecha: {e.fecha_programada.isoformat() if e.fecha_programada else 'N/A'}")
            sp = get_subproceso(session, e.id_subproceso)
            if sp:
                L.append(f"Subproceso:  {sp}")
            preguntas = session.scalars(
                select(EntrevistaPreguntas)
                .where(EntrevistaPreguntas.id_entrevista == e.id_entrevista)
                .order_by(EntrevistaPreguntas.orden)
            ).all()
            if preguntas:
                L.append("")
                for j, pr in enumerate(preguntas, 1):
                    L.append(f"  P{j}: {pr.pregunta}")
                    L.append(f"  R:  {pr.respuesta or 'Sin respuesta'}")
                    L.append("")

    # Cuestionarios
    L.append(sep("CUESTIONARIOS"))
    encuestas = session.scalars(
        select(Encuestas).where(Encuestas.id_proyecto == id_proyecto)
    ).all()
    if not encuestas:
        L.append("Sin cuestionarios registrados.")
    else:
        for i, enc in enumerate(encuestas, 1):
            L.append(sub(f"Cuestionario {i}: {enc.titulo}"))
            L.append(f"Descripción:   {enc.descripcion or 'N/A'}")
            L.append(f"Participantes: {enc.num_participantes}")
            sp = get_subproceso(session, enc.id_subproceso)
            if sp:
                L.append(f"Subproceso:    {sp}")
            preguntas = session.scalars(
                select(EncuestaPreguntas)
                .where(EncuestaPreguntas.id_encuesta == enc.id_encuesta)
                .order_by(EncuestaPreguntas.orden)
            ).all()
            for j, preg in enumerate(preguntas, 1):
                L.append(f"\n  P{j} [{preg.tipo}]: {preg.pregunta}")
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
                        L.append(f"    • {op.opcion}: {cant} respuestas ({pct}%)")
                else:
                    for r in respuestas:
                        if r.respuesta:
                            L.append(f"    • {r.respuesta}")

    # Observaciones
    L.append(sep("OBSERVACIONES"))
    observaciones = session.scalars(
        select(Observaciones).where(Observaciones.id_proyecto == id_proyecto)
    ).all()
    if not observaciones:
        L.append("Sin observaciones registradas.")
    else:
        for i, o in enumerate(observaciones, 1):
            L.append(sub(f"Observación {i}"))
            L.append(f"Lugar:    {o.lugar} | Fecha: {o.fecha_observacion.isoformat() if o.fecha_observacion else 'N/A'} | Duración: {o.duracion_minutos or 'N/A'} min")
            sp = get_subproceso(session, o.id_subproceso)
            if sp:
                L.append(f"Subproceso: {sp}")
            L.append(f"Descripción: {o.descripcion}")
            if o.problema_detectado:
                L.append(f"Problema detectado: {o.problema_detectado}")
            if o.contexto:
                L.append(f"Contexto: {o.contexto}")

    # Focus Groups
    L.append(sep("FOCUS GROUPS"))
    fgs = session.scalars(
        select(FocusGroup).where(FocusGroup.id_proyecto == id_proyecto)
    ).all()
    if not fgs:
        L.append("Sin focus groups registrados.")
    else:
        for i, fg in enumerate(fgs, 1):
            L.append(sub(f"Focus Group {i}: {fg.titulo}"))
            L.append(f"Objetivo: {fg.objetivo or 'N/A'}")
            L.append(f"Lugar:    {fg.lugar or 'N/A'} | Fecha: {fg.fecha.isoformat() if fg.fecha else 'N/A'}")
            sp = get_subproceso(session, fg.id_subproceso)
            if sp:
                L.append(f"Subproceso: {sp}")
            participantes = session.scalars(
                select(FocusGroupParticipante)
                .where(FocusGroupParticipante.id_focus_group == fg.id_focus_group)
            ).all()
            nombres = [get_stakeholder(session, p.id_stakeholder) for p in participantes]
            nombres = [n for n in nombres if n]
            if nombres:
                L.append(f"Participantes: {', '.join(nombres)}")
            temas = session.scalars(
                select(FocusGroupTema)
                .where(FocusGroupTema.id_focus_group == fg.id_focus_group)
                .order_by(FocusGroupTema.orden)
            ).all()
            if temas:
                L.append("Temas:")
                for t in temas:
                    L.append(f"  • {t.tema}")
                    if t.conclusiones:
                        L.append(f"    Conclusión: {t.conclusiones}")
            if fg.conclusiones:
                L.append("Conclusiones generales:")
                for c in fg.conclusiones:
                    L.append(f"  • {c}")

    # Análisis de documentos
    L.append(sep("ANÁLISIS DE DOCUMENTOS"))
    analisis = session.scalars(
        select(AnalisisDocumento).where(AnalisisDocumento.id_proyecto == id_proyecto)
    ).all()
    if not analisis:
        L.append("Sin análisis de documentos registrados.")
    else:
        for i, an in enumerate(analisis, 1):
            L.append(sub(f"Análisis {i}: {an.titulo}"))
            L.append(f"Tipo: {an.tipo_documento} | Fuente: {an.fuente}")
            p = get_proceso(session, an.id_proceso)
            sp = get_subproceso(session, an.id_subproceso)
            if p:
                L.append(f"Proceso: {p}")
            if sp:
                L.append(f"Subproceso: {sp}")
            hallazgos = session.scalars(
                select(HallazgoAnalisis)
                .where(HallazgoAnalisis.id_analisis == an.id_analisis)
                .order_by(HallazgoAnalisis.orden)
            ).all()
            if hallazgos:
                L.append("Hallazgos:")
                for h in hallazgos:
                    L.append(f"  • {h.descripcion}")
            if an.recomendaciones:
                L.append(f"Recomendaciones: {an.recomendaciones}")

    # Seguimiento transaccional
    L.append(sep("SEGUIMIENTO TRANSACCIONAL"))
    seguimientos = session.scalars(
        select(Seguimiento).where(Seguimiento.id_proyecto == id_proyecto)
    ).all()
    if not seguimientos:
        L.append("Sin seguimientos registrados.")
    else:
        for i, seg in enumerate(seguimientos, 1):
            L.append(sub(f"Seguimiento {i}: {seg.titulo} [{seg.id_transaccion}]"))
            L.append(f"Proceso: {seg.nombre_proceso}")
            pasos = session.scalars(
                select(SeguimientoPaso)
                .where(SeguimientoPaso.id_seguimiento == seg.id_seguimiento)
                .order_by(SeguimientoPaso.orden)
            ).all()
            if pasos:
                L.append("Pasos:")
                for paso in pasos:
                    L.append(f"  {paso.orden}. {paso.nombre}{f' ({paso.duracion_min} min)' if paso.duracion_min else ''}")
            metricas = session.scalars(
                select(SeguimientoMetrica)
                .where(SeguimientoMetrica.id_seguimiento == seg.id_seguimiento)
            ).all()
            if metricas:
                L.append("Métricas:")
                for m in metricas:
                    L.append(f"  • {m.nombre}: {m.valor}")
            problemas = session.scalars(
                select(SeguimientoProblema)
                .where(SeguimientoProblema.id_seguimiento == seg.id_seguimiento)
            ).all()
            if problemas:
                L.append("Problemas detectados:")
                for prob in problemas:
                    L.append(f"  • {prob.descripcion}")

    return "\n".join(L)


def gen_04_diagrama_clases(session):
    L = []
    L.append(sep("DIAGRAMA DE CLASES — MODELO DE DATOS"))
    L.append("INSTRUCCIÓN PARA LA IA: Usa estas clases como base para el modelo")
    L.append("de la base de datos. Cada clase es una tabla. Los atributos son")
    L.append("columnas. Las relaciones definen las llaves foráneas.")
    L.append("")

    diagramas = session.scalars(
        select(Diagrama).where(Diagrama.tipo == 'clases')
    ).all()

    if not diagramas:
        L.append("Sin diagramas de clases registrados.")
        L.append("")
        L.append("NOTA PARA LA IA: Infiere el modelo de datos a partir de las")
        L.append("historias de usuario y casos de uso.")
        return "\n".join(L)

    for diag in diagramas:
        L.append(sub(f"Diagrama: {diag.nombre}"))
        if diag.descripcion:
            L.append(f"Descripción: {diag.descripcion}")
        L.append("")

        nodos = session.scalars(
            select(ClaseNodo).where(ClaseNodo.id_diagrama == diag.id_diagrama)
        ).all()

        mapa_nodos = {n.node_id: n.nombre for n in nodos}

        for n in nodos:
            tipo_label = {'class': 'Clase', 'abstract': 'Clase Abstracta', 'interface': 'Interfaz'}.get(n.tipo, n.tipo)
            L.append(f"{'─' * 50}")
            L.append(f"{tipo_label}: {n.nombre}")
            if n.atributos:
                L.append("  Atributos:")
                for a in n.atributos:
                    vis = {'+': 'public', '-': 'private', '#': 'protected'}.get(a.visibilidad, a.visibilidad)
                    L.append(f"    {vis} {a.nombre}: {a.tipo_dato}")
            if n.metodos:
                L.append("  Métodos:")
                for m in n.metodos:
                    vis = {'+': 'public', '-': 'private', '#': 'protected'}.get(m.visibilidad, m.visibilidad)
                    abstracto = " [abstracto]" if m.es_abstracto else ""
                    L.append(f"    {vis} {m.nombre}(): {m.tipo_dato}{abstracto}")
            L.append("")

        aristas = session.scalars(
            select(ClaseArista).where(ClaseArista.id_diagrama == diag.id_diagrama)
        ).all()

        if aristas:
            L.append("  Relaciones:")
            tipo_rel = {
                'herencia': 'hereda de',
                'implementa': 'implementa',
                'composicion': 'tiene (composición)',
                'agregacion': 'tiene (agregación)',
                'asociacion': 'se asocia con',
                'assoc': 'se asocia con',
            }
            for a in aristas:
                origen = mapa_nodos.get(a.id_source, a.id_source)
                destino = mapa_nodos.get(a.id_target, a.id_target)
                rel = tipo_rel.get(a.tipo, a.tipo)
                etiqueta = f" [{a.etiqueta}]" if a.etiqueta else ""
                L.append(f"    • {origen} {rel} {destino}{etiqueta}")

    return "\n".join(L)


def gen_05_diagramas_uml(session):
    L = []

    # Casos de uso
    L.append(sep("DIAGRAMAS DE CASOS DE USO"))
    L.append("INSTRUCCIÓN PARA LA IA: Implementa TODOS los casos de uso listados.")
    L.append("Cada caso de uso es una funcionalidad del sistema.")
    L.append("")

    diag_cu = session.scalars(
        select(Diagrama).where(Diagrama.tipo == 'casos_uso')
    ).all()

    if not diag_cu:
        L.append("Sin diagramas de casos de uso registrados.")
    else:
        for diag in diag_cu:
            L.append(sub(f"Diagrama: {diag.nombre}"))
            nodos = session.scalars(
                select(CasoUsoNodo).where(CasoUsoNodo.id_diagrama == diag.id_diagrama)
            ).all()
            aristas = session.scalars(
                select(CasoUsoArista).where(CasoUsoArista.id_diagrama == diag.id_diagrama)
            ).all()

            mapa = {n.node_id: n.nombre for n in nodos}
            actores  = [n for n in nodos if n.tipo == 'actor']
            casos    = [n for n in nodos if n.tipo == 'useCase']
            sistemas = [n for n in nodos if n.tipo == 'system']

            if sistemas:
                L.append(f"Sistema(s): {', '.join(s.nombre for s in sistemas)}")
            if actores:
                L.append(f"Actores: {', '.join(a.nombre for a in actores)}")
            if casos:
                L.append(f"Casos de uso: {', '.join(c.nombre for c in casos)}")
            if aristas:
                L.append("Relaciones:")
                for a in aristas:
                    origen  = mapa.get(a.id_source, a.id_source)
                    destino = mapa.get(a.id_target, a.id_target)
                    tipo    = {'assoc': 'asociación', 'include': '«include»', 'extend': '«extend»', 'generalize': 'generalización'}.get(a.tipo, a.tipo)
                    L.append(f"  • {origen} --[{tipo}]--> {destino}")
            L.append("")

    # Secuencias
    L.append(sep("DIAGRAMAS DE SECUENCIAS"))
    L.append("INSTRUCCIÓN PARA LA IA: Implementa los flujos de mensajes exactamente")
    L.append("como están definidos aquí.")
    L.append("")

    diag_seq = session.scalars(
        select(Diagrama).where(Diagrama.tipo == 'secuencias')
    ).all()

    if not diag_seq:
        L.append("Sin diagramas de secuencias registrados.")
    else:
        for diag in diag_seq:
            L.append(sub(f"Diagrama: {diag.nombre}"))
            participantes = session.scalars(
                select(SeqParticipante)
                .where(SeqParticipante.id_diagrama == diag.id_diagrama)
                .order_by(SeqParticipante.orden)
            ).all()
            mensajes = session.scalars(
                select(SeqMensaje)
                .where(SeqMensaje.id_diagrama == diag.id_diagrama)
                .order_by(SeqMensaje.orden)
            ).all()
            mapa = {p.id_nodo: p.nombre for p in participantes}
            if participantes:
                L.append(f"Participantes: {', '.join(f'{p.nombre} [{p.tipo}]' for p in participantes)}")
            if mensajes:
                L.append("Flujo:")
                for m in mensajes:
                    self_msg = " [self]" if m.es_self else ""
                    L.append(f"  {m.orden}. {mapa.get(m.source_id, m.source_id)} → {mapa.get(m.target_id, m.target_id)}: {m.contenido} [{m.tipo}]{self_msg}")
            L.append("")

    # Paquetes
    L.append(sep("DIAGRAMAS DE PAQUETES"))
    L.append("INSTRUCCIÓN PARA LA IA: Usa esta estructura para organizar los módulos")
    L.append("del sistema.")
    L.append("")

    diag_paq = session.scalars(
        select(Diagrama).where(Diagrama.tipo == 'paquetes')
    ).all()

    if not diag_paq:
        L.append("Sin diagramas de paquetes registrados.")
    else:
        for diag in diag_paq:
            L.append(sub(f"Diagrama: {diag.nombre}"))
            nodos = session.scalars(
                select(PaqueteNodo).where(PaqueteNodo.id_diagrama == diag.id_diagrama)
            ).all()
            for n in nodos:
                L.append(f"  Paquete: {n.nombre}")
                try:
                    elementos = session.scalars(
                        select(PaqueteNodoElemento)
                        .where(PaqueteNodoElemento.id_paquete_nodo == n.id_paquete_nodo)
                        .order_by(PaqueteNodoElemento.orden)
                    ).all()
                    for e in elementos:
                        L.append(f"    • {e.nombre}")
                except Exception:
                    pass
            L.append("")

    return "\n".join(L)


def gen_06_backend(tecnicas):
    L = []
    L.append(sep("ESPECIFICACIONES TÉCNICAS — BACKEND"))
    L.append("INSTRUCCIÓN PARA LA IA: Genera el backend con exactamente el stack")
    L.append("y las configuraciones definidas a continuación.")
    L.append("")

    if not tecnicas:
        L.append("Sin especificaciones técnicas definidas.")
        L.append("NOTA: Define el stack tecnológico del backend antes de generar.")
        return "\n".join(L)

    L.append(sub("Stack tecnológico"))
    L.append(f"Lenguaje:    {tecnicas.backend_lenguaje or 'N/A'}")
    L.append(f"Framework:   {tecnicas.backend_framework or 'N/A'}")
    L.append(f"Tipo de API: {tecnicas.backend_tipo_api or 'N/A'}")
    L.append(f"Motor BD:    {tecnicas.bd_motor or 'N/A'}")
    L.append(f"ORM:         {tecnicas.bd_orm or 'N/A'}")

    L.append(sub("Seguridad y autenticación"))
    L.append(f"Autenticación: {tecnicas.seg_autenticacion or 'N/A'}")
    L.append(f"Cifrado:       {tecnicas.seg_cifrado or 'N/A'}")
    if tecnicas.seg_roles:
        L.append(f"Roles del sistema:")
        for rol in tecnicas.seg_roles.split('\n'):
            if rol.strip():
                L.append(f"  • {rol.strip()}")

    L.append(sub("Infraestructura"))
    L.append(f"Despliegue:   {tecnicas.infra_despliegue or 'N/A'}")
    L.append(f"Contenedores: {tecnicas.infra_contenedores or 'N/A'}")

    L.append(sub("Instrucciones específicas para la IA"))
    L.append("1. Estructura el proyecto en carpetas por módulo/feature.")
    L.append("2. Implementa manejo de errores en todos los endpoints.")
    L.append("3. Valida los datos de entrada en cada endpoint.")
    L.append("4. Protege los endpoints con el sistema de autenticación definido.")
    L.append("5. Implementa los roles definidos arriba con control de acceso.")
    L.append("6. Usa el ORM para todas las operaciones de base de datos.")
    L.append("7. Implementa migraciones para la base de datos.")
    L.append("8. Incluye un archivo de configuración para variables de entorno.")
    L.append("9. Genera los modelos basados en el diagrama de clases de 04.")
    L.append("10. Implementa un endpoint por cada caso de uso definido en 05.")

    if tecnicas.restricciones_adicionales:
        L.append(sub("Restricciones adicionales"))
        L.append(tecnicas.restricciones_adicionales)

    return "\n".join(L)


def gen_07_frontend(tecnicas):
    L = []
    L.append(sep("ESPECIFICACIONES TÉCNICAS — FRONTEND"))
    L.append("INSTRUCCIÓN PARA LA IA: Genera el frontend con exactamente el stack")
    L.append("y las configuraciones definidas a continuación.")
    L.append("")

    if not tecnicas:
        L.append("Sin especificaciones técnicas definidas.")
        L.append("NOTA: Define el stack tecnológico del frontend antes de generar.")
        return "\n".join(L)

    L.append(sub("Stack tecnológico"))
    L.append(f"Framework:        {tecnicas.frontend_framework or 'N/A'}")
    L.append(f"Librería UI:      {tecnicas.frontend_libreria_ui or 'N/A'}")
    L.append(f"Manejo de estado: {tecnicas.frontend_manejo_estado or 'N/A'}")

    L.append(sub("Sistema de diseño — Referencia visual"))
    L.append("El frontend debe replicar la estética del dashboard de referencia (estilo 'azia').")
    L.append("Es un diseño administrativo moderno, limpio y profesional.")
    L.append("")
    L.append("PALETA DE COLORES:")
    L.append("  Color primario (accent):  #4F46E5  (índigo/violeta — botones, links activos, badges)")
    L.append("  Color secundario:         #6366F1  (variante más clara del primario)")
    L.append("  Fondo de página:          #EEF0F8  (gris azulado muy claro — fondo general)")
    L.append("  Fondo de sidebar:         #FFFFFF  (blanco puro)")
    L.append("  Fondo de cards:           #FFFFFF  (blanco puro con sombra suave)")
    L.append("  Borde de cards:           #E5E7EB  (gris claro, 1px)")
    L.append("  Texto principal:          #111827  (casi negro)")
    L.append("  Texto secundario:         #6B7280  (gris medio)")
    L.append("  Texto de etiquetas:       #9CA3AF  (gris claro, uppercase, tracking-wide)")
    L.append("  Color éxito/positivo:     #10B981  (verde esmeralda)")
    L.append("  Color peligro/negativo:   #EF4444  (rojo)")
    L.append("  Color advertencia:        #F59E0B  (ámbar)")
    L.append("  Color info:               #3B82F6  (azul)")
    L.append("")
    L.append("TIPOGRAFÍA:")
    L.append("  Fuente principal: Inter (Google Fonts) o sistema sans-serif")
    L.append("  Tamaños:")
    L.append("    - Título de página:     24px, font-weight 600")
    L.append("    - Subtítulo:            14px, font-weight 400, color secundario")
    L.append("    - Título de card:       13px, font-weight 700, UPPERCASE, letter-spacing 0.05em")
    L.append("    - Contenido:            14px, font-weight 400")
    L.append("    - Etiquetas/labels:     11px, font-weight 600, UPPERCASE, color gris claro")
    L.append("    - Números grandes:      28-32px, font-weight 700")
    L.append("")
    L.append("LAYOUT GENERAL:")
    L.append("  - Sidebar fijo a la izquierda: 260px de ancho, fondo blanco, sombra derecha")
    L.append("  - Header/topbar: fijo arriba, fondo blanco, barra de búsqueda central")
    L.append("  - Área de contenido: fondo #EEF0F8, padding 24px, scroll independiente")
    L.append("  - Grid de cards: CSS Grid, columnas responsivas (1 col mobile, 2 tablet, 3-4 desktop)")
    L.append("")
    L.append("SIDEBAR:")
    L.append("  - Logo en la parte superior izquierda")
    L.append("  - Items de navegación: padding 10px 16px, border-radius 8px")
    L.append("  - Item activo: fondo #EEF2FF, texto #4F46E5, font-weight 600")
    L.append("  - Item inactivo: texto #6B7280, hover fondo #F3F4F6")
    L.append(f"  - Íconos a la izquierda de cada item ({tecnicas.frontend_libreria_ui or 'librería de íconos'})")
    L.append("  - Separador entre grupos de items: línea gris muy clara")
    L.append("  - Avatar de usuario en la parte inferior")
    L.append("")
    L.append("CARDS:")
    L.append("  - Fondo blanco, border-radius 12px, border 1px solid #E5E7EB")
    L.append("  - Sombra: box-shadow 0 1px 3px rgba(0,0,0,0.08)")
    L.append("  - Padding interno: 20-24px")
    L.append("  - Título de card en UPPERCASE gris claro arriba")
    L.append("  - Hover: sombra ligeramente más pronunciada")
    L.append("")
    L.append("TABLAS:")
    L.append("  - Encabezados: fondo #F9FAFB, texto gris claro UPPERCASE, font-size 11px")
    L.append("  - Filas: fondo blanco, borde inferior 1px #F3F4F6")
    L.append("  - Hover de fila: fondo #F9FAFB")
    L.append("  - Paginación en la parte inferior")
    L.append("")
    L.append("FORMULARIOS:")
    L.append("  - Inputs: border 1px solid #D1D5DB, border-radius 8px, padding 8px 12px")
    L.append("  - Focus: border-color #4F46E5, outline none, ring 2px #EEF2FF")
    L.append("  - Labels: texto 13px, font-weight 500, color #374151, margin-bottom 4px")
    L.append("  - Placeholders: color #9CA3AF")
    L.append("  - Selects: mismo estilo que inputs")
    L.append("  - Validación de formularios en el cliente antes de enviar al backend")
    L.append("")
    L.append("BOTONES:")
    L.append("  - Primario: fondo #4F46E5, texto blanco, border-radius 8px, padding 8px 16px")
    L.append("  - Primario hover: fondo #4338CA")
    L.append("  - Secundario: fondo blanco, borde #D1D5DB, texto #374151")
    L.append("  - Secundario hover: fondo #F9FAFB")
    L.append("  - Peligro: fondo #EF4444, texto blanco")
    L.append("  - Tamaño base: font-size 14px, font-weight 500")
    L.append("  - Todos con transition 150ms ease")
    L.append("")
    L.append("BADGES / CHIPS:")
    L.append("  - Border-radius 9999px (pill)")
    L.append("  - Padding 2px 10px, font-size 12px, font-weight 500")
    L.append("  - Activo/éxito: fondo #D1FAE5, texto #065F46")
    L.append("  - Pendiente: fondo #FEF3C7, texto #92400E")
    L.append("  - Error: fondo #FEE2E2, texto #991B1B")
    L.append("  - Info: fondo #DBEAFE, texto #1E40AF")
    L.append("")
    L.append("MODALES:")
    L.append("  - Overlay: fondo negro con opacidad 50%")
    L.append("  - Modal: fondo blanco, border-radius 12px, sombra grande, max-width 480-640px")
    L.append("  - Header con título y botón X para cerrar")
    L.append("  - Footer con botones alineados a la derecha")
    L.append("")
    L.append("ESTADOS VACÍOS:")
    L.append("  - Ícono grande centrado en gris claro")
    L.append("  - Texto explicativo en gris")
    L.append("  - Botón de acción primaria si aplica")
    L.append("")
    L.append("ESTADOS DE CARGA:")
    L.append("  - Skeleton loaders para cards y tablas")
    L.append("  - Spinner en botones mientras se procesa una acción")
    L.append("  - Deshabilitar botones durante peticiones en curso")
    L.append("")
    L.append("RESPONSIVE:")
    L.append("  - Mobile (<768px): sidebar colapsado como drawer, 1 columna")
    L.append("  - Tablet (768-1024px): sidebar colapsado, 2 columnas")
    L.append("  - Desktop (>1024px): sidebar visible, 3-4 columnas")

    L.append(sub("Estructura de pantallas"))
    L.append("Genera una pantalla por cada caso de uso definido en 05_DIAGRAMAS_UML.txt")
    L.append("Agrupa las pantallas por actor/rol.")
    L.append("")
    L.append("Pantallas obligatorias:")
    L.append("  • Login / autenticación — pantalla completa, sin sidebar")
    L.append("  • Dashboard principal por rol — con métricas y resumen")
    L.append("  • Una pantalla por cada caso de uso del diagrama")
    L.append("  • Pantalla 404 / no encontrado")

    L.append(sub("Navegación"))
    L.append("  • Implementa rutas protegidas por rol")
    L.append("  • Redirige al login si no hay sesión activa")
    L.append("  • Menú de navegación en el sidebar adaptado al rol del usuario autenticado")
    L.append("  • Resalta el item activo del sidebar según la ruta actual")

    L.append(sub("Comunicación con el backend"))
    L.append(f"  • Tipo de API: {tecnicas.backend_tipo_api or 'N/A'}")
    L.append(f"  • Autenticación: {tecnicas.seg_autenticacion or 'N/A'}")
    L.append("  • Maneja estados: cargando, éxito, error en todas las peticiones")
    L.append("  • Intercepta errores 401 y redirige al login")
    L.append("  • Centraliza todas las llamadas al API en un módulo de servicios")

    L.append(sub("Instrucciones específicas para la IA"))
    L.append("1. Crea un componente por cada pantalla principal.")
    L.append("2. Separa la lógica de negocio de la presentación.")
    L.append("3. Centraliza las llamadas al API en un módulo de servicios.")
    L.append("4. Implementa manejo global de errores.")
    L.append("5. Protege las rutas según el rol del usuario.")
    L.append("6. Aplica el sistema de diseño definido de forma consistente en TODAS las pantallas.")
    L.append("7. Implementa formularios con validación para cada operación de escritura.")
    L.append("8. Muestra mensajes de confirmación para operaciones destructivas.")
    L.append("9. Usa el layout de sidebar + topbar + contenido en todas las pantallas autenticadas.")
    L.append("10. La pantalla de login es la única sin sidebar.")

    if tecnicas.restricciones_adicionales:
        L.append(sub("Restricciones adicionales"))
        L.append(tecnicas.restricciones_adicionales)

    return "\n".join(L)


# ENDPOINT 

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

            # Generar contenido de cada archivo
            contenidos = {
                "01_INFO_PROYECTO.txt":   gen_01_info_proyecto(session, proyecto, id_proyecto),
                "02_REQUERIMIENTOS.txt":  gen_02_requerimientos(session, id_proyecto),
                "03_EVIDENCIA.txt":       gen_03_evidencia(session, id_proyecto),
                "04_DIAGRAMA_CLASES.txt": gen_04_diagrama_clases(session),
                "05_DIAGRAMAS_UML.txt":   gen_05_diagramas_uml(session),
                "06_BACKEND_SPECS.txt":   gen_06_backend(tecnicas),
                "07_FRONTEND_SPECS.txt":  gen_07_frontend(tecnicas),
            }

            # Determinar qué archivos tienen datos reales
            archivos_presentes = set(contenidos.keys())

            contenidos["00_INDICE.txt"] = gen_00_indice(proyecto, archivos_presentes)

            # Crear ZIP en memoria
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