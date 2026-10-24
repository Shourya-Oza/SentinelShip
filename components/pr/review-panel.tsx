'use client'

import { useState } from 'react'
import { Check, ChevronRight, Copy, RotateCw, Sparkles, X, CircleCheck, AlertTriangle, CircleX, Loader, Undo2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Severity } from '@/lib/data'
import type { Finding } from '@/lib/review-data'
import { Button } from '@/components/ui/button'
import { Badge, SeverityIcon, severityMeta } from '@/components/kit/status'
import { Mono, Segmented, Skeleton } from '@/components/kit/primitives'
import type { FindingStatus } from './diff-view'

export type ReviewData = {
  model: string
  reviewedSha: string
  reviewedAt: string
  durationSec: number
  risk: 'low' | 'medium' | 'high'
  summary: string
  checks: { label: string; status: 'success' | 'warning' | 'failed'; note: string }[]
  findings: Finding[]
}

const riskMeta = {
  low: { tone: 'success', label: 'Low risk' },
  medium: { tone: 'warning', label: 'Medium risk' },
  high: { tone: 'danger', label: 'High risk' },
} as const

function CheckIcon({ status }: { status: 'success' | 'warning' | 'failed' }) {
  if (status === 'success') return <CircleCheck className="size-3.5 text-success" aria-label="Passed" />
  if (status === 'warning') return <AlertTriangle className="size-3.5 text-warning" aria-label="Warning" />
  return <CircleX className="size-3.5 text-danger" aria-label="Failed" />
}

export function ReviewRunning({ files }: { files: number }) {
  const steps = [
    { label: `Indexed ${files} changed files`, done: true },
    { label: 'Resolved call graph for touched symbols', done: true },
    { label: 'Analyzing correctness and security', done: false },
    { label: 'Ranking findings', done: false },
  ]
  return (
    <div className="flex flex-col gap-4 p-4" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-2">
        <Loader className="size-4 animate-spin text-accent-foreground [animation-duration:2s]" aria-hidden />
        <p className="text-[13px] font-medium text-foreground">Sentinel is reviewing this pull request</p>
      </div>
      <ol className="flex flex-col gap-2">
        {steps.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2.5 text-xs">
            {s.done ? (
              <Check className="size-3.5 text-success" aria-hidden />
            ) : i === steps.findIndex((x) => !x.done) ? (
              <span className="flex size-3.5 items-center justify-center" aria-hidden>
                <span className="size-1.5 animate-pulse rounded-full bg-accent-foreground" />
              </span>
            ) : (
              <span className="flex size-3.5 items-center justify-center" aria-hidden>
                <span className="size-1.5 rounded-full bg-subtle-foreground/50" />
              </span>
            )}
            <span className={s.done ? 'text-muted-foreground' : 'text-foreground'}>{s.label}</span>
          </li>
        ))}
      </ol>
      <div className="space-y-2 border-t pt-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  )
}

