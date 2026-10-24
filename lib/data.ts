export type RunStatus = 'success' | 'failed' | 'running' | 'queued' | 'canceled' | 'skipped' | 'waiting'
export type Health = 'healthy' | 'degraded' | 'failing'
export type Severity = 'critical' | 'warning' | 'suggestion'
export type ReviewState = 'approved' | 'changes_requested' | 'reviewing' | 'pending'
export type PRState = 'open' | 'draft' | 'merged'
export type Environment = 'production' | 'staging' | 'preview'

export type Person = { handle: string; name: string; initials: string }

export const people: Record<string, Person> = {
  mara: { handle: 'mara', name: 'Mara Okafor', initials: 'MO' },
  dev: { handle: 'dev.k', name: 'Dev Kapoor', initials: 'DK' },
  lena: { handle: 'lena', name: 'Lena Brandt', initials: 'LB' },
  tom: { handle: 'tomr', name: 'Tomás Rivera', initials: 'TR' },
  aiko: { handle: 'aiko', name: 'Aiko Tanaka', initials: 'AT' },
}

export const currentUser = people.mara

export type Repo = {
  slug: string
  name: string
  language: string
  health: Health
  healthNote: string
  buildSuccess7d: number
  p50BuildMin: number
  openPRs: number
  lastDeploy: string
  coverage: number
}

export const repos: Repo[] = [
  {
    slug: 'api-gateway',
    name: 'sentinel/api-gateway',
    language: 'Go',
    health: 'failing',
    healthNote: 'Integration tests failing on main since run #4821',
    buildSuccess7d: 81,
    p50BuildMin: 6.4,
    openPRs: 7,
    lastDeploy: '42m ago',
    coverage: 78.2,
  },
  {
    slug: 'web-dashboard',
    name: 'sentinel/web-dashboard',
    language: 'TypeScript',
    health: 'healthy',
    healthNote: 'All checks passing',
    buildSuccess7d: 97,
    p50BuildMin: 3.1,
    openPRs: 4,
    lastDeploy: '12m ago',
    coverage: 84.6,
  },
  {
    slug: 'billing-service',
    name: 'sentinel/billing-service',
    language: 'Go',
    health: 'degraded',
    healthNote: 'p95 build time up 38% this week',
    buildSuccess7d: 92,
    p50BuildMin: 9.8,
    openPRs: 3,
    lastDeploy: '3h ago',
    coverage: 71.0,
  },
  {
    slug: 'mobile-app',
    name: 'sentinel/mobile-app',
    language: 'Swift',
    health: 'healthy',
    healthNote: 'All checks passing',
    buildSuccess7d: 95,
    p50BuildMin: 14.2,
    openPRs: 2,
    lastDeploy: '1d ago',
    coverage: 66.3,
  },
]

export type PullRequest = {
  number: number
  title: string
  repo: string
  author: Person
  branch: string
  base: string
  state: PRState
  review: ReviewState
  checks: RunStatus
  additions: number
  deletions: number
  files: number
  updated: string
  findings: { critical: number; warning: number; suggestion: number }
  reviewers: Person[]
  requestedFromMe?: boolean
}

