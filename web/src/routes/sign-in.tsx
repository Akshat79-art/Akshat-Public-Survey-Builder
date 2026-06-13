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

const SECTION_COUNT = 6
function makeDropSquare(id: number, sectionIndex: number) {
  const sectionWidth = 100 / SECTION_COUNT
  return {
    id,
    x: sectionIndex * sectionWidth + Math.random() * sectionWidth * 0.7 + sectionWidth * 0.15,
    delay: Math.random() * 1.8,
    duration: 1.5 + Math.random() * 1.5,
    rotation: (Math.random() - 0.5) * 20,
    size: 1.5 + Math.random() * 2.5,
    color: id % 3 === 0 ? '#3730a3' : id % 3 === 1 ? '#4f46e5' : '#6366f1',
    distance: 40 + Math.random() * 140,
  }
}
const EXTRA_COUNT = Math.floor(Math.random() * 15)
const DROP_SQUARES = Array.from({ length: SECTION_COUNT + EXTRA_COUNT }, (_, i) =>
  i < SECTION_COUNT ? makeDropSquare(i, i) : makeDropSquare(i, Math.floor(Math.random() * SECTION_COUNT)),
)

function FallingSquares() {
  return (
    <>
      <style>{`
        @keyframes drop {
          0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(var(--drop-distance)) rotate(var(--drop-rotation)); opacity: 0.6; }
        }
      `}</style>
      {DROP_SQUARES.map((s) => (
        <div
          key={s.id}
          className="absolute top-0 rounded-xl border-2 pointer-events-none"
          style={{
            left: `${s.x}%`,
            width: `${s.size}rem`,
            height: `${s.size}rem`,
            borderColor: s.color,
            backgroundColor: `color-mix(in srgb, ${s.color} 15%, transparent)`,
            animation: `drop ${s.duration}s ease-in ${s.delay}s both`,
            '--drop-distance': `${s.distance}px`,
            '--drop-rotation': `${s.rotation}deg`,
          } as React.CSSProperties}
        />
      ))}
    </>
  )
}

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const [dropping] = useState(true)
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="absolute left-0 top-0 bottom-0 w-36 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 100 1440" preserveAspectRatio="none" className="h-full w-full">
          <path d="M0,0 C100,480 0,960 100,1440 L0,1440 Z" fill="var(--color-indigo-800)" opacity="0.3" />
        </svg>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-36 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 100 1440" preserveAspectRatio="none" className="h-full w-full">
          <path d="M100,0 C0,480 100,960 0,1440 L100,1440 Z" fill="var(--color-indigo-800)" opacity="0.3" />
        </svg>
      </div>
      {dropping && (
        <div className="absolute inset-0 overflow-x-hidden pointer-events-none">
          <FallingSquares />
        </div>
      )}
      <div className="flex min-h-screen items-center justify-center">
        <ClerkSignInForm />
      </div>
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
      <p className="mb-8 text-center text-sm text-slate-600">
        Welcome back to Survey Bee
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
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-black focus:ring-2 focus:ring-black/10"
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
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-black focus:ring-2 focus:ring-black/10"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <Button type="submit" className="w-full cursor-pointer hover:bg-primary" size="xl" disabled={pending}>
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
