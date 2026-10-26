"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

export interface Expense {
  id: string
  title: string
  amount: number
  category: string
  note: string
  starred: boolean
  spentAt: string
  createdAt: string
}

export interface CategoryBreakdown {
  category: string
  count: number
  total: number
}

export interface ExpenseSummary {
  count: number
  starredCount: number
  totalAmount: number
  breakdown: CategoryBreakdown[]
}

export interface User {
  id: string
  email: string
}

interface ExpenseContextType {
  user: User | null
  loadingUser: boolean
  expenses: Expense[]
  summary: ExpenseSummary
  loadingExpenses: boolean
  categoryFilter: string
  starredFilter: boolean
  searchQuery: string
  setCategoryFilter: (cat: string) => void
  setStarredFilter: (starred: boolean) => void
  setSearchQuery: (q: string) => void
  clearFilters: () => void
  fetchExpenses: (overrideFilters?: { category?: string; starred?: boolean; q?: string }) => Promise<void>
  addExpense: (data: { title: string; amount: number; category: string; note: string; spentAt: string }) => Promise<{ success: boolean; error?: string }>
  toggleStar: (id: string) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<User | null>
  setUser: (u: User | null) => void
}

const defaultSummary: ExpenseSummary = {
  count: 0,
  starredCount: 0,
  totalAmount: 0,
  breakdown: [],
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<ExpenseSummary>(defaultSummary)
  const [loadingExpenses, setLoadingExpenses] = useState(false)

  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [starredFilter, setStarredFilter] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")

  const checkAuth = useCallback(async (): Promise<User | null> => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        return data
      } else {
        setUser(null)
        setExpenses([])
        setSummary(defaultSummary)
        return null
      }
    } catch {
      setUser(null)
      setExpenses([])
      setSummary(defaultSummary)
      return null
    } finally {
      setLoadingUser(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const fetchExpenses = useCallback(
    async (overrideFilters?: { category?: string; starred?: boolean; q?: string }) => {
      const cat = overrideFilters?.category !== undefined ? overrideFilters.category : categoryFilter
      const star = overrideFilters?.starred !== undefined ? overrideFilters.starred : starredFilter
      const q = overrideFilters?.q !== undefined ? overrideFilters.q : searchQuery

      const params = new URLSearchParams()
      if (cat) params.set("category", cat)
      if (star) params.set("starred", "true")
      if (q && q.trim()) params.set("q", q.trim())

      const queryStr = params.toString() ? `?${params.toString()}` : ""

      setLoadingExpenses(true)
      try {
        const [expRes, sumRes] = await Promise.all([
          fetch(`/api/expenses${queryStr}`, { cache: "no-store" }),
          fetch(`/api/expenses/summary${queryStr}`, { cache: "no-store" }),
        ])

        if (expRes.ok && sumRes.ok) {
          const expData = await expRes.json()
          const sumData = await sumRes.json()
          setExpenses(expData)
          setSummary(sumData)
        } else if (expRes.status === 401 || sumRes.status === 401) {
          setUser(null)
          setExpenses([])
          setSummary(defaultSummary)
        }
      } catch (err) {
        console.error("Failed to fetch expenses:", err)
      } finally {
        setLoadingExpenses(false)
      }
    },
    [categoryFilter, starredFilter, searchQuery]
  )

  // Reload expenses whenever filters change or user logs in
  useEffect(() => {
    if (user) {
      fetchExpenses()
    } else {
      setExpenses([])
      setSummary(defaultSummary)
    }
  }, [user, categoryFilter, starredFilter, searchQuery, fetchExpenses])

  const clearFilters = () => {
    setCategoryFilter("")
    setStarredFilter(false)
    setSearchQuery("")
  }

  const addExpense = async (data: {
    title: string
    amount: number
    category: string
    note: string
    spentAt: string
  }) => {
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        return { success: false, error: result.error || "Failed to add expense" }
      }

      // Re-fetch current expenses list and summary so sorting & filters apply correctly
      await fetchExpenses()
      return { success: true }
    } catch {
      return { success: false, error: "Network error" }
    }
  }

  const toggleStar = async (id: string) => {
    const item = expenses.find((e) => e.id === id)
    if (!item) return
    const newStarred = !item.starred

    // Optimistic UI update
    if (starredFilter && !newStarred) {
      // If filtering starred only, unstarring removes it from list immediately
      setExpenses((prev) => prev.filter((e) => e.id !== id))
    } else {
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, starred: newStarred } : e))
      )
    }

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: newStarred }),
      })
      if (!res.ok) {
        // Revert on error
        await fetchExpenses()
      } else {
        // Refresh summary
        const params = new URLSearchParams()
        if (categoryFilter) params.set("category", categoryFilter)
        if (starredFilter) params.set("starred", "true")
        if (searchQuery.trim()) params.set("q", searchQuery.trim())
        const sumRes = await fetch(`/api/expenses/summary${params.toString() ? `?${params.toString()}` : ""}`, { cache: "no-store" })
        if (sumRes.ok) {
          const sumData = await sumRes.json()
          setSummary(sumData)
        }
      }
    } catch {
      await fetchExpenses()
    }
  }

  const deleteExpense = async (id: string) => {
    // Optimistic removal
    setExpenses((prev) => prev.filter((e) => e.id !== id))

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        await fetchExpenses()
      } else {
        // Refresh summary
        const params = new URLSearchParams()
        if (categoryFilter) params.set("category", categoryFilter)
        if (starredFilter) params.set("starred", "true")
        if (searchQuery.trim()) params.set("q", searchQuery.trim())
        const sumRes = await fetch(`/api/expenses/summary${params.toString() ? `?${params.toString()}` : ""}`, { cache: "no-store" })
        if (sumRes.ok) {
          const sumData = await sumRes.json()
          setSummary(sumData)
        }
      }
    } catch {
      await fetchExpenses()
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (e) {
      console.error("Logout error", e)
    } finally {
      setUser(null)
      setExpenses([])
      setSummary(defaultSummary)
      clearFilters()
      router.push("/login")
    }
  }

  return (
    <ExpenseContext.Provider
      value={{
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
        fetchExpenses,
        addExpense,
        toggleStar,
        deleteExpense,
        logout,
        checkAuth,
        setUser,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpense() {
  const context = useContext(ExpenseContext)
  if (!context) {
    throw new Error("useExpense must be used within an ExpenseProvider")
  }
  return context
}
