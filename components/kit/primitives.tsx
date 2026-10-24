import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Person } from '@/lib/data'

export function Avatar({ person, size = 'sm' }: { person: Person; size?: 'xs' | 'sm' | 'md' }) {
  const hue = [...person.handle].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return (
    <span
      title={person.name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium text-foreground/90 ring-1 ring-border-strong',
        size === 'xs' && 'size-4 text-[8px]',
        size === 'sm' && 'size-5 text-[9px]',
        size === 'md' && 'size-7 text-[11px]',
      )}
      style={{ backgroundColor: `oklch(0.32 0.04 ${hue})` }}
    >
      <span aria-hidden>{person.initials}</span>
      <span className="sr-only">{person.name}</span>
    </span>
  )
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  id,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
  id?: string
}) {
  return (
    <section id={id} aria-labelledby={id && title ? `${id}-title` : undefined} className={cn('rounded-lg border bg-surface', className)}>
      {(title || actions) && (
        <header className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b px-4 py-2">
          <div className="min-w-0">
            {title && (
              <h2 id={id ? `${id}-title` : undefined} className="text-[13px] font-medium text-foreground">
                {title}
              </h2>
            )}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

export function PageHeader({
  crumbs,
  title,
  meta,
  actions,
  children,
}: {
  crumbs?: { label: string; href?: string }[]
  title: React.ReactNode
  meta?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="border-b">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 pt-5 pb-4 md:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {crumbs && (
            <nav aria-label="Breadcrumb" className="mb-1.5">
              <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                {crumbs.map((c, i) => (
                  <li key={c.label} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight className="size-3 text-subtle-foreground" aria-hidden />}
                    {c.href ? (
                      <Link href={c.href} className="hover:text-foreground">
                        {c.label}
                      </Link>
                    ) : (
                      <span aria-current="page" className="font-mono">{c.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <h1 className="text-pretty text-lg font-semibold tracking-tight text-foreground md:text-xl">{title}</h1>
          {meta && <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">{meta}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; count?: number }[]
  label: string
  className?: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex h-7 items-center rounded-md border bg-background p-0.5', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex h-full items-center gap-1.5 rounded-[5px] px-2 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              active ? 'bg-surface-raised text-foreground shadow-[inset_0_0_0_1px_var(--border-strong)]' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {o.label}
            {o.count !== undefined && <span className={cn('tabular text-[11px]', active ? 'text-muted-foreground' : 'text-subtle-foreground')}>{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function Tabs<T extends string>({
  value,
  onChange,
  tabs,
  label,
  className,
}: {
  value: T
  onChange: (v: T) => void
  tabs: { value: T; label: string; count?: number }[]
  label: string
  className?: string
}) {
  return (
    <div role="tablist" aria-label={label} className={cn('flex gap-4 overflow-x-auto scrollbar-thin', className)}>
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            id={`tab-${t.value}`}
            aria-selected={active}
            aria-controls={`panel-${t.value}`}
            onClick={() => onChange(t.value)}
            className={cn(
              '-mb-px flex h-10 items-center gap-1.5 border-b-2 text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:text-foreground focus-visible:outline-none',
              active ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="tabular rounded bg-muted px-1 text-[11px] text-muted-foreground">{t.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 px-6 py-12 text-center', className)}>
      {icon && <div className="mb-1 flex size-9 items-center justify-center rounded-md border bg-background text-muted-foreground">{icon}</div>}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="max-w-sm text-pretty text-xs leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-muted', className)} aria-hidden />
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded border border-border-strong bg-background px-1 font-mono text-[10px] text-muted-foreground">
      {children}
    </kbd>
  )
}

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('font-mono text-[12px]', className)}>{children}</span>
}
