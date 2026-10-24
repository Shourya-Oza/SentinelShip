'use client'

import { Fragment, useState } from 'react'
import { ChevronDown, FileCode2, MessageSquareText, Check, Undo2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DiffFile, DiffLine, Finding } from '@/lib/review-data'
import { Badge, SeverityIcon, severityMeta } from '@/components/kit/status'

export type FindingStatus = 'open' | 'applied' | 'dismissed'

function highlight(content: string, language: string) {
  if (language === 'yaml') {
    const m = /^(\s*-?\s*)([\w.-]+)(:)(.*)$/.exec(content)
    if (m) {
      return (
        <>
          {m[1]}
          <span className="text-[oklch(0.78_0.09_265)]">{m[2]}</span>
          {m[3]}
          <span className="text-[oklch(0.8_0.07_150)]">{m[4]}</span>
        </>
      )
    }
    return content
  }
  const commentIdx = content.indexOf('//')
  const code = commentIdx >= 0 ? content.slice(0, commentIdx) : content
  const comment = commentIdx >= 0 ? content.slice(commentIdx) : ''
  const parts: React.ReactNode[] = []
  const tokenRe = /("(?:[^"\\]|\\.)*"|`[^`]*`)|\b(func|return|if|else|for|range|type|struct|package|import|var|const|defer|go|nil|true|false|map|interface|chan|select|case|switch|break|continue)\b/g
  let last = 0
  let match: RegExpExecArray | null
  let k = 0
  while ((match = tokenRe.exec(code))) {
    if (match.index > last) parts.push(code.slice(last, match.index))
    parts.push(
      <span key={k++} className={match[1] ? 'text-[oklch(0.8_0.07_150)]' : 'text-[oklch(0.78_0.09_265)]'}>
        {match[0]}
      </span>,
    )
    last = match.index + match[0].length
  }
  if (last < code.length) parts.push(code.slice(last))
  if (comment) parts.push(<span key="c" className="text-subtle-foreground italic">{comment}</span>)
  return parts
}

function InlineFinding({
  finding,
  status,
  active,
  onSelect,
  onReopen,
}: {
  finding: Finding
  status: FindingStatus
  active: boolean
  onSelect: () => void
  onReopen: () => void
}) {
  const meta = severityMeta[finding.severity]
  if (status !== 'open') {
    return (
      <div className="flex items-center gap-2 border-y bg-background/60 px-4 py-1.5 text-xs text-muted-foreground">
        <Check className="size-3.5 text-success" aria-hidden />
        <span className="truncate">
          {status === 'applied' ? 'Suggestion applied' : 'Dismissed'} · {finding.title}
        </span>
        <button type="button" onClick={onReopen} className="ml-auto inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <Undo2 className="size-3" aria-hidden />
          Reopen
        </button>
      </div>
    )
  }
  return (
    <div
      className={cn(
        'border-y bg-background px-3 py-2.5 font-sans sm:px-4',
        finding.severity === 'critical' ? 'border-l-2 border-l-danger' : finding.severity === 'warning' ? 'border-l-2 border-l-warning' : 'border-l-2 border-l-accent-foreground/60',
        active && 'bg-surface-raised',
      )}
    >
      <button type="button" onClick={onSelect} className="flex w-full items-start gap-2.5 text-left" aria-label={`Open finding: ${finding.title}`}>
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground" aria-hidden>
          <MessageSquareText className="size-3" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-foreground">Sentinel</span>
            <Badge tone={meta.tone}>
              <SeverityIcon severity={finding.severity} className="size-3" />
              {meta.label}
            </Badge>
            <span className="text-xs text-muted-foreground">{finding.category}</span>
          </span>
          <span className="mt-1 block text-[13px] text-foreground">{finding.title}</span>
          <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">{finding.body}</span>
        </span>
      </button>
    </div>
  )
}

