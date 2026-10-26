"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useExpense } from "@/context/ExpenseContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { checkAuth } = useExpense()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Validation functions
  const getEmailError = (val: string) => {
    if (!val || !val.trim()) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(val.trim())) return "Please enter a valid email address"
    return null
  }

  const getPasswordError = (val: string) => {
    if (!val) return "Password is required"
    return null
  }

  const emailError = hasSubmitted ? getEmailError(email) : null
  const passwordError = hasSubmitted ? getPasswordError(password) : null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setHasSubmitted(true)
    setAuthError(null)

    const eErr = getEmailError(email)
    const pErr = getPasswordError(password)

    if (eErr || pErr) {
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setAuthError(data.error || "Login failed")
      } else {
        await checkAuth()
        router.push("/expenses")
      }
    } catch {
      setAuthError("Failed to connect to server")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card className="shadow-lg border-[#8BA3C5]/40 bg-white">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-[#02122F]">Welcome back</CardTitle>
          <CardDescription className="text-[#495B7D]">
            Enter your credentials to access your ExpenseTrail account
          </CardDescription>
        </CardHeader>

        <form data-testid="login-form" noValidate onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {authError && (
              <div
                data-testid="error-auth"
                className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
              >
                {authError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                data-testid="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (authError) setAuthError(null)
                }}
                placeholder="you@example.com"
              />
              {emailError && (
                <p data-testid="error-email" className="text-xs text-red-500 font-medium">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  data-testid="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (authError) setAuthError(null)
                  }}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#495B7D] hover:text-[#02122F] cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p data-testid="error-password" className="text-xs text-red-500 font-medium">
                  {passwordError}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              type="submit"
              data-testid="login-submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-xs text-center text-[#495B7D]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#23354D] hover:text-[#02122F] hover:underline font-semibold">
                Register here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
