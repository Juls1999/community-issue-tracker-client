import axios from 'axios'

export interface IssueComment {
  id: number
  body: string
  is_internal: boolean
  created_at: string
  user: {
    id: number
    name: string
  }
}

export interface IssueAttachment {
  id: number
  original_name: string
  mime_type: string
  file_size: number
  created_at: string
  uploader?: {
    id: number
    name: string
  }
}

export const issueDiscussionService = {
  async getComments(issueUuid: string) {
    const response = await axios.get(`/api/issues/${issueUuid}/comments`)

    return response.data
  },

  async addComment(issueUuid: string, body: string) {
    const response = await axios.post(`/api/issues/${issueUuid}/comments`, { body })

    return response.data
  },

  async getAttachments(issueUuid: string) {
    const response = await axios.get(`/api/issues/${issueUuid}/attachments`)

    return response.data
  },

  async uploadAttachment(issueUuid: string, files: File[]) {
    const formData = new FormData()

    files.forEach((file) => {
      formData.append('images[]', file)
    })

    return axios.post(`/api/issues/${issueUuid}/attachments`, formData)
  },

  getDownloadUrl(issueUuid: string, attachmentId: number) {
    return (
      `${axios.defaults.baseURL ?? ''}` +
      `/api/issues/${issueUuid}/attachments/${attachmentId}/download`
    )
  },
}
