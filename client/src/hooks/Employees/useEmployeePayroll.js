// Hook: useEmployeePayroll
// Fetches payroll for a single employee for a given week, with efficient pagination (week by week)
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { ToastDanger } from '../../helpers/toastify'
import { getWeekRange } from '../../../../common/dateOps'
import { useSupervisorReports } from '../Supervisors/useSupervisorReports'
import { useBranchReports } from '../BranchReports.js/useBranchReports'

export const EMPLOYEE_PAYROLL_QUERY_KEY = (employeeId) => ['employeePayroll', employeeId]

// Helper to get ISO string for a date (yyyy-mm-dd)
const toISODate = (date) => {
  if (!date) return ''
  if (typeof date === 'string') return date.split('T')[0]
  return date.toISOString().split('T')[0]
}

export function useEmployeePayroll({ employee }) {
  const [date, setDate] = useState(null)
  const [week, setWeek] = useState(0) // Week offset from the initial date
  const queryClient = useQueryClient()
  const employeeId = employee?._id

  useEffect(() => {

    if (!employee) return

    const weekStart = toISODate(getWeekRange(new Date(), employee?.payDay, week).weekStart)

    setDate(weekStart)

  }, [employee?.payDay, week])

  const queryKey = EMPLOYEE_PAYROLL_QUERY_KEY(employeeId)

  const {
    data: payroll,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/employee/get-employee-payroll/${employeeId}?page=${week}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      const data = await res.json()
      if (!data || data.employeePayroll === undefined) throw new Error('No se encontró la nómina')
      return data.employeePayroll
    },
    enabled: !!employeeId
  })

  const { branchReports, totalBalance: branchBalance } = useBranchReports({ reports: payroll?.branchReports ?? [], profile: true })
  const { supervisorReports, totalBalance: supervisorBalance } = useSupervisorReports({ supervisorReports: payroll?.supervisorReports ?? [], profile: true })

  // Helpers para updates optimistas
  const updateBranchReport = (report) => {
    queryClient.setQueryData(queryKey, (old) => {
      if (!old) return old
      return {
        ...old,
        branchReports: old.branchReports.map((r) => r._id === report._id ? report : r),
      }
    })
  }
  const updateSupervisorReport = (report) => {
    queryClient.setQueryData(queryKey, (old) => {
      if (!old) return old
      return {
        ...old,
        supervisorReports: old.supervisorReports.map((r) => r._id === report._id ? report : r),
      }
    })
  }
  const refetch = () => queryClient.invalidateQueries({ queryKey })

  // Pagination helpers
  const goToPreviousWeek = () => {
    if (week <= -1 && !isSupervisor(employee?.role._id))
      setWeek((prev) => prev - 1)
  }
  const goToNextWeek = () => {
    if (week >= 0) {
      ToastDanger('No puedes avanzar más allá de la semana actual')
      return
    }
    setWeek((prev) => prev + 1)
  }

  return {
    payroll,
    loading,
    error,
    date,
    goToPreviousWeek,
    goToNextWeek,
    queryKey,
    updateBranchReport,
    updateSupervisorReport,
    refetch,
    branchBalance,
    supervisorBalance,
    branchReports,
    supervisorReports,
  }
}
