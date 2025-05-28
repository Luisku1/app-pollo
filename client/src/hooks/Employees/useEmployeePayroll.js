// Hook: useEmployeePayroll
// Fetches payroll for a single employee for a given week, with efficient pagination (week by week)
import { useState, useEffect, useCallback } from 'react'
import { ToastDanger } from '../../helpers/toastify'
import { getWeekRange } from '../../../../common/dateOps'

// Helper to get ISO string for a date (yyyy-mm-dd)
const toISODate = (date) => {
  console.log('toISODate', date)
  if (!date) return ''
  if (typeof date === 'string') return date.split('T')[0]
  return date.toISOString().split('T')[0]
}

export function useEmployeePayroll({ employee, initialDate, week = 0 }) {
  const [date, setDate] = useState(null)
  const [payroll, setPayroll] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if (!employee || !initialDate) return

    console.log(employee, initialDate, week)

    const weekStart = toISODate(getWeekRange(initialDate ? initialDate : (new Date()), employee?.payDay, week).weekStart)

    setDate(weekStart)

  }, [initialDate, employee?.payDay, week])

  // Fetch payroll for the current date
  const fetchPayroll = useCallback(async (targetDate) => {

    const employeeId = employee?._id
    if (!employeeId || !targetDate) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/employee/get-employee-payroll/${employeeId}/${targetDate}`)
      const data = await res.json()
      if (!data || data.employeePayroll === undefined) throw new Error('No se encontró la nómina')
      setPayroll(data.employeePayroll)
    } catch (err) {
      setPayroll(null)
      setError(err.message)
      ToastDanger(err.message)
    } finally {
      setLoading(false)
    }
  }, [employee])

  // Fetch on mount or when date/employeeId changes
  useEffect(() => {

    if (!employee || !date) return
    fetchPayroll(date)
  }, [employee, date, fetchPayroll])

  // Pagination: go to previous/next week
  const goToPreviousWeek = () => {
    setDate(toISODate(d))
  }
  const goToNextWeek = () => {
    const d = new Date(date)
    d.setDate(d.getDate() + 7)
    setDate(toISODate(d))
  }

  // Allow manual date set (for custom date pickers)
  const setPayrollDate = (newDate) => setDate(toISODate(newDate))

  return {
    payroll,
    loading,
    error,
    date,
    setPayrollDate,
    goToPreviousWeek,
    goToNextWeek,
  }
}
