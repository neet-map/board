'use client'

import { useState, useEffect, useCallback } from 'react'
import { TicketFilters, TICKET_STATUS_LABELS, TICKET_PRIORITY_LABELS } from '@/types/ticket'

interface TicketFiltersComponentProps {
  filters: TicketFilters
  onChange: (filters: TicketFilters) => void
  onRefresh?: () => void
}

export default function TicketFiltersComponent({ 
  filters, 
  onChange, 
  onRefresh 
}: TicketFiltersComponentProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '')

  // 検索入力のデバウンス処理
  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     onChange({
  //       ...filters,
  //       search: searchInput.trim() || undefined
  //     })
  //   }, 500)
  //   console.log("デバウンス処理", searchInput)

  //   return () => clearTimeout(timeoutId)
  // }, [searchInput])

  const handleFilterChange = (key: keyof TicketFilters, value: any) => {
    onChange({
      ...filters,
      [key]: value === 'all' ? undefined : value
    })
  }

  const clearFilters = () => {
    setSearchInput('')
    onChange({
      status: 'all',
      priority: 'all',
      assigned_to: 'all',
      created_by: 'all',
      search: undefined,
      tag_ids: []
    })
  }

  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.priority !== 'all' || 
    filters.assigned_to !== 'all' || 
    filters.created_by !== 'all' || 
    filters.search ||
    (filters.tag_ids && filters.tag_ids.length > 0)



  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* 検索バー */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="チケットを検索..."
            className="w-full px-3 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* ステータスフィルター */}
        <select
          value={filters.status || 'all'}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm min-w-[100px]"
        >
          <option value="all">全ステータス</option>
          {Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* 優先度フィルター */}
        <select
          value={filters.priority || 'all'}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm min-w-[100px]"
        >
          <option value="all">全優先度</option>
          {Object.entries(TICKET_PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* 担当者フィルター */}
        <select
          value={filters.assigned_to || 'all'}
          onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm min-w-[100px]"
        >
          <option value="all">全担当者</option>
          <option value="">未割り当て</option>
          {/* TODO: ユーザー一覧を動的に取得して表示 */}
        </select>

        {/* アクションボタン */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              クリア
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              title="更新"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
