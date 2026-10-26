import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth"
import { validateExpenseField } from "@/lib/validations"

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await props.params

    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const { title, amount, category, note, spentAt, starred } = body

    const updateData: any = {}

    if (title !== undefined) {
      const titleErr = validateExpenseField("title", title)
      if (titleErr) return NextResponse.json({ error: titleErr }, { status: 400 })
      updateData.title = String(title).trim()
    }

    if (amount !== undefined) {
      const amountErr = validateExpenseField("amount", amount)
      if (amountErr) return NextResponse.json({ error: amountErr }, { status: 400 })
      updateData.amount = Math.round(Number(amount) * 100) / 100
    }

    if (category !== undefined) {
      const categoryErr = validateExpenseField("category", category)
      if (categoryErr) return NextResponse.json({ error: categoryErr }, { status: 400 })
      updateData.category = String(category).trim()
    }

    if (spentAt !== undefined) {
      const dateErr = validateExpenseField("spentAt", spentAt)
      if (dateErr) return NextResponse.json({ error: dateErr }, { status: 400 })
      updateData.spentAt = String(spentAt).slice(0, 10)
    }

    if (note !== undefined) {
      updateData.note = String(note).trim()
    }

    if (starred !== undefined) {
      updateData.starred = Boolean(starred)
    }

    // Check duplicate if title, amount or spentAt is modified
    const finalTitle = updateData.title ?? existingExpense.title
    const finalAmount = updateData.amount ?? existingExpense.amount
    const finalSpentAt = updateData.spentAt ?? existingExpense.spentAt

    if (
      (updateData.title !== undefined || updateData.amount !== undefined || updateData.spentAt !== undefined) &&
      (finalTitle !== existingExpense.title ||
        finalAmount !== existingExpense.amount ||
        finalSpentAt !== existingExpense.spentAt)
    ) {
      const duplicate = await prisma.expense.findFirst({
        where: {
          userId: user.id,
          id: { not: id },
          title: { equals: finalTitle, mode: "insensitive" },
          amount: finalAmount,
          spentAt: finalSpentAt,
        },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: "Duplicate expense: an expense with the same title, amount and date already exists" },
          { status: 409 }
        )
      }
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: updateData,
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
        ...updated,
        spentAt: String(updated.spentAt).slice(0, 10),
        createdAt: updated.createdAt.toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("PATCH /api/expenses/:id error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await props.params

    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    await prisma.expense.delete({
      where: { id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("DELETE /api/expenses/:id error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
