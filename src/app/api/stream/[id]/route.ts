import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: streamData, error } = await supabase
      .from('stream_settings')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !streamData) {
      return NextResponse.json(
        { error: 'Stream not found or inactive' },
        { status: 404 }
      )
    }

    return NextResponse.json(streamData)
  } catch (error) {
    console.error('Error fetching stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}