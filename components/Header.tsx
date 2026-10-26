"use client"

import React from "react"
import Link from "next/link"
import { useExpense } from "@/context/ExpenseContext"
import { Button } from "@/components/ui/button"

export function Header() {
  const { user, logout } = useExpense()

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            E
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            ExpenseTrail
          </span>
        </Link>

        <nav className="flex items-center space-x-3">
          {user ? (
            <>
              <Link
                href="/expenses"
                data-testid="link-expenses"
                className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
              >
                Expenses
              </Link>
              <span
                data-testid="user-email"
                className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full"
              >
                {user.email}
              </span>
              <Button
                data-testid="btn-logout"
                variant="outline"
                size="sm"
                onClick={logout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button data-testid="btn-login" variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button data-testid="btn-register" size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
