import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET /api/streams — публичный список активных событий (без sensitive полей)
export async function GET() {
  try {
    const { data: streams, error } = await supabaseAdmin
      .from('stream_settings')
      .select('id, title, description, poster_url, poster_square_url, poster_card_url, stream_start_time, stream_end_time, price, currency, is_live, is_active, cf_video_id, recorded_video_url')
      .eq('is_active', true)
      .order('stream_start_time', { ascending: false })

    if (error) {
      return NextResponse.json({ streams: [] })
    }

    return NextResponse.json({ streams: streams || [] })
  } catch {
    return NextResponse.json({ streams: [] })
  }
}
