'use client'

import { Ticket, TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS, TICKET_STATUS_COLORS, TICKET_PRIORITY_COLORS } from '@/types/ticket'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface TicketCardProps {
  ticket: Ticket
  onClick?: (ticket: Ticket) => void
}

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(ticket)
    }
  }

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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
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
