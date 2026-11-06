import type {
  AddAttachmentPayload,
  AddCommentPayload,
  AssignStaffPayload,
  Barangay,
  CreateIssueTicketParams,
  Issue,
  IssueCategory,
  IssueListParams,
  IssueUpdatePayload,
  PaginatedIssues,
  UpdateStatusPayload,
  User,
} from '@/types'
import axios from 'axios'

export const issueService = {
  // Fetches a paginated list of issues with optional search and status filters

  async getIssues(params: Partial<IssueListParams> = {}): Promise<PaginatedIssues> {
    const response = await axios.get('/api/issues', {
      params,
    })

    return response.data
  },

  // Fetches a single issue by its UUID
  async getIssue(uuid: string): Promise<Issue> {
    const { data } = await axios.get<{ data: Issue }>(`/api/issues/${uuid}`)

    return data.data
  },

  // Creates a new issue with the provided payload
  async createIssue(payload: CreateIssueTicketParams): Promise<Issue> {
    const { data } = await axios.post<{ data: Issue }>('/api/issues', {
      title: payload.title,
      description: payload.description,
      issue_category_id: payload.categoryId,
      barangay_id: payload.barangayId,
      priority: payload.priority,
      // latitude: payload.latitude,
      // longitude: payload.longitude,
    })

    return data.data
  },

  // Fetches a list of issue categories
  async getIssueCategories(): Promise<IssueCategory[]> {
    const { data } = await axios.get<IssueCategory[]>('/api/issue-categories')
    return data
  },

  async updateIssue(uuid: string, payload: IssueUpdatePayload): Promise<void> {
    await axios.patch<void>(`api/issues/${uuid}`, payload)
  },

  async assignStaff(uuid: string, payload: AssignStaffPayload): Promise<User> {
    const { data } = await axios.post(`/api/issues/${uuid}/assign`, payload)
    return data
  },

  async updateIssueStatus(uuid: string, payload: UpdateStatusPayload): Promise<void> {
    await axios.patch(`/api/issues/${uuid}/status`, payload)
  },

  async addComment(uuid: string, payload: AddCommentPayload) {
    await axios.post(`/api/issues/${uuid}/comments`, payload)
  },

  async addAttachment(uuid: string, payload: AddAttachmentPayload) {
    await axios.post(`/api/issues/${uuid}/attachments`, payload)
  },

  async getBarangays(): Promise<Barangay[]> {
    const { data } = await axios.get<Barangay[]>('/api/barangays')
    return data
  },
}
