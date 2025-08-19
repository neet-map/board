'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import TicketsList from '@/components/tickets/TicketsList'
import CreateTicketModal from '@/components/tickets/CreateTicketModal'
import { Ticket } from '@/types/ticket'

export default function TicketsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [ticketsListKey, setTicketsListKey] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleTicketClick = (ticket: Ticket) => {
    // 将来的にチケット詳細ページに遷移
    console.log('Ticket clicked:', ticket)
    // router.push(`/tickets/${ticket.id}`)
  }

  const handleCreateTicket = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateSuccess = () => {
    // チケット一覧を再読み込み
    setTicketsListKey(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                チケット管理
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                共有タスクの管理と進捗確認
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* 将来的にチケット作成ボタンを追加 */}
              <button
                onClick={handleCreateTicket}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                + チケット作成
              </button>
            </div>
          </div>
        </div>

        {/* チケット一覧 */}
        <TicketsList key={ticketsListKey} onTicketClick={handleTicketClick} />

        {/* チケット作成モーダル */}
        <CreateTicketModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </div>
  )
}
