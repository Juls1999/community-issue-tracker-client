import { useQuery } from '@tanstack/vue-query'
import { staffDashboardService } from '@/services/staffDashboardService'
import { queryKeys } from '@/constants/queryKeys'
import { computed } from 'vue'

export function useStaffDashboard() {
  const dashboardQuery = useQuery({
    queryKey: queryKeys.staffDashboard.all,
    queryFn: staffDashboardService.getDashboard,
    staleTime: Infinity,
  })

  return {
    dashboardQuery,
    statistics: computed(() => dashboardQuery.data.value?.statistics),
    recentIssues: computed(() => dashboardQuery.data.value?.recentIssues ?? []),
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
  }
}
