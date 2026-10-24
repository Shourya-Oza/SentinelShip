'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { GitPullRequest, RefreshCw, Rocket, Workflow, X } from 'lucide-react'
import { currentUser, deployments, pipelineRuns, pullRequests, repos, type Environment } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { EmptyState, PageHeader, Panel, Segmented, Skeleton } from '@/components/kit/primitives'
import { DeploymentTable, PRRow, RunRow } from '@/components/lists/rows'
import { RepoHealth } from './repo-health'
import { Attention, attentionItems } from './attention'

type PRFilter = 'review' | 'mine' | 'all'
type EnvFilter = 'all' | Environment

function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul aria-busy="true" aria-label="Loading" className="divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="size-4 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
          <Skeleton className="h-5 w-20" />
        </li>
      ))}
    </ul>
  )
}

export function Overview({ repo }: { repo?: string }) {
  const router = useRouter()
  const [prFilter, setPrFilter] = useState<PRFilter>('review')
  const [envFilter, setEnvFilter] = useState<EnvFilter>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [, startTransition] = useTransition()

  const scoped = <T extends { repo: string }>(xs: T[]) => (repo ? xs.filter((x) => x.repo === repo) : xs)

  const prs = useMemo(() => {
    const base = scoped(pullRequests)
    if (prFilter === 'review') return base.filter((p) => p.requestedFromMe && p.state !== 'merged')
    if (prFilter === 'mine') return base.filter((p) => p.author.handle === currentUser.handle)
    return base
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prFilter, repo])

  const runs = scoped(pipelineRuns).slice(0, 5)
  const deploys = scoped(deployments).filter((d) => envFilter === 'all' || d.env === envFilter)
  const repoItems = repo ? repos.filter((r) => r.slug === repo) : repos
  const attention = attentionItems.filter((a) => !repo || !a.repo || a.repo === repo)

  const counts = {
    review: scoped(pullRequests).filter((p) => p.requestedFromMe && p.state !== 'merged').length,
    mine: scoped(pullRequests).filter((p) => p.author.handle === currentUser.handle).length,
    all: scoped(pullRequests).length,
  }

  const refresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 900)
  }

  return (
    <>
      <PageHeader
        title="Overview"
        meta={
          <>
            <span>{repo ? `sentinel/${repo}` : `${repos.length} repositories`}</span>
            <span aria-hidden className="text-subtle-foreground">·</span>
            <span>{refreshing ? 'Syncing…' : 'Synced just now'}</span>
          </>
        }
        actions={
          <>
            <label className="sr-only" htmlFor="repo-scope">Repository</label>
            <select
              id="repo-scope"
              value={repo ?? ''}
              onChange={(e) => startTransition(() => router.push(e.target.value ? `/?repo=${e.target.value}` : '/'))}
              className="h-8 rounded-md border border-border-strong bg-surface px-2.5 pr-8 text-[13px] text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <option value="">All repositories</option>
              {repos.map((r) => (
                <option key={r.slug} value={r.slug}>{r.name}</option>
              ))}
            </select>
            {repo && (
              <Button variant="ghost" size="sm" render={<Link href="/" />} nativeButton={false}>
                <X aria-hidden />
                Clear
              </Button>
            )}
            <Button variant="outline" onClick={refresh} disabled={refreshing} aria-label="Refresh data">
              <RefreshCw className={refreshing ? 'animate-spin' : undefined} aria-hidden />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </>
        }
      />

      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-5 md:px-6">
        {refreshing ? <Skeleton className="h-[118px] w-full rounded-lg" /> : <Attention items={attention} />}

        {refreshing ? (
          <Panel title="Repository health"><ListSkeleton rows={repoItems.length} /></Panel>
        ) : (
          <RepoHealth items={repoItems} />
        )}

        <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
          <Panel
            id="recent-prs"
            title="Pull requests"
            actions={
              <Segmented
                label="Filter pull requests"
                value={prFilter}
                onChange={setPrFilter}
                options={[
                  { value: 'review', label: 'Needs my review', count: counts.review },
                  { value: 'mine', label: 'Mine', count: counts.mine },
                  { value: 'all', label: 'All', count: counts.all },
                ]}
              />
            }
          >
            {refreshing ? (
              <ListSkeleton />
            ) : prs.length === 0 ? (
              <EmptyState
                icon={<GitPullRequest className="size-4" />}
                title={prFilter === 'review' ? 'Your review queue is clear' : 'No pull requests'}
                description={
                  prFilter === 'review'
                    ? 'When someone requests your review, it will show up here with AI findings attached.'
                    : 'No pull requests match this filter in the selected repository.'
                }
                action={
                  prFilter !== 'all' ? (
                    <Button variant="outline" size="sm" onClick={() => setPrFilter('all')}>Show all pull requests</Button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="divide-y">
                {prs.map((pr) => (
                  <PRRow key={pr.number} pr={pr} showRepo={!repo} />
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            id="recent-builds"
            title="Builds"
            actions={
              <Button variant="ghost" size="sm" render={<Link href="/pipelines" />} nativeButton={false}>
                View all
              </Button>
            }
          >
            {refreshing ? (
              <ListSkeleton rows={5} />
            ) : runs.length === 0 ? (
              <EmptyState icon={<Workflow className="size-4" />} title="No builds yet" description="Push a commit or open a pull request to trigger the first pipeline run." />
            ) : (
              <ul className="divide-y">
                {runs.map((run) => (
                  <RunRow key={run.id} run={run} showRepo={!repo} />
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Panel
          id="deployments"
          title="Deployment history"
          actions={
            <Segmented
              label="Filter by environment"
              value={envFilter}
              onChange={setEnvFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'production', label: 'Production' },
                { value: 'staging', label: 'Staging' },
                { value: 'preview', label: 'Preview' },
              ]}
            />
          }
        >
          {refreshing ? (
            <ListSkeleton rows={4} />
          ) : deploys.length === 0 ? (
            <EmptyState
              icon={<Rocket className="size-4" />}
              title={`No ${envFilter === 'all' ? '' : envFilter + ' '}deployments`}
              description="Deployments appear here once a pipeline promotes a build to this environment."
            />
          ) : (
            <DeploymentTable items={deploys} />
          )}
        </Panel>
      </div>
    </>
  )
}
