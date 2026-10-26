import { NextResponse } from "next/server"

export async function GET() {
  const keys = Object.keys(process.env).filter(
    (k) =>
      k.includes("DATA") ||
      k.includes("URL") ||
      k.includes("POSTGRES") ||
      k.includes("PRISMA") ||
      k.includes("SUPABASE") ||
      k.includes("STORAGE") ||
      k.includes("SECRET")
  )
  return NextResponse.json({
    databaseUrlDefined: !!process.env.DATABASE_URL,
    directUrlDefined: !!process.env.DIRECT_URL,
    authSecretDefined: !!process.env.AUTH_SECRET,
    matchingKeys: keys,
  })
}
