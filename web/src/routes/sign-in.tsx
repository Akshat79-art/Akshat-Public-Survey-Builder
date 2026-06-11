/*
  sign-in.tsx — Route: /sign-in
  Renders the Clerk <SignIn /> component.
  Unauthenticated users land here when they hit a protected route.
*/
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  return <div>Sign in — coming soon</div>
}
