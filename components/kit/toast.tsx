'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { Check, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastTone = 'success' | 'danger' | 'neutral'
type Toast = { id: number; title: string; description?: string; tone: ToastTone }

const ToastContext = createContext<(t: Omit<Toast, 'id'>) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev.slice(-2), { ...t, id }])
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border-strong bg-popover px-3.5 py-3 shadow-lg shadow-black/40 animate-in fade-in slide-in-from-bottom-2"
          >
            <span
              className={cn(
                'mt-0.5 flex size-4 items-center justify-center rounded-full',
                t.tone === 'success' && 'bg-success/15 text-success',
                t.tone === 'danger' && 'bg-danger/15 text-danger',
                t.tone === 'neutral' && 'bg-muted text-muted-foreground',
              )}
              aria-hidden
            >
              {t.tone === 'success' ? <Check className="size-2.5" strokeWidth={3} /> : t.tone === 'danger' ? <AlertTriangle className="size-2.5" /> : <Check className="size-2.5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-foreground">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-subtle-foreground hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