function FindingCard({
  finding,
  status,
  active,
  location,
  onSelect,
  onApply,
  onDismiss,
  onReopen,
}: {
  finding: Finding
  status: FindingStatus
  active: boolean
  location: string
  onSelect: () => void
  onApply: () => void
  onDismiss: () => void
  onReopen: () => void
}) {
  const [copied, setCopied] = useState(false)
  const meta = severityMeta[finding.severity]
  const resolved = status !== 'open'

  return (
    <li id={`finding-${finding.id}`} className={cn('scroll-mt-4 transition-colors', active && 'bg-surface-raised')}>
      <button
        type="button"
        onClick={onSelect}
        aria-expanded={active}
        className="flex w-full items-start gap-2.5 px-4 py-3 text-left focus-visible:bg-surface-raised focus-visible:outline-none"
      >
        <SeverityIcon severity={finding.severity} className="mt-0.5" />
        <span className="min-w-0 flex-1">
          <span className={cn('block text-[13px] leading-snug', resolved ? 'text-muted-foreground line-through decoration-subtle-foreground' : 'text-foreground')}>
            {finding.title}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="sr-only">{meta.label}.</span>
            <Mono className="text-[11px]">{location}</Mono>
            <span>{finding.category}</span>
            {status === 'applied' && <Badge tone="success">Applied</Badge>}
            {status === 'dismissed' && <Badge tone="neutral">Dismissed</Badge>}
          </span>
        </span>
        <ChevronRight className={cn('mt-0.5 size-3.5 shrink-0 text-subtle-foreground transition-transform', active && 'rotate-90')} aria-hidden />
      </button>

      {active && (
        <div className="flex flex-col gap-3 px-4 pb-4 pl-10">
          <p className="text-pretty text-xs leading-relaxed text-muted-foreground">{finding.body}</p>
          {finding.suggestion && (
            <div className="overflow-hidden rounded-md border bg-background">
              <div className="flex h-7 items-center justify-between border-b px-2.5">
                <span className="text-[11px] font-medium text-muted-foreground">Suggested change</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(finding.suggestion ?? '')
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check className="size-3" aria-hidden /> : <Copy className="size-3" aria-hidden />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="overflow-x-auto p-2.5 font-mono text-[11.5px] leading-relaxed text-foreground/90 scrollbar-thin" style={{ tabSize: 2 }}>
                {finding.suggestion}
              </pre>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {resolved ? (
              <Button variant="outline" size="sm" onClick={onReopen}>
                <Undo2 aria-hidden />
                Reopen
              </Button>
            ) : (
              <>
                {finding.suggestion && (
                  <Button size="sm" onClick={onApply}>
                    <Check aria-hidden />
                    Commit suggestion
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={onDismiss}>
                  <X aria-hidden />
                  Dismiss
                </Button>
              </>
            )}
            <span className="tabular ml-auto text-[11px] text-subtle-foreground">{Math.round(finding.confidence * 100)}% confidence</span>
          </div>
        </div>
      )}
    </li>
  )
}

type SeverityFilter = 'all' | Severity

export function ReviewPanel({
  review,
  statuses,
  activeId,
  locations,
  rerunning,
  onSelect,
  onApply,
  onDismiss,
  onReopen,
  onRerun,
}: {
  review: ReviewData
  statuses: Record<string, FindingStatus>
  activeId: string | null
  locations: Record<string, string>
  rerunning: boolean
  onSelect: (id: string) => void
  onApply: (id: string) => void
  onDismiss: (id: string) => void
  onReopen: (id: string) => void
  onRerun: () => void
}) {
  const [filter, setFilter] = useState<SeverityFilter>('all')
  const [showResolved, setShowResolved] = useState(true)

  const count = (s: Severity) => review.findings.filter((f) => f.severity === s && statuses[f.id] === 'open').length
  const resolvedCount = review.findings.filter((f) => statuses[f.id] !== 'open').length
  const visible = review.findings.filter(
    (f) => (filter === 'all' || f.severity === filter) && (showResolved || statuses[f.id] === 'open'),
  )
  const risk = riskMeta[review.risk]

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded bg-primary text-primary-foreground" aria-hidden>
            <Sparkles className="size-3" />
          </span>
          <h2 className="text-[13px] font-medium text-foreground">AI review</h2>
          <Badge tone={risk.tone}>{risk.label}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onRerun} disabled={rerunning}>
          <RotateCw className={rerunning ? 'animate-spin' : undefined} aria-hidden />
          Re-run
        </Button>
      </div>

      {rerunning ? (
        <ReviewRunning files={3} />
      ) : (
        <>
          <div className="flex flex-col gap-3 border-b px-4 py-3.5">
            <p className="text-pretty text-[13px] leading-relaxed text-foreground/90">{review.summary}</p>
            <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {review.checks.map((c) => (
                <li key={c.label} className="flex items-start gap-2 rounded-md border bg-background px-2.5 py-2">
                  <span className="mt-px">
                    <CheckIcon status={c.status} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-foreground">{c.label}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{c.note}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-subtle-foreground">
              {review.model} · reviewed <Mono className="text-[11px]">{review.reviewedSha}</Mono> {review.reviewedAt} in {review.durationSec}s
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2">
            <Segmented
              label="Filter findings by severity"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All', count: review.findings.length - resolvedCount },
                { value: 'critical', label: 'Critical', count: count('critical') },
                { value: 'warning', label: 'Warning', count: count('warning') },
                { value: 'suggestion', label: 'Suggestion', count: count('suggestion') },
              ]}
            />
            {resolvedCount > 0 && (
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showResolved}
                  onChange={(e) => setShowResolved(e.target.checked)}
                  className="size-3.5 accent-[var(--primary)]"
                />
                Show resolved ({resolvedCount})
              </label>
            )}
          </div>

          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 px-6 py-10 text-center">
              <CircleCheck className="size-5 text-success" aria-hidden />
              <p className="text-[13px] font-medium text-foreground">No open {filter === 'all' ? '' : severityMeta[filter].label.toLowerCase() + ' '}findings</p>
              <p className="text-xs text-muted-foreground">Resolved findings are hidden. Toggle “Show resolved” to see them.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {visible.map((f) => (
                <FindingCard
                  key={f.id}
                  finding={f}
                  status={statuses[f.id]}
                  active={activeId === f.id}
                  location={locations[f.id] ?? f.file}
                  onSelect={() => onSelect(f.id)}
                  onApply={() => onApply(f.id)}
                  onDismiss={() => onDismiss(f.id)}
                  onReopen={() => onReopen(f.id)}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