function Row({ line, language, highlighted, id }: { line: DiffLine; language: string; highlighted: boolean; id: string }) {
  if (line.kind === 'hunk') {
    return (
      <div className="flex bg-accent/40 text-subtle-foreground">
        <span className="w-[4.5rem] shrink-0 select-none sm:w-24" aria-hidden />
        <span className="px-3 py-1">{line.content}</span>
      </div>
    )
  }
  const sign = line.kind === 'add' ? '+' : line.kind === 'del' ? '−' : ' '
  return (
    <div
      id={id}
      className={cn(
        'flex scroll-mt-32',
        line.kind === 'add' && 'bg-success/[0.07]',
        line.kind === 'del' && 'bg-danger/[0.08]',
        highlighted && 'bg-warning/15 shadow-[inset_2px_0_0_var(--warning)]',
      )}
    >
      <span className="flex w-[4.5rem] shrink-0 select-none text-right text-subtle-foreground/80 sm:w-24" aria-hidden>
        <span className="w-1/2 pr-2">{line.oldNo ?? ''}</span>
        <span className="w-1/2 pr-2">{line.newNo ?? ''}</span>
      </span>
      <span
        className={cn(
          'w-4 shrink-0 select-none text-center',
          line.kind === 'add' ? 'text-success' : line.kind === 'del' ? 'text-danger' : 'text-transparent',
        )}
        aria-hidden
      >
        {sign}
      </span>
      <span className="sr-only">{line.kind === 'add' ? 'Added line' : line.kind === 'del' ? 'Removed line' : ''}</span>
      <code className={cn('min-w-0 flex-1 pr-4 break-words whitespace-pre-wrap', line.kind === 'del' ? 'text-foreground/70' : 'text-foreground/90')}>
        {highlight(line.content, language) || ' '}
      </code>
    </div>
  )
}

export function lineAnchorId(fileIdx: number, lineIdx: number) {
  return `L-${fileIdx}-${lineIdx}`
}

export function DiffFileView({
  file,
  fileIdx,
  findingsAt,
  statuses,
  activeId,
  onSelect,
  onReopen,
}: {
  file: DiffFile
  fileIdx: number
  findingsAt: Map<number, Finding[]>
  statuses: Record<string, FindingStatus>
  activeId: string | null
  onSelect: (id: string) => void
  onReopen: (id: string) => void
}) {
  const [open, setOpen] = useState(true)
  const openFindings = [...findingsAt.values()].flat().filter((f) => statuses[f.id] === 'open').length

  return (
    <section id={`file-${fileIdx}`} className="scroll-mt-28 overflow-clip rounded-lg border bg-surface" aria-label={file.path}>
      <header className="sticky top-12 z-10 flex h-10 items-center gap-2 border-b bg-surface px-3 lg:top-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronDown className={cn('size-3.5 shrink-0 text-subtle-foreground transition-transform', !open && '-rotate-90')} aria-hidden />
          <FileCode2 className="size-3.5 shrink-0 text-subtle-foreground" aria-hidden />
          <span className="truncate font-mono text-[12px] text-foreground">{file.path}</span>
          {file.status === 'added' && <Badge tone="success">New</Badge>}
        </button>
        {openFindings > 0 && (
          <span className="tabular hidden text-xs text-muted-foreground sm:inline">
            {openFindings} open
          </span>
        )}
        <span className="tabular text-xs">
          <span className="text-success">+{file.additions}</span> <span className="text-danger">−{file.deletions}</span>
        </span>
      </header>
      {open && (
        <div>
          <div className="font-mono text-[12px] leading-[1.7]" style={{ tabSize: 4 }}>
            {file.lines.map((line, i) => {
              const fs = findingsAt.get(i)
              const highlighted = !!fs?.some((f) => f.id === activeId)
              return (
                <Fragment key={i}>
                  <Row line={line} language={file.language} highlighted={highlighted} id={lineAnchorId(fileIdx, i)} />
                  {fs?.map((f) => (
                    <InlineFinding
                      key={f.id}
                      finding={f}
                      status={statuses[f.id]}
                      active={f.id === activeId}
                      onSelect={() => onSelect(f.id)}
                      onReopen={() => onReopen(f.id)}
                    />
                  ))}
                </Fragment>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
