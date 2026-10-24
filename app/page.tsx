import { Overview } from '@/components/overview/overview'
import { getRepo } from '@/lib/data'

export default async function Page({ searchParams }: { searchParams: Promise<{ repo?: string }> }) {
  const { repo } = await searchParams
  const valid = repo && getRepo(repo) ? repo : undefined
  return <Overview key={valid ?? 'all'} repo={valid} />
}
