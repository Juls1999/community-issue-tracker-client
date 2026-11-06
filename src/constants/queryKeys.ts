export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
  },

  issues: {
    all: ['issues'] as const,
    allList: ['issues', 'list'] as const,

    residentDashboard: ['issues', 'resident-dashboard'] as const,

    residentReports: ['issues', 'resident-reports'] as const,

    list: (params: {
      page: number
      per_page: number
      search: string
      status: string
      priority: string
      category: string
      sort_by: string
      sort_direction: string
    }) => ['issues', 'list', params] as const,

    detail: (uuid: string) => ['issues', uuid] as const,

    comments: (uuid: string) => ['issues', uuid, 'comments'] as const,

    attachments: (uuid: string) => ['issues', uuid, 'attachments'] as const,
  },

  issueCategories: ['issue-categories'] as const,

  barangays: ['barangays'] as const,
}
