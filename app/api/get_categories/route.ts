// app/api/get_categories/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { id: 'asc' },
    where: { isAvailable: true },
    select: { id: true, name: true,}
  })
  console.log(categories)
  return NextResponse.json(categories)
}