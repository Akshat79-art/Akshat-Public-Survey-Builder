/*
  surveys.$id/route.tsx — Route: /dashboard/surveys/:id (layout)
  Parent route for survey-specific pages (settings, builder, responses).
  Loads the survey once and provides it via context/outlet.
*/
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/surveys/$id')({
  component: SurveyLayout,
})

function SurveyLayout() {
  return (
    <div>
      <p>Survey sub-nav — coming soon</p>
      <Outlet />
    </div>
  )
}
