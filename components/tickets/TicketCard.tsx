'use client'

import { Ticket, TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS, TICKET_STATUS_COLORS, TICKET_PRIORITY_COLORS } from '@/types/ticket'
import { useAuth } from '@/lib/auth-context'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface TicketCardProps {
  ticket: Ticket
  onClick?: (ticket: Ticket) => void
  onEdit?: (ticket: Ticket) => void
  onDelete?: (ticket: Ticket) => void
}

export default function TicketCard({ ticket, onClick, onEdit, onDelete }: TicketCardProps) {
  const { user } = useAuth()
  
  const handleClick = () => {
    if (onClick) {
      onClick(ticket)
    }
  }

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // カード全体のクリックイベントを防ぐ
    if (onEdit) {
      onEdit(ticket)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation() // カード全体のクリックイベントを防ぐ
    if (onDelete) {
      onDelete(ticket)
    }
  }

  // 現在のユーザーがチケットの作成者かどうかをチェック
  const isCreator = user?.id === ticket.created_by

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: ja 
    })
  }

  const isDueSoon = ticket.due_date && new Date(ticket.due_date) < new Date(Date.now() + 24 * 60 * 60 * 1000)
  const isOverdue = ticket.due_date && new Date(ticket.due_date) < new Date()

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 
            className={`text-lg font-semibold text-gray-900 dark:text-white truncate ${
              onEdit ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200' : ''
            }`}
            onClick={onEdit ? handleTitleClick : undefined}
            title={onEdit ? 'クリックして編集' : undefined}
          >
            {ticket.title}
          </h3>
          {ticket.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {ticket.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {/* 優先度バッジ */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${TICKET_PRIORITY_COLORS[ticket.priority]}`}>
            {TICKET_PRIORITY_LABELS[ticket.priority]}
          </span>
          {/* ステータスバッジ */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${TICKET_STATUS_COLORS[ticket.status]}`}>
            {TICKET_STATUS_LABELS[ticket.status]}
          </span>
          {/* 削除ボタン（作成者のみ表示） */}
          {isCreator && onDelete && (
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors duration-200"
              title="削除"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* タグ */}
      {ticket.tags && ticket.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {ticket.tags.map(tag => (
            <span
              key={tag.id}
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: tag.color + '20',
                color: tag.color,
                borderColor: tag.color + '40',
                borderWidth: '1px'
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* 期日 */}
      {ticket.due_date && (
        <div className="mb-3">
          <span className={`text-sm ${
            isOverdue 
              ? 'text-red-600 dark:text-red-400 font-medium' 
              : isDueSoon 
                ? 'text-orange-600 dark:text-orange-400 font-medium'
                : 'text-gray-600 dark:text-gray-400'
          }`}>
            期日: {new Date(ticket.due_date).toLocaleDateString('ja-JP')}
            {isOverdue && ' (期限切れ)'}
            {isDueSoon && !isOverdue && ' (間もなく期限)'}
          </span>
        </div>
      )}

      {/* フッター */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          {/* 作成者 */}
          <div className="flex items-center gap-2">
            {ticket.creator?.avatar_url ? (
              <img
                src={ticket.creator.avatar_url}
                alt={ticket.creator.display_name || '作成者'}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {ticket.creator?.display_name?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <span>{ticket.creator?.display_name || '不明'}</span>
          </div>

          {/* 担当者 */}
          {ticket.assigned_user && (
            <div className="flex items-center gap-2">
              <span>→</span>
              {ticket.assigned_user.avatar_url ? (
                <img
                  src={ticket.assigned_user.avatar_url}
                  alt={ticket.assigned_user.display_name || '担当者'}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-300 dark:bg-blue-600 flex items-center justify-center">
                  <span className="text-xs text-blue-600 dark:text-blue-300">
                    {ticket.assigned_user.display_name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              <span>{ticket.assigned_user.display_name || '不明'}</span>
            </div>
          )}
        </div>

        {/* 作成日時 */}
        <span>{formatDate(ticket.created_at)}</span>
      </div>
    </div>
  )
}
