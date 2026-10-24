'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowLeft, Check, CircleSlash, FileCode2, GitBranch, GitMerge, GitPullRequest, GitPullRequestDraft, MessageSquareWarning, Sparkles, Workflow } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PipelineRun, PullRequest, ReviewState } from '@/lib/data'
import type { DiffFile, Finding } from '@/lib/review-data'
import { locateFinding } from '@/lib/review-data'
import { Button } from '@/components/ui/button'
import { Avatar, EmptyState, Mono, PageHeader, Segmented, Tabs } from '@/components/kit/primitives'
import { Badge, ReviewBadge, RunBadge, RunIcon, SeverityIcon } from '@/components/kit/status'
import { useToast } from '@/components/kit/toast'
import { DiffFileView, lineAnchorId, type FindingStatus } from './diff-view'
import { ReviewPanel, ReviewRunning, type ReviewData } from './review-panel'

type Tab = 'files' | 'checks' | 'activity'

function stateBadge(pr: PullRequest) {
  if (pr.state === 'merged')
    return (
      <Badge tone="accent">
        <GitMerge className="size-3" aria-hidden /> Merged
      </Badge>
    )
  if (pr.state === 'draft')
    return (
      <Badge tone="neutral">
        <GitPullRequestDraft className="size-3" aria-hidden /> Draft
      </Badge>
    )
  return (
    <Badge tone="success">
      <GitPullRequest className="size-3" aria-hidden /> Open
    </Badge>
  )
}

function NoReviewPanel({ pr }: { pr: PullRequest }) {
  if (pr.review === 'reviewing') {
    return (
      <>
        <div className="flex items-center gap-2 border-b px-4 py-2.5">
          <span className="flex size-5 items-center justify-center rounded bg-primary text-primary-foreground" aria-hidden>
            <Sparkles className="size-3" />
          </span>
          <h2 className="text-[13px] font-medium text-foreground">AI review</h2>
        </div>
        <ReviewRunning files={pr.files} />
      </>
    )
  }
  if (pr.state === 'draft') {
    return (
      <EmptyState
        icon={<Sparkles className="size-4" />}
        title="Review starts when this PR is ready"
        description="Sentinel skips drafts to save CI minutes. Mark the pull request ready for review to trigger an AI pass."
      />
    )
  }
  return (
    <EmptyState
      icon={<Check className="size-4 text-success" />}
      title="No issues found"
      description={`Sentinel reviewed ${pr.files} changed files and found nothing worth flagging across correctness, security, and reliability.`}
    />
  )
}

