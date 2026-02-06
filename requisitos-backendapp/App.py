from sqlalchemy import create_engine,text #importamos clase create engine del ORM sqlAlchemy
from sqlalchemy.exc import SQLAlchemyError
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


engine = create_engine('postgresql+psycopg2://postgres:root\
@localhost:5432/postgres')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React (CRA)
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/login")
def login(data: LoginRequest):
    try:
        with engine.connect() as conn:
            query = text("""
                SELECT id, nombre, email
                FROM usuarios
                WHERE email = :email
                AND password = :password
            """)
            result = conn.execute(
                query,
                {
                    "email": data.email,
                    "password": data.password
                }
            ).fetchone()

            if result is None:
                raise HTTPException(
                    status_code=401,
                    detail="Email o password incorrectos"
                )

            return {
                "message": "Login exitoso",
                "user": {
                    "id": result.id,
                    "nombre": result.nombre,
                    "email": result.email
                }
            }

    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=str(e))

"""
try:
    with engine.connect() as conn:
        print("conexion con postgree realizada")

except SQLAlchemyError as e:
    print("fallo la conexion")
    print(e)

"""

