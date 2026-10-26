"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useExpense } from "@/context/ExpenseContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star, Trash2, Search, RotateCcw } from "lucide-react"

const CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Other"]

export default function ExpensesPage() {
  const router = useRouter()
  const {
    user,
    loadingUser,
    expenses,
    summary,
    loadingExpenses,
    categoryFilter,
    starredFilter,
    searchQuery,
    setCategoryFilter,
    setStarredFilter,
    setSearchQuery,
    clearFilters,
    addExpense,
    toggleStar,
    deleteExpense,
  } = useExpense()

  // Form states
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [note, setNote] = useState("")
  const [spentAt, setSpentAt] = useState("")

  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!loadingUser && !user) {
      router.replace("/login")
    }
  }, [user, loadingUser, router])

  if (loadingUser || !user) {
    // "While the app is still finding out whether someone is logged in, nothing from this page is shown (no flash of content, no wrong redirect)."
    return null
  }

  // Field validation functions
  const getTitleError = (val: string) => {
    if (!val || !val.trim()) return "Title is required"
    if (val.length > 80) return "Title must be at most 80 characters"
    return null
  }

  const getAmountError = (val: string) => {
    if (!val || !val.trim()) return "Amount is required"
    const num = Number(val)
    if (isNaN(num)) return "Amount is required"
    if (num <= 0) return "Amount must be a positive number"
    return null
  }

  const getCategoryError = (val: string) => {
    if (!val || !val.trim()) return "Please choose a category"
    if (!CATEGORIES.includes(val)) return "Invalid category"
    return null
  }

  const getDateError = (val: string) => {
    if (!val || !val.trim()) return "Date is required"
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, "0")
    const dd = String(today.getDate()).padStart(2, "0")
    const todayStr = `${yyyy}-${mm}-${dd}`
    if (val > todayStr) return "Date cannot be in the future"
    return null
  }

  const titleError = hasSubmitted ? getTitleError(title) : null
  const amountError = hasSubmitted ? getAmountError(amount) : null
  const categoryError = hasSubmitted ? getCategoryError(category) : null
  const dateError = hasSubmitted ? getDateError(spentAt) : null

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setHasSubmitted(true)
    setFormSuccess(null)
    setFormError(null)

    const tErr = getTitleError(title)
    const aErr = getAmountError(amount)
    const cErr = getCategoryError(category)
    const dErr = getDateError(spentAt)

    if (tErr || aErr || cErr || dErr) {
      return
    }

    setIsSubmitting(true)
    const result = await addExpense({
      title: title.trim(),
      amount: Number(amount),
      category,
      note: note.trim(),
      spentAt,
    })

    setIsSubmitting(false)

    if (result.success) {
      setFormSuccess("Expense added")
      setTitle("")
      setAmount("")
      setCategory("")
      setNote("")
      setSpentAt("")
      setHasSubmitted(false)
    } else {
      setFormError(result.error || "Failed to add expense")
    }
  }

  return (
    <div data-testid="expenses-page" className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Add Expense Form & Summary */}
        <div className="xl:col-span-4 space-y-6">
          {/* Add Expense Form Card */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">Add Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                data-testid="expense-form"
                noValidate
                onSubmit={handleAddExpense}
                className="space-y-4"
              >
                {formSuccess && (
                  <div
                    data-testid="expense-success"
                    className="p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md"
                  >
                    {formSuccess}
                  </div>
                )}

                {formError && (
                  <div
                    data-testid="error-expense"
                    className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
                  >
                    {formError}
                  </div>
                )}

                {/* Title */}
                <div className="space-y-1">
                  <Label htmlFor="input-title">Title</Label>
                  <Input
                    id="input-title"
                    data-testid="input-title"
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      if (formError) setFormError(null)
                      if (formSuccess) setFormSuccess(null)
                    }}
                    placeholder="e.g. Lunch with team"
                  />
                  {titleError && (
                    <p data-testid="error-title" className="text-xs text-red-500 font-medium">
                      {titleError}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <Label htmlFor="input-amount">Amount</Label>
                  <Input
                    id="input-amount"
                    data-testid="input-amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      if (formError) setFormError(null)
                      if (formSuccess) setFormSuccess(null)
                    }}
                    placeholder="0.00"
                  />
                  {amountError && (
                    <p data-testid="error-amount" className="text-xs text-red-500 font-medium">
                      {amountError}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <Label htmlFor="input-category">Category</Label>
                  <select
                    id="input-category"
                    data-testid="input-category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value)
                      if (formError) setFormError(null)
                      if (formSuccess) setFormSuccess(null)
                    }}
                    className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Choose category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {categoryError && (
                    <p data-testid="error-category" className="text-xs text-red-500 font-medium">
                      {categoryError}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <Label htmlFor="input-date">Date</Label>
                  <Input
                    id="input-date"
                    data-testid="input-date"
                    type="date"
                    value={spentAt}
                    onChange={(e) => {
                      setSpentAt(e.target.value)
                      if (formError) setFormError(null)
                      if (formSuccess) setFormSuccess(null)
                    }}
                  />
                  {dateError && (
                    <p data-testid="error-date" className="text-xs text-red-500 font-medium">
                      {dateError}
                    </p>
                  )}
                </div>

                {/* Note */}
                <div className="space-y-1">
                  <Label htmlFor="input-note">Note (Optional)</Label>
                  <Input
                    id="input-note"
                    data-testid="input-note"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Additional details..."
                  />
                </div>

                <Button
                  type="submit"
                  data-testid="btn-add-expense"
                  className="w-full mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Expense"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Spending Summary Card */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Spending Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Total Items</p>
                  <p data-testid="expense-count" className="text-lg font-bold text-slate-800">
                    {summary.count}
                  </p>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-700 font-medium">Starred</p>
                  <p data-testid="starred-count" className="text-lg font-bold text-amber-800">
                    {summary.starredCount}
                  </p>
                </div>
                <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-700 font-medium">Total Spent</p>
                  <p data-testid="total-amount" className="text-lg font-bold text-blue-800">
                    {summary.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Category Breakdown
                </p>
                <div data-testid="category-breakdown" className="space-y-2">
                  {summary.breakdown.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No category data to display</p>
                  ) : (
                    summary.breakdown.map((item) => (
                      <div
                        key={item.category}
                        data-testid="breakdown-row"
                        className="flex items-center justify-between text-sm py-1.5 px-3 bg-slate-50 rounded-md border border-slate-100"
                      >
                        <span data-testid="breakdown-name" className="font-medium text-slate-700">
                          {item.category}
                        </span>
                        <div className="flex items-center space-x-3">
                          <span
                            data-testid="breakdown-count"
                            className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full"
                          >
                            {item.count}
                          </span>
                          <span
                            data-testid="breakdown-total"
                            className="font-semibold text-slate-900"
                          >
                            {item.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Filters & Expense List */}
        <div className="xl:col-span-8 space-y-6">
          {/* Filters Card */}
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    data-testid="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title or note..."
                    className="pl-9"
                  />
                </div>

                {/* Category select */}
                <div className="w-full md:w-44">
                  <select
                    data-testid="filter-category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Starred checkbox */}
                <div className="flex items-center space-x-2 shrink-0">
                  <input
                    id="filter-starred"
                    data-testid="filter-starred"
                    type="checkbox"
                    checked={starredFilter}
                    onChange={(e) => setStarredFilter(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <Label htmlFor="filter-starred" className="text-sm cursor-pointer select-none">
                    Starred only
                  </Label>
                </div>

                {/* Clear filters button */}
                <Button
                  data-testid="btn-clear-filters"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="shrink-0 w-full md:w-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Expenses List */}
          <div data-testid="expense-list" className="space-y-3">
            {expenses.length === 0 ? (
              <div
                data-testid="expenses-empty"
                className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 shadow-sm"
              >
                No expenses found
              </div>
            ) : (
              expenses.map((expense) => (
                <div
                  key={expense.id}
                  data-testid="expense-item"
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start space-x-3.5">
                    <button
                      type="button"
                      data-testid="btn-toggle-star"
                      aria-pressed={expense.starred ? "true" : "false"}
                      onClick={() => toggleStar(expense.id)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        expense.starred
                          ? "text-amber-500 hover:text-amber-600 bg-amber-50"
                          : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <Star
                        className={`w-5 h-5 ${expense.starred ? "fill-amber-400 text-amber-500" : ""}`}
                      />
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          data-testid="expense-title"
                          className="font-semibold text-slate-900 text-base"
                        >
                          {expense.title}
                        </span>
                        <span
                          data-testid="expense-category"
                          className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {expense.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                        <span data-testid="expense-date">{expense.spentAt}</span>
                        {expense.note && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-600">{expense.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span
                      data-testid="expense-amount"
                      className="font-bold text-slate-900 text-lg tabular-nums"
                    >
                      {Number(expense.amount).toFixed(2)}
                    </span>
                    <Button
                      type="button"
                      data-testid="btn-delete-expense"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteExpense(expense.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
