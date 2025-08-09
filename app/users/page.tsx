'use client'

import { useAuth } from '@/lib/auth-context'
import UsersList from '@/components/users/UsersList'
import Link from 'next/link'

export default function UsersPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-xl text-gray-600 dark:text-gray-300">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!user ? (
        <div className="text-center py-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              メンバー一覧を見るにはログインが必要です
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              コミュニティメンバーと繋がりましょう
            </p>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-block"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      ) : (
        <UsersList />
      )}
    </div>
  )
}