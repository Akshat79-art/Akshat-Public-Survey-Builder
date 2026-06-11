/*
  s.$slug.tsx — Route: /s/:slug
  The public survey page. No auth required.
  Loads the survey by slug, renders questions in the owner's brand colors,
  and POSTs answers on submit.
*/
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/s/$slug')({
  component: PublicSurveyPage,
})

function PublicSurveyPage() {
  return <div>Public survey — coming soon</div>
}
