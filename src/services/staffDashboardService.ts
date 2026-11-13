import axios from 'axios'
import type { StaffDashboardResponse } from '@/types/staffDashboard'

export const staffDashboardService = {
  async getDashboard(): Promise<StaffDashboardResponse> {
    const { data } = await axios.get<{ data: StaffDashboardResponse }>('/api/staff/dashboard')

    return data.data
  },
}
