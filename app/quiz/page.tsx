"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { discoverValidationDepths } from "next/dist/server/app-render/instant-validation/instant-validation";

interface Quiz {
  id: number;
  q: string;
  choices: Choice[];
  explaining: string;
}

interface Choice {
  id: number;
  text: string;
  isCorrect: boolean;
  userAnswer: boolean;
}

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categories = searchParams.get("categories") ?? "";
  const [displayQuiz, setDisplayQuiz] = useState<number>(0);
  const [quiz, setQuiz] = useState<Quiz[]>([]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [correct, setCorrect] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [toggleGrade, setToggleGrade] = useState<boolean>(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      const res = await fetch(`/api/questions?category=${categories}`);
      const data: Quiz[] = await res.json();
      setQuiz(data);
    };
    if (categories) fetchQuiz();
  }, [categories]);

  const handleEnd = () => {
    if (window.confirm("クイズを終了しますか?進捗が失われます")) {
      router.push(`/`);
    }
  };

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

    const isCorrect = quiz[displayQuiz].choices[choiceIndex].isCorrect;
    if (isCorrect) {
      setCorrect((prev) => [...prev, quiz[displayQuiz].id]);
    } else {
      setWrong((prev) => [...prev, quiz[displayQuiz].id]);
    }

    setFeedback(isCorrect ? "correct" : "wrong");
    setTimeout(() => setFeedback(null), 400);
  };

  const handleToggle = () => {
    setToggleGrade((prev) => !prev);
  };

  const current = quiz[displayQuiz];
  const total = quiz.length;
  const correctCnt = correct.length;
  const wrongCnt = wrong.length;
  const correctRate =
    correctCnt + wrongCnt == 0
      ? 0
      : Math.round((correctCnt / (correctCnt + wrongCnt)) * 100);

  return (
    <div className="bg-gray-100">
      {current ? (
        <div className=" bg-white px-4 py-10 sm:px-6">
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
            {/* 正答率 */}
            {(correctCnt !== 0 || wrongCnt !== 0) && (
              <div className="flex gap-5 text-sm font-semibold text-gray-600">
                <p>
                  正解数 <span className="text-gray-900">{correctCnt}</span>
                  <span className="text-gray-400">
                    /{correctCnt + wrongCnt}
                  </span>
                </p>
                <p>
                  正答率{" "}
                  <span className="text-blue-600">
                    {correctRate.toFixed(0)}%
                  </span>
                </p>
              </div>
            )}
            <div
              className={`relative bg-white rounded-2xl border px-6 py-8 sm:px-8 flex flex-col gap-6
                transition-all duration-300 ease-out
                ${
                  feedback === "correct"
                    ? " border-blue-400 ring-4 ring-blue-100 bg-blue-50/40"
                    : feedback === "wrong"
                      ? " border-red-300 ring-4 ring-red-100 bg-red-50/40"
                      : " border-gray-200 ring-0"
                }`}
            >
              <p className="text-[17px] leading-relaxed font-semibold text-gray-900">
                {current.q}
              </p>

              <div className="flex flex-col gap-2">
                {/*回答済みかどうか*/}
                {current.choices.some((item) => item.userAnswer === true)
                  ? current.choices.map((choice, i) => {
                      const isCorrect = choice.isCorrect;
                      const isUserAnswer = choice.userAnswer;
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between gap-3 px-5 py-3.5 rounded-lg border text-sm transition-all duration-300
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

            {current.choices.some((item) => item.userAnswer === true) &&
              current.explaining && (
                <div className="flex gap-3 px-5 py-4 rounded-lg bg-gray-50 border border-gray-200 animate-in fade-in slide-in-from-top-1 duration-300">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">
                    ?
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-gray-400 tracking-wide">
                      解説
                    </span>
                    <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                      {current.explaining}
                    </p>
                  </div>
                </div>
              )}

            {/* ナビゲーション */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setFeedback(null);
                  setDisplayQuiz((prev) => prev - 1);
                }}
                disabled={displayQuiz === 0}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-500 bg-white border border-gray-200 transition-all
              hover:border-gray-900 hover:text-gray-900
              disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-500"
              >
                ← 前へ
              </button>

              <button
                onClick={() => {
                  setFeedback(null);
                  setDisplayQuiz((prev) => prev + 1);
                }}
                disabled={displayQuiz === quiz.length - 1}
                className="px-7 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 transition-all
              hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.97]
              disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-none"
              >
                次へ →
              </button>
            </div>

            {/*全問達成 */}
            {correctCnt + wrongCnt === total && (
              <div className="flex flex-col gap-5 px-6 py-8 sm:px-8 rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50/60 to-purple-50/60">
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-lg font-bold text-gray-900">全問達成</p>
                  <p className="text-sm font-semibold text-gray-500">
                    おめでとう！！
                  </p>
                </div>

                <div className="flex justify-center gap-6 text-sm font-semibold text-gray-600">
                  <p>
                    正解数 <span className="text-gray-900">{correctCnt}</span>
                    <span className="text-gray-400">/{total}</span>
                  </p>
                  <p>
                    正答率{" "}
                    <span className="text-blue-600">
                      {correctRate.toFixed(0)}%
                    </span>
                  </p>
                </div>

                <button
                  onClick={handleToggle}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
                >
                  成績の詳細を{toggleGrade ? "閉じる" : "見る"}
                  <span
                    className={`transition-transform duration-200 ${toggleGrade ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>

                {toggleGrade && (
                  <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] font-bold text-red-400 tracking-wide">
                        間違えた問題 ({wrong.length})
                      </p>
                      <ul className="flex flex-col gap-2">
                        {wrong.map((w) => {
                          const q = quiz.find((item) => item.id === w);
                          const answer = q?.choices.find((c) => c.isCorrect);
                          return q ? (
                            <li
                              key={w}
                              className="px-4 py-3 rounded-lg bg-white border border-red-200 text-sm text-gray-700 flex flex-col gap-1"
                            >
                              <p>{q.q}</p>
                              <p className="text-xs font-semibold text-gray-400">
                                答え:{" "}
                                <span className="text-gray-900">
                                  {answer?.text}
                                </span>
                              </p>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] font-bold text-blue-400 tracking-wide">
                        正解した問題 ({correct.length})
                      </p>
                      <ul className="flex flex-col gap-2">
                        {correct.map((c) => {
                          const q = quiz.find((item) => item.id === c);
                          const answer = q?.choices.find(
                            (choice) => choice.isCorrect,
                          );
                          return q ? (
                            <li
                              key={c}
                              className="px-4 py-3 rounded-lg bg-white border border-blue-200 text-sm text-gray-700 flex flex-col gap-1"
                            >
                              <p>{q.q}</p>
                              <p className="text-xs font-semibold text-gray-400">
                                答え:{" "}
                                <span className="text-gray-900">
                                  {answer?.text}
                                </span>
                              </p>
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 終了ボタン */}
            <div className="flex justify-center items-center ">
              <button
                onClick={handleEnd}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-500 bg-white border border-gray-200 transition-all
  hover:border-gray-900 hover:text-gray-900"
              >
                終わる
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
          問題制作中。。。
        </div>
      )}
    </div>
  );
}

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
