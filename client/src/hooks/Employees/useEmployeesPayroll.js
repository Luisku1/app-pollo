import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getEmployeesPayrollFetch } from "../../services/employees/getEmployeesPayroll"

export const EMPLOYEES_PAYROLL_QUERY_KEY = (companyId, date) => ['employeesPayroll', companyId, date]

export const useEmployeesPayroll = ({ companyId, date, setSelectedEmployeePayroll }) => {
  const queryClient = useQueryClient()
  const queryKey = EMPLOYEES_PAYROLL_QUERY_KEY(companyId, date)

  const {
    data: employeesPayroll,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => getEmployeesPayrollFetch({ companyId, date }).then(r => r.employeesPayroll),
    enabled: !!companyId && !!date,
  })

  // Helpers para updates optimistas
  const updateBranchReport = (employeeId, report) => {
    queryClient.setQueryData(queryKey, (old) => {
      if (!old) return old
      return old.map((payroll) => {
        if (payroll.employee._id === employeeId) {
          const newPayroll = {
            ...payroll,
            branchReports: payroll.branchReports.map((r) => r._id === report._id ? report : r),
          }
          if (setSelectedEmployeePayroll) {
            setSelectedEmployeePayroll({
              employeePayroll: newPayroll,
              externalIndex: payroll._id,
            })
          }
          return newPayroll
        }
        return payroll
      })
    })
  }
  const updateSupervisorReport = (employeeId, report) => {
    queryClient.setQueryData(queryKey, (old) => {
      if (!old) return old
      return old.map((payroll) => {
        if (payroll.employee._id === employeeId) {
          const newPayroll = {
            ...payroll,
            supervisorReports: payroll.supervisorReports.map((r) => r._id === report._id ? report : r),
          }
          if (setSelectedEmployeePayroll) {
            setSelectedEmployeePayroll({
              employeePayroll: newPayroll,
              externalIndex: payroll._id,
            })
          }
          return newPayroll
        }
        return payroll
      })
    })
  }

  // Para invalidar/recargar
  const refetch = () => queryClient.invalidateQueries({ queryKey })

  return { employeesPayroll, loading, error, queryKey, updateBranchReport, updateSupervisorReport, refetch }
}