import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dot, type Tone } from '@/components/kit/status'

export type AttentionItem = {
  id: string
  tone: Tone
  repo?: string
  title: string
  detail: string
  href: string
  cta: string
}

export const attentionItems: AttentionItem[] = [
  {
    id: 'a1',
    tone: 'danger',
    repo: 'api-gateway',
    title: 'Data race blocks rate limiting PR',
    detail: 'Run #4821 failed in Integration · AI review flagged the same line',
    href: '/pulls/482',
    cta: 'Review #482',
  },
  {
    id: 'a2',
    tone: 'warning',
    title: 'Datadog token expired',
    detail: 'Deploy markers and error-rate gates are paused for 2 repositories',
    href: '/settings/integrations',
    cta: 'Reconnect',
  },
  {
    id: 'a3',
    tone: 'warning',
    repo: 'billing-service',
    title: 'Build time regression',
    detail: 'p95 build 14m 20s, up 38% since ledger batching landed',
    href: '/pipelines/4816',
    cta: 'Inspect run',
  },
]

export function Attention({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-surface px-4 py-3">
        <CheckCircle2 className="size-4 text-success" aria-hidden />
        <p className="text-[13px] text-foreground">Nothing needs your attention</p>
        <p className="text-xs text-muted-foreground">All checks, reviews, and integrations are healthy for this scope.</p>
      </div>
    )
  }
  return (
    <section aria-labelledby="attention-title">
      <h2 id="attention-title" className="sr-only">Needs attention</h2>
      <ul className={cn('grid gap-px overflow-hidden rounded-lg border bg-border', items.length > 1 && 'md:grid-cols-3')}>
        {items.map((item) => (
          <li key={item.id} className="bg-surface">
            <Link href={item.href} className="group flex h-full flex-col gap-2 px-4 py-3 transition-colors hover:bg-surface-raised">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <Dot tone={item.tone} pulse={item.tone === 'danger'} />
                {item.repo ?? 'Workspace'}
              </span>
              <span className="text-[13px] font-medium text-foreground">{item.title}</span>
              <span className="text-xs leading-relaxed text-muted-foreground">{item.detail}</span>
              <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-medium text-accent-foreground">
                {item.cta}
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
