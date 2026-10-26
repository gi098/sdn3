"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
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
    if (val.length < 6) return "Password must be at least 6 characters"
    return null
  }

  const getConfirmPasswordError = (val: string, pwd: string) => {
    if (!val) return "Confirm password is required"
    if (val !== pwd) return "Passwords do not match"
    return null
  }

  const emailError = hasSubmitted ? getEmailError(email) : null
  const passwordError = hasSubmitted ? getPasswordError(password) : null
  const confirmPasswordError = hasSubmitted ? getConfirmPasswordError(confirmPassword, password) : null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setHasSubmitted(true)
    setAuthError(null)
    setSuccessMessage(null)

    const eErr = getEmailError(email)
    const pErr = getPasswordError(password)
    const cErr = getConfirmPasswordError(confirmPassword, password)

    if (eErr || pErr || cErr) {
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          confirmPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setAuthError(data.error || "Registration failed")
      } else {
        setSuccessMessage("Registration successful")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setHasSubmitted(false)
      }
    } catch {
      setAuthError("Failed to connect to server")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Join ExpenseTrail to start managing your personal expenses
          </CardDescription>
        </CardHeader>

        <form data-testid="register-form" noValidate onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {successMessage && (
              <div
                data-testid="form-success"
                className="p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md"
              >
                {successMessage}
              </div>
            )}

            {authError && (
              <div
                data-testid="error-auth"
                className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
              >
                {authError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                data-testid="register-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (authError) setAuthError(null)
                  if (successMessage) setSuccessMessage(null)
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
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                data-testid="register-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (authError) setAuthError(null)
                  if (successMessage) setSuccessMessage(null)
                }}
                placeholder="••••••••"
              />
              {passwordError && (
                <p data-testid="error-password" className="text-xs text-red-500 font-medium">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="register-confirm-password">Confirm Password</Label>
              <Input
                id="register-confirm-password"
                data-testid="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (authError) setAuthError(null)
                  if (successMessage) setSuccessMessage(null)
                }}
                placeholder="••••••••"
              />
              {confirmPasswordError && (
                <p data-testid="error-confirm-password" className="text-xs text-red-500 font-medium">
                  {confirmPasswordError}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              type="submit"
              data-testid="register-submit"
              className="w-full"
              disabled={submitting}
            >
              {submitting ? "Registering..." : "Register"}
            </Button>
            <p className="text-xs text-center text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
