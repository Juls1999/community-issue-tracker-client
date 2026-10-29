import type {
  AddAttachmentPayload,
  AddCommentPayload,
  AssignStaffPayload,
  CreateIssueTicketParams,
  Issue,
  UpdateStatusPayload,
} from '@/types'
import axios from 'axios'

export const getIssues = async (): Promise<Issue> => {
  const { data } = await axios.get<Issue>('api/issues')
  return data
}

export const createIssue = async (details: CreateIssueTicketParams): Promise<Issue> => {
  const { data } = await axios.post<Issue>('/api/issues', {
    title: details.title,
    description: details.description,
    issue_category_id: details.issueCategoryId,
    barangay_id: details.barangayId,
    priority: details.priority,
    latitude: details.latitude,
    longitude: details.longitude,
  })
  return data
}

export const getIssue = async (uuid: string): Promise<Issue> => {
  const { data } = await axios.get<Issue>(`/api/issues/${uuid}`)
  return data
}

export const updateIssue = async (uuid: string, issue: Partial<Issue>): Promise<void> => {
  await axios.patch(`/api/issues/${uuid}`, issue)
}

export const assignStaff = async (uuid: string, staff: AssignStaffPayload): Promise<void> => {
  await axios.patch<void>(`/api/issues/${uuid}/assign`, {
    assigned_to: staff.id,
  })
}

export const updateIssueStatus = async (uuid: string, status: UpdateStatusPayload) => {
  await axios.patch(`/api/issues/${uuid}/status`, status)
}

export const addComment = async (uuid: string, comment: AddCommentPayload): Promise<void> => {
  await axios.post<void>(`/api/issues/${uuid}/comments`, comment)
}

export const addAttachment = async (uuid: string, attachment: AddAttachmentPayload): Promise<void> => {
  await axios.post<void>(`/api/issues/${uuid}/attachments`, attachment)
}
