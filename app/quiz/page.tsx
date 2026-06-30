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
        <div className="min-h-screen bg-white px-4 py-10 sm:px-6">
          <div className="max-w-xl mx-auto flex flex-col gap-7">
            {/* 進捗バー */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${((displayQuiz + 1) / quiz.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-400 tabular-nums whitespace-nowrap tracking-wide">
                {String(displayQuiz + 1).padStart(2, "0")} /{" "}
                {String(quiz.length).padStart(2, "0")}
              </span>
            </div>

            {/* 問題カード */}
            <div className="relative bg-white rounded-2xl border border-gray-200 px-6 py-8 sm:px-8 flex flex-col gap-6">
              <p className="text-[17px] leading-relaxed font-semibold text-gray-900">
                {current.q}
              </p>

              <div className="flex flex-col gap-2">
                {current.choices.some((item) => item.userAnswer === true)
                  ? current.choices.map((choice, i) => {
                      const isCorrect = choice.isCorrect;
                      const isUserAnswer = choice.userAnswer;
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between gap-3 px-5 py-3.5 rounded-lg border text-sm transition-colors
                          ${
                            isCorrect
                              ? "border-blue-500 bg-blue-50/60 text-gray-900"
                              : isUserAnswer
                                ? "border-red-300 bg-red-50/60 text-gray-500"
                                : "border-gray-200 bg-white text-gray-400"
                          }`}
                        >
                          <span className="font-medium">{choice.text}</span>
                          <span className="flex items-center gap-1.5 shrink-0">
                            {isCorrect && (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-gray-900 text-white tracking-wide">
                                正解
                              </span>
                            )}
                            {isUserAnswer && !isCorrect && (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-red-500 text-white tracking-wide">
                                YOUR ANSWER
                              </span>
                            )}
                            {isUserAnswer && isCorrect && (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-white text-blue-600 border border-blue-300 tracking-wide">
                                YOUR ANSWER
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
                        className="group text-left px-5 py-3.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 transition-all
                      hover:border-gray-900 hover:text-gray-900
                      active:scale-[0.98]
                      focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full border-[1.5px] border-gray-300 group-hover:border-gray-900 transition-colors shrink-0" />
                          {choice.text}
                        </span>
                      </button>
                    ))}
              </div>
            </div>

            {/* ナビゲーション */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setDisplayQuiz((prev) => prev - 1)}
                disabled={displayQuiz === 0}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-500 bg-white border border-gray-200 transition-all
              hover:border-gray-900 hover:text-gray-900
              disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-500"
              >
                ← 前へ
              </button>

              <button
                onClick={() => setDisplayQuiz((prev) => prev + 1)}
                disabled={displayQuiz === quiz.length - 1}
                className="px-7 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 transition-all
              hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.97]
              disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-none"
              >
                次へ →
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
