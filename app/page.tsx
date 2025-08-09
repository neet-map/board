'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import MarkdownViewer from '@/components/shared/MarkdownViewer'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-xl text-gray-600 dark:text-gray-300">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6">
          N-Board
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          <a href="/users">NEET相互扶助計画</a>のメンバー用アプリです
        </p>
        
        {user ? (
          <div className="flex flex-col gap-8">
            {/* マークダウンコンテンツ */}
            <div className="mt-0 w-full max-w-6xl mx-auto">
              <MarkdownViewer 
                url="https://github.com/neet-map/mds/blob/main/index.md"
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl px-4 py-0 text-left border border-gray-200 dark:border-gray-700 w-full"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                コミュニティに参加するにはログインしてください
              </p>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
