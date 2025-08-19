'use client'

import { useState, useEffect } from 'react'
import { Ticket, UpdateTicketData, TICKET_PRIORITY_LABELS, TICKET_STATUS_LABELS } from '@/types/ticket'
import { useAuth } from '@/lib/auth-context'

interface EditTicketModalProps {
  isOpen: boolean
  ticket: Ticket | null
  onClose: () => void
  onSuccess: () => void
}

export default function EditTicketModal({ isOpen, ticket, onClose, onSuccess }: EditTicketModalProps) {
  const { session } = useAuth()
  const [formData, setFormData] = useState<UpdateTicketData>({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    assigned_to: undefined,
    due_date: undefined
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // モーダルが開かれたときにフォームにチケット情報を設定
  useEffect(() => {
    if (isOpen && ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description || '',
        status: ticket.status,
        priority: ticket.priority,
        assigned_to: ticket.assigned_to || undefined,
        due_date: ticket.due_date ? ticket.due_date.split('T')[0] : undefined // 日付部分のみ
      })
      setError(null)
    }
  }, [isOpen, ticket])

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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
  }, [isOpen, onClose])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? (name === 'title' || name === 'description' ? '' : undefined) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.access_token || !ticket) {
      setError('認証が必要です')
      return
    }

    if (!formData.title || !formData.title.trim()) {
      setError('タイトルは必須です')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          title: formData.title.trim(),
          description: formData.description?.trim() || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'チケットの更新に失敗しました')
      }

      // 成功時の処理
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Update ticket error:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !ticket) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            チケットを編集
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* タイトル */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="チケットのタイトルを入力してください"
              maxLength={200}
              required
              disabled={isSubmitting}
            />
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {(formData.title || '').length}/200文字
            </div>
          </div>

          {/* 説明 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="チケットの詳細な説明を入力してください"
              disabled={isSubmitting}
            />
          </div>

          {/* ステータス、優先度、期日の行 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ステータス */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ステータス
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isSubmitting}
              >
                {Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* 優先度 */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                優先度
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isSubmitting}
              >
                {Object.entries(TICKET_PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* 期日 */}
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                期日
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 担当者 */}
          <div>
            <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              担当者
            </label>
            <select
              id="assigned_to"
              name="assigned_to"
              value={formData.assigned_to || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={isSubmitting}
            >
              <option value="">未割り当て</option>
              {/* TODO: ユーザー一覧を動的に取得して表示 */}
            </select>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200"
              disabled={isSubmitting || !formData.title || !formData.title.trim()}
            >
              {isSubmitting ? '更新中...' : 'チケットを更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
