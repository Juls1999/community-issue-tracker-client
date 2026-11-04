import axios from 'axios'

export interface Issue {
  uuid: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  category?: {
    id: number
    name: string
  } | null
  barangay?: {
    id: number
    name: string
  } | null
}

export interface IssueStatistics {
  total: number
  pending: number
  in_progress: number
  resolved: number
  rejected: number
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
    last_page: number
    per_page: number
    total: number
  }
  statistics: IssueStatistics
}

export const issueService = {
  async getIssues(page = 1, search = '', status = 'all'): Promise<PaginatedIssues> {
    const response = await axios.get('/api/issues', {
      params: {
        page,
        search: search || undefined,
        status: status === 'all' ? undefined : status,
      },
    })

    return response.data
  },

  async getIssue(uuid: string): Promise<Issue> {
    const response = await axios.get(`/api/issues/${uuid}`)

    return response.data.data
  },

  async createIssue(payload: {
    title: string
    description: string
    issue_category_id: number
    barangay_id?: number | null
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    latitude?: number | null
    longitude?: number | null
  }): Promise<Issue> {
    const response = await axios.post('/api/issues', payload)

    return response.data.data
  },
}
