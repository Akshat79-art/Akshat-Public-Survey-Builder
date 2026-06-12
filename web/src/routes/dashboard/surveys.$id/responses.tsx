/*
  responses.tsx — Route: /dashboard/surveys/:id/responses
  Lists every anonymous submission for a survey.
  Fetches both the survey (for question text) and responses,
  then displays each response as a card with question → answer pairs.
  Empty state shown when no submissions exist yet.
*/
import { createFileRoute, useParams } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useResponses, useSurvey } from '@/hooks'
import { Card, CardContent } from '@/components/ui/card'
import type { Response } from '@/types'

export const Route = createFileRoute('/dashboard/surveys/$id/responses')({
  component: ResponsesPage,
})

function ResponsesPage() {
  const { id } = useParams({ from: '/dashboard/surveys/$id/responses' })
  const { data: surveyData } = useSurvey(id)
  const { data: responses, isLoading, isError } = useResponses(id)

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-slate-300" />
      </div>
    )
  }

  if (isError) {
    return <p className="text-sm text-red-500">Failed to load responses</p>
  }

  if (!responses || responses.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
        <p className="text-sm text-slate-400">No responses yet</p>
      </div>
    )
  }

  const questions = surveyData?.questions ?? []

  return (
    <div>
      <p className="mb-4 text-xs text-slate-400">
        {responses.length} response{responses.length !== 1 ? 's' : ''}
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {responses.map((r) => (
          <ResponseCard key={r.id} response={r} questions={questions} />
        ))}
      </div>
    </div>
  )
}

function ResponseCard({ response, questions }: { response: Response; questions: { id: string; question_text: string }[] }) {
  const date = new Date(response.submitted_at).toLocaleString()
  const entries = Object.entries(response.answers as Record<string, unknown>)

  return (
    <Card className="border-slate-200">
      <CardContent className="p-4">
        <p className="mb-3 text-xs text-slate-400">{date}</p>
        {entries.length === 0 ? (
          <p className="text-xs text-slate-300">No answers</p>
        ) : (
          <div className="space-y-2">
            {entries.map(([questionId, answer]) => {
              const q = questions.find((q) => q.id === questionId)
              return (
                <div key={questionId}>
                  <p className="text-xs font-medium text-slate-500">
                    {q?.question_text || questionId}
                  </p>
                  <p className="text-sm text-slate-900">
                    {renderAnswer(answer)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function renderAnswer(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}
