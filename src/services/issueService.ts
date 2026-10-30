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

export interface PaginatedIssues {
  data: Issue[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export const issueService = {
  async getIssues(page = 1): Promise<PaginatedIssues> {
    const response = await axios.get('/api/issues', {
      params: { page },
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
