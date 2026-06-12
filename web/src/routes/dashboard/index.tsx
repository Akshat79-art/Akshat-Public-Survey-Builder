/*
  dashboard/index.tsx — Route: /dashboard
  Lists all surveys. Shows an empty state with a CTA when there are none.
  Actual survey data will be loaded via TanStack Query in hooks.ts.
*/
import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCreateSurvey, useSurveys } from '@/hooks'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const { data: surveys, isLoading, error } = useSurveys()
  const create = useCreateSurvey()

  function handleNewSurvey() {
    const slug = crypto.randomUUID().slice(0, 8)
    create.mutate(
      { title: 'Untitled Survey', url_slug: slug },
      {
        onSuccess: (res) => {
          toast.success('Survey created')
          navigate({ to: '/dashboard/surveys/$id', params: { id: res.id } })
        },
        onError: (e) => toast.error(e.message),
      },
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            My Surveys
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage your surveys
          </p>
        </div>
        <Button onClick={handleNewSurvey} disabled={create.isPending}>
          {create.isPending ? (
            <Loader2 className="mr-1.5 size-4 animate-spin" />
          ) : (
            <Plus className="mr-1.5 size-4" />
          )}
          New Survey
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-slate-300" />
        </div>
      ) : error ? (
        <Card className="border-dashed border-slate-300">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-slate-400">{error.message}</p>
            <p className="mt-1 text-xs text-slate-300">Add Clerk API keys to use the dashboard</p>
          </CardContent>
        </Card>
      ) : surveys && surveys.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {surveys.map((s) => (
            <Card key={s.id} className="cursor-pointer border-slate-200 transition-shadow hover:shadow-md" onClick={() => navigate({ to: '/dashboard/surveys/$id', params: { id: s.id } })}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  {s.logo_url ? (
                    <img src={s.logo_url} alt="" className="mt-0.5 size-8 shrink-0 rounded object-contain" />
                  ) : (
                    <div className="mt-0.5 size-8 shrink-0 rounded-lg border border-slate-200" style={{ backgroundColor: s.brand_color || '#4f46e5' }} />
                  )}
                  <div className="min-w-0">
                    <CardTitle className="text-base">{s.title}</CardTitle>
                    <CardDescription>/s/{s.url_slug}</CardDescription>
                    {!s.logo_url && (
                      <div className="mt-2 h-1 w-12 rounded-full" style={{ backgroundColor: s.brand_color || '#4f46e5' }} />
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState onNewSurvey={handleNewSurvey} />
      )}
    </div>
  )
}

function EmptyState({ onNewSurvey }: { onNewSurvey: () => void }) {
  return (
    <Card className="border-dashed border-slate-300">
      <CardHeader>
        <CardTitle className="text-center text-lg text-slate-500">
          No surveys yet
        </CardTitle>
        <CardDescription className="text-center">
          Create your first survey to start collecting responses.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-8">
        <Button onClick={onNewSurvey}>
          <Plus className="mr-1.5 size-4" />
          New Survey
        </Button>
      </CardContent>
    </Card>
  )
}
