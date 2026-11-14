import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')

  const secret = process.env.CRON_SECRET
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = await createClient()

  const { error } = await supabase.from('snippets').select('id').limit(1)

  if (error) {
    return new NextResponse('Keep-alive failed', { status: 500 })
  }

  return new NextResponse('OK', { status: 200 })
}