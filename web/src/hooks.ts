/*
  hooks.ts — All TanStack Query hooks live here.
  Each hook uses useAuth() from Clerk to get the JWT token for API calls.
  When Clerk isn't configured (dev mode), token is null and API calls
  will 401 — handled gracefully in the UI.
*/

import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSurvey, getResponses, getSurvey, getSurveys, syncUser, updateSurvey } from './lib/api'
import type { Question } from './types'

function useToken() {
  const auth = useAuth()
  return auth.getToken
}

export function useSurveys() {
  const getToken = useToken()
  return useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const token = await getToken()
      const res = await getSurveys(token)
      return res.surveys
    },
  })
}

export function useSurvey(id: string) {
  const getToken = useToken()
  return useQuery({
    queryKey: ['survey', id],
    queryFn: async () => {
      const token = await getToken()
      return getSurvey(token, id)
    },
  })
}

export function useCreateSurvey() {
  const getToken = useToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { title: string; url_slug: string }) => {
      const token = await getToken()
      return createSurvey(token, data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['surveys'] }),
  })
}

export function useUpdateSurvey(id: string) {
  const getToken = useToken()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { title?: string; brand_color?: string; logo_url?: string; questions: Question[] }) => {
      const token = await getToken()
      return updateSurvey(token, id, data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['survey', id] })
      qc.invalidateQueries({ queryKey: ['surveys'] })
    },
  })
}

/*
  useSyncUser — Syncs the Clerk user into our D1 database.
  Accepts nullable values because Clerk's user object may not have loaded yet.
  The query only fires (enabled) when both email and username are truthy strings,
  so null/undefined values are safe to pass — they just delay execution until
  the data is ready. Fires at most once per user session.
*/
export function useSyncUser(email: string | null | undefined, username: string | null | undefined) {
  const getToken = useToken()
  return useQuery({
    queryKey: ['sync-user', email, username],
    queryFn: async () => {
      const token = await getToken()
      return syncUser(token, { email: email!, username: username! })
    },
    enabled: !!email && !!username,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  })
}

export function useResponses(id: string) {
  const getToken = useToken()
  return useQuery({
    queryKey: ['responses', id],
    queryFn: async () => {
      const token = await getToken()
      const res = await getResponses(token, id)
      return res.responses
    },
  })
}
