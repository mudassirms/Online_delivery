from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
load_dotenv()


DATABASE_URL = "mysql+pymysql://root:khansa@localhost:3306/online_delivery"

engine = create_engine(DATABASE_URL, echo=True)  # echo=True for SQL logs
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
