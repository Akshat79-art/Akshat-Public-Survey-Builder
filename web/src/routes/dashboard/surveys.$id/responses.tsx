/*
  responses.tsx — Route: /dashboard/surveys/:id/responses
  Lists all anonymous submissions for a survey.
  Each row shows submitted_at and expandable per-question answers.
*/
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/surveys/$id/responses')({
  component: ResponsesPage,
})

function ResponsesPage() {
  return <div>Responses — coming soon</div>
}
