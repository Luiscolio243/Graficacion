from flask import Flask
from flask_cors import CORS
from config import Config
from db import engine
from Routers.auth import auth_bp
from Routers.proyectos import proyectos_bp
from Routers.roles import roles_bp
from Routers.stakeholders import stakeholders_bp
from Routers.procesos import procesos_bp
from Routers.entrevistas import entrevistas_bp
from Routers.entrevistaPreguntas import entrevista_preguntas_bp
from Routers.Encuestas import encuestas_bp
from Routers.Equipo_ti_router import equipo_ti_bp
from Routers.Seguimiento import seguimiento_bp
from Routers.Observaciones import observaciones_bp
from Routers.FocusGroup import focus_groups_bp
from Routers.responderEncuesta import responder_encuesta_bp
from Routers.historiasUsuario import historias_bp

Config.validate()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Registro de todos los blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(proyectos_bp)
app.register_blueprint(roles_bp)
app.register_blueprint(stakeholders_bp)
app.register_blueprint(procesos_bp)
app.register_blueprint(entrevistas_bp)
app.register_blueprint(entrevista_preguntas_bp)
app.register_blueprint(encuestas_bp)
app.register_blueprint(equipo_ti_bp)
app.register_blueprint(seguimiento_bp)
app.register_blueprint(observaciones_bp)
app.register_blueprint(focus_groups_bp)
app.register_blueprint(historias_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=Config.FLASK_PORT, debug=Config.FLASK_ENV == 'development')
