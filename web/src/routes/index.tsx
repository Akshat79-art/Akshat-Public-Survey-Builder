/*
  index.tsx — Route: /
  Landing page. Soft indigo palette, minimal hero with sign-in CTA.
*/
import { Link, createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="px-6 pt-10 pb-4 text-center">
        <span className="text-2xl font-semibold tracking-tight text-indigo-800">
          Survey Builder
        </span>
      </header>

      <main className="mx-auto max-w-3xl px-6 pt-24 pb-40 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Surveys that feel like yours
        </h1>
        <p className="mt-5 text-lg text-slate-500 sm:text-xl">
          Create branded surveys, share a public link, and collect responses
          — no sign-in required for your respondents.
        </p>
        <div className="mt-9 flex items-center justify-center gap-4">
          <Button size="xl" variant="outline" asChild className="border-black transition-all hover:border-transparent hover:bg-indigo-800 hover:text-white hover:shadow-xl hover:-translate-y-0.5">
            <Link to="/sign-up">Sign up</Link>
          </Button>
          <Button size="xl" variant="outline" asChild className="border-black transition-all hover:border-transparent hover:bg-indigo-800 hover:text-white hover:shadow-xl hover:-translate-y-0.5">
            <Link to="/sign-in">Sign in</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
