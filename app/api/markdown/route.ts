import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    // GitHubのrawコンテンツURLに変換
    const rawUrl = convertToRawUrl(url)
    
    const response = await fetch(rawUrl, {
      headers: {
        'User-Agent': 'N-Board-App',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const content = await response.text()
    
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error fetching markdown:', error)
    return NextResponse.json(
      { error: 'Failed to fetch markdown content' },
      { status: 500 }
    )
  }
}

function convertToRawUrl(githubUrl: string): string {
  // GitHub URLをraw URLに変換
  // https://github.com/user/repo/blob/branch/file.md
  // → https://raw.githubusercontent.com/user/repo/branch/file.md
  
  if (githubUrl.includes('raw.githubusercontent.com')) {
    return githubUrl
  }
  
  if (githubUrl.includes('github.com')) {
    return githubUrl
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/')
  }
  
  return githubUrl
}
