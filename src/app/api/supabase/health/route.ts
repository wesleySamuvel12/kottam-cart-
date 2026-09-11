import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.auth.getSession()

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isConfigured =
      Boolean(url) &&
      url !== 'your_supabase_project_url_here' &&
      url !== 'https://your-project.supabase.co'

    return NextResponse.json({
      status: 'ok',
      configured: isConfigured,
      hasSession: Boolean(data.session),
      error: error ? error.message : null,
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { status: 'error', error: errorMessage },
      { status: 500 }
    )
  }
}
