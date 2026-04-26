from flask import Blueprint, request, jsonify
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from datetime import datetime, date
from db import engine
from Models.Entrevistas import Entrevistas
from Models.EntrevistasPreguntas import EntrevistaPreguntas
from sqlalchemy.exc import SQLAlchemyError
import google.generativeai as genai
import os
import json

entrevistas_bp = Blueprint('entrevistas', __name__)

#Esta funcion es para configurar la IA de Gemini
def configurar_gemini():
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    return genai.GenerativeModel("gemini-2.5-flash")


#Esta funcion es para convertir el formato de fecha en sql a un objeto que sea de tipo date
def parsear_fecha(fecha_str: str | None) -> date | None:
    if not fecha_str:
        return None
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(fecha_str, fmt).date()
        except ValueError:
            continue
    return None

#Es para convertir una entrevista en un json, que al ser un objeto muy grande lo separe en una funcion para mayor orden
def serializar_entrevista(e: Entrevistas, total_preguntas: int = 0) -> dict:
    return {
        "id_entrevista": e.id_entrevista,
        "titulo": e.titulo,
        "id_proyecto": e.id_proyecto,
        "id_subproceso": e.id_subproceso,
        "id_stakeholder": e.id_stakeholder,
        "id_entrevistador": e.id_entrevistador,
        "fecha_programada": e.fecha_programada.isoformat() if e.fecha_programada else None,
        "fecha_realizada": e.fecha_realizada.isoformat() if e.fecha_realizada else None,
        "fecha_creacion": e.fecha_creacion.isoformat() if e.fecha_creacion else None,
        "lugar": e.lugar,
        "objetivo": e.objetivo,
        "estado": e.estado,
        "audio_url": e.audio_url,
        "procesado_ia": e.procesado_ia,
        "total_preguntas": total_preguntas,
    }


#Retorna absolutamente de todas las entrevistas que hay en tal proyecto ademas de devolver un conteto de preguntas
@entrevistas_bp.route('/entrevistas/<int:id_proyecto>', methods=['GET'])
def obtener_entrevistas(id_proyecto):
    try:
        with Session(engine) as session:
            entrevistas = session.scalars(
                select(Entrevistas).where(Entrevistas.id_proyecto == id_proyecto)
            ).all()

            resultado = []
            for e in entrevistas:
                try:                         
                    total = session.scalar(
                        select(func.count()).where(
                            EntrevistaPreguntas.id_entrevista == e.id_entrevista
                        )
                    )
                    resultado.append(serializar_entrevista(e, total_preguntas=total))
                except Exception as inner:
                    print(f"ERROR serializando entrevista {e.id_entrevista}: {inner}")
                    raise

            return jsonify(resultado), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:                   
        return jsonify({"error": str(e)}), 500


#Crea de una entrevista en un cierto proyecto que se envia el id como parametro
@entrevistas_bp.route('/entrevistas/crear', methods=['POST'])
def crear_entrevista():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido o vacío"}), 400

        campos_obligatorios = ["id_proyecto", "id_stakeholder", "id_entrevistador", "titulo"]
        faltantes = [c for c in campos_obligatorios if not data.get(c)]
        if faltantes:
            return jsonify({
                "error": f"Faltan campos obligatorios: {', '.join(faltantes)}"
            }), 400

        with Session(engine) as session:
            entrevista = Entrevistas(
                id_proyecto=data["id_proyecto"],
                id_stakeholder=data["id_stakeholder"],
                id_entrevistador=data["id_entrevistador"],
                titulo=data["titulo"],
                id_subproceso=data.get("id_subproceso"),        # opcional
                fecha_programada=parsear_fecha(data.get("fecha_programada")),
                lugar=data.get("lugar"),
                objetivo=data.get("objetivo"),
                estado="planificada",
                procesado_ia=False,
                fecha_creacion=datetime.now(),
            )
            session.add(entrevista)
            session.commit()
            session.refresh(entrevista)

            return jsonify({
                "mensaje": "Entrevista creada exitosamente",
                "entrevista": serializar_entrevista(entrevista)
            }), 201

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


