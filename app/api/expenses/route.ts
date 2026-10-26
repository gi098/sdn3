import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth"
import { validateExpenseField } from "@/lib/validations"

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
        title: true,
        amount: true,
        category: true,
        note: true,
        starred: true,
        spentAt: true,
        createdAt: true,
      },
    })

    // "ordered by spentAt descending (most recent first); ties broken by title, alphabetically, case-insensitive."
    expenses.sort((a, b) => {
      const dateA = String(a.spentAt).slice(0, 10)
      const dateB = String(b.spentAt).slice(0, 10)
      if (dateA !== dateB) {
        return dateB.localeCompare(dateA) // descending
      }
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
    })

    const formattedExpenses = expenses.map((e) => ({
      ...e,
      spentAt: String(e.spentAt).slice(0, 10),
      createdAt: e.createdAt.toISOString(),
    }))

    return NextResponse.json(formattedExpenses, { status: 200 })
  } catch (error) {
    console.error("GET /api/expenses error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { title, amount, category, note, spentAt } = body

    // Validate in order: title, amount, category, date
    const titleErr = validateExpenseField("title", title)
    if (titleErr) return NextResponse.json({ error: titleErr }, { status: 400 })

    const amountErr = validateExpenseField("amount", amount)
    if (amountErr) return NextResponse.json({ error: amountErr }, { status: 400 })

    const categoryErr = validateExpenseField("category", category)
    if (categoryErr) return NextResponse.json({ error: categoryErr }, { status: 400 })

    const dateErr = validateExpenseField("spentAt", spentAt)
    if (dateErr) return NextResponse.json({ error: dateErr }, { status: 400 })

    const trimmedTitle = String(title).trim()
    const parsedAmount = Math.round(Number(amount) * 100) / 100
    const formattedSpentAt = String(spentAt).slice(0, 10)
    const trimmedNote = note !== undefined && note !== null ? String(note).trim() : ""

    // Duplicate check: same title, amount and spentAt already saved by this user
    const existing = await prisma.expense.findFirst({
      where: {
        userId: user.id,
        title: { equals: trimmedTitle, mode: "insensitive" },
        amount: parsedAmount,
        spentAt: formattedSpentAt,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Duplicate expense: an expense with the same title, amount and date already exists" },
        { status: 409 }
      )
    }

    const created = await prisma.expense.create({
      data: {
        userId: user.id,
        title: trimmedTitle,
        amount: parsedAmount,
        category: String(category).trim(),
        note: trimmedNote,
        starred: false,
        spentAt: formattedSpentAt,
      },
      select: {
        id: true,
        title: true,
        amount: true,
        category: true,
        note: true,
        starred: true,
        spentAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        ...created,
        spentAt: String(created.spentAt).slice(0, 10),
        createdAt: created.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/expenses error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
