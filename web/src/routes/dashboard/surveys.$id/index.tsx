/*
  surveys.$id/index.tsx — Route: /dashboard/surveys/:id
  Survey Settings page. Lets the owner rename the survey,
  change the URL slug, and update branding (color + logo).
*/
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/surveys/$id/')({
  component: SurveySettingsPage,
})

function SurveySettingsPage() {
  return <div>Survey settings — coming soon</div>
}
