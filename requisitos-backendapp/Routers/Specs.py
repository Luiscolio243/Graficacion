from flask import Blueprint, jsonify
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from db import engine

from Models.Proyectos import Proyecto
from Models.Stakeholders import Stakeholders
from Models.Proceso import Proceso
from Models.Subproceso import Subproceso

# Recopilacion
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

# Diagramas
from Models.Diagrama import Diagrama
from Models.ClaseNodo import ClaseNodo
from Models.ClaseArista import ClaseArista
from Models.CasoUsoNodo import CasoUsoNodo
from Models.CasoUsoArista import CasoUsoArista
from Models.PaqueteNodo import PaqueteNodo
from Models.PaqueteNodoElemento import PaqueteNodoElemento
from Models.SeqParticipante import SeqParticipante
from Models.SeqMensaje import SeqMensaje

specs_bp = Blueprint('specs', __name__)


# HELPERS 

def get_nombre_stakeholder(session, id_stakeholder):
    if not id_stakeholder:
        return None
    sh = session.get(Stakeholders, id_stakeholder)
    return sh.nombre if sh else None

def get_nombre_proceso(session, id_proceso):
    if not id_proceso:
        return None
    p = session.get(Proceso, id_proceso)
    return p.nombre if p else None

def get_nombre_subproceso(session, id_subproceso):
    if not id_subproceso:
        return None
    sp = session.get(Subproceso, id_subproceso)
    return sp.nombre if sp else None


