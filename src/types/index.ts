export interface User {
  id: number
  fullName: string
  firstName: string
  middleName: string
  lastName: string
  phoneNumber: string
  email: string
  role?: Role | null
  barangay?: Barangay | null
  createdAt: string
  updatedAt: string
  isVerified: boolean
}

export interface UpdateUserParams {
  firstName?: string
  middleName?: string
  lastName?: string
  phoneNumber?: string
}

export interface Role {
  id: number
  name: string
}

export interface RegisterParams {
  firstName: string
  middleName: string
  lastName: string
  phoneNumber: string
  email: string
  barangayId: string
  password: string
  passwordConfirmation: string
}

export interface LoginParams {
  email: string
  password: string
}

export interface Barangay {
  id: number
  name: string
  municipality: string
  province: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface IssueCategory {
  id: number
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateIssueTicketParams {
  title: string
  description: string
  categoryId: number | null
  barangayId?: number | null
  priority: string
  latitude?: number
  longitude?: number
}

export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent'

export type IssueStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected'

export interface Issue {
  uuid: string
  reporter: User
  assignee: User
  barangay: Barangay
  category: IssueCategory
  title: string
  description: string
  status: IssueStatus
  priority: IssuePriority
  latitude: string
  longitude: string
  resolvedAt: string
  createdAt: string
  updatedAt: string
}

export interface IssueStatistics {
  total: number
  pending: number
  in_progress: number
  resolved: number
  rejected: number
}

// export interface PaginatedIssues {
//   data: Issue[]
//   links: {
//     first: string | null
//     last: string | null
//     prev: string | null
//     next: string | null
//   }
//   meta: {
//     current_page: number
//     last_page: number
//     per_page: number
//     total: number
//   }
//   statistics: IssueStatistics
// }

export interface IssueComment {
  id: number
  body: string
  is_internal: boolean
  created_at: string
  user: User
}

export interface IssueAttachment {
  id: number
  original_name: string
  mime_type: string
  file_size: number
  created_at: string
  uploader?: User | null
}

export type AssignStaffPayload = {
  id: number
}

export type UpdateStatusPayload = {
  status: string
}

export type AddCommentPayload = {
  body: string
}

export type AddAttachmentPayload = {
  image: string
}

export interface IssueEditForm {
  title: string
  description: string
  category: {
    id: number
  }
  latitude: string
  longitude: string
}

export interface IssueUpdatePayload {
  title: string
  description: string
  issue_category_id: number
  latitude: number | null
  longitude: number | null
}

export interface IssuesResponse {
  data: Issue[]
  statistics: {
    total: number
    pending: number
    in_progress: number
    resolved: number
    rejected: number
  }
}

export interface IssueListParams {
  page: number
  per_page: number
  search: string
  status: string
  priority: string
  category: string
  sort_by: string
  sort_direction: string
}

export interface PaginatedIssues {
  data: Issue[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
  }
  statistics?: IssueStatistics
}
