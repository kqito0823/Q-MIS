import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
conn = psycopg2.connect(os.getenv("DATABASE_URL"), options="-c client_encoding=UTF8")
cur = conn.cursor()
cur.execute("DELETE FROM categories")
cur.executemany(
    "INSERT INTO categories(name,is_available) VALUES (%s,false) ON CONFLICT (name) DO NOTHING",
    [(f"第{i + 1}回",) for i in range(15)],
)
conn.commit()
