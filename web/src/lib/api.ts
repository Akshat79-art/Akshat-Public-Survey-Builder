/*
  api.ts — The only file that talks to our Hono backend.
  Every API function returns raw JSON so TanStack Query can own the caching.
  If the backend URL ever changes, edit BASE_URL here — one place.
*/

const BASE_URL = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}
