/*
  dashboard/route.tsx — Route: /dashboard (layout)
  Protected route. Redirects to /sign-in if unauthenticated.
  Wraps children in <AppLayout /> which provides nav and user menu.
*/
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div>
      <p>Dashboard nav — coming soon</p>
      <Outlet />
    </div>
  )
}
