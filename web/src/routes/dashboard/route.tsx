/*
  dashboard/route.tsx — Route: /dashboard (layout)
  Auth guard: redirects to /sign-in if unauthenticated.
  Syncs the Clerk user to the backend on first load.
*/
import { useAuth, useUser, useClerk } from '@clerk/clerk-react'
import { Link, createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { CircleUser, LayoutDashboard, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSyncUser } from '@/hooks'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const { signOut } = useClerk()
  const email = user?.primaryEmailAddress?.emailAddress
  useSyncUser(email, user?.username)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  /*
    If not signed in, go back and sign in.
  */
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate({ to: '/sign-in' })
    }
  }, [isLoaded, isSignedIn, navigate])

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    function handleClick() { setMenuOpen(false) }
    addEventListener('click', handleClick)
    return () => removeEventListener('click', handleClick)
  }, [menuOpen])

  if (!isLoaded || !isSignedIn) return null

  const displayName = user?.username ?? 'User'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-indigo-100/50 to-purple-200">
      <header className="border-b border-slate-200 bg-white">
        <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 py-3">
          <Link to="/dashboard" className="text-lg font-semibold tracking-tight text-indigo-800">
            Survey Bee
          </Link>
          <div className="absolute right-6">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
              className="flex size-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600"
            >
              <CircleUser className="size-6" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-slate-100 px-3 py-2 text-sm text-slate-600">
                  {displayName}
                </div>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); navigate({ to: '/dashboard' }) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => signOut({ redirectUrl: '/' })}
                  className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
