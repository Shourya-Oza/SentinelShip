import type { Severity } from './data'

export type DiffLine = {
  kind: 'add' | 'del' | 'ctx' | 'hunk'
  oldNo?: number
  newNo?: number
  content: string
}

export type DiffFile = {
  path: string
  status: 'added' | 'modified'
  language: string
  lines: DiffLine[]
  additions: number
  deletions: number
}

export function parseDiff(path: string, status: DiffFile['status'], language: string, raw: string): DiffFile {
  const lines: DiffLine[] = []
  let oldNo = 0
  let newNo = 0
  let additions = 0
  let deletions = 0
  for (const line of raw.replace(/^\n/, '').replace(/\n$/, '').split('\n')) {
    if (line.startsWith('@@')) {
      const m = /@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line)
      oldNo = m ? Number(m[1]) : 0
      newNo = m ? Number(m[2]) : 0
      lines.push({ kind: 'hunk', content: line })
    } else if (line.startsWith('+')) {
      lines.push({ kind: 'add', newNo: newNo++, content: line.slice(1) })
      additions++
    } else if (line.startsWith('-')) {
      lines.push({ kind: 'del', oldNo: oldNo++, content: line.slice(1) })
      deletions++
    } else {
      lines.push({ kind: 'ctx', oldNo: oldNo++, newNo: newNo++, content: line.slice(1) })
    }
  }
  return { path, status, language, lines, additions, deletions }
}

const bucketGo = `
@@ -0,0 +1,44 @@
+package ratelimit
+
+import (
+	"sync"
+	"time"
+)
+
+// Bucket is a token bucket that refills continuously.
+type Bucket struct {
+	mu       sync.Mutex
+	capacity float64
+	tokens   float64
+	rate     float64 // tokens per second
+	last     time.Time
+}
+
+func NewBucket(capacity, rate float64) *Bucket {
+	return &Bucket{
+		capacity: capacity,
+		tokens:   capacity,
+		rate:     rate,
+		last:     time.Now(),
+	}
+}
+
+// Allow reports whether a single request may proceed.
+func (b *Bucket) Allow() bool {
+	b.refill()
+	if b.tokens < 1 {
+		return false
+	}
+	b.mu.Lock()
+	b.tokens--
+	b.mu.Unlock()
+	return true
+}
+
+func (b *Bucket) refill() {
+	now := time.Now()
+	elapsed := now.Sub(b.last).Seconds()
+	b.tokens = min(b.capacity, b.tokens+elapsed*b.rate)
+	b.last = now
+}`

const middlewareGo = `
@@ -1,18 +1,41 @@
 package middleware
 
 import (
 	"net/http"
-	"strings"
+	"net"
+	"sync"
+
+	"gateway/internal/ratelimit"
 )
 
-// RateLimit is a no-op placeholder until #431 lands.
-func RateLimit(next http.Handler) http.Handler {
-	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
-		if strings.HasPrefix(r.URL.Path, "/internal") {
-			next.ServeHTTP(w, r)
-			return
-		}
-		next.ServeHTTP(w, r)
-	})
+type Limiter struct {
+	buckets  map[string]*ratelimit.Bucket
+	mu       sync.Mutex
+	capacity float64
+	rate     float64
+}
+
+func NewLimiter(capacity, rate float64) *Limiter {
+	return &Limiter{buckets: map[string]*ratelimit.Bucket{}, capacity: capacity, rate: rate}
+}
+
+func (l *Limiter) Middleware(next http.Handler) http.Handler {
+	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
+		key := r.Header.Get("X-Forwarded-For")
+		if key == "" {
+			key, _, _ = net.SplitHostPort(r.RemoteAddr)
+		}
+		l.mu.Lock()
+		b, ok := l.buckets[key]
+		if !ok {
+			b = ratelimit.NewBucket(l.capacity, l.rate)
+			l.buckets[key] = b
+		}
+		l.mu.Unlock()
+		if !b.Allow() {
+			http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
+			return
+		}
+		next.ServeHTTP(w, r)
+	})
 }`

const gatewayYaml = `
@@ -12,7 +12,11 @@ upstreams:
   - name: core
     url: http://core.svc.cluster.local:8080
     timeout: 5s
 
 middleware:
   - cors
+  - ratelimit:
+      capacity: 2000
+      refill_per_second: 33.3
+      exempt_paths: ["/internal/health"]
   - auth
   - proxy`

export const pr482Files: DiffFile[] = [
  parseDiff('internal/ratelimit/bucket.go', 'added', 'go', bucketGo),
  parseDiff('internal/middleware/ratelimit.go', 'modified', 'go', middlewareGo),
  parseDiff('config/gateway.yaml', 'modified', 'yaml', gatewayYaml),
]

