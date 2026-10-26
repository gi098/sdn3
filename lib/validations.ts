export const ALLOWED_CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Other"] as const
export type ExpenseCategory = typeof ALLOWED_CATEGORIES[number]

export interface ExpenseInput {
  title?: string
  amount?: number | string
  category?: string
  note?: string
  spentAt?: string
  starred?: boolean
}

export function validateExpenseField(
  field: "title" | "amount" | "category" | "spentAt",
  value: any
): string | null {
  if (field === "title") {
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
      return "Title is required"
    }
    if (typeof value === "string" && value.length > 80) {
      return "Title must be at most 80 characters"
    }
    return null
  }

  if (field === "amount") {
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
      return "Amount is required"
    }
    const num = Number(value)
    if (isNaN(num)) {
      return "Amount is required"
    }
    if (num <= 0) {
      return "Amount must be a positive number"
    }
    return null
  }

  if (field === "category") {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return "Please choose a category"
    }
    if (!ALLOWED_CATEGORIES.includes(value as ExpenseCategory)) {
      return "Invalid category"
    }
    return null
  }

  if (field === "spentAt") {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return "Date is required"
    }
    const dateStr = String(value).slice(0, 10)
    // Compare date with today in local date
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, "0")
    const dd = String(today.getDate()).padStart(2, "0")
    const todayStr = `${yyyy}-${mm}-${dd}`

    if (dateStr > todayStr) {
      return "Date cannot be in the future"
    }
    return null
  }

  return null
}

export function validateExpenseInput(data: ExpenseInput, isPartial = false): string | null {
  if (!isPartial || data.title !== undefined) {
    const err = validateExpenseField("title", data.title)
    if (err) return err
  }

  if (!isPartial || data.amount !== undefined) {
    const err = validateExpenseField("amount", data.amount)
    if (err) return err
  }

  if (!isPartial || data.category !== undefined) {
    const err = validateExpenseField("category", data.category)
    if (err) return err
  }

  if (!isPartial || data.spentAt !== undefined) {
    const err = validateExpenseField("spentAt", data.spentAt)
    if (err) return err
  }

  return null
}
