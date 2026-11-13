export interface StaffDashboardStatistics {
  total: number
  pending: number
  inProgress: number
  resolved: number
}

export interface StaffDashboardIssue {
  uuid: string
  title: string
  status: 'pending' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  category?: {
    id: number
    name: string
  }
  barangay?: {
    id: number
    name: string
  }
  reporter?: {
    id: number
    fullName: string
  }
}

export interface StaffDashboardResponse {
  statistics: StaffDashboardStatistics
  recentIssues: StaffDashboardIssue[]
}
