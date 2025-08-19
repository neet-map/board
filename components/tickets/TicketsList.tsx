'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Ticket, TicketFilters } from '@/types/ticket'
import { useAuth } from '@/lib/auth-context'
import TicketCard from './TicketCard'
import TicketFiltersComponent from '@/components/tickets/TicketFilters'

interface TicketsListProps {
  onTicketClick?: (ticket: Ticket) => void
  onTicketEdit?: (ticket: Ticket) => void
  onTicketDelete?: (ticket: Ticket) => void
}

export default function TicketsList({ onTicketClick, onTicketEdit, onTicketDelete }: TicketsListProps) {
  const { session, loading: authLoading } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TicketFilters>({
    status: 'all',
    priority: 'all',
    assigned_to: 'all',
    created_by: 'all',
    search: ''
  })

  const fetchTickets = useCallback(async () => {
    console.log("fetchTickets")

    try {
      setLoading(true)
      setError(null)

      if (!session?.access_token) {
        throw new Error('認証が必要です')
      }

      const params = new URLSearchParams()
      if (filters.status && filters.status !== 'all') params.set('status', filters.status)
      if (filters.priority && filters.priority !== 'all') params.set('priority', filters.priority)
      if (filters.assigned_to && filters.assigned_to !== 'all') params.set('assigned_to', filters.assigned_to)
      if (filters.created_by && filters.created_by !== 'all') params.set('created_by', filters.created_by)
      if (filters.search) params.set('search', filters.search)
      if (filters.tag_ids && filters.tag_ids.length > 0) params.set('tag_ids', filters.tag_ids.join(','))

      const response = await fetch(`/api/tickets?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        console.error('Fetch tickets error:', response)
        throw new Error('チケットの取得に失敗しました')
      }

      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (err) {
      console.error('Fetch tickets error:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [session?.access_token, filters.status, filters.priority, filters.assigned_to, filters.created_by, filters.search, filters.tag_ids])

  useEffect(() => {
    let isCancelled = false
    
    const loadTickets = async () => {
      if (!authLoading && session?.access_token && !isCancelled) {
        await fetchTickets()
      }
    }
    
    loadTickets()
    
    return () => {
      isCancelled = true
    }
  }, [authLoading, session?.access_token, filters.status, filters.priority, filters.assigned_to, filters.created_by, filters.search, filters.tag_ids, fetchTickets])

  const handleFiltersChange = useCallback((newFilters: TicketFilters) => {
    setFilters(newFilters)
  }, [setFilters])

  const handleRefresh = useCallback(() => {
    fetchTickets()
  }, [fetchTickets])

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          {error}
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          再試行
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <TicketFiltersComponent
        filters={filters}
        onChange={handleFiltersChange}
        onRefresh={handleRefresh}
      />

      {/* チケット数表示 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {tickets.length}件のチケット
        </div>
      </div>

      {/* チケット一覧 */}
      {tickets.length === 0 ? (
        <div className="text-center p-12 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-4">📋</div>
          <div className="text-lg font-medium mb-2">チケットが見つかりません</div>
          <div className="text-sm">
            条件に一致するチケットがないか、まだチケットが作成されていません。
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={onTicketClick}
              onEdit={onTicketEdit}
              onDelete={onTicketDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
