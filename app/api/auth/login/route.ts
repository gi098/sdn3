import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { comparePassword, signToken, SESSION_COOKIE_NAME } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email, password } = body

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const isMatch = await comparePassword(password, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = signToken({ id: user.id, email: user.email })

    const response = NextResponse.json({ id: user.id, email: user.email }, { status: 200 })

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