export const pullRequests: PullRequest[] = [
  {
    number: 482,
    title: 'Add token bucket rate limiting to edge middleware',
    repo: 'api-gateway',
    author: people.dev,
    branch: 'dk/edge-rate-limit',
    base: 'main',
    state: 'open',
    review: 'changes_requested',
    checks: 'failed',
    additions: 81,
    deletions: 10,
    files: 3,
    updated: '18m ago',
    findings: { critical: 1, warning: 2, suggestion: 2 },
    reviewers: [people.mara, people.lena],
    requestedFromMe: true,
  },
  {
    number: 1193,
    title: 'Migrate deployment list to server components',
    repo: 'web-dashboard',
    author: people.lena,
    branch: 'lena/rsc-deployments',
    base: 'main',
    state: 'open',
    review: 'reviewing',
    checks: 'running',
    additions: 312,
    deletions: 401,
    files: 14,
    updated: '26m ago',
    findings: { critical: 0, warning: 0, suggestion: 0 },
    reviewers: [people.mara],
    requestedFromMe: true,
  },
  {
    number: 477,
    title: 'Bump grpc-go to v1.66 and regenerate stubs',
    repo: 'api-gateway',
    author: people.tom,
    branch: 'deps/grpc-1.66',
    base: 'main',
    state: 'open',
    review: 'approved',
    checks: 'success',
    additions: 2140,
    deletions: 1988,
    files: 38,
    updated: '1h ago',
    findings: { critical: 0, warning: 0, suggestion: 0 },
    reviewers: [people.dev],
  },
  {
    number: 214,
    title: 'Idempotency keys for invoice finalization',
    repo: 'billing-service',
    author: people.mara,
    branch: 'mara/idempotent-finalize',
    base: 'main',
    state: 'open',
    review: 'pending',
    checks: 'success',
    additions: 96,
    deletions: 12,
    files: 5,
    updated: '2h ago',
    findings: { critical: 0, warning: 0, suggestion: 0 },
    reviewers: [people.tom, people.aiko],
  },
  {
    number: 88,
    title: 'Offline queue for crash reports',
    repo: 'mobile-app',
    author: people.aiko,
    branch: 'aiko/offline-crash-queue',
    base: 'develop',
    state: 'draft',
    review: 'pending',
    checks: 'queued',
    additions: 204,
    deletions: 8,
    files: 6,
    updated: '4h ago',
    findings: { critical: 0, warning: 0, suggestion: 0 },
    reviewers: [],
  },
  {
    number: 1189,
    title: 'Fix CLS on project switcher when list is empty',
    repo: 'web-dashboard',
    author: people.mara,
    branch: 'mara/switcher-cls',
    base: 'main',
    state: 'merged',
    review: 'approved',
    checks: 'success',
    additions: 18,
    deletions: 9,
    files: 2,
    updated: '5h ago',
    findings: { critical: 0, warning: 0, suggestion: 0 },
    reviewers: [people.lena],
  },
]

export type Stage = {
  id: string
  name: string
  status: RunStatus
  duration: string
  jobs: Job[]
}

export type Job = {
  id: string
  name: string
  status: RunStatus
  duration: string
  runner: string
  log: LogLine[]
}

export type LogLine = { t: string; text: string; level?: 'info' | 'warn' | 'error' | 'cmd' | 'ok' }

export type PipelineRun = {
  id: number
  repo: string
  branch: string
  sha: string
  message: string
  author: Person
  trigger: 'push' | 'pull_request' | 'schedule' | 'manual'
  pr?: number
  status: RunStatus
  duration: string
  started: string
  stages: Stage[]
  events: DeployEvent[]
}

export type DeployEvent = {
  t: string
  title: string
  detail: string
  status: RunStatus
}

const okLog = (cmd: string, lines: string[]): LogLine[] => [
  { t: '00:00', text: `$ ${cmd}`, level: 'cmd' },
  ...lines.map((text, i) => ({ t: `00:${String(i * 3 + 2).padStart(2, '0')}`, text })),
  { t: `00:${String(lines.length * 3 + 4).padStart(2, '0')}`, text: 'Completed successfully', level: 'ok' as const },
]

function job(id: string, name: string, status: RunStatus, duration: string, log: LogLine[] = []): Job {
  return { id, name, status, duration, runner: 'ubuntu-24.04 · 4 vCPU', log }
}

