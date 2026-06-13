import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: Home,
})

function LoadingAnimation() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (phase >= 3) return
    const t = setTimeout(() => setPhase((p) => p + 1), 800)
    return () => clearTimeout(t)
  }, [phase])

  const stage = (i: number) => {
    if (phase < i) return 'opacity-0 scale-90'
    if (phase === i) return 'opacity-100 scale-100'
    return 'opacity-0 scale-75'
  }

  return (
    <div className="blur-sm relative flex items-center justify-center" style={{ height: '16rem', width: '32rem' }}>
      <div className={`transition-all duration-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${stage(0)}`}>
        <div className="size-32 rounded-xl border-4 border-indigo-800 bg-indigo-100/70" />
      </div>
      <div className={`transition-all duration-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${stage(1)}`}>
        <div className="h-32 w-[28rem] rounded-xl border-4 border-indigo-700 bg-indigo-100/70" />
      </div>
      <div className={`transition-all duration-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${stage(2)}`}>
        <div className="flex gap-8">
          <div className="size-28 rounded-xl border-4 border-indigo-800 bg-indigo-100/70" />
          <div className="size-28 rounded-xl border-4 border-indigo-400 bg-indigo-100/70" />
          <div className="size-28 rounded-xl border-4 border-indigo-800 bg-indigo-100/70" />
        </div>
      </div>
    </div>
  )
}

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

function Home() {
  const [dropping, setDropping] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDropping(true), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="scale-150">
          <LoadingAnimation />
        </div>
      </div>

      <div className="relative">
        <header className="px-6 pt-10 pb-4 text-center">
          <span className="text-2xl font-semibold tracking-tight text-indigo-800">
            Survey Bee
          </span>
        </header>

        <main className="mx-auto max-w-3xl px-6 pt-24 pb-40 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Surveys that feel like yours
          </h1>
          <p className="mt-5 text-lg text-slate-500 sm:text-xl">
            Create branded surveys, share a public link, and collect responses.
            No sign-in required for your respondents.
          </p>
          <div className="mt-9 flex items-center justify-center gap-4">
            <Button size="xl" variant="outline" asChild className="!border-black transition-all hover:!border-transparent hover:!bg-indigo-800 hover:!text-white hover:!shadow-xl hover:-translate-y-0.5">
              <Link to="/sign-up">Sign up</Link>
            </Button>
            <Button size="xl" variant="outline" asChild className="!border-black transition-all hover:!border-transparent hover:!bg-indigo-800 hover:!text-white hover:!shadow-xl hover:-translate-y-0.5">
              <Link to="/sign-in">Sign in</Link>
            </Button>
          </div>
        </main>
      </div>

      {dropping && (
        <div className="absolute inset-0 overflow-x-hidden pointer-events-none">
          <FallingSquares />
        </div>
      )}

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 w-full overflow-x-hidden pointer-events-none" style={{ height: '10rem' }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="h-full w-full">
          <path d="M0,40 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-indigo-800)" opacity="0.4" />
        </svg>
      </div>
    </div>
  )
}
