export interface Ticket {
  id: string
  title: string
  description: string | null
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to: string | null
  created_by: string
  due_date: string | null
  created_at: string
  updated_at: string
  // リレーション
  assigned_user?: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }
  creator?: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }
  comments?: TicketComment[]
  tags?: TicketTag[]
}

export interface TicketComment {
  id: string
  ticket_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  // リレーション
  user?: {
    id: string
    display_name: string | null
    avatar_url: string | null
  }
}

export interface TicketTag {
  id: string
  name: string
  color: string
  created_at: string
}

export interface TicketTagRelation {
  ticket_id: string
  tag_id: string
}

export interface CreateTicketData {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
  due_date?: string
  tag_ids?: string[]
}

export interface UpdateTicketData {
  title?: string
  description?: string
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
  due_date?: string
  tag_ids?: string[]
}

export interface TicketFilters {
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'all'
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'all'
  assigned_to?: string | 'all'
  created_by?: string | 'all'
  tag_ids?: string[]
  search?: string
}

export const TICKET_STATUS_LABELS = {
  open: 'オープン',
  in_progress: '進行中',
  completed: '完了',
  cancelled: 'キャンセル'
} as const

export const TICKET_PRIORITY_LABELS = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急'
} as const

export const TICKET_STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800'
} as const

export const TICKET_PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
} as const