export const pipelineRuns: PipelineRun[] = [
  {
    id: 4821,
    repo: 'api-gateway',
    branch: 'dk/edge-rate-limit',
    sha: 'a41f9c2',
    message: 'ratelimit: use sliding refill for token bucket',
    author: people.dev,
    trigger: 'pull_request',
    pr: 482,
    status: 'failed',
    duration: '7m 12s',
    started: '18m ago',
    stages: [
      {
        id: 'setup',
        name: 'Setup',
        status: 'success',
        duration: '41s',
        jobs: [
          job('checkout', 'Checkout & cache restore', 'success', '12s', okLog('git fetch --depth=50 origin dk/edge-rate-limit', ['HEAD is now at a41f9c2', 'Restored Go module cache (412 MB) from key go-mod-7f3a'])),
          job('deps', 'go mod download', 'success', '29s', okLog('go mod download', ['All modules verified'])),
        ],
      },
      {
        id: 'verify',
        name: 'Verify',
        status: 'success',
        duration: '1m 58s',
        jobs: [
          job('lint', 'golangci-lint', 'success', '1m 04s', okLog('golangci-lint run ./...', ['Running 34 linters', '0 issues found'])),
          job('vet', 'go vet', 'success', '22s', okLog('go vet ./...', [])),
          job('unit', 'Unit tests', 'success', '1m 58s', okLog('go test ./... -race -count=1', ['ok   gateway/internal/ratelimit   2.114s  coverage: 91.4%', 'ok   gateway/internal/middleware  1.870s  coverage: 82.0%', 'ok   gateway/internal/router      0.944s  coverage: 76.3%'])),
        ],
      },
      {
        id: 'build',
        name: 'Build',
        status: 'success',
        duration: '1m 21s',
        jobs: [
          job('image', 'Build container image', 'success', '1m 21s', okLog('docker buildx build --platform linux/amd64,linux/arm64 .', ['#14 exporting layers 3.2s done', 'Pushed ghcr.io/sentinel/api-gateway:a41f9c2 (38.1 MB)'])),
        ],
      },
      {
        id: 'integration',
        name: 'Integration',
        status: 'failed',
        duration: '3m 12s',
        jobs: [
          job('int-http', 'HTTP contract tests', 'success', '1m 40s', okLog('make test-contract', ['142 passed, 0 failed'])),
          job('int-load', 'Rate limit under load', 'failed', '3m 12s', [
            { t: '00:00', text: '$ go test ./test/integration -run TestRateLimitConcurrency -v', level: 'cmd' },
            { t: '00:04', text: '=== RUN   TestRateLimitConcurrency' },
            { t: '00:04', text: '    spawning 256 clients against :8080 for 60s' },
            { t: '01:06', text: '    observed 2,481 accepted requests (limit: 2,000 ± 2%)', level: 'warn' },
            { t: '01:06', text: '    ratelimit_test.go:88: bucket exceeded capacity under concurrent refill', level: 'error' },
            { t: '01:06', text: 'WARNING: DATA RACE', level: 'error' },
            { t: '01:06', text: '  Write at 0x00c0001a4f30 by goroutine 211:', level: 'error' },
            { t: '01:06', text: '    gateway/internal/ratelimit.(*Bucket).refill() bucket.go:42', level: 'error' },
            { t: '01:06', text: '  Previous read at 0x00c0001a4f30 by goroutine 187:', level: 'error' },
            { t: '01:06', text: '    gateway/internal/ratelimit.(*Bucket).Allow() bucket.go:29', level: 'error' },
            { t: '01:07', text: '--- FAIL: TestRateLimitConcurrency (62.84s)', level: 'error' },
            { t: '01:07', text: 'FAIL  gateway/test/integration  63.102s', level: 'error' },
            { t: '01:07', text: 'Error: Process completed with exit code 1.', level: 'error' },
          ]),
        ],
      },
      {
        id: 'deploy',
        name: 'Deploy preview',
        status: 'skipped',
        duration: '—',
        jobs: [job('preview', 'Deploy to preview', 'skipped', '—', [{ t: '00:00', text: 'Skipped: upstream stage "Integration" failed', level: 'warn' }])],
      },
    ],
    events: [
      { t: '14:02:11', title: 'Run triggered', detail: 'pull_request synchronize by dev.k', status: 'success' },
      { t: '14:05:31', title: 'Image published', detail: 'ghcr.io/sentinel/api-gateway:a41f9c2', status: 'success' },
      { t: '14:09:23', title: 'Integration failed', detail: 'TestRateLimitConcurrency — data race in Bucket.refill', status: 'failed' },
      { t: '14:09:24', title: 'Preview deploy skipped', detail: 'Blocked by failing stage', status: 'skipped' },
    ],
  },
  {
    id: 4819,
    repo: 'web-dashboard',
    branch: 'main',
    sha: '9be20d1',
    message: 'Merge #1189: fix CLS on project switcher',
    author: people.mara,
    trigger: 'push',
    status: 'success',
    duration: '3m 04s',
    started: '24m ago',
    stages: [
      { id: 'setup', name: 'Setup', status: 'success', duration: '18s', jobs: [job('install', 'pnpm install --frozen-lockfile', 'success', '18s', okLog('pnpm install --frozen-lockfile', ['Packages: +1,204', 'Done in 14.2s']))] },
      { id: 'verify', name: 'Verify', status: 'success', duration: '58s', jobs: [job('lint', 'ESLint', 'success', '31s', okLog('pnpm lint', ['✔ No problems found'])), job('types', 'Typecheck', 'success', '44s', okLog('pnpm tsc --noEmit', [])), job('test', 'Vitest', 'success', '58s', okLog('pnpm vitest run', ['Test Files  86 passed (86)', 'Tests  612 passed (612)']))] },
      { id: 'build', name: 'Build', status: 'success', duration: '1m 12s', jobs: [job('next', 'next build', 'success', '1m 12s', okLog('pnpm build', ['✓ Compiled successfully', 'Route (app) 42 routes generated']))] },
      { id: 'deploy', name: 'Deploy production', status: 'success', duration: '36s', jobs: [job('prod', 'Promote to production', 'success', '36s', okLog('sentinel deploy --prod', ['Aliased dashboard.sentinel.dev → dpl_8Hq2', 'Health check passed (200 in 84ms)']))] },
    ],
    events: [
      { t: '13:54:02', title: 'Run triggered', detail: 'push to main by mara', status: 'success' },
      { t: '13:56:30', title: 'Deployment ready', detail: 'dpl_8Hq2 built in 1m 12s', status: 'success' },
      { t: '13:57:06', title: 'Promoted to production', detail: 'dashboard.sentinel.dev', status: 'success' },
      { t: '14:02:06', title: 'Post-deploy checks passed', detail: 'Error rate 0.02% · p95 182ms', status: 'success' },
    ],
  },
  {
    id: 4818,
    repo: 'web-dashboard',
    branch: 'lena/rsc-deployments',
    sha: '3c7e1aa',
    message: 'Stream deployment rows with Suspense',
    author: people.lena,
    trigger: 'pull_request',
    pr: 1193,
    status: 'running',
    duration: '1m 48s',
    started: '2m ago',
    stages: [
      { id: 'setup', name: 'Setup', status: 'success', duration: '17s', jobs: [job('install', 'pnpm install --frozen-lockfile', 'success', '17s', okLog('pnpm install --frozen-lockfile', ['Done in 13.8s']))] },
      { id: 'verify', name: 'Verify', status: 'success', duration: '55s', jobs: [job('lint', 'ESLint', 'success', '29s', okLog('pnpm lint', ['✔ No problems found'])), job('test', 'Vitest', 'success', '55s', okLog('pnpm vitest run', ['Tests  618 passed (618)']))] },
      { id: 'build', name: 'Build', status: 'running', duration: '36s', jobs: [job('next', 'next build', 'running', '36s', [{ t: '00:00', text: '$ pnpm build', level: 'cmd' }, { t: '00:04', text: '▲ Next.js 16.4.0 (Turbopack)' }, { t: '00:21', text: 'Creating an optimized production build ...' }])] },
      { id: 'deploy', name: 'Deploy preview', status: 'queued', duration: '—', jobs: [job('preview', 'Deploy to preview', 'queued', '—', [{ t: '00:00', text: 'Waiting for "Build"' }])] },
    ],
    events: [{ t: '14:18:40', title: 'Run triggered', detail: 'pull_request synchronize by lena', status: 'success' }],
  },
  {
    id: 4816,
    repo: 'billing-service',
    branch: 'main',
    sha: 'e0a4b77',
    message: 'ledger: batch writes for reconciliation job',
    author: people.tom,
    trigger: 'push',
    status: 'success',
    duration: '11m 40s',
    started: '3h ago',
    stages: [
      { id: 'setup', name: 'Setup', status: 'success', duration: '52s', jobs: [job('deps', 'go mod download', 'success', '52s', okLog('go mod download', []))] },
      { id: 'verify', name: 'Verify', status: 'success', duration: '4m 10s', jobs: [job('unit', 'Unit tests', 'success', '4m 10s', okLog('go test ./... -race', ['ok   billing/ledger  38.2s']))] },
      { id: 'build', name: 'Build', status: 'success', duration: '2m 02s', jobs: [job('image', 'Build container image', 'success', '2m 02s', okLog('docker buildx build .', ['Pushed ghcr.io/sentinel/billing:e0a4b77']))] },
      { id: 'staging', name: 'Deploy staging', status: 'success', duration: '1m 30s', jobs: [job('stg', 'Deploy to staging', 'success', '1m 30s', okLog('sentinel deploy --env staging', ['Rollout 3/3 pods ready']))] },
      { id: 'prod', name: 'Deploy production', status: 'success', duration: '3m 06s', jobs: [job('prod', 'Canary → 100%', 'success', '3m 06s', okLog('sentinel deploy --prod --canary 10,50,100', ['Canary 10% healthy', 'Canary 50% healthy', 'Rollout complete']))] },
    ],
    events: [
      { t: '11:02:00', title: 'Run triggered', detail: 'push to main by tomr', status: 'success' },
      { t: '11:09:31', title: 'Staging healthy', detail: '3/3 pods ready', status: 'success' },
      { t: '11:11:10', title: 'Canary at 10%', detail: 'Error rate 0.00%', status: 'success' },
      { t: '11:13:40', title: 'Production rollout complete', detail: 'billing.sentinel.internal', status: 'success' },
    ],
  },
  {
    id: 4812,
    repo: 'api-gateway',
    branch: 'main',
    sha: '71d0f3e',
    message: 'router: preserve trailing slash on proxied paths',
    author: people.lena,
    trigger: 'push',
    status: 'success',
    duration: '6m 22s',
    started: '42m ago',
    stages: [
      { id: 'setup', name: 'Setup', status: 'success', duration: '38s', jobs: [job('deps', 'go mod download', 'success', '38s', okLog('go mod download', []))] },
      { id: 'verify', name: 'Verify', status: 'success', duration: '1m 50s', jobs: [job('unit', 'Unit tests', 'success', '1m 50s', okLog('go test ./... -race', []))] },
      { id: 'build', name: 'Build', status: 'success', duration: '1m 18s', jobs: [job('image', 'Build container image', 'success', '1m 18s', okLog('docker buildx build .', []))] },
      { id: 'prod', name: 'Deploy production', status: 'success', duration: '2m 36s', jobs: [job('prod', 'Rolling deploy', 'success', '2m 36s', okLog('sentinel deploy --prod', ['12/12 pods ready']))] },
    ],
    events: [
      { t: '13:36:01', title: 'Run triggered', detail: 'push to main by lena', status: 'success' },
      { t: '13:42:23', title: 'Production rollout complete', detail: 'edge.sentinel.dev · 12 regions', status: 'success' },
    ],
  },
  {
    id: 4809,
    repo: 'mobile-app',
    branch: 'develop',
    sha: 'b2290fe',
    message: 'Nightly TestFlight build',
    author: people.aiko,
    trigger: 'schedule',
    status: 'canceled',
    duration: '4m 10s',
    started: '9h ago',
    stages: [
      { id: 'setup', name: 'Setup', status: 'success', duration: '1m 02s', jobs: [job('pods', 'Resolve packages', 'success', '1m 02s', okLog('xcodebuild -resolvePackageDependencies', []))] },
      { id: 'build', name: 'Build', status: 'canceled', duration: '3m 08s', jobs: [job('archive', 'xcodebuild archive', 'canceled', '3m 08s', [{ t: '00:00', text: '$ xcodebuild archive -scheme Sentinel', level: 'cmd' }, { t: '03:08', text: 'Run canceled by aiko', level: 'warn' }])] },
    ],
    events: [
      { t: '05:00:00', title: 'Scheduled run started', detail: 'cron 0 5 * * *', status: 'success' },
      { t: '05:04:10', title: 'Run canceled', detail: 'Canceled by aiko', status: 'canceled' },
    ],
  },
]

