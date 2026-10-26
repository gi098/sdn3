import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    return NextResponse.json({
      status: "success",
      userCount,
      databaseUrlDefined: !!process.env.DATABASE_URL,
    })
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error?.message || String(error),
      code: error?.code,
    })
  }
}
