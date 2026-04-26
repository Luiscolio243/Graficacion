from flask import Blueprint, request, jsonify
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime, date
from db import engine
from Models.Focus_Group import FocusGroup
from Models.FocusGroupTema import FocusGroupTema
from Models.FocusGroupParticipante import FocusGroupParticipante
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
import google.generativeai as genai
import json
import os

focus_groups_bp = Blueprint('focus_groups', __name__)


def parsear_fecha(fecha_str: str | None) -> date | None:
    if not fecha_str:
        return None
    try:
        return datetime.strptime(fecha_str, "%Y-%m-%d").date()
    except ValueError:
        return None


def serializar_tema(t: FocusGroupTema) -> dict:
    return {
        "id_tema": t.id_tema,
        "id_focus_group": t.id_focus_group,
        "tema": t.tema,
        "conclusiones": t.conclusiones,
        "orden": t.orden,
    }


def serializar_participante(p: FocusGroupParticipante) -> dict:
    return {
        "id_participante": p.id_participante,
        "id_focus_group": p.id_focus_group,
        "id_stakeholder": p.id_stakeholder,
    }


def serializar_focus_group(fg: FocusGroup, incluir_detalle: bool = False) -> dict:
    data = {
        "id_focus_group": fg.id_focus_group,
        "id_proyecto": fg.id_proyecto,
        "id_subproceso": fg.id_subproceso,
        "id_moderador": fg.id_moderador,
        "titulo": fg.titulo,
        "fecha": fg.fecha.isoformat() if fg.fecha else None,
        "lugar": fg.lugar,
        "objetivo": fg.objetivo,
        "estado": fg.estado,
        "tipo_media": fg.tipo_media,           
        "transcripcion": fg.transcripcion,     
        "conclusiones": fg.conclusiones or [], 
        "fecha_creacion": fg.fecha_creacion.isoformat() if fg.fecha_creacion else None,
        "total_participantes": len(fg.participantes),
        "total_temas": len(fg.temas),
    }
    if incluir_detalle:
        data["participantes"] = [serializar_participante(p) for p in fg.participantes]
        data["temas"] = [serializar_tema(t) for t in fg.temas]
    return data


def configurar_gemini():
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    return genai.GenerativeModel("gemini-2.5-flash")



@focus_groups_bp.route('/focus-groups/<int:id_proyecto>', methods=['GET'])
def obtener_focus_groups(id_proyecto):
    try:
        with Session(engine) as session:
            grupos = session.scalars(
                select(FocusGroup)
                .where(FocusGroup.id_proyecto == id_proyecto)
                .order_by(FocusGroup.fecha_creacion.desc())
            ).all()

            return jsonify([serializar_focus_group(fg) for fg in grupos]), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500



@focus_groups_bp.route('/focus-groups/detalle/<int:id_focus_group>', methods=['GET'])
def obtener_focus_group(id_focus_group):
    try:
        with Session(engine) as session:
            fg = session.get(FocusGroup, id_focus_group)
            if not fg:
                return jsonify({"error": "Focus group no encontrado"}), 404

            return jsonify(serializar_focus_group(fg, incluir_detalle=True)), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500



@focus_groups_bp.route('/focus-groups/crear', methods=['POST'])
def crear_focus_group():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido o vacío"}), 400

        campos_obligatorios = ["id_proyecto", "id_moderador", "titulo"]
        faltantes = [c for c in campos_obligatorios if not data.get(c)]
        if faltantes:
            return jsonify({"error": f"Faltan campos obligatorios: {', '.join(faltantes)}"}), 400

        with Session(engine) as session:
            fg = FocusGroup(
                id_proyecto=data["id_proyecto"],
                id_moderador=data["id_moderador"],
                titulo=data["titulo"],
                id_subproceso=data.get("id_subproceso"),
                fecha=parsear_fecha(data.get("fecha")),
                lugar=data.get("lugar"),
                objetivo=data.get("objetivo"),
                tipo_media=data.get("tipo_media"),          
                transcripcion=data.get("transcripcion"),    
                conclusiones=data.get("conclusiones", []),   
                estado="planificado",
                fecha_creacion=datetime.now(),
            )
            session.add(fg)
            session.flush()  # para obtener id_focus_group antes del commit

            # Agregar participantes si vienen
            for id_sh in data.get("participantes", []):
                session.add(FocusGroupParticipante(
                    id_focus_group=fg.id_focus_group,
                    id_stakeholder=id_sh,
                ))

            # Agregar temas si vienen
            for i, t in enumerate(data.get("temas", []), start=1):
                if t.get("tema", "").strip():
                    session.add(FocusGroupTema(
                        id_focus_group=fg.id_focus_group,
                        tema=t["tema"].strip(),
                        conclusiones=t.get("conclusiones"),
                        orden=t.get("orden", i),
                    ))

            session.commit()
            session.refresh(fg)

            return jsonify({
                "mensaje": "Focus group creado exitosamente",
                "focus_group": serializar_focus_group(fg, incluir_detalle=True)
            }), 201

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500