export type Deployment = {
  id: string
  repo: string
  env: Environment
  status: RunStatus
  sha: string
  message: string
  author: Person
  url: string
  when: string
  duration: string
  runId: number
}

export const deployments: Deployment[] = [
  { id: 'dpl_8Hq2', repo: 'web-dashboard', env: 'production', status: 'success', sha: '9be20d1', message: 'Fix CLS on project switcher', author: people.mara, url: 'dashboard.sentinel.dev', when: '12m ago', duration: '3m 04s', runId: 4819 },
  { id: 'dpl_7Zk1', repo: 'api-gateway', env: 'preview', status: 'failed', sha: 'a41f9c2', message: 'ratelimit: use sliding refill', author: people.dev, url: 'pr-482.edge.sentinel.dev', when: '18m ago', duration: '7m 12s', runId: 4821 },
  { id: 'dpl_6Pa9', repo: 'api-gateway', env: 'production', status: 'success', sha: '71d0f3e', message: 'Preserve trailing slash on proxied paths', author: people.lena, url: 'edge.sentinel.dev', when: '42m ago', duration: '6m 22s', runId: 4812 },
  { id: 'dpl_5Yt4', repo: 'billing-service', env: 'production', status: 'success', sha: 'e0a4b77', message: 'Batch writes for reconciliation', author: people.tom, url: 'billing.sentinel.internal', when: '3h ago', duration: '11m 40s', runId: 4816 },
  { id: 'dpl_4Rm0', repo: 'billing-service', env: 'staging', status: 'success', sha: 'e0a4b77', message: 'Batch writes for reconciliation', author: people.tom, url: 'billing.staging.sentinel.internal', when: '3h ago', duration: '1m 30s', runId: 4816 },
]

export function getRepo(slug: string) {
  return repos.find((r) => r.slug === slug)
}
export function getPR(number: number) {
  return pullRequests.find((p) => p.number === number)
}
export function getRun(id: number) {
  return pipelineRuns.find((r) => r.id === id)
}
export function runForPR(number: number) {
  return pipelineRuns.find((r) => r.pr === number)
}
