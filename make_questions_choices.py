# このpythonファイルと同じ階層内にdata.csvを用意してください
# data.csvの書き方
# 問題番号,選択肢の何番目が答えか,選択肢,選択肢,選択肢,選択肢,,,,
# ヘッダーは必要ありません
# csvのため必ず文章内にカンマは使用しないでください

import psycopg2
import os
from dotenv import load_dotenv
import csv

load_dotenv()
conn = psycopg2.connect(os.getenv("DATABASE_URL"), options="-c client_encoding=UTF8")
cur = conn.cursor()
questions = []
choices = []
categories = input("今回は第何回ですか？数値で記入してください：")
with open("data.csv", newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    for row in reader:
        # questionをINSERTしてIDを取得
        cur.execute(
            "INSERT INTO questions (q, category_id) VALUES (%s, %s) RETURNING id",
            (row[0], categories),
        )
        question_id = cur.fetchone()[0]  # 採番されたIDを取得

        # choicesをINSERT
        for ci, r in enumerate(row[2:]):
            is_correct = ci + 1 == int(row[1])
            cur.execute(
                "INSERT INTO choices (question_id, text, is_correct) VALUES (%s, %s, %s)",
                (question_id, r, is_correct),
            )
cur.execute("UPDATE categories SET is_available = true WHERE id = %s", (categories,))
conn.commit()
