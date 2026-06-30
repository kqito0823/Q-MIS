"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Quiz {
  q: string;
  choices: Choice[];
}

interface Choice {
  text: string;
  isCorrect: boolean;
  userAnswer: boolean;
}

export default function QuizPage() {
  const searchParams = useSearchParams();
  const categories = searchParams.get("categories") ?? "";
  const [displayQuiz, setDisplayQuiz] = useState<number>(0);
  const [quiz, setQuiz] = useState<Quiz[]>([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      const res = await fetch(`/api/questions?category=${categories}`);
      const data: Quiz[] = await res.json();
      setQuiz(data);
    };
    if (categories) fetchQuiz();
  }, [categories]);

  const current = quiz[displayQuiz];

  return (
    <>
      {current ? (
        <div>
          <p>{current.q}</p>
          <ul>
            {current.choices.map((choice, i) => (
              <li key={i}>{choice.text}</li>
            ))}
          </ul>
          <div>
            <button
              onClick={() => setDisplayQuiz((prev) => prev - 1)}
              disabled={displayQuiz === 0}
            >
              前へ
            </button>
            <span>
              {displayQuiz + 1} / {quiz.length}
            </span>
            <button
              onClick={() => setDisplayQuiz((prev) => prev + 1)}
              disabled={displayQuiz === quiz.length - 1}
            >
              次へ
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
          問題制作中。。。
        </div>
      )}
    </>
  );
}
