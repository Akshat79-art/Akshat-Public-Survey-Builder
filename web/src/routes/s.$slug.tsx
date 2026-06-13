/*
  s.$slug.tsx — Route: /s/:slug
  The public survey page — no authentication required.
  Loads survey branding + questions by slug, renders each question
  with a type-appropriate input (text, radio, rating buttons).
  Validates required fields, and submits answers to the backend.
  Shows a success screen after submission.
*/
import { useState } from 'react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { fetchPublicSurvey, submitPublicResponse } from '@/lib/api'
import type { Question } from '@/types'

const SECTION_COUNT = 6
function makeDropSquare(id: number, sectionIndex: number) {
  const sectionWidth = 100 / SECTION_COUNT
  return {
    id,
    x: sectionIndex * sectionWidth + Math.random() * sectionWidth * 0.7 + sectionWidth * 0.15,
    delay: Math.random() * 1.8,
    duration: 1.5 + Math.random() * 1.5,
    rotation: (Math.random() - 0.5) * 20,
    size: 1.5 + Math.random() * 2.5,
    color: id % 3 === 0 ? '#3730a3' : id % 3 === 1 ? '#4f46e5' : '#6366f1',
    distance: 40 + Math.random() * 140,
  }
}
const EXTRA_COUNT = Math.floor(Math.random() * 15)
const DROP_SQUARES = Array.from({ length: SECTION_COUNT + EXTRA_COUNT }, (_, i) =>
  i < SECTION_COUNT ? makeDropSquare(i, i) : makeDropSquare(i, Math.floor(Math.random() * SECTION_COUNT)),
)

function FallingSquares() {
  return (
    <>
      <style>{`
        @keyframes drop {
          0% { transform: translateY(-120px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(var(--drop-distance)) rotate(var(--drop-rotation)); opacity: 0.6; }
        }
      `}</style>
      {DROP_SQUARES.map((s) => (
        <div
          key={s.id}
          className="absolute top-0 rounded-xl border-2 pointer-events-none"
          style={{
            left: `${s.x}%`,
            width: `${s.size}rem`,
            height: `${s.size}rem`,
            borderColor: s.color,
            backgroundColor: `color-mix(in srgb, ${s.color} 15%, transparent)`,
            animation: `drop ${s.duration}s ease-in ${s.delay}s both`,
            '--drop-distance': `${s.distance}px`,
            '--drop-rotation': `${s.rotation}deg`,
          } as React.CSSProperties}
        />
      ))}
    </>
  )
}

export const Route = createFileRoute('/s/$slug')({
  component: PublicSurveyPage,
})

function PublicSurveyPage() {
  const { slug } = useParams({ from: '/s/$slug' })
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set())
  const [dropping] = useState(true)

  /*
    useQuery — TanStack Query's data-fetching hook.
    It handles caching, loading/error states, and re-fetching automatically.

    queryKey: A unique identifier for this query.
      ['public-survey', slug] means "cache this fetch by the slug".
      If the same slug is visited again, the cached result is returned instantly
      without a network request.

    queryFn: The function that actually fetches data.
      Here it calls fetchPublicSurvey(slug) which hits GET /api/public/:slug
      and returns { survey, questions }.

    retry: false — Don't retry on failure (a bad slug just shows "Survey not found").
  */
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-survey', slug],
    queryFn: () => fetchPublicSurvey(slug),
    retry: false,
  })

  const survey = data?.survey
  const questions = data?.questions?.sort((a, b) => a.order_index - b.order_index) ?? []

  function setAnswer(questionId: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    setFieldErrors((prev) => { const next = new Set(prev); next.delete(questionId); return next })
  }

  async function handleSubmit() {
    setError('')

    const missing = new Set<string>()
    for (const q of questions) {
      if (q.is_required) {
        const val = answers[q.id]
        if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
          missing.add(q.id)
        }
      }
    }
    if (missing.size > 0) {
      setFieldErrors(missing)
      return
    }

    setSubmitting(true)
    try {
      await submitPublicResponse(slug, answers)
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="size-6 animate-spin text-slate-300" />
      </div>
    )
  }

  if (isError || !survey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Survey not found</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {dropping && (
          <div className="absolute inset-0 overflow-x-hidden pointer-events-none">
            <FallingSquares />
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-full overflow-x-hidden pointer-events-none" style={{ height: '10rem' }}>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0,40 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-indigo-800)" opacity="0.4" />
          </svg>
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-lg border-slate-200 text-center">
            <CardContent className="py-16">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100">
                <svg className="size-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-slate-900">Response submitted</h2>
              <p className="text-sm text-slate-500">Thank you for your feedback.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {dropping && (
        <div className="absolute inset-0 overflow-x-hidden pointer-events-none">
          <FallingSquares />
        </div>
      )}
      <div className="absolute bottom-0 left-0 w-full overflow-x-hidden pointer-events-none" style={{ height: '10rem' }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="h-full w-full">
          <path d="M0,40 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-indigo-800)" opacity="0.4" />
        </svg>
      </div>
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-16">
        <Card className="border-slate-200">
          <CardContent className="p-8">
            {survey.logo_url && (
              <img
                src={survey.logo_url}
                alt=""
                className="mb-6 max-h-12 object-contain"
              />
            )}

            <h1 className="mb-8 text-2xl font-semibold tracking-tight text-slate-900">
              {survey.title}
            </h1>

            <div className="space-y-6">
              {questions.map((q) => (
                <QuestionField
                  key={q.id}
                  question={q}
                  value={answers[q.id]}
                  onChange={(v) => setAnswer(q.id, v)}
                  error={fieldErrors.has(q.id)}
                  brandColor={survey.brand_color || '#4f46e5'}
                />
              ))}
            </div>

            {error && (
              <p className="mt-4 text-xs text-red-500">{error}</p>
            )}

            <Button
              className="mt-8 w-full"
              size="xl"
              onClick={handleSubmit}
              disabled={submitting}
              style={{ backgroundColor: survey.brand_color || '#4f46e5' }}
            >
              {submitting ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
              Submit
            </Button>
            <p className="mt-4 text-center text-xs text-slate-400">Powered by Survey Bee</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QuestionField({
  question,
  value,
  onChange,
  error,
  brandColor,
}: {
  question: Question
  value: unknown
  onChange: (v: unknown) => void
  error: boolean
  brandColor: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {question.question_text}
        {question.is_required && <span className="ml-1 text-red-400">*</span>}
      </label>

      {question.question_type === 'short_text' && (
        <input
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:ring-2 ${
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'
          }`}
        />
      )}

      {question.question_type === 'multiple_choice' && (
        <div className="space-y-2">
          {((question.type_specific_options?.options as string[]) ?? []).map((opt, i) => (
            <label
              key={i}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-slate-50 ${
                error && value !== opt ? 'border-red-200' : value === opt ? '' : 'border-slate-200'
              }`}
              style={value === opt ? { borderColor: brandColor, backgroundColor: `${brandColor}10` } : undefined}
            >
              <input
                type="radio"
                name={question.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="size-4"
                style={{ accentColor: brandColor }}
              />
              {opt || `Option ${i + 1}`}
            </label>
          ))}
        </div>
      )}

      {question.question_type === 'rating' && (
        <div className="flex gap-2">
          {Array.from({ length: ((question.type_specific_options?.max as number) ?? 5) }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`flex size-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                error ? 'border-red-200' : 'border-slate-200'
              }`}
              style={value === n ? { borderColor: brandColor, backgroundColor: `${brandColor}10`, color: brandColor } : undefined}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500">This field is required</p>
      )}
    </div>
  )
}
