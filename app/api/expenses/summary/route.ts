import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth"

const CATEGORY_PRIORITY: Record<string, number> = {
  Food: 1,
  Transport: 2,
  Bills: 3,
  Shopping: 4,
  Other: 5,
}

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryParam = searchParams.get("category")
    const starredParam = searchParams.get("starred")
    const qParam = searchParams.get("q")

    const where: any = {
      userId: user.id,
    }

    if (categoryParam) {
      where.category = categoryParam
    }

    if (starredParam === "true") {
      where.starred = true
    }

    if (qParam && qParam.trim()) {
      const qClean = qParam.trim()
      where.OR = [
        { title: { contains: qClean, mode: "insensitive" } },
        { note: { contains: qClean, mode: "insensitive" } },
      ]
    }

    const expenses = await prisma.expense.findMany({
      where,
      select: {
        id: true,
        amount: true,
        category: true,
        starred: true,
      },
    })

    const count = expenses.length
    const starredCount = expenses.filter((e) => e.starred).length
    const totalAmount = Math.round(expenses.reduce((sum, e) => sum + e.amount, 0) * 100) / 100

    // Compute category breakdown
    const categoryMap = new Map<string, { count: number; total: number }>()
    for (const exp of expenses) {
      const cat = exp.category
      const existing = categoryMap.get(cat) ?? { count: 0, total: 0 }
      existing.count += 1
      existing.total = Math.round((existing.total + exp.amount) * 100) / 100
      categoryMap.set(cat, existing)
    }

    // "breakdown has one entry per category present in the matching set, ordered by total amount descending;
    // equal totals are ordered Food, then Transport, then Bills, then Shopping, then Other."
    const breakdown = Array.from(categoryMap.entries())
      .map(([category, stats]) => ({
        category,
        count: stats.count,
        total: stats.total,
      }))
      .sort((a, b) => {
        if (b.total !== a.total) {
          return b.total - a.total // descending
        }
        const prioA = CATEGORY_PRIORITY[a.category] ?? 99
        const prioB = CATEGORY_PRIORITY[b.category] ?? 99
        return prioA - prioB
      })

    return NextResponse.json(
      {
        count,
        starredCount,
        totalAmount,
        breakdown,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("GET /api/expenses/summary error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