@focus_groups_bp.route('/focus-groups/actualizar/<int:id_focus_group>', methods=['PATCH'])
def actualizar_focus_group(id_focus_group):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido o vacío"}), 400

        campos_editables = ["titulo", "lugar", "objetivo", "estado", "id_subproceso", "id_moderador", "fecha"]

        with Session(engine) as session:
            fg = session.get(FocusGroup, id_focus_group)
            if not fg:
                return jsonify({"error": "Focus group no encontrado"}), 404

            for campo in campos_editables:
                if campo in data:
                    if campo == "fecha":
                        setattr(fg, campo, parsear_fecha(data[campo]))
                    else:
                        setattr(fg, campo, data[campo])

            session.commit()
            session.refresh(fg)

            return jsonify({
                "mensaje": "Focus group actualizado correctamente",
                "focus_group": serializar_focus_group(fg, incluir_detalle=True)
            }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500



@focus_groups_bp.route('/focus-groups/eliminar/<int:id_focus_group>', methods=['DELETE'])
def eliminar_focus_group(id_focus_group):
    try:
        with Session(engine) as session:
            fg = session.get(FocusGroup, id_focus_group)
            if not fg:
                return jsonify({"error": "Focus group no encontrado"}), 404

            session.delete(fg)
            session.commit()

            return jsonify({"mensaje": "Focus group eliminado correctamente"}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500



@focus_groups_bp.route('/focus-groups/<int:id_focus_group>/participantes/agregar', methods=['POST'])
def agregar_participante(id_focus_group):
    try:
        data = request.get_json()
        if not data or not data.get("id_stakeholder"):
            return jsonify({"error": "Se requiere id_stakeholder"}), 400

        with Session(engine) as session:
            fg = session.get(FocusGroup, id_focus_group)
            if not fg:
                return jsonify({"error": "Focus group no encontrado"}), 404

            participante = FocusGroupParticipante(
                id_focus_group=id_focus_group,
                id_stakeholder=data["id_stakeholder"],
            )
            session.add(participante)
            session.commit()
            session.refresh(participante)

            return jsonify({
                "mensaje": "Participante agregado correctamente",
                "participante": serializar_participante(participante)
            }), 201

    except IntegrityError:
        return jsonify({"error": "Este stakeholder ya es participante del focus group"}), 409
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500



@focus_groups_bp.route('/focus-groups/participantes/eliminar/<int:id_participante>', methods=['DELETE'])
def eliminar_participante(id_participante):
    try:
        with Session(engine) as session:
            participante = session.get(FocusGroupParticipante, id_participante)
            if not participante:
                return jsonify({"error": "Participante no encontrado"}), 404

            session.delete(participante)
            session.commit()

            return jsonify({"mensaje": "Participante eliminado correctamente"}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500



@focus_groups_bp.route('/focus-groups/<int:id_focus_group>/temas/agregar', methods=['POST'])
def agregar_tema(id_focus_group):
    try:
        data = request.get_json()
        if not data or not data.get("tema", "").strip():
            return jsonify({"error": "El campo tema es obligatorio"}), 400

        with Session(engine) as session:
            fg = session.get(FocusGroup, id_focus_group)
            if not fg:
                return jsonify({"error": "Focus group no encontrado"}), 404

            # Calcular el siguiente orden automáticamente
            orden_actual = len(fg.temas) + 1

            tema = FocusGroupTema(
                id_focus_group=id_focus_group,
                tema=data["tema"].strip(),
                conclusiones=data.get("conclusiones"),
                orden=data.get("orden", orden_actual),
            )
            session.add(tema)
            session.commit()
            session.refresh(tema)

            return jsonify({
                "mensaje": "Tema agregado correctamente",
                "tema": serializar_tema(tema)
            }), 201

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


@focus_groups_bp.route('/focus-groups/temas/actualizar/<int:id_tema>', methods=['PATCH'])
def actualizar_tema(id_tema):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido o vacío"}), 400

        with Session(engine) as session:
            tema = session.get(FocusGroupTema, id_tema)
            if not tema:
                return jsonify({"error": "Tema no encontrado"}), 404

            for campo in ["tema", "conclusiones", "orden"]:
                if campo in data:
                    setattr(tema, campo, data[campo])

            session.commit()
            session.refresh(tema)

            return jsonify({
                "mensaje": "Tema actualizado correctamente",
                "tema": serializar_tema(tema)
            }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


@focus_groups_bp.route('/focus-groups/temas/eliminar/<int:id_tema>', methods=['DELETE'])
def eliminar_tema(id_tema):
    try:
        with Session(engine) as session:
            tema = session.get(FocusGroupTema, id_tema)
            if not tema:
                return jsonify({"error": "Tema no encontrado"}), 404

            session.delete(tema)
            session.commit()

            return jsonify({"mensaje": "Tema eliminado correctamente"}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


@focus_groups_bp.route('/focus-groups/subir-audio/<int:id_focus_group>', methods=['POST'])
def subir_audio_focus_group(id_focus_group):
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No se envió ningún archivo de audio"}), 400

        archivo = request.files['audio']
        if archivo.filename == '':
            return jsonify({"error": "Archivo sin nombre"}), 400

        with Session(engine) as session:
            fg = session.get(FocusGroup, id_focus_group)
            if not fg:
                return jsonify({"error": "Focus group no encontrado"}), 404

        carpeta = "temp_audios"
        os.makedirs(carpeta, exist_ok=True)
        ruta = os.path.join(carpeta, f"focusgroup_{id_focus_group}_{archivo.filename}")
        archivo.save(ruta)

        return jsonify({
            "mensaje": "Audio subido correctamente",
            "ruta_audio": ruta,
            "id_focus_group": id_focus_group
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@focus_groups_bp.route('/focus-groups/procesar-audio/<int:id_focus_group>', methods=['POST'])
def procesar_audio_focus_group(id_focus_group):
    try:
        data = request.get_json()
        if not data or not data.get("ruta_audio"):
            return jsonify({"error": "Se requiere ruta_audio en el body"}), 400

        ruta_audio = data["ruta_audio"]
        if not os.path.exists(ruta_audio):
            return jsonify({"error": "Archivo de audio no encontrado"}), 404

        with Session(engine) as session:
            fg = session.get(FocusGroup, id_focus_group)
            if not fg:
                return jsonify({"error": "Focus group no encontrado"}), 404

            model = configurar_gemini()
            audio_subido = genai.upload_file(ruta_audio)

            prompt = """
Eres un asistente que analiza grabaciones de sesiones de focus group para levantamiento de requisitos de software.

Escucha el audio y extrae:
1. Una transcripción resumida de la sesión
2. Las conclusiones principales obtenidas
3. Los temas principales discutidos con sus conclusiones

Responde ÚNICAMENTE con un JSON con esta estructura exacta, sin texto extra:
{
  "transcripcion": "resumen de la sesión",
  "conclusiones": ["conclusión 1", "conclusión 2"],
  "temas": [
    {
      "tema": "nombre del tema",
      "conclusiones": "conclusión específica de este tema"
    }
  ]
}
"""
            respuesta_gemini = model.generate_content([prompt, audio_subido])
            texto = respuesta_gemini.text.strip()

            if texto.startswith("```"):
                texto = texto.split("```")[1]
                if texto.startswith("json"):
                    texto = texto[4:]

            resultado = json.loads(texto)

            # Actualizar focus group con los datos de la IA
            fg.transcripcion = resultado.get("transcripcion")
            fg.conclusiones = resultado.get("conclusiones", [])
            fg.estado = "realizado"

            # Agregar temas detectados por la IA
            orden_actual = len(fg.temas) + 1
            temas_creados = []
            for t in resultado.get("temas", []):
                if t.get("tema", "").strip():
                    tema = FocusGroupTema(
                        id_focus_group=id_focus_group,
                        tema=t["tema"].strip(),
                        conclusiones=t.get("conclusiones"),
                        orden=orden_actual,
                    )
                    session.add(tema)
                    temas_creados.append(t["tema"])
                    orden_actual += 1

            session.commit()

            return jsonify({
                "mensaje": "Audio procesado exitosamente por Gemini",
                "transcripcion": fg.transcripcion,
                "conclusiones": fg.conclusiones,
                "temas_detectados": temas_creados,
            }), 200

    except json.JSONDecodeError:
        return jsonify({"error": "Gemini no devolvió un JSON válido, intenta de nuevo"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500