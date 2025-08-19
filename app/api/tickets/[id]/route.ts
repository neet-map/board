import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { UpdateTicketData } from '@/types/ticket'

// チケット更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: ticketId } = await params
    const body: UpdateTicketData = await request.json()
    
    // バリデーション
    if (body.title !== undefined && (!body.title || body.title.trim().length === 0)) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (body.title && body.title.length > 200) {
      return NextResponse.json({ error: 'Title must be 200 characters or less' }, { status: 400 })
    }

    // 既存チケットの確認と権限チェック
    const { data: existingTicket, error: fetchError } = await supabase
      .from('tickets')
      .select('created_by, assigned_to')
      .eq('id', ticketId)
      .single()

    if (fetchError || !existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // 権限チェック（作成者または担当者のみ更新可能）
    if (existingTicket.created_by !== user.id && existingTicket.assigned_to !== user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // 更新データの準備
    const updateData: any = {}
    
    if (body.title !== undefined) {
      updateData.title = body.title.trim()
    }
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }
    if (body.status !== undefined) {
      updateData.status = body.status
    }
    if (body.priority !== undefined) {
      updateData.priority = body.priority
    }
    if (body.assigned_to !== undefined) {
      updateData.assigned_to = body.assigned_to || null
    }
    if (body.due_date !== undefined) {
      updateData.due_date = body.due_date || null
    }

    // updated_atは自動的に更新される（トリガーにより）
    updateData.updated_at = new Date().toISOString()

    // チケット更新
    const { data: updatedTicket, error: updateError } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select(`
        *,
        assigned_user:assigned_to(id, display_name, avatar_url),
        creator:created_by(id, display_name, avatar_url),
        ticket_tag_relations(
          ticket_tags(id, name, color)
        )
      `)
      .single()

    if (updateError) {
      console.error('Ticket update error:', updateError)
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
    }

    // データの整形
    const formattedTicket = {
      ...updatedTicket,
      assigned_user: updatedTicket.assigned_user || undefined,
      creator: updatedTicket.creator || undefined,
      tags: updatedTicket.ticket_tag_relations?.map((relation: any) => relation.ticket_tags).filter(Boolean) || []
    }

    return NextResponse.json({ ticket: formattedTicket })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// チケット削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: ticketId } = await params

    // 既存チケットの確認と権限チェック
    const { data: existingTicket, error: fetchError } = await supabase
      .from('tickets')
      .select('created_by')
      .eq('id', ticketId)
      .single()

    if (fetchError || !existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // 権限チェック（作成者のみ削除可能）
    if (existingTicket.created_by !== user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // チケット削除
    const { error: deleteError } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketId)

    if (deleteError) {
      console.error('Ticket delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Ticket deleted successfully' })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
