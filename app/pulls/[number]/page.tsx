import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPR, runForPR } from '@/lib/data'
import { pr482Files, pr482Review } from '@/lib/review-data'
import { PRDetail } from '@/components/pr/pr-detail'

type Params = { params: Promise<{ number: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { number } = await params
  const pr = getPR(Number(number))
  return { title: pr ? `${pr.title} · #${pr.number}` : 'Pull request' }
}

export default async function Page({ params }: Params) {
  const { number } = await params
  const pr = getPR(Number(number))
  if (!pr) notFound()
  const isSample = pr.number === 482
  return (
    <PRDetail
      pr={pr}
      files={isSample ? pr482Files : []}
      review={isSample ? pr482Review : null}
      run={runForPR(pr.number)}
    />
  )
}
