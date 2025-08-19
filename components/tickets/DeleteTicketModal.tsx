'use client'

import { useState, useEffect } from 'react'
import { Ticket } from '@/types/ticket'
import { useAuth } from '@/lib/auth-context'

interface DeleteTicketModalProps {
  isOpen: boolean
  ticket: Ticket | null
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteTicketModal({ isOpen, ticket, onClose, onSuccess }: DeleteTicketModalProps) {
  const { session } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isDeleting, onClose])

  // モーダルが開かれたときにエラーをリセット
  useEffect(() => {
    if (isOpen) {
      setError(null)
    }
  }, [isOpen])

  const handleDelete = async () => {
    if (!session?.access_token || !ticket) {
      setError('認証が必要です')
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'チケットの削除に失敗しました')
      }

      // 成功時の処理
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Delete ticket error:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !ticket) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            チケットを削除
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            disabled={isDeleting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* 警告アイコンと確認メッセージ */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                本当に削除しますか？
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                以下のチケットを完全に削除します。この操作は元に戻すことができません。
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {ticket.title}
                </p>
                {ticket.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {ticket.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
              disabled={isDeleting}
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors duration-200"
              disabled={isDeleting}
            >
              {isDeleting ? '削除中...' : '削除する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