export type Finding = {
  id: string
  severity: Severity
  category: 'Correctness' | 'Security' | 'Reliability' | 'Performance' | 'Maintainability'
  file: string
  anchor: string
  title: string
  body: string
  suggestion?: string
  confidence: number
}

export const pr482Review = {
  model: 'sentinel-review-2',
  reviewedSha: 'a41f9c2',
  reviewedAt: '16m ago',
  durationSec: 41,
  risk: 'high' as const,
  summary:
    'Introduces a per-client token bucket in edge middleware. The approach is sound, but Allow() reads and mutates shared bucket state outside the mutex, which matches the data race reported by TestRateLimitConcurrency. Client keys are taken from an unvalidated header, and the bucket map never evicts entries.',
  checks: [
    { label: 'Correctness', status: 'failed' as const, note: 'Data race in Bucket.Allow' },
    { label: 'Security', status: 'warning' as const, note: 'Spoofable client key' },
    { label: 'Reliability', status: 'warning' as const, note: 'Unbounded map growth' },
    { label: 'Test coverage', status: 'success' as const, note: 'ratelimit 91.4%' },
  ],
  findings: [
    {
      id: 'f1',
      severity: 'critical',
      category: 'Correctness',
      file: 'internal/ratelimit/bucket.go',
      anchor: '\tb.refill()',
      title: 'Token check and refill happen outside the lock',
      body: 'refill() writes b.tokens and b.last without holding b.mu, and the `b.tokens < 1` check races with concurrent decrements. Under load, multiple goroutines can pass the check and overdraw the bucket — consistent with the 2,481 accepted requests observed against a 2,000 limit in run #4821.',
      suggestion:
        'func (b *Bucket) Allow() bool {\n\tb.mu.Lock()\n\tdefer b.mu.Unlock()\n\tb.refill() // caller must hold b.mu\n\tif b.tokens < 1 {\n\t\treturn false\n\t}\n\tb.tokens--\n\treturn true\n}',
      confidence: 0.97,
    },
    {
      id: 'f2',
      severity: 'warning',
      category: 'Security',
      file: 'internal/middleware/ratelimit.go',
      anchor: 'X-Forwarded-For',
      title: 'Client key is taken from a spoofable header',
      body: 'X-Forwarded-For is client-controlled unless set by a trusted proxy. A caller can rotate the header value to receive a fresh bucket per request and bypass the limit entirely. Use the right-most untrusted hop, or the connection address when not behind the edge LB.',
      suggestion: 'key := clientip.FromRequest(r, trustedProxies)',
      confidence: 0.91,
    },
    {
      id: 'f3',
      severity: 'warning',
      category: 'Reliability',
      file: 'internal/middleware/ratelimit.go',
      anchor: 'l.buckets[key] = b',
      title: 'Bucket map grows without bound',
      body: 'Every distinct client key allocates a Bucket that is never evicted. With rotating IPv6 clients this becomes a slow memory leak on long-lived edge pods. Consider an LRU with a TTL, or sweeping buckets that have refilled to capacity.',
      confidence: 0.84,
    },
    {
      id: 'f4',
      severity: 'suggestion',
      category: 'Maintainability',
      file: 'internal/middleware/ratelimit.go',
      anchor: 'http.Error(w, "rate limit exceeded"',
      title: 'Return Retry-After with 429 responses',
      body: 'Well-behaved clients and our own SDKs back off using Retry-After. The value can be derived from the deficit and the bucket refill rate.',
      suggestion: 'w.Header().Set("Retry-After", strconv.Itoa(b.RetryAfterSeconds()))\nhttp.Error(w, "rate limit exceeded", http.StatusTooManyRequests)',
      confidence: 0.76,
    },
    {
      id: 'f5',
      severity: 'suggestion',
      category: 'Performance',
      file: 'config/gateway.yaml',
      anchor: '  - ratelimit:',
      title: 'Consider limiting after auth to key by tenant',
      body: 'Placing ratelimit before auth means limits are per IP rather than per tenant. Customers behind shared NATs will share a single 2,000 request budget.',
      confidence: 0.62,
    },
  ] satisfies Finding[],
}

export function locateFinding(files: DiffFile[], f: Finding) {
  const file = files.find((x) => x.path === f.file)
  if (!file) return undefined
  const idx = file.lines.findIndex((l) => l.kind !== 'del' && l.content.includes(f.anchor.trimStart()) && (f.anchor.startsWith('\t') ? l.content.startsWith(f.anchor) : true))
  if (idx === -1) return undefined
  return { file, index: idx, line: file.lines[idx].newNo }
}
