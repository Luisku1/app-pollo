// Hook: useEmployeePayroll
// Fetches payroll for a single employee for a given week, with efficient pagination (week by week)
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { ToastDanger } from '../../helpers/toastify'
import { getWeekRange } from '../../../../common/dateOps'

export const EMPLOYEE_PAYROLL_QUERY_KEY = (employeeId, date) => ['employeePayroll', employeeId, date]

// Helper to get ISO string for a date (yyyy-mm-dd)
const toISODate = (date) => {
  console.log('toISODate', date)
  if (!date) return ''
  if (typeof date === 'string') return date.split('T')[0]
  return date.toISOString().split('T')[0]
}

export function useEmployeePayroll({ employee, initialDate, week = 0 }) {
  const [date, setDate] = useState(null)
  const queryClient = useQueryClient()
  const employeeId = employee?._id

  useEffect(() => {

    if (!employee || !initialDate) return

    console.log(employee, initialDate, week)

    const weekStart = toISODate(getWeekRange(initialDate ? initialDate : (new Date()), employee?.payDay, week).weekStart)

    setDate(weekStart)

  }, [initialDate, employee?.payDay, week])

  const queryKey = EMPLOYEE_PAYROLL_QUERY_KEY(employeeId, date)

  const {
    data: payroll,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/employee/get-employee-payroll/${employeeId}/${date}`)
      const data = await res.json()
      if (!data || data.employeePayroll === undefined) throw new Error('No se encontró la nómina')
      return data.employeePayroll
    },
    enabled: !!employeeId && !!date,
  })

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
    const d = new Date(date)
    d.setDate(d.getDate() - 7)
    setDate(toISODate(d))
  }
  const goToNextWeek = () => {
    const d = new Date(date)
    d.setDate(d.getDate() + 7)
    setDate(toISODate(d))
  }
  const setPayrollDate = (newDate) => setDate(toISODate(newDate))

  return {
    payroll,
    loading,
    error,
    date,
    setPayrollDate,
    goToPreviousWeek,
    goToNextWeek,
    queryKey,
    updateBranchReport,
    updateSupervisorReport,
    refetch,
  }
}
