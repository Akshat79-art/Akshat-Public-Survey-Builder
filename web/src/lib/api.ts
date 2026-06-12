/*
  api.ts — The only file that talks to our Hono backend.
  Every API function returns raw JSON so TanStack Query can own the caching.
  Auth token is passed in from hooks.ts where useAuth() provides it.
  If the backend URL ever changes, edit BASE_URL here — one place.
*/

import type { Question, Response as SurveyResponse, Survey } from '@/types'

const BASE_URL = '/api'

async function request<T>(path: string, token: string | null, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { headers, ...options })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message = typeof body.error === 'string' ? body.error : JSON.stringify(body.error)
    throw new Error(message ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function getSurveys(token: string | null): Promise<{ surveys: Survey[] }> {
  return request('/surveys', token)
}

export function getSurvey(token: string | null, id: string): Promise<{ survey: Survey; questions: Question[] }> {
  return request(`/surveys/${id}`, token)
}

export function createSurvey(token: string | null, data: { title: string; url_slug: string }): Promise<{ success: boolean; id: string }> {
  return request('/surveys', token, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateSurvey(
  token: string | null,
  id: string,
  data: { title?: string; brand_color?: string; logo_url?: string; questions: Question[] },
): Promise<{ success: boolean }> {
  return request(`/surveys/${id}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function getResponses(token: string | null, id: string): Promise<{ responses: SurveyResponse[] }> {
  return request(`/surveys/${id}/responses`, token)
}

export function syncUser(token: string | null, data: { email: string; username: string }): Promise<{ success: boolean }> {
  return request('/users/sync', token, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function fetchPublicSurvey(slug: string): Promise<{ survey: Pick<Survey, 'id' | 'title' | 'brand_color' | 'logo_url'>; questions: Question[] }> {
  return request(`/public/${slug}`, null)
}

export function submitPublicResponse(slug: string, answers: Record<string, unknown>): Promise<{ success: boolean }> {
  return request(`/public/${slug}/responses`, null, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
}