#  GET /proyectos/<id>/specs 
@specs_bp.route('/proyectos/<int:id_proyecto>/specs', methods=['GET'])
def generar_specs(id_proyecto):
    try:
        with Session(engine) as session:

            # 1. PROYECTO 
            proyecto = session.get(Proyecto, id_proyecto)
            if not proyecto:
                return jsonify({"error": "Proyecto no encontrado"}), 404

            specs = {
                "proyecto": {
                    "nombre": proyecto.nombre,
                    "descripcion": proyecto.descripcion,
                    "objetivo_general": proyecto.objetivo_general,
                    "organizacion": proyecto.organizacion,
                    "fecha_inicio": proyecto.fecha_inicio.isoformat() if proyecto.fecha_inicio else None,
                    "fecha_fin": proyecto.fecha_fin.isoformat() if proyecto.fecha_fin else None,
                    "estado": proyecto.estado,
                },

                # 2. STAKEHOLDERS 
                "stakeholders": [],

                # 3. PROCESOS 
                "procesos": [],

                #  4. RECOPILACION 
                "entrevistas": [],
                "cuestionarios": [],
                "observaciones": [],
                "focus_groups": [],
                "analisis_documentos": [],
                "seguimientos": [],

                #  5. HISTORIAS DE USUARIO 
                "historias_usuario": [],

                #  6. DIAGRAMAS 
                "diagramas": {
                    "clases": [],
                    "casos_uso": [],
                    "paquetes": [],
                    "secuencias": [],
                },
            }

            #  2. STAKEHOLDERS 
            stakeholders = session.scalars(
                select(Stakeholders).where(Stakeholders.id_proyecto == id_proyecto)
            ).all()
            for sh in stakeholders:
                specs["stakeholders"].append({
                    "nombre": sh.nombre,
                    "rol": sh.rol,
                    "area": sh.area if hasattr(sh, 'area') else None,
                    "email": sh.email if hasattr(sh, 'email') else None,
                })

            #  3. PROCESOS Y SUBPROCESOS 
            procesos = session.scalars(
                select(Proceso).where(Proceso.id_proyecto == id_proyecto)
            ).all()
            for p in procesos:
                subprocesos = session.scalars(
                    select(Subproceso).where(Subproceso.id_proceso == p.id_proceso)
                ).all()
                specs["procesos"].append({
                    "nombre": p.nombre,
                    "descripcion": p.descripcion if hasattr(p, 'descripcion') else None,
                    "subprocesos": [
                        {"nombre": sp.nombre, "descripcion": sp.descripcion if hasattr(sp, 'descripcion') else None}
                        for sp in subprocesos
                    ],
                })

            # 4a. ENTREVISTAS 
            entrevistas = session.scalars(
                select(Entrevistas).where(Entrevistas.id_proyecto == id_proyecto)
            ).all()
            for e in entrevistas:
                preguntas = session.scalars(
                    select(EntrevistaPreguntas)
                    .where(EntrevistaPreguntas.id_entrevista == e.id_entrevista)
                    .order_by(EntrevistaPreguntas.orden)
                ).all()
                specs["entrevistas"].append({
                    "titulo": e.titulo,
                    "stakeholder": get_nombre_stakeholder(session, e.id_stakeholder),
                    "objetivo": e.objetivo,
                    "lugar": e.lugar,
                    "fecha": e.fecha_programada.isoformat() if e.fecha_programada else None,
                    "duracion_minutos": e.duracion_minutos,
                    "subproceso": get_nombre_subproceso(session, e.id_subproceso),
                    "preguntas_respuestas": [
                        {
                            "pregunta": p.pregunta,
                            "respuesta": p.respuesta,
                            "origen": p.origen,
                        }
                        for p in preguntas
                    ],
                })

            #  4b. CUESTIONARIOS 
            encuestas = session.scalars(
                select(Encuestas).where(Encuestas.id_proyecto == id_proyecto)
            ).all()
            for enc in encuestas:
                preguntas_enc = session.scalars(
                    select(EncuestaPreguntas)
                    .where(EncuestaPreguntas.id_encuesta == enc.id_encuesta)
                    .order_by(EncuestaPreguntas.orden)
                ).all()

                preguntas_data = []
                for preg in preguntas_enc:
                    opciones = session.scalars(
                        select(EncuestaOpciones)
                        .where(EncuestaOpciones.id_pregunta == preg.id_pregunta)
                        .order_by(EncuestaOpciones.orden)
                    ).all()

                    respuestas = session.scalars(
                        select(EncuestaRespuestas)
                        .where(EncuestaRespuestas.id_pregunta == preg.id_pregunta)
                    ).all()

                    total_resp = len(respuestas)

                    if preg.tipo in ('opcion_multiple', 'si_no'):
                        # Contar respuestas por opción
                        conteo = {}
                        for r in respuestas:
                            val = r.respuesta or ''
                            conteo[val] = conteo.get(val, 0) + 1

                        opciones_data = []
                        for op in opciones:
                            cant = conteo.get(op.opcion, 0)
                            pct = round((cant / total_resp * 100), 1) if total_resp > 0 else 0
                            opciones_data.append({
                                "opcion": op.opcion,
                                "cantidad": cant,
                                "porcentaje": pct,
                            })
                        preguntas_data.append({
                            "pregunta": preg.pregunta,
                            "tipo": preg.tipo,
                            "total_respuestas": total_resp,
                            "opciones": opciones_data,
                        })
                    else:
                        # Preguntas abiertas — listar respuestas
                        preguntas_data.append({
                            "pregunta": preg.pregunta,
                            "tipo": preg.tipo,
                            "total_respuestas": total_resp,
                            "respuestas": [r.respuesta for r in respuestas if r.respuesta],
                        })

                specs["cuestionarios"].append({
                    "titulo": enc.titulo,
                    "descripcion": enc.descripcion,
                    "subproceso": get_nombre_subproceso(session, enc.id_subproceso),
                    "num_participantes": enc.num_participantes,
                    "estado": enc.estado,
                    "preguntas": preguntas_data,
                })

            #  4c. OBSERVACIONES 
            observaciones = session.scalars(
                select(Observaciones).where(Observaciones.id_proyecto == id_proyecto)
            ).all()
            for ob in observaciones:
                specs["observaciones"].append({
                    "lugar": ob.lugar,
                    "fecha": ob.fecha_observacion.isoformat() if ob.fecha_observacion else None,
                    "duracion_minutos": ob.duracion_minutos,
                    "subproceso": get_nombre_subproceso(session, ob.id_subproceso),
                    "descripcion": ob.descripcion,
                    "problema_detectado": ob.problema_detectado,
                    "contexto": ob.contexto,
                })

            #  4d. FOCUS GROUPS 
            focus_groups = session.scalars(
                select(FocusGroup).where(FocusGroup.id_proyecto == id_proyecto)
            ).all()
            for fg in focus_groups:
                participantes = session.scalars(
                    select(FocusGroupParticipante)
                    .where(FocusGroupParticipante.id_focus_group == fg.id_focus_group)
                ).all()
                temas = session.scalars(
                    select(FocusGroupTema)
                    .where(FocusGroupTema.id_focus_group == fg.id_focus_group)
                    .order_by(FocusGroupTema.orden)
                ).all()

                specs["focus_groups"].append({
                    "titulo": fg.titulo,
                    "objetivo": fg.objetivo,
                    "lugar": fg.lugar,
                    "fecha": fg.fecha.isoformat() if fg.fecha else None,
                    "subproceso": get_nombre_subproceso(session, fg.id_subproceso),
                    "estado": fg.estado,
                    "conclusiones_generales": fg.conclusiones or [],
                    "participantes": [
                        get_nombre_stakeholder(session, p.id_stakeholder)
                        for p in participantes
                    ],
                    "temas": [
                        {"tema": t.tema, "conclusiones": t.conclusiones}
                        for t in temas
                    ],
                })

            #  4e. ANALISIS DE DOCUMENTOS 
            analisis = session.scalars(
                select(AnalisisDocumento).where(AnalisisDocumento.id_proyecto == id_proyecto)
            ).all()
            for an in analisis:
                hallazgos = session.scalars(
                    select(HallazgoAnalisis)
                    .where(HallazgoAnalisis.id_analisis == an.id_analisis)
                    .order_by(HallazgoAnalisis.orden)
                ).all()
                documentos = session.scalars(
                    select(DocumentoAnalizado)
                    .where(DocumentoAnalizado.id_analisis == an.id_analisis)
                    .order_by(DocumentoAnalizado.orden)
                ).all()
                specs["analisis_documentos"].append({
                    "titulo": an.titulo,
                    "tipo_documento": an.tipo_documento,
                    "fuente": an.fuente,
                    "proceso": get_nombre_proceso(session, an.id_proceso),
                    "subproceso": get_nombre_subproceso(session, an.id_subproceso),
                    "recomendaciones": an.recomendaciones,
                    "documentos": [
                        {"nombre": d.nombre, "tipo": d.tipo, "descripcion": d.descripcion}
                        for d in documentos
                    ],
                    "hallazgos": [h.descripcion for h in hallazgos],
                })

            #  4f. SEGUIMIENTO TRANSACCIONAL 
            seguimientos = session.scalars(
                select(Seguimiento).where(Seguimiento.id_proyecto == id_proyecto)
            ).all()
            for seg in seguimientos:
                pasos = session.scalars(
                    select(SeguimientoPaso)
                    .where(SeguimientoPaso.id_seguimiento == seg.id_seguimiento)
                    .order_by(SeguimientoPaso.orden)
                ).all()
                problemas = session.scalars(
                    select(SeguimientoProblema)
                    .where(SeguimientoProblema.id_seguimiento == seg.id_seguimiento)
                ).all()
                metricas = session.scalars(
                    select(SeguimientoMetrica)
                    .where(SeguimientoMetrica.id_seguimiento == seg.id_seguimiento)
                ).all()
                specs["seguimientos"].append({
                    "titulo": seg.titulo,
                    "id_transaccion": seg.id_transaccion,
                    "nombre_proceso": seg.nombre_proceso,
                    "proceso": get_nombre_proceso(session, seg.id_proceso),
                    "subproceso": get_nombre_subproceso(session, seg.id_subproceso),
                    "pasos": [
                        {"nombre": p.nombre, "duracion_min": p.duracion_min, "orden": p.orden}
                        for p in pasos
                    ],
                    "problemas": [p.descripcion for p in problemas],
                    "metricas": [
                        {"nombre": m.nombre, "valor": m.valor}
                        for m in metricas
                    ],
                })

            #  5. HISTORIAS DE USUARIO 
            historias = session.scalars(
                select(HistoriaUsuario).where(HistoriaUsuario.id_proyecto == id_proyecto)
            ).all()
            for h in historias:
                specs["historias_usuario"].append({
                    "titulo": h.titulo,
                    "rol": h.rol,
                    "accion": h.accion,
                    "beneficio": h.beneficio,
                    "prioridad": h.prioridad,
                    "estimacion": h.estimacion,
                    "criterios_aceptacion": h.criterios or [],
                    "subproceso": get_nombre_subproceso(session, h.id_subproceso),
                })

            #  6. DIAGRAMAS 
            diagramas = session.scalars(select(Diagrama)).all()

            for diag in diagramas:

                #  Clases 
                if diag.tipo == 'clases':
                    nodos = session.scalars(
                        select(ClaseNodo).where(ClaseNodo.id_diagrama == diag.id_diagrama)
                    ).all()
                    aristas = session.scalars(
                        select(ClaseArista).where(ClaseArista.id_diagrama == diag.id_diagrama)
                    ).all()
                    specs["diagramas"]["clases"].append({
                        "nombre": diag.nombre,
                        "descripcion": diag.descripcion,
                        "clases": [
                            {
                                "nombre": n.nombre,
                                "tipo": n.tipo,
                                "atributos": [
                                    {"visibilidad": a.visibilidad, "nombre": a.nombre, "tipo_dato": a.tipo_dato}
                                    for a in n.atributos
                                ],
                                "metodos": [
                                    {"visibilidad": m.visibilidad, "nombre": m.nombre, "tipo_dato": m.tipo_dato, "es_abstracto": m.es_abstracto}
                                    for m in n.metodos
                                ],
                            }
                            for n in nodos
                        ],
                        "relaciones": [
                            {"origen": a.id_source, "destino": a.id_target, "tipo": a.tipo, "etiqueta": a.etiqueta}
                            for a in aristas
                        ],
                    })

                #  Casos de uso 
                elif diag.tipo == 'casos_uso':
                    nodos = session.scalars(
                        select(CasoUsoNodo).where(CasoUsoNodo.id_diagrama == diag.id_diagrama)
                    ).all()
                    aristas = session.scalars(
                        select(CasoUsoArista).where(CasoUsoArista.id_diagrama == diag.id_diagrama)
                    ).all()

                    actores = [n for n in nodos if n.tipo == 'actor']
                    casos = [n for n in nodos if n.tipo == 'useCase']
                    sistemas = [n for n in nodos if n.tipo == 'system']

                    specs["diagramas"]["casos_uso"].append({
                        "nombre": diag.nombre,
                        "descripcion": diag.descripcion,
                        "sistemas": [s.nombre for s in sistemas],
                        "actores": [a.nombre for a in actores],
                        "casos_de_uso": [c.nombre for c in casos],
                        "relaciones": [
                            {
                                "origen": next((n.nombre for n in nodos if n.node_id == a.id_source), a.id_source),
                                "destino": next((n.nombre for n in nodos if n.node_id == a.id_target), a.id_target),
                                "tipo": a.tipo,
                            }
                            for a in aristas
                        ],
                    })

                #  Paquetes 
                elif diag.tipo == 'paquetes':
                    nodos = session.scalars(
                        select(PaqueteNodo).where(PaqueteNodo.id_diagrama == diag.id_diagrama)
                    ).all()
                    print(f"Paquetes nodos encontrados: {len(nodos)}")
                    paquetes_data = []
                    for n in nodos:
                        print(f"Procesando nodo: {n.id_paquete_nodo}")
                        elementos = session.scalars(
                            select(PaqueteNodoElemento)
                            .where(PaqueteNodoElemento.id_paquete_nodo == n.id_paquete_nodo)
                            .order_by(PaqueteNodoElemento.orden)
                        ).all()
                        print(f"Elementos: {len(elementos)}")
                        paquetes_data.append({
                            "nombre": n.nombre,
                            "elementos": [e.nombre for e in elementos],
                        })
                    specs["diagramas"]["paquetes"].append({
                        "nombre": diag.nombre,
                        "descripcion": diag.descripcion,
                        "paquetes": paquetes_data,
                    })

                #  Secuencias 
                elif diag.tipo == 'secuencias':
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

                    # Mapa id_nodo -> nombre para resolver nombres en mensajes
                    mapa = {p.id_nodo: p.nombre for p in participantes}

                    specs["diagramas"]["secuencias"].append({
                        "nombre": diag.nombre,
                        "descripcion": diag.descripcion,
                        "participantes": [
                            {"nombre": p.nombre, "tipo": p.tipo}
                            for p in participantes
                        ],
                        "mensajes": [
                            {
                                "de": mapa.get(m.source_id, m.source_id),
                                "para": mapa.get(m.target_id, m.target_id),
                                "contenido": m.contenido,
                                "tipo": m.tipo,
                                "orden": m.orden,
                                "es_self": m.es_self,
                            }
                            for m in mensajes
                        ],
                    })

            return jsonify(specs), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500