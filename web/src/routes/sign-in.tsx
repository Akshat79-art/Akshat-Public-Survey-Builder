/*
  sign-in.tsx — Route: /sign-in
  Custom sign-in form that mirrors the sign-up page's design.
  Uses Clerk's useSignIn hook instead of the pre-built component.
*/
import { useSignIn } from '@clerk/clerk-react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <ClerkSignInForm />
    </div>
  )
}

function ClerkSignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  /*
    handleSubmit — Called when the user taps "Sign in".
    Validates fields, then tells Clerk to authenticate.
    If successful, it:
      1. Sets the session as active so the user is logged in.
      2. Shows a toast and redirects to the dashboard.
    On any error, the message is displayed below the form.
  */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('All fields are required')
      return
    }

    if (!isLoaded || !signIn || !setActive) return

    setPending(true)

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        toast.success('Signed in successfully')
        navigate({ to: '/dashboard' })
      } else {
        setError('Additional verification required')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/30 bg-indigo-800/30 p-8 shadow-2xl shadow-indigo-800/10 backdrop-blur-xl">
      <h1 className="mb-1 text-center text-2xl font-semibold tracking-tight text-slate-900">
        Sign in
      </h1>
      <p className="mb-8 text-center text-sm text-slate-500">
        Welcome back to Survey Builder
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <Button type="submit" className="w-full" size="xl" disabled={pending}>
          {pending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/sign-up" className="font-medium text-indigo-800 hover:text-indigo-700">
          Sign up
        </Link>
      </p>
    </div>
  )
}
