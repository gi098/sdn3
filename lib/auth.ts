import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { prisma } from "./prisma"

const AUTH_SECRET = process.env.AUTH_SECRET || "exam_fallback_secret_key_sdn302"
export const SESSION_COOKIE_NAME = "session_token"

export interface SessionPayload {
  id: string
  email: string
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as SessionPayload
  } catch {
    return null
  }
}

export async function getSessionUser(request?: Request): Promise<SessionPayload | null> {
  let token: string | undefined

  if (request) {
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      const parsedCookies = Object.fromEntries(
        cookieHeader.split("; ").map((c) => {
          const [key, ...v] = c.split("=")
          return [key, decodeURIComponent(v.join("="))]
        })
      )
      token = parsedCookies[SESSION_COOKIE_NAME]
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies()
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    } catch {
      // Ignore if headers/cookies context is not available
    }
  }

  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || !payload.id) return null

  // Ensure user still exists in database
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true },
    })
    if (!user) return null
    return { id: user.id, email: user.email }
  } catch {
    return null
  }
}
