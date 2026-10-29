import {
  createIssue as generateIssue,
  getIssue as showIssue,
  getIssues as retrieveIssues,
  updateIssue as modifyIssue,
  assignStaff as assignUser,
  updateIssueStatus,
  addComment,
  addAttachment,
} from '@/services/issueService'
import type {
  AddAttachmentPayload,
  AddCommentPayload,
  AssignStaffPayload,
  CreateIssueTicketParams,
  Issue,
  UpdateStatusPayload,
} from '@/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useIssueStore = defineStore('issue', () => {
  const issues = ref<Issue[] | null>(null)
  const fetchingIssues = ref(false)
  const issue = ref<Issue | null>(null)

  const getIssues = async () => {
    fetchingIssues.value = true
    try {
      await retrieveIssues()
    } catch (err) {
      console.log(err, 'Error')
    } finally {
      fetchingIssues.value = false
    }
  }

  const createIssue = async (details: CreateIssueTicketParams) => {
    try {
      const data = await generateIssue(details)
      issue.value = data
    } catch (err) {
      console.log(err, 'Error')
    }
  }

  const getIssue = async (uuid: string) => {
    try {
      const data = await showIssue(uuid)
      issue.value = data
    } catch (err) {
      console.log(err, 'Error')
    }
  }

  const updateIssue = async (uuid: string, issue: Partial<Issue>) => {
    try {
      await modifyIssue(uuid, issue)
    } catch (err) {
      console.error(err, 'Error')
    }
  }

  const assignStaff = async (uuid: string, staff: AssignStaffPayload) => {
    try {
      await assignUser(uuid, staff)
    } catch (err) {
      console.log(err, 'Error')
    }
  }

  const updateStatus = async (uuid: string, status: UpdateStatusPayload) => {
    try {
      await updateIssueStatus(uuid, status)
    } catch (err) {
      console.log(err, 'Error')
    }
  }

  const createComment = async (uuid: string, comment: AddCommentPayload) => {
    try {
      await addComment(uuid, comment)
    } catch (err) {
      console.log(err, 'Error')
    }
  }

  const createAttachment = async (uuid: string, attachment: AddAttachmentPayload) => {
    try {
      await addAttachment(uuid, attachment)
    } catch (err) {
      console.log(err, 'Error')
    }
  }
  return {
    issues,
    fetchingIssues,
    issue,
    getIssues,
    createIssue,
    getIssue,
    updateIssue,
    assignStaff,
    updateStatus,
    createComment,
    createAttachment,
  }
})
