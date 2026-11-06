
export const issueDiscussionKeys = {
    all: ['issueDiscussion'] as const,

    comments: (issueUuid: string) =>
        [...issueDiscussionKeys.all, 'comments', issueUuid] as const,

    attachments: (issueUuid: string) =>
        [...issueDiscussionKeys.all, 'attachments', issueUuid] as const,
}
