from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from config import Config

engine = create_engine(Config.DATABASE_URL)
secret_key = Config.SECRET_KEY