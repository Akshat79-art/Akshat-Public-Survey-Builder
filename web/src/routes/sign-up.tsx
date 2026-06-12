/*
  sign-up.tsx — Route: /sign-up
  Custom sign-up form with an email, password and username field (random default, required).
  Uses Clerk's useSignUp hook instead of the pre-built component for full control over form fields.
*/
import { useSignUp, useClerk } from '@clerk/clerk-react'
import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { syncUser } from '@/lib/api'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

function randomUsername() {
  const adj = ['blue', 'calm', 'cool', 'bold', 'kind', 'neat', 'vast', 'keen']
  const noun = ['owl', 'fox', 'elm', 'sky', 'bay', 'sun', 'dew', 'ark']
  return `${adj[Math.floor(Math.random() * adj.length)]}_${noun[Math.floor(Math.random() * noun.length)]}_${Math.random().toString(36).slice(2, 6)}`
}

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <ClerkSignUpForm />
    </div>
  )
}

function ClerkSignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const clerk = useClerk()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState(randomUsername)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  /*
    handleSubmit — Called when the user taps "Sign up".
    Validates fields, then tells Clerk to create the account.
    If successful (no email verification needed), it:
      1. Sets the new session as active so the user is logged in.
      2. Gets a JWT from the active session.
      3. Syncs the user to our D1 database via the backend.
      4. Shows a toast and redirects to the dashboard.
    On any error, the message is displayed below the form.
  */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !username || !password) {
      setError('All fields are required')
      return
    }

    if (!isLoaded || !signUp || !setActive) return

    setPending(true)

    try {
      const result = await signUp.create({
        emailAddress: email,
        username,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        const token = await clerk.session?.getToken()
        await syncUser(token ?? null, { email, username })
        toast.success('Signed up successfully')
        navigate({ to: '/dashboard' })
      } else {
        setError('Email verification required — not yet implemented')
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
        Create account
      </h1>
      <p className="mb-8 text-center text-sm text-slate-500">
        Sign up and start building surveys
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
          <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">
            Username
          </label>
          <div className="flex gap-2">
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="button"
              onClick={() => setUsername(randomUsername())}
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Random
            </button>
          </div>
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
            placeholder="At least 8 characters"
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <Button type="submit" className="w-full" size="xl" disabled={pending}>
          {pending ? 'Creating account...' : 'Sign up'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <a href="/sign-in" className="font-medium text-indigo-800 hover:text-indigo-700">
          Sign in
        </a>
      </p>
    </div>
  )
}