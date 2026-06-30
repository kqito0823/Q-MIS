"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Item {
  id: string;
  name: string;
}

export default function Home() {
  const router = useRouter();
  const [category, setCategory] = useState<Item[]>([]);
  const [chosen, setChosen] = useState<string>("all");

  const handleStart = () => {
    if (chosen === "") return;
    router.push(`/quiz?categories=${chosen}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/get_categories");
      const data = await res.json();
      setCategory(data);
    };
    fetchData();
  }, []);
  return (
    <>
      {category.length > 0 ? (
        <div className="px-10 py-10 flex flex-col gap-9">
          {/* ヘッダー */}
          <div className="relative bg-white rounded-2xl border border-gray-200 px-8 py-8">
            <div className="absolute top-0 left-0 w-10 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-r-full" />

            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-[11px] font-semibold tracking-[0.15em] uppercase border border-blue-200">
                Mini Test
              </span>
              <span className="text-gray-400 text-xs">経営情報システム論</span>
            </div>

            <h1 className="text-[26px] sm:text-3xl font-bold text-gray-900 tracking-tight mb-4">
              一問一答
              <span className="ml-2 text-base font-normal text-gray-400">
                / Quiz
              </span>
            </h1>

            <div className="text-sm text-gray-500 leading-relaxed space-y-1 max-w-xl">
              <p>
                皆さん、経営情報システム論の期末対策進んでますか？私はやってません。
              </p>
              <p>
                なので、出題された小テストを
                <span className="text-blue-600 font-medium">一問一答形式</span>
                で解けるWebサイトを作りました。
              </p>
            </div>

            <p className="mt-5 text-xs text-gray-400 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-pink-400" />
              簡素な作りではありますが、ぜひご利用いただけると光栄です♡
            </p>
          </div>

          {/* カテゴリ選択 */}
          <div>
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {/* すべて */}
              <span>
                <input
                  type="radio"
                  id="-1"
                  name="category"
                  value="all"
                  checked={chosen === "all"}
                  onChange={() => setChosen("all")}
                  className="sr-only peer"
                />
                <label
                  htmlFor="-1"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg border border-gray-200 bg-white text-gray-500 text-sm font-medium cursor-pointer transition-all
                hover:border-gray-900 hover:text-gray-900
                peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white
                peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue-400"
                >
                  すべて
                </label>
              </span>

              {/* カテゴリ一覧 */}
              {category.map((d, i) => (
                <span key={i}>
                  <input
                    type="radio"
                    id={d.id}
                    name="category"
                    value={d.id}
                    checked={chosen === d.id}
                    onChange={() => setChosen(d.id)}
                    className="sr-only peer"
                  />
                  <label
                    htmlFor={d.id}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg border border-gray-200 bg-white text-gray-500 text-sm font-medium cursor-pointer transition-all
                  hover:border-gray-900 hover:text-gray-900
                  peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white
                  peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue-400"
                  >
                    {d.name}
                  </label>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={chosen === ""}
            className="self-start px-9 py-3 rounded-lg text-[15px] font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 transition-all
          hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.97]
          disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:shadow-none"
          >
            開始する →
          </button>
        </div>
      ) : (
        <p className="text-gray-400 text-sm text-center py-8 animate-pulse">
          読み込み中…
        </p>
      )}
    </>
  );
}
