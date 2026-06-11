/*
  dashboard/index.tsx — Route: /dashboard
  Lists all surveys owned by the signed-in user.
  Shows an empty state ("Create your first survey") when there are none.
*/
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  return <div>Dashboard — coming soon</div>
}