#Obtiene de los detalles de las entrevistas asi como las preguntas de esa entrevista
@entrevistas_bp.route('/entrevistas/detalle/<int:id_entrevista>', methods=['GET'])
def obtener_entrevista(id_entrevista):
    try:
        with Session(engine) as session:
            entrevista = session.get(Entrevistas, id_entrevista)

            if not entrevista:
                return jsonify({"error": "Entrevista no encontrada"}), 404

            preguntas = session.scalars(
                select(EntrevistaPreguntas)
                .where(EntrevistaPreguntas.id_entrevista == id_entrevista)
                .order_by(EntrevistaPreguntas.orden)
            ).all()

            data = serializar_entrevista(entrevista, total_preguntas=len(preguntas))
            data["preguntas"] = [
                {
                    "id_ent_prg": p.id_ent_prg,
                    "pregunta": p.pregunta,
                    "respuesta": p.respuesta,
                    "orden": p.orden,
                    "origen": p.origen,
                    "timestamp_audio": p.timestamp_audio,
                }
                for p in preguntas
            ]
            return jsonify(data), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


#Actualizar una entrevista con los campos que se mandan con este endpoint
@entrevistas_bp.route('/entrevistas/actualizar/<int:id_entrevista>', methods=['PATCH'])
def actualizar_entrevista(id_entrevista):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido o vacío"}), 400

        campos_editables = [
            "titulo", "lugar", "objetivo", "estado",
            "audio_url", "procesado_ia", "fecha_programada", "fecha_realizada"
        ]

        with Session(engine) as session:
            entrevista = session.get(Entrevistas, id_entrevista)
            if not entrevista:
                return jsonify({"error": "Entrevista no encontrada"}), 404

            for campo in campos_editables:
                if campo in data:
                    if campo in ("fecha_programada", "fecha_realizada"):
                        setattr(entrevista, campo, parsear_fecha(data[campo]))
                    else:
                        setattr(entrevista, campo, data[campo])

            session.commit()
            session.refresh(entrevista)
            return jsonify({
                "mensaje": "Entrevista actualizada",
                "entrevista": serializar_entrevista(entrevista)
            }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


#Se eleimina de la entrevista y tambien de las preguntas que se le crearon a esa entrevista
@entrevistas_bp.route('/entrevistas/eliminar/<int:id_entrevista>', methods=['DELETE'])
def eliminar_entrevista(id_entrevista):
    try:
        with Session(engine) as session:
            entrevista = session.get(Entrevistas, id_entrevista)
            if not entrevista:
                return jsonify({"error": "Entrevista no encontrada"}), 404

            session.delete(entrevista)
            session.commit()
            return jsonify({"mensaje": "Entrevista eliminada correctamente"}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500




@entrevistas_bp.route('/entrevistas/subir-audio/<int:id_entrevista>', methods=['POST'])
def subir_audio(id_entrevista):
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No se envió ningún archivo de audio"}), 400

        archivo = request.files['audio']
        if archivo.filename == '':
            return jsonify({"error": "Archivo sin nombre"}), 400

        with Session(engine) as session:
            entrevista = session.get(Entrevistas, id_entrevista)
            if not entrevista:
                return jsonify({"error": "Entrevista no encontrada"}), 404

        # Guardar audio temporalmente
        carpeta = "temp_audios"
        os.makedirs(carpeta, exist_ok=True)
        ruta = os.path.join(carpeta, f"entrevista_{id_entrevista}_{archivo.filename}")
        archivo.save(ruta)

        # Actualizar audio_url en la entrevista
        with Session(engine) as session:
            entrevista = session.get(Entrevistas, id_entrevista)
            if entrevista:
                entrevista.audio_url = ruta
                session.commit()

        return jsonify({
            "mensaje": "Audio subido correctamente",
            "ruta_audio": ruta,
            "id_entrevista": id_entrevista
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── POST /entrevistas/procesar-audio/<id_entrevista> ─────────────────────────
@entrevistas_bp.route('/entrevistas/procesar-audio/<int:id_entrevista>', methods=['POST'])
def procesar_audio(id_entrevista):
    """
    Envía el audio a Gemini para que:
    1. Responda las preguntas existentes de la entrevista
    2. Detecte preguntas nuevas que surgieron durante la entrevista
    3. Marque la entrevista como procesada
    """
    try:
        data = request.get_json()
        if not data or not data.get("ruta_audio"):
            return jsonify({"error": "Se requiere ruta_audio en el body"}), 400

        ruta_audio = data["ruta_audio"]
        if not os.path.exists(ruta_audio):
            return jsonify({"error": "Archivo de audio no encontrado"}), 404

        with Session(engine) as session:
            entrevista = session.get(Entrevistas, id_entrevista)
            if not entrevista:
                return jsonify({"error": "Entrevista no encontrada"}), 404

            if entrevista.procesado_ia:
                return jsonify({"error": "Esta entrevista ya fue procesada por IA"}), 400

            # Obtener preguntas existentes
            preguntas_existentes = session.scalars(
                select(EntrevistaPreguntas)
                .where(EntrevistaPreguntas.id_entrevista == id_entrevista)
                .order_by(EntrevistaPreguntas.orden)
            ).all()

            lista_preguntas = [
                {"id_ent_prg": p.id_ent_prg, "pregunta": p.pregunta}
                for p in preguntas_existentes
            ]

            # Preparar y enviar audio a Gemini
            model = configurar_gemini()
            audio_subido = genai.upload_file(ruta_audio)

            prompt = f"""
Eres un asistente que analiza grabaciones de entrevistas de levantamiento de requisitos de software.

Se te proporciona el audio de una entrevista. Tu tarea es:

1. Para cada pregunta de esta lista, encuentra la respuesta en el audio:
{json.dumps(lista_preguntas, ensure_ascii=False, indent=2)}

2. Detecta si durante la entrevista surgieron preguntas ADICIONALES que no están en la lista anterior.

Responde ÚNICAMENTE con un JSON con esta estructura exacta, sin texto extra:
{{
  "respuestas": [
    {{
      "id_ent_prg": 1,
      "respuesta": "respuesta encontrada en el audio"
    }}
  ],
  "preguntas_nuevas": [
    {{
      "pregunta": "pregunta nueva detectada en el audio",
      "respuesta": "su respuesta si la hay"
    }}
  ]
}}
"""
            respuesta_gemini = model.generate_content([prompt, audio_subido])
            texto = respuesta_gemini.text.strip()

            if texto.startswith("```"):
                texto = texto.split("```")[1]
                if texto.startswith("json"):
                    texto = texto[4:]

            resultado = json.loads(texto)

            # Actualizar respuestas de preguntas existentes
            for item in resultado.get("respuestas", []):
                pregunta = session.get(EntrevistaPreguntas, item["id_ent_prg"])
                if pregunta and item.get("respuesta"):
                    pregunta.respuesta = item["respuesta"]

            # Crear preguntas nuevas detectadas en el audio en caso de que hayan resultado de imprevisto
            orden_actual = len(preguntas_existentes) + 1
            nuevas_creadas = []
            for nueva in resultado.get("preguntas_nuevas", []):
                p = EntrevistaPreguntas(
                    id_entrevista=id_entrevista,
                    pregunta=nueva["pregunta"],
                    respuesta=nueva.get("respuesta"),
                    orden=orden_actual,
                    origen="ia",
                    timestamp_audio=None
                )
                session.add(p)
                nuevas_creadas.append(nueva["pregunta"])
                orden_actual += 1

            # Marcar entrevista como procesada
            entrevista.procesado_ia = True
            entrevista.estado = "realizada"
            entrevista.fecha_realizada = datetime.now()

            session.commit()

            return jsonify({
                "mensaje": "Audio procesado exitosamente por Gemini",
                "preguntas_respondidas": len(resultado.get("respuestas", [])),
                "preguntas_nuevas_detectadas": len(nuevas_creadas),
                "preguntas_nuevas": nuevas_creadas
            }), 200

    except json.JSONDecodeError:
        return jsonify({"error": "Gemini no devolvió un JSON válido, intenta de nuevo"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


