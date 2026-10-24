import { cn } from '@/lib/utils'
import type { Health, ReviewState, RunStatus, Severity } from '@/lib/data'
import {
  AlertTriangle,
  Ban,
  Check,
  CircleDashed,
  CircleDot,
  Clock,
  Loader,
  MinusCircle,
  OctagonAlert,
  Lightbulb,
  X,
} from 'lucide-react'

type Tone = 'success' | 'warning' | 'danger' | 'accent' | 'neutral'

const toneText: Record<Tone, string> = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  accent: 'text-accent-foreground',
  neutral: 'text-muted-foreground',
}

const toneBg: Record<Tone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  accent: 'bg-primary',
  neutral: 'bg-subtle-foreground',
}

const toneBadge: Record<Tone, string> = {
  success: 'text-success bg-success/10 border-success/20',
  warning: 'text-warning bg-warning/10 border-warning/20',
  danger: 'text-danger bg-danger/10 border-danger/20',
  accent: 'text-accent-foreground bg-accent border-primary/25',
  neutral: 'text-muted-foreground bg-muted border-border',
}

export const runTone: Record<RunStatus, Tone> = {
  success: 'success',
  failed: 'danger',
  running: 'accent',
  queued: 'neutral',
  canceled: 'neutral',
  skipped: 'neutral',
  waiting: 'warning',
}

export const runLabel: Record<RunStatus, string> = {
  success: 'Passed',
  failed: 'Failed',
  running: 'Running',
  queued: 'Queued',
  canceled: 'Canceled',
  skipped: 'Skipped',
  waiting: 'Awaiting approval',
}

export function RunIcon({ status, className }: { status: RunStatus; className?: string }) {
  const cls = cn('size-3.5 shrink-0', toneText[runTone[status]], className)
  switch (status) {
    case 'success':
      return <Check className={cls} strokeWidth={2.5} aria-hidden />
    case 'failed':
      return <X className={cls} strokeWidth={2.5} aria-hidden />
    case 'running':
      return <Loader className={cn(cls, 'animate-spin [animation-duration:2s]')} aria-hidden />
    case 'queued':
      return <CircleDashed className={cls} aria-hidden />
    case 'canceled':
      return <Ban className={cls} aria-hidden />
    case 'skipped':
      return <MinusCircle className={cls} aria-hidden />
    case 'waiting':
      return <Clock className={cls} aria-hidden />
  }
}

export function Dot({ tone, pulse, className }: { tone: Tone; pulse?: boolean; className?: string }) {
  return (
    <span className={cn('relative inline-flex size-2 shrink-0', className)} aria-hidden>
      {pulse && <span className={cn('absolute inset-0 animate-ping rounded-full opacity-50', toneBg[tone])} />}
      <span className={cn('relative inline-flex size-2 rounded-full', toneBg[tone])} />
    </span>
  )
}

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1 rounded-[5px] border px-1.5 text-[11px] font-medium leading-none whitespace-nowrap',
        toneBadge[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function RunBadge({ status }: { status: RunStatus }) {
  return (
    <Badge tone={runTone[status]}>
      <RunIcon status={status} className="size-3" />
      {runLabel[status]}
    </Badge>
  )
}

export const healthTone: Record<Health, Tone> = { healthy: 'success', degraded: 'warning', failing: 'danger' }
export const healthLabel: Record<Health, string> = { healthy: 'Healthy', degraded: 'Degraded', failing: 'Failing' }

const reviewMeta: Record<ReviewState, { tone: Tone; label: string }> = {
  approved: { tone: 'success', label: 'Approved' },
  changes_requested: { tone: 'danger', label: 'Changes requested' },
  reviewing: { tone: 'accent', label: 'AI reviewing' },
  pending: { tone: 'neutral', label: 'Review pending' },
}

export function ReviewBadge({ state }: { state: ReviewState }) {
  const m = reviewMeta[state]
  return (
    <Badge tone={m.tone}>
      {state === 'reviewing' ? <Loader className="size-3 animate-spin [animation-duration:2s]" aria-hidden /> : <CircleDot className="size-3" aria-hidden />}
      {m.label}
    </Badge>
  )
}

export const severityMeta: Record<Severity, { tone: Tone; label: string; Icon: typeof OctagonAlert }> = {
  critical: { tone: 'danger', label: 'Critical', Icon: OctagonAlert },
  warning: { tone: 'warning', label: 'Warning', Icon: AlertTriangle },
  suggestion: { tone: 'accent', label: 'Suggestion', Icon: Lightbulb },
}

export function SeverityIcon({ severity, className }: { severity: Severity; className?: string }) {
  const { Icon, tone } = severityMeta[severity]
  return <Icon className={cn('size-3.5 shrink-0', toneText[tone], className)} aria-hidden />
}

export function FindingCounts({ findings }: { findings: Record<Severity, number> }) {
  const total = findings.critical + findings.warning + findings.suggestion
  if (total === 0) return <span className="text-xs text-subtle-foreground">No findings</span>
  return (
    <span className="inline-flex items-center gap-2.5 text-xs tabular">
      {(['critical', 'warning', 'suggestion'] as const).map((s) =>
        findings[s] > 0 ? (
          <span key={s} className="inline-flex items-center gap-1 text-muted-foreground">
            <SeverityIcon severity={s} className="size-3" />
            {findings[s]}
            <span className="sr-only">{severityMeta[s].label}</span>
          </span>
        ) : null,
      )}
    </span>
  )
}

export { toneText, toneBg, type Tone }
