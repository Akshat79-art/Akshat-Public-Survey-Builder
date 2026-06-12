/*
  surveys.$id/route.tsx — Route: /dashboard/surveys/:id (layout)
  Sub-nav with tab for Responses; the survey editor is on the root.
*/
import { Link, createFileRoute, Outlet, useParams, useMatchRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/surveys/$id')({
  component: SurveyLayout,
})

function SurveyLayout() {
  const { id } = useParams({ from: '/dashboard/surveys/$id' })
  const matchRoute = useMatchRoute()
  const isResponses = matchRoute({ to: '/dashboard/surveys/$id/responses', params: { id } })

  return (
    <div>
      <nav className="mb-6 flex gap-1 rounded-lg bg-slate-100 p-1">
        <Link
          to="/dashboard/surveys/$id"
          params={{ id }}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            !isResponses
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Editor
        </Link>
        <Link
          to="/dashboard/surveys/$id/responses"
          params={{ id }}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            isResponses
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Responses
        </Link>
      </nav>
      <Outlet />
    </div>
  )
}
