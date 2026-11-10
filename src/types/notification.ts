export interface AppNotification {
  id: string
  type: string
  data: {
    type: string
    issue_uuid: string
    issue_title: string
    message: string
    old_status?: string
    new_status?: string
    comment_id?: number
    commenter_name?: string
  }
  read_at: string | null
  created_at: string
}

export interface NotificationResponse {
  data: AppNotification[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  unread_count: number
}
