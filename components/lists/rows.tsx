import Link from 'next/link'
import { GitBranch, GitCommitHorizontal, GitMerge, GitPullRequest, GitPullRequestDraft, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Deployment, PipelineRun, PullRequest } from '@/lib/data'
import { Avatar, Mono } from '@/components/kit/primitives'
import { Badge, FindingCounts, ReviewBadge, RunIcon, RunBadge, runLabel } from '@/components/kit/status'

function PRStateIcon({ pr }: { pr: PullRequest }) {
  if (pr.state === 'merged') return <GitMerge className="size-4 text-accent-foreground" aria-label="Merged" />
  if (pr.state === 'draft') return <GitPullRequestDraft className="size-4 text-subtle-foreground" aria-label="Draft" />
  return <GitPullRequest className="size-4 text-success" aria-label="Open" />
}

export function PRRow({ pr, showRepo = true }: { pr: PullRequest; showRepo?: boolean }) {
  return (
    <li>
      <Link
        href={`/pulls/${pr.number}`}
        className="group grid grid-cols-[auto_1fr_auto] items-start gap-x-3 gap-y-1.5 px-4 py-3 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none md:items-center"
      >
        <span className="pt-0.5 md:pt-0">
          <PRStateIcon pr={pr} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-foreground group-hover:text-foreground">{pr.title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            {showRepo && <span>{pr.repo}</span>}
            <span className="tabular">#{pr.number}</span>
            <span className="inline-flex items-center gap-1">
              <Avatar person={pr.author} size="xs" />
              {pr.author.handle}
            </span>
            <span className="tabular">
              <span className="text-success">+{pr.additions}</span> <span className="text-danger">−{pr.deletions}</span>
            </span>
            <span>{pr.updated}</span>
          </p>
        </div>
        <div className="col-start-2 flex flex-wrap items-center gap-2 md:col-start-auto md:justify-end">
          <FindingCounts findings={pr.findings} />
          <ReviewBadge state={pr.review} />
          <span className="inline-flex items-center" title={`Checks ${runLabel[pr.checks].toLowerCase()}`}>
            <RunIcon status={pr.checks} />
            <span className="sr-only">Checks {runLabel[pr.checks]}</span>
          </span>
        </div>
      </Link>
    </li>
  )
}

export function RunRow({ run, showRepo = true }: { run: PipelineRun; showRepo?: boolean }) {
  return (
    <li>
      <Link
        href={`/pipelines/${run.id}`}
        className="grid grid-cols-[auto_1fr_auto] items-start gap-x-3 px-4 py-3 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
      >
        <span className="pt-0.5">
          <RunIcon status={run.status} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] text-foreground">{run.message}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            {showRepo && <span>{run.repo}</span>}
            <span className="inline-flex min-w-0 items-center gap-1">
              <GitBranch className="size-3 text-subtle-foreground" aria-hidden />
              <Mono className="truncate text-[11px]">{run.branch}</Mono>
            </span>
            <Mono className="text-[11px] text-subtle-foreground">{run.sha}</Mono>
          </p>
        </div>
        <div className="text-right text-xs">
          <p className="tabular text-muted-foreground">#{run.id}</p>
          <p className="tabular mt-0.5 text-subtle-foreground">{run.status === 'running' ? 'running' : run.duration}</p>
        </div>
      </Link>
    </li>
  )
}

const envTone = { production: 'accent', staging: 'neutral', preview: 'neutral' } as const

export function DeploymentTable({ items }: { items: Deployment[] }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[720px] text-left text-[13px]">
        <thead>
          <tr className="border-b text-[11px] font-medium tracking-wide text-subtle-foreground uppercase">
            <th scope="col" className="px-4 py-2 font-medium">Deployment</th>
            <th scope="col" className="px-3 py-2 font-medium">Environment</th>
            <th scope="col" className="px-3 py-2 font-medium">Status</th>
            <th scope="col" className="px-3 py-2 font-medium">Commit</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Duration</th>
            <th scope="col" className="px-4 py-2 text-right font-medium">When</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((d) => (
            <tr key={d.id} className="transition-colors hover:bg-muted/40">
              <td className="px-4 py-2.5">
                <Link href={`/pipelines/${d.runId}`} className="group flex flex-col">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    {d.url}
                    <ArrowUpRight className="size-3 text-subtle-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </span>
                  <span className="text-xs text-muted-foreground">{d.repo}</span>
                </Link>
              </td>
              <td className="px-3 py-2.5">
                <Badge tone={envTone[d.env]} className="capitalize">{d.env}</Badge>
              </td>
              <td className="px-3 py-2.5">
                <RunBadge status={d.status} />
              </td>
              <td className="px-3 py-2.5">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <GitCommitHorizontal className="size-3.5 text-subtle-foreground" aria-hidden />
                  <Mono className="text-foreground/80">{d.sha}</Mono>
                  <span className="max-w-56 truncate">{d.message}</span>
                </span>
              </td>
              <td className={cn('tabular px-3 py-2.5 text-right text-muted-foreground')}>{d.duration}</td>
              <td className="px-4 py-2.5 text-right">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  {d.when}
                  <Avatar person={d.author} size="xs" />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
