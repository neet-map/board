'use client'

import { UserProfile } from '@/types/user'

interface UserCardProps {
  user: UserProfile
}

export default function UserCard({ user }: UserCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        {/* アバター */}
        <div className="flex-shrink-0">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.display_name || 'ユーザー'}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-semibold">
              {user.display_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        {/* ユーザー情報 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
            {user.display_name || 'ゲストユーザー'}
          </h3>
          
          {user.bio && (
            <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {user.bio}
            </p>
          )}

          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm mb-2 inline-block"
            >
              🔗 ウェブサイト
            </a>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400">
            参加日: {formatDate(user.created_at)}
          </div>
        </div>
      </div>
    </div>
  )
}