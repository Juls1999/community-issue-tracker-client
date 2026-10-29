export interface User {
  id: number
  name: string
  email: string
  role?: string | null
  barangay?: string | null
  createdAt: string
  updatedAt: string
}

export interface RegisterParams {
  name: string
  email: string
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
  issueCategoryId: number
  barangayId: number
  priority: string
  latitude: number
  longitude: number
}

export interface Issue {
  uuid: number
  reporter: User
  assignee: User
  barangay: Barangay
  Category: IssueCategory
  title: string
  description: string
  status: string
  priority: string
  latitude: string
  longitude: string
  resolvedAt: string
  createdAt: string
  updatedAt: string
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