export function PRDetail({
  pr,
  files,
  review,
  run,
}: {
  pr: PullRequest
  files: DiffFile[]
  review: ReviewData | null
  run?: PipelineRun
}) {
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('files')
  const [mobileView, setMobileView] = useState<'code' | 'review'>('code')
  const [activeId, setActiveId] = useState<string | null>(review?.findings[0]?.id ?? null)
  const [statuses, setStatuses] = useState<Record<string, FindingStatus>>(() =>
    Object.fromEntries((review?.findings ?? []).map((f) => [f.id, 'open' as const])),
  )
  const [myReview, setMyReview] = useState<ReviewState | null>(null)
  const [rerunning, setRerunning] = useState(false)

  const located = useMemo(() => {
    const byFile = files.map(() => new Map<number, Finding[]>())
    const locations: Record<string, string> = {}
    const anchors: Record<string, string> = {}
    for (const f of review?.findings ?? []) {
      const loc = locateFinding(files, f)
      if (!loc) continue
      const fileIdx = files.indexOf(loc.file)
      const list = byFile[fileIdx].get(loc.index) ?? []
      list.push(f)
      byFile[fileIdx].set(loc.index, list)
      locations[f.id] = `${f.file.split('/').pop()}:${loc.line}`
      anchors[f.id] = lineAnchorId(fileIdx, loc.index)
    }
    return { byFile, locations, anchors }
  }, [files, review])

  const openFindings = (review?.findings ?? []).filter((f) => statuses[f.id] === 'open')
  const openCritical = openFindings.filter((f) => f.severity === 'critical').length

  const blockers = [
    pr.checks === 'failed' && { label: 'Required checks failing', icon: <RunIcon status="failed" /> },
    pr.checks === 'running' && { label: 'Checks still running', icon: <RunIcon status="running" /> },
    openCritical > 0 && { label: `${openCritical} critical finding unresolved`, icon: <SeverityIcon severity="critical" /> },
    pr.state === 'draft' && { label: 'Pull request is a draft', icon: <CircleSlash className="size-3.5 text-subtle-foreground" /> },
  ].filter(Boolean) as { label: string; icon: React.ReactNode }[]

  const select = (id: string, fromPanel = false) => {
    setActiveId((cur) => (cur === id && !fromPanel ? null : id))
    const anchor = located.anchors[id]
    if (!anchor) return
    if (fromPanel) {
      setMobileView('code')
      requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    } else {
      requestAnimationFrame(() => document.getElementById(`finding-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
    }
  }

  const setStatus = (id: string, status: FindingStatus) => setStatuses((s) => ({ ...s, [id]: status }))

  const apply = (id: string) => {
    setStatus(id, 'applied')
    const next = openFindings.find((f) => f.id !== id)
    setActiveId(next?.id ?? null)
    toast({ tone: 'success', title: 'Suggestion committed', description: `Pushed 3f2e71a to ${pr.branch}. Checks will re-run.` })
  }
  const dismiss = (id: string) => {
    setStatus(id, 'dismissed')
    const next = openFindings.find((f) => f.id !== id)
    setActiveId(next?.id ?? null)
    toast({ tone: 'neutral', title: 'Finding dismissed', description: 'Sentinel will use this as feedback for future reviews.' })
  }
  const reopen = (id: string) => {
    setStatus(id, 'open')
    setActiveId(id)
  }
  const rerun = () => {
    setRerunning(true)
    setTimeout(() => {
      setRerunning(false)
      toast({ tone: 'success', title: 'Review complete', description: 'No new findings since a41f9c2.' })
    }, 1800)
  }

  const submitReview = (state: ReviewState) => {
    setMyReview(state)
    toast({
      tone: state === 'approved' ? 'success' : 'danger',
      title: state === 'approved' ? 'Approved' : 'Changes requested',
      description: `Your review on #${pr.number} was submitted.`,
    })
  }

  const reviewPanel = review ? (
    <ReviewPanel
      review={review}
      statuses={statuses}
      activeId={activeId}
      locations={located.locations}
      rerunning={rerunning}
      onSelect={(id) => select(id, true)}
      onApply={apply}
      onDismiss={dismiss}
      onReopen={reopen}
      onRerun={rerun}
    />
  ) : (
    <NoReviewPanel pr={pr} />
  )

  return (
    <>
      <PageHeader
        crumbs={[
          { label: pr.repo, href: `/?repo=${pr.repo}` },
          { label: 'Pull requests', href: '/pulls' },
          { label: `#${pr.number}` },
        ]}
        title={
          <>
            {pr.title} <span className="tabular font-normal text-subtle-foreground">#{pr.number}</span>
          </>
        }
        meta={
          <>
            {stateBadge(pr)}
            <span className="flex items-center gap-1.5">
              <Avatar person={pr.author} size="xs" />
              <span className="text-foreground">{pr.author.handle}</span>
              wants to merge
            </span>
            <span className="flex min-w-0 items-center gap-1">
              <GitBranch className="size-3 text-subtle-foreground" aria-hidden />
              <Mono className="truncate rounded bg-muted px-1 text-[11px] text-foreground">{pr.branch}</Mono>
              <span aria-hidden>→</span>
              <span className="sr-only">into</span>
              <Mono className="rounded bg-muted px-1 text-[11px] text-foreground">{pr.base}</Mono>
            </span>
            <ReviewBadge state={myReview ?? pr.review} />
          </>
        }
        actions={
          pr.state !== 'merged' && (
            <>
              <Button variant="outline" onClick={() => submitReview('changes_requested')} disabled={myReview === 'changes_requested'}>
                <MessageSquareWarning aria-hidden />
                Request changes
              </Button>
              <Button variant="outline" onClick={() => submitReview('approved')} disabled={myReview === 'approved'}>
                <Check aria-hidden />
                Approve
              </Button>
              <Button
                disabled={blockers.length > 0}
                aria-describedby={blockers.length > 0 ? 'merge-blockers' : undefined}
                onClick={() => toast({ tone: 'success', title: `Merged #${pr.number}`, description: `${pr.branch} was squashed into ${pr.base}.` })}
              >
                <GitMerge aria-hidden />
                Merge
              </Button>
            </>
          )
        }
      >
        <div className="mx-auto max-w-[1400px] px-4 md:px-6">
          {blockers.length > 0 && pr.state !== 'merged' && (
            <div id="merge-blockers" className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Merge blocked</span>
              {blockers.map((b) => (
                <span key={b.label} className="flex items-center gap-1.5">
                  {b.icon}
                  {b.label}
                </span>
              ))}
            </div>
          )}
          <Tabs
            label="Pull request sections"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'files', label: 'Files changed', count: pr.files },
              { value: 'checks', label: 'Checks', count: run ? run.stages.reduce((a, s) => a + s.jobs.length, 0) : 0 },
              { value: 'activity', label: 'Activity' },
            ]}
          />
        </div>
      </PageHeader>

      <div className="mx-auto max-w-[1400px] px-4 py-4 md:px-6" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'files' && (
          <>
            <div className="mb-3 xl:hidden">
              <Segmented
                label="Show code or AI review"
                value={mobileView}
                onChange={setMobileView}
                options={[
                  { value: 'code', label: 'Code' },
                  { value: 'review', label: 'AI review', count: review ? openFindings.length : undefined },
                ]}
              />
            </div>
            <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
              <div className={cn('flex min-w-0 flex-col gap-3', mobileView !== 'code' && 'hidden xl:flex')}>
                {files.length === 0 ? (
                  <div className="rounded-lg border bg-surface">
                    <EmptyState
                      icon={<FileCode2 className="size-4" />}
                      title="Diff not loaded"
                      description={`This sample workspace includes the full diff for #482 only. #${pr.number} changes ${pr.files} files (+${pr.additions} −${pr.deletions}).`}
                      action={
                        <Button variant="outline" size="sm" render={<Link href="/pulls/482" />} nativeButton={false}>
                          Open #482
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <>
                    <nav aria-label="Changed files" className="flex flex-wrap gap-1.5">
                      {files.map((f, i) => (
                        <a
                          key={f.path}
                          href={`#file-${i}`}
                          className="inline-flex h-7 items-center gap-1.5 rounded-md border bg-surface px-2 font-mono text-[11px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                        >
                          {f.path.split('/').pop()}
                          <span className="tabular text-success">+{f.additions}</span>
                          {f.deletions > 0 && <span className="tabular text-danger">−{f.deletions}</span>}
                        </a>
                      ))}
                    </nav>
                    {files.map((f, i) => (
                      <DiffFileView
                        key={f.path}
                        file={f}
                        fileIdx={i}
                        findingsAt={located.byFile[i]}
                        statuses={statuses}
                        activeId={activeId}
                        onSelect={(id) => select(id)}
                        onReopen={reopen}
                      />
                    ))}
                  </>
                )}
              </div>
              <aside
                aria-label="AI review"
                className={cn(
                  'overflow-hidden rounded-lg border bg-surface xl:sticky xl:top-4 xl:max-h-[calc(100dvh-2rem)] xl:overflow-y-auto xl:scrollbar-thin',
                  mobileView !== 'review' && 'hidden xl:block',
                )}
              >
                {reviewPanel}
              </aside>
            </div>
          </>
        )}

        {tab === 'checks' &&
          (run ? (
            <div className="overflow-hidden rounded-lg border bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
                <div className="flex items-center gap-2 text-[13px]">
                  <Workflow className="size-4 text-subtle-foreground" aria-hidden />
                  <span className="font-medium text-foreground">Run #{run.id}</span>
                  <RunBadge status={run.status} />
                  <span className="text-xs text-muted-foreground">{run.duration}</span>
                </div>
                <Button variant="outline" size="sm" render={<Link href={`/pipelines/${run.id}`} />} nativeButton={false}>
                  Open pipeline
                </Button>
              </div>
              <ul className="divide-y">
                {run.stages.flatMap((s) =>
                  s.jobs.map((j) => (
                    <li key={j.id}>
                      <Link href={`/pipelines/${run.id}?job=${j.id}`} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40">
                        <RunIcon status={j.status} />
                        <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                          <span className="text-muted-foreground">{s.name} / </span>
                          {j.name}
                        </span>
                        <span className="tabular text-xs text-muted-foreground">{j.duration}</span>
                      </Link>
                    </li>
                  )),
                )}
              </ul>
            </div>
          ) : (
            <div className="rounded-lg border bg-surface">
              <EmptyState icon={<Workflow className="size-4" />} title="No checks reported" description="Pipelines will appear here once CI picks up the latest push to this branch." />
            </div>
          ))}

        {tab === 'activity' && (
          <ol className="relative ml-2 flex max-w-2xl flex-col gap-5 border-l pl-6">
            {[
              { who: pr.author, what: `opened this pull request from ${pr.branch}`, when: '2d ago' },
              { who: null, what: `Sentinel requested review from ${pr.reviewers.map((r) => r.handle).join(', ')}`, when: '2d ago' },
              ...(run ? [{ who: run.author, what: `pushed ${run.sha} — ${run.message}`, when: run.started }] : []),
              ...(review ? [{ who: null, what: `Sentinel left ${review.findings.length} findings on ${review.reviewedSha}`, when: review.reviewedAt }] : []),
              ...(myReview ? [{ who: null, what: `You ${myReview === 'approved' ? 'approved these changes' : 'requested changes'}`, when: 'just now' }] : []),
            ].map((e, i) => (
              <li key={i} className="relative text-[13px]">
                <span className="absolute top-1.5 -left-[29px] size-2 rounded-full bg-border-strong ring-4 ring-background" aria-hidden />
                <span className="flex flex-wrap items-center gap-x-1.5 text-muted-foreground">
                  {e.who ? (
                    <>
                      <Avatar person={e.who} size="xs" />
                      <span className="font-medium text-foreground">{e.who.handle}</span>
                    </>
                  ) : (
                    <Sparkles className="size-3.5 text-accent-foreground" aria-hidden />
                  )}
                  <span>{e.what}</span>
                  <span className="text-subtle-foreground">· {e.when}</span>
                </span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-6 xl:hidden">
          <Button variant="ghost" size="sm" render={<Link href="/pulls" />} nativeButton={false}>
            <ArrowLeft aria-hidden />
            All pull requests
          </Button>
        </div>
      </div>
    </>
  )
}
