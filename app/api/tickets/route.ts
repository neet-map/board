import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Ticket, CreateTicketData, TicketFilters } from '@/types/ticket'

// チケット一覧取得
export async function GET(request: NextRequest) {
  try {
    // 認証トークンを取得
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Service Role Keyを使用してSupabaseクライアントを作成
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // クエリパラメータの取得
    const { searchParams } = new URL(request.url)
    const filters: TicketFilters = {
      status: (searchParams.get('status') as any) || 'all',
      priority: (searchParams.get('priority') as any) || 'all',
      assigned_to: searchParams.get('assigned_to') || 'all',
      created_by: searchParams.get('created_by') || 'all',
      search: searchParams.get('search') || undefined,
      tag_ids: searchParams.get('tag_ids')?.split(',').filter(Boolean) || []
    }

    // ベースクエリ
    let query = supabase
      .from('tickets')
      .select(`
        *,
        assigned_user:assigned_to(id, display_name, avatar_url),
        creator:created_by(id, display_name, avatar_url),
        ticket_tag_relations(
          ticket_tags(id, name, color)
        )
      `)

    // フィルター適用
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority)
    }

    if (filters.assigned_to && filters.assigned_to !== 'all') {
      query = query.eq('assigned_to', filters.assigned_to)
    }

    if (filters.created_by && filters.created_by !== 'all') {
      query = query.eq('created_by', filters.created_by)
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // 並び順: 優先度（緊急→高→中→低）、作成日時（新しい順）
    query = query.order('priority', { ascending: false })
    query = query.order('created_at', { ascending: false })

    const { data: tickets, error } = await query

    if (error) {
      console.error('Tickets fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
    }

    // データの整形
    const formattedTickets: Ticket[] = tickets?.map(ticket => ({
      ...ticket,
      assigned_user: ticket.assigned_user || undefined,
      creator: ticket.creator || undefined,
      tags: ticket.ticket_tag_relations?.map((relation: any) => relation.ticket_tags).filter(Boolean) || []
    })) || []

    return NextResponse.json({ tickets: formattedTickets })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// チケット作成
export async function POST(request: NextRequest) {
  try {
    // 認証トークンを取得
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Service Role Keyを使用してSupabaseクライアントを作成
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateTicketData = await request.json()
    
    // バリデーション
    if (!body.title || body.title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (body.title.length > 200) {
      return NextResponse.json({ error: 'Title must be 200 characters or less' }, { status: 400 })
    }

    // チケット作成
    const ticketData = {
      title: body.title.trim(),
      description: body.description?.trim() || null,
      priority: body.priority || 'medium',
      assigned_to: body.assigned_to || null,
      created_by: user.id,
      due_date: body.due_date || null
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select(`
        *,
        assigned_user:assigned_to(id, display_name, avatar_url),
        creator:created_by(id, display_name, avatar_url)
      `)
      .single()

    if (ticketError) {
      console.error('Ticket creation error:', ticketError)
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
    }

    // タグの関連付け
    if (body.tag_ids && body.tag_ids.length > 0) {
      const tagRelations = body.tag_ids.map(tagId => ({
        ticket_id: ticket.id,
        tag_id: tagId
      }))

      const { error: tagError } = await supabase
        .from('ticket_tag_relations')
        .insert(tagRelations)

      if (tagError) {
        console.error('Tag relation creation error:', tagError)
        // タグ関連付けエラーは非致命的なので、チケット作成は成功として扱う
      }
    }

    // 作成されたチケットを再取得（タグ情報を含む）
    const { data: createdTicket, error: fetchError } = await supabase
      .from('tickets')
      .select(`
        *,
        assigned_user:assigned_to(id, display_name, avatar_url),
        creator:created_by(id, display_name, avatar_url),
        ticket_tag_relations(
          ticket_tags(id, name, color)
        )
      `)
      .eq('id', ticket.id)
      .single()

    if (fetchError) {
      console.error('Created ticket fetch error:', fetchError)
      return NextResponse.json({ error: 'Ticket created but failed to fetch details' }, { status: 500 })
    }

    // データの整形
    const formattedTicket: Ticket = {
      ...createdTicket,
      assigned_user: createdTicket.assigned_user || undefined,
      creator: createdTicket.creator || undefined,
      tags: createdTicket.ticket_tag_relations?.map((relation: any) => relation.ticket_tags).filter(Boolean) || []
    }

    return NextResponse.json({ ticket: formattedTicket }, { status: 201 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
