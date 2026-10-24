import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Repo } from '@/lib/data'
import { Panel } from '@/components/kit/primitives'
import { Dot, healthLabel, healthTone } from '@/components/kit/status'

const history: Record<string, string> = {
  'api-gateway': 'sssssfsssssssfssssff',
  'web-dashboard': 'sssssssssssssfssssss',
  'billing-service': 'sssssssfssssssssssss',
  'mobile-app': 'ssssscsssssfssssssss',
}

function BuildStrip({ slug }: { slug: string }) {
  const seq = (history[slug] ?? '').split('')
  const failed = seq.filter((c) => c === 'f').length
  return (
    <div className="flex items-center gap-[3px]" role="img" aria-label={`Last ${seq.length} builds: ${failed} failed`}>
      {seq.map((c, i) => (
        <span
          key={i}
          className={cn(
            'h-4 w-[5px] rounded-[1.5px]',
            c === 's' && 'bg-success/55',
            c === 'f' && 'bg-danger',
            c === 'c' && 'bg-subtle-foreground/50',
          )}
        />
      ))}
    </div>
  )
}

export function RepoHealth({ items }: { items: Repo[] }) {
  return (
    <Panel id="repo-health" title="Repository health" description="Default branch · last 20 builds">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b text-[11px] tracking-wide text-subtle-foreground uppercase">
              <th scope="col" className="px-4 py-2 font-medium">Repository</th>
              <th scope="col" className="px-3 py-2 font-medium">Status</th>
              <th scope="col" className="px-3 py-2 font-medium">Build history</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Success 7d</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">p50 build</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Coverage</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Open PRs</th>
              <th scope="col" className="px-4 py-2 text-right font-medium">Last deploy</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((r) => (
              <tr key={r.slug} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-2.5">
                  <Link href={`/?repo=${r.slug}`} className="font-medium text-foreground hover:underline underline-offset-4">
                    {r.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{r.language}</p>
                </td>
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-2">
                    <Dot tone={healthTone[r.health]} />
                    <span className="text-foreground">{healthLabel[r.health]}</span>
                  </span>
                  <p className="max-w-56 truncate text-xs text-muted-foreground" title={r.healthNote}>{r.healthNote}</p>
                </td>
                <td className="px-3 py-2.5">
                  <BuildStrip slug={r.slug} />
                </td>
                <td className={cn('tabular px-3 py-2.5 text-right', r.buildSuccess7d < 90 ? 'text-danger' : r.buildSuccess7d < 95 ? 'text-warning' : 'text-foreground')}>
                  {r.buildSuccess7d}%
                </td>
                <td className="tabular px-3 py-2.5 text-right text-muted-foreground">{r.p50BuildMin.toFixed(1)}m</td>
                <td className="tabular px-3 py-2.5 text-right text-muted-foreground">{r.coverage.toFixed(1)}%</td>
                <td className="tabular px-3 py-2.5 text-right text-muted-foreground">{r.openPRs}</td>
                <td className="tabular px-4 py-2.5 text-right text-muted-foreground">{r.lastDeploy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
