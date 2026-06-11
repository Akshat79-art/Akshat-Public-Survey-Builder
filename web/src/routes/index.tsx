/*
  index.tsx — Route: /
  Landing page. Shown to visitors who aren't signed in.
  Links to /sign-in and explains what the app does.
*/
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main>
      <h1>Survey Builder</h1>
      <p>Create branded surveys, share them, and collect responses.</p>
    </main>
  )
}
