'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { GitPullRequest, LayoutGrid, Menu, Plug, Workflow, X, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { currentUser, pullRequests, repos } from '@/lib/data'
import { Avatar } from '@/components/kit/primitives'
import { Dot, healthTone } from '@/components/kit/status'
import { ToastProvider } from '@/components/kit/toast'

const nav = [
  { href: '/', label: 'Overview', icon: LayoutGrid, match: (p: string) => p === '/' },
  {
    href: '/pulls',
    label: 'Pull requests',
    icon: GitPullRequest,
    match: (p: string) => p.startsWith('/pulls'),
    badge: pullRequests.filter((p) => p.requestedFromMe && p.state !== 'merged').length,
  },
  { href: '/pipelines', label: 'Pipelines', icon: Workflow, match: (p: string) => p.startsWith('/pipelines') },
  { href: '/settings/integrations', label: 'Integrations', icon: Plug, match: (p: string) => p.startsWith('/settings') },
]

function Logo() {
  return (
    <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground" aria-hidden>
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1.75 2.75 4v4c0 3.1 2.2 5.4 5.25 6.25C11.05 13.4 13.25 11.1 13.25 8V4L8 1.75Z" />
        <path d="m5.75 8 1.6 1.6L10.5 6.5" />
      </svg>
    </span>
  )
}

function RepoLinks({ onNavigate }: { onNavigate?: () => void }) {
  const params = useSearchParams()
  const pathname = usePathname()
  const activeRepo = pathname === '/' ? params.get('repo') : null
  return (
    <ul className="flex flex-col gap-px">
      {repos.map((r) => (
        <li key={r.slug}>
          <Link
            href={`/?repo=${r.slug}`}
            onClick={onNavigate}
            aria-current={activeRepo === r.slug ? 'page' : undefined}
            className={cn(
              'flex h-7 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors',
              activeRepo === r.slug ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            <Dot tone={healthTone[r.health]} />
            <span className="truncate">{r.slug}</span>
            <span className="sr-only">, {r.health}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 items-center gap-2 px-3">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-muted/60">
          <Logo />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-foreground">Sentinel Labs</span>
          </span>
          <ChevronsUpDown className="size-3.5 text-subtle-foreground" aria-hidden />
          <span className="sr-only">Switch workspace</span>
        </button>
      </div>

      <nav aria-label="Primary" className="px-2 pt-1">
        <ul className="flex flex-col gap-px">
          {nav.map((item) => {
            const active = item.match(pathname)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium transition-colors',
                    active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  <item.icon className={cn('size-4', active ? 'text-foreground' : 'text-subtle-foreground')} aria-hidden />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="tabular rounded bg-accent px-1.5 text-[11px] text-accent-foreground">
                      {item.badge}
                      <span className="sr-only"> awaiting your review</span>
                    </span>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-6 px-2">
        <p className="px-2 pb-1.5 text-[11px] font-medium tracking-wide text-subtle-foreground uppercase">Repositories</p>
        <Suspense fallback={null}>
          <RepoLinks onNavigate={onNavigate} />
        </Suspense>
      </div>

      <div className="mt-auto border-t p-3">
        <div className="flex items-center gap-2.5">
          <Avatar person={currentUser} size="md" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-foreground">{currentUser.name}</p>
            <p className="truncate text-xs text-muted-foreground">@{currentUser.handle} · Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const current = nav.find((n) => n.match(pathname))

  return (
    <ToastProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-1.5 focus:text-sm">
        Skip to content
      </a>
      <div className="flex min-h-dvh">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r bg-background lg:block">
          <SidebarContent />
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
            <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close navigation" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 border-r bg-background animate-in slide-in-from-left duration-200">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="-ml-1.5 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Open navigation"
              aria-expanded={open}
            >
              <Menu className="size-4.5" />
            </button>
            <Logo />
            <span className="text-[13px] font-medium text-foreground">{current?.label ?? 'SentinelShip'}</span>
          </header>
          <main id="main" className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
