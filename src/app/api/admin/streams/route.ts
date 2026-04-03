import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminFromRequest } from '@/lib/auth/admin-auth'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — список всех событий
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: streams, error } = await supabase
      .from('stream_settings')
      .select('*')
      .order('stream_start_time', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 })
    }

    return NextResponse.json({ streams })
  } catch (error) {
    console.error('Admin streams error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const createStreamSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  stream_start_time: z.string(),
  price: z.number().positive(),
  currency: z.string().default('MDL'),
  is_active: z.boolean().default(true),
  is_live: z.boolean().default(false),
  poster_url: z.string().nullable().optional(),
})

// POST — создать новое событие
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const streamData = createStreamSchema.parse(body)

    const { data: stream, error } = await supabase
      .from('stream_settings')
      .insert({
        ...streamData,
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating stream:', error)
      return NextResponse.json({ error: 'Failed to create stream' }, { status: 500 })
    }

    // Логируем действие
    await supabase
      .from('access_logs')
      .insert({
        action: 'admin_stream_create',
        resource: `stream:${stream.id}`,
        metadata: {
          admin_id: admin.adminId,
          stream_title: stream.title
        }
      })

    return NextResponse.json(stream, { status: 201 })
  } catch (error) {
    console.error('Admin create stream error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
