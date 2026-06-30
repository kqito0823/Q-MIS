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
        <div>
          <input
            type="radio"
            id="-1"
            name="category"
            value="all"
            checked={chosen === "all"}
            onChange={() => setChosen("all")}
          />
          <label htmlFor="-1">すべて</label>
          {category.map((d, i) => (
            <div key={i}>
              <input
                type="radio"
                id={d.id}
                name="category"
                value={d.id}
                checked={chosen === d.id}
                onChange={() => setChosen(d.id)}
              />
              <label htmlFor={d.id}>{d.name}</label>
            </div>
          ))}
        </div>
      ) : (
        <p>読み込み中</p>
      )}
      <button onClick={handleStart} disabled={chosen == ""}>
        開始
      </button>
    </>
  );
}
