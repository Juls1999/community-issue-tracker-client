import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { issueService } from '@/services/issueService'
import { queryKeys } from '@/constants/queryKeys'

export function useIssueAssignment() {
  const queryClient = useQueryClient()

  const assignMutation = useMutation({
    mutationFn: (uuid: string) => issueService.claimIssue(uuid),

    onSuccess: () => {
      // Refresh issue lists and dashboard statistics.
      queryClient.invalidateQueries({
        queryKey: queryKeys.issues.all,
      })

      queryClient.invalidateQueries({
        queryKey: queryKeys.staffDashboard.all,
      })
    },
  })

  return {
    assignIssue: assignMutation.mutate,
    assignIssueAsync: assignMutation.mutateAsync,
    isAssigning: assignMutation.isPending,
    assignmentError: assignMutation.error,
    isAssignmentError: assignMutation.isError,
  }
}
