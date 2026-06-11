/*
  build.tsx — Route: /dashboard/surveys/:id/build
  Survey Builder page. Drag-and-drop interface for adding, removing,
  reordering, and configuring questions.
*/
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/surveys/$id/build')({
  component: BuilderPage,
})

function BuilderPage() {
  return <div>Survey builder — coming soon</div>
}
