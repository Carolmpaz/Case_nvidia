import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load .env from project root
load_dotenv()

def _clean_db_url(url: str) -> str:
    if url is None:
        return None
    # strip whitespace and surrounding quotes
    url = url.strip()
    if (url.startswith('"') and url.endswith('"')) or (url.startswith("'") and url.endswith("'")):
        url = url[1:-1]
    return url

DATABASE_URL = _clean_db_url(os.getenv("DATABASE_URL"))

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Please add it to your .env file or environment variables.")

# Create engine with clearer errors
try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
except Exception as e:
    raise RuntimeError(f"Failed to create SQLAlchemy engine from DATABASE_URL: {e}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_session():
    return SessionLocal()
