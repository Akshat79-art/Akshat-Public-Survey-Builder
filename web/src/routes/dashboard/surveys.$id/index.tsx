import { useEffect, useState } from 'react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, Copy, GripVertical, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useSurvey, useUpdateSurvey } from '@/hooks'

type QuestionType = 'short_text' | 'multiple_choice' | 'rating'

interface Question {
  id: string
  question_type: QuestionType
  question_text: string
  order_index: number
  is_required: boolean
  type_specific_options: Record<string, unknown>
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'short_text', label: 'Short Text' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'rating', label: 'Rating (1-5)' },
]

function newQuestion(type: QuestionType, index: number): Question {
  const base = {
    id: crypto.randomUUID(),
    question_type: type,
    question_text: '',
    order_index: index,
    is_required: false,
  }
  if (type === 'multiple_choice') {
    return { ...base, type_specific_options: { options: ['', ''] } }
  }
  if (type === 'rating') {
    return { ...base, type_specific_options: { max: 5 } }
  }
  return { ...base, type_specific_options: {} }
}

function SortableQuestion({
  question,
  onChange,
  onDelete,
}: {
  question: Question
  onChange: (q: Question) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
      <Card className="border-slate-200">
        <CardContent className="flex items-start gap-3 p-4">
          <button
            type="button"
            className="mt-1.5 cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Select
                value={question.question_type}
                onValueChange={(v) => onChange({ ...question, question_type: v as QuestionType })}
              >
                <SelectTrigger className="h-7 w-40 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-1.5 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={question.is_required}
                  onChange={(e) => onChange({ ...question, is_required: e.target.checked })}
                  className="size-3.5 rounded border-slate-300 text-indigo-800"
                />
                Required
              </label>
            </div>

            <input
              value={question.question_text}
              onChange={(e) => onChange({ ...question, question_text: e.target.value })}
              placeholder="Enter your question..."
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />

            {question.question_type === 'multiple_choice' && (
              <OptionsEditor
                options={(question.type_specific_options.options as string[]) ?? ['', '']}
                onChange={(options) =>
                  onChange({ ...question, type_specific_options: { ...question.type_specific_options, options } })
                }
              />
            )}

            {question.question_type === 'rating' && (
              <p className="text-xs text-slate-400">Rating scale: 1 to 5</p>
            )}
          </div>

          <button
            type="button"
            onClick={onDelete}
            className="mt-1.5 text-slate-300 hover:text-red-500"
          >
            <Trash2 className="size-4" />
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

function OptionsEditor({ options, onChange }: { options: string[]; onChange: (o: string[]) => void }) {
  function setOption(i: number, value: string) {
    const next = [...options]
    next[i] = value
    onChange(next)
  }

  function addOption() {
    onChange([...options, ''])
  }

  function removeOption(i: number) {
    if (options.length <= 2) return
    onChange(options.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-1.5">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-slate-300" />
          <input
            value={opt}
            onChange={(e) => setOption(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
            className="block w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          {options.length > 2 && (
            <button type="button" onClick={() => removeOption(i)} className="text-slate-300 hover:text-red-500">
              <Trash2 className="size-3" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="flex items-center gap-1 text-xs text-indigo-800 hover:text-indigo-700"
      >
        <Plus className="size-3" /> Add option
      </button>
    </div>
  )
}

export const Route = createFileRoute('/dashboard/surveys/$id/')({
  component: SurveyPage,
})

function SurveyPage() {
  const { id } = useParams({ from: '/dashboard/surveys/$id/' })
  const { data, isLoading } = useSurvey(id)
  const save = useUpdateSurvey(id)

  const [title, setTitle] = useState('')
  const [color, setColor] = useState('#4f46e5')
  const [logo, setLogo] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [copied, setCopied] = useState(false)
  const urlSlug = data?.survey?.url_slug

  useEffect(() => {
    if (data?.survey) {
      setTitle(data.survey.title || '')
      setColor(data.survey.brand_color || '#4f46e5')
      setLogo(data.survey.logo_url || '')
    }
  }, [data?.survey])

  useEffect(() => {
    if (data?.questions) {
      setQuestions(data.questions)
    }
  }, [data?.questions])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = questions.findIndex((q) => q.id === active.id)
    const newIndex = questions.findIndex((q) => q.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    setQuestions((q) => {
      const reordered = arrayMove(q, oldIndex, newIndex)
      return reordered.map((q, i) => ({ ...q, order_index: i }))
    })
  }

  function addQuestion(type: QuestionType) {
    setQuestions((q) => [...q, newQuestion(type, q.length)])
  }

  function updateQuestion(updated: Question) {
    setQuestions((q) => q.map((item) => (item.id === updated.id ? updated : item)))
  }

  function deleteQuestion(id: string) {
    setQuestions((q) => q.filter((item) => item.id !== id))
  }

  function handleSave() {
    save.mutate(
      { title, brand_color: color, logo_url: logo || undefined, questions },
      { onSuccess: () => toast.success('Survey saved'), onError: (e) => toast.error(e.message) },
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-slate-300" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700">
          Survey name
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        {urlSlug && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-slate-400">
              {window.location.origin}/s/{urlSlug}
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/s/${urlSlug}`)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="flex size-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-start gap-6">
        <div>
          <label htmlFor="color" className="mb-1.5 block text-sm font-medium text-slate-700">
            Brand color
          </label>
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg border border-slate-200" style={{ backgroundColor: color }} />
            <input
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="block w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>
        <div className="flex-1">
          <label htmlFor="logo" className="mb-1.5 block text-sm font-medium text-slate-700">
            Logo URL (optional)
          </label>
          <input
            id="logo"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      <hr className="border-slate-200" />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-slate-400">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
        </div>

        {questions.length === 0 ? (
          <div className="mb-6 rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
            <p className="mb-4 text-sm text-slate-400">Add a question to get started</p>
            <div className="flex justify-center gap-2">
              {QUESTION_TYPES.map((t) => (
                <Button key={t.value} variant="outline" size="sm" onClick={() => addQuestion(t.value)}>
                  <Plus className="mr-1 size-3.5" />
                  {t.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {questions.map((q) => (
                  <SortableQuestion
                    key={q.id}
                    question={q}
                    onChange={updateQuestion}
                    onDelete={() => deleteQuestion(q.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {questions.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-slate-500">Add question</p>
            <div className="flex gap-2">
              {QUESTION_TYPES.map((t) => (
                <Button key={t.value} variant="outline" size="sm" onClick={() => addQuestion(t.value)}>
                  <Plus className="mr-1 size-3.5" />
                  {t.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button onClick={handleSave} disabled={save.isPending}>
          {save.isPending ? <Loader2 className="mr-1 size-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
