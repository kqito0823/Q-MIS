"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface Quiz {
  q: string;
  choices: Choice[];
}

interface Choice {
  text: string;
  isCorrect: boolean;
  userAnswer: boolean;
}

function QuizContent() {
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
  console.log(quiz);
  const handleUserAnswer = (choiceIndex: number) => {
    setQuiz((prevQuiz) =>
      prevQuiz.map((q, qIndex) => {
        if (qIndex !== displayQuiz) return q;
        return {
          ...q,
          choices: q.choices.map((choice, cIndex) => ({
            ...choice,
            userAnswer: cIndex === choiceIndex,
          })),
        };
      }),
    );
  };
  const current = quiz[displayQuiz];

  return (
    <>
      {current ? (
        <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
          <div className="max-w-xl mx-auto flex flex-col gap-6">
            {/* 進捗バー */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${((displayQuiz + 1) / quiz.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs font-medium text-gray-400 tabular-nums whitespace-nowrap">
                {displayQuiz + 1} / {quiz.length}
              </span>
            </div>

            {/* 問題カード */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 py-8 sm:px-8 flex flex-col gap-6">
              <p className="text-[17px] leading-relaxed font-medium text-gray-800">
                {current.q}
              </p>

              <div className="flex flex-col gap-2.5">
                {current.choices.some((item) => item.userAnswer === true)
                  ? current.choices.map((choice, i) => {
                      const isCorrect = choice.isCorrect;
                      const isUserAnswer = choice.userAnswer;
                      return (
                        <div
                          key={i}
                          className={`relative flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl border-[1.5px] text-sm transition-colors
                            ${
                              isCorrect
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : isUserAnswer
                                  ? "border-red-300 bg-red-50 text-red-600"
                                  : "border-gray-200 bg-white text-gray-500"
                            }`}
                        >
                          <span className="font-medium">{choice.text}</span>
                          <span className="flex items-center gap-1.5 shrink-0">
                            {isCorrect && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                                正解
                              </span>
                            )}
                            {isUserAnswer && !isCorrect && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-400 text-white">
                                あなたの回答
                              </span>
                            )}
                            {isUserAnswer && isCorrect && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white text-blue-600 border border-blue-300">
                                あなたの回答
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })
                  : current.choices.map((choice, i) => (
                      <button
                        key={i}
                        onClick={() => handleUserAnswer(i)}
                        className="text-left px-5 py-3.5 rounded-2xl border-[1.5px] border-gray-200 bg-white text-sm font-medium text-gray-600 transition-all
                        hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50
                        active:scale-[0.98]
                        focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                      >
                        {choice.text}
                      </button>
                    ))}
              </div>
            </div>

            {/* ナビゲーション */}
            <div className="flex items-center justify-between px-1">
              <button
                onClick={() => setDisplayQuiz((prev) => prev - 1)}
                disabled={displayQuiz === 0}
                className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-500 bg-white border-[1.5px] border-gray-300 transition-all
                hover:border-blue-400 hover:text-blue-500
                disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-500"
              >
                前へ
              </button>

              <button
                onClick={() => setDisplayQuiz((prev) => prev + 1)}
                disabled={displayQuiz === quiz.length - 1}
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white bg-blue-500 transition-all
                hover:bg-blue-600 active:scale-[0.97]
                disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                次へ
              </button>
            </div>
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

// ページコンポーネントはSuspenseでラップするだけ
export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm animate-pulse">
          読み込み中…
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
