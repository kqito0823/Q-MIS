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
        <div className="px-10 py-8 flex flex-col gap-8">
          <div className="flex flex-wrap gap-2.5">
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
                className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-full border-[1.5px] border-gray-300 bg-white text-gray-500 text-sm cursor-pointer transition-all
                hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50
                peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-checked:text-white
                peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue-400"
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-70 hidden peer-checked:block" />
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
                  className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-full border-[1.5px] border-gray-300 bg-white text-gray-500 text-sm cursor-pointer transition-all
                  hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50
                  peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-checked:text-white
                  peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue-400"
                >
                  <span className="w-2 h-2 rounded-full bg-current opacity-70 hidden peer-checked:block" />
                  {d.name}
                </label>
              </span>
            ))}
          </div>

          <button
            onClick={handleStart}
            disabled={chosen === ""}
            className="self-start px-8 py-2.5 rounded-full text-[15px] font-medium text-white bg-blue-500 transition-all
            hover:bg-blue-600 active:scale-[0.97]
            disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            開始
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
