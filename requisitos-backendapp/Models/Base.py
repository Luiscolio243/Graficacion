from sqlalchemy.orm import DeclarativeBase

#Con esta clase establecemos la comunicacion de clases de python a una conexion con las tablas en postgree
class Base(DeclarativeBase):
    pass