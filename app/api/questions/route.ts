// app/api/get_categories/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server';


export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category');
  let categoryId = 0
  if (category != "all"){
    categoryId = Number(category);
  }

  const question = await prisma.question.findMany({
    orderBy: { id: 'asc' },
    where: category === "all" ? {} : { categoryId },
    select: { id: true, q: true, explaining: true, categoryId:true , choices:{select:{id: true, text:true,isCorrect:true}}}
  })

  // 配列をシャッフル
  function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 配列にユーザー入力欄を追加
  const data = shuffle(
    question.map(item => ({
      ...item,
      choices: shuffle(
        item.choices.map(c => ({ ...c, userAnswer: false }))
      )
    }))
  );
  return NextResponse.json(data)
}