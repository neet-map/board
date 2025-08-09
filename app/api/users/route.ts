import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        bio,
        avatar_url,
        website,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('プロファイル取得エラー:', error)
      return NextResponse.json(
        { error: 'プロファイルの取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ profiles })
  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    )
  }
}