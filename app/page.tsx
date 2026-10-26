import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Receipt, PieChart, ShieldCheck } from "lucide-react"

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center space-y-4 mb-12">
        <h1
          data-testid="home-title"
          className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight"
        >
          ExpenseTrail
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          A smart, elegant personal expense tracker to record spending, organize by category, star important items, and view live financial breakdowns.
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="px-6 shadow-md">
              Get Started
            </Button>
          </Link>
          <Link href="/expenses">
            <Button size="lg" variant="outline" className="px-6">
              View Expenses
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
              <Receipt className="w-5 h-5" />
            </div>
            <CardTitle className="text-xl">Track spending</CardTitle>
            <CardDescription className="text-sm pt-2">
              Log every personal expense with precise dates, amounts, and notes. Star crucial transactions for fast reference.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
              <PieChart className="w-5 h-5" />
            </div>
            <CardTitle className="text-xl">Sort into categories</CardTitle>
            <CardDescription className="text-sm pt-2">
              Group transactions effortlessly into Food, Transport, Bills, Shopping, or Other for clean organization.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <CardTitle className="text-xl">See where it goes</CardTitle>
            <CardDescription className="text-sm pt-2">
              Get instant automated summaries and category breakdowns to take control of your financial goals.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
