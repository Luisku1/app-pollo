import { useEffect, useState } from "react"
import { getEmployeesPayrollFetch } from "../../services/employees/getEmployeesPayroll"
import { ToastDanger } from "../../helpers/toastify"

export const useEmployeesPayroll = ({ companyId, date }) => {

  const [employeesPayroll, setEmployeesPayroll] = useState()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const replaceReport = (report, payrollIndex) => {

    setEmployeesPayroll((prevEmployeesPayroll) => {

      const newEmployeesPayroll = [...prevEmployeesPayroll]
      newEmployeesPayroll[payrollIndex].branchReports.forEach((branchReport, index) => {

        if (branchReport._id === report._id) {

          newEmployeesPayroll[payrollIndex].branchReports[index] = report
        }
      })
      return newEmployeesPayroll
    })
  }

  const replaceSupervisorReport = (report, payrollIndex) => {

    setEmployeesPayroll((prevEmployeesPayroll) => {

      const newEmployeesPayroll = [...prevEmployeesPayroll]
      newEmployeesPayroll[payrollIndex].supervisorReports.forEach((supervisorReport, index) => {

        if (supervisorReport._id === report._id) {

          newEmployeesPayroll[payrollIndex].supervisorReports[index] = report
        }
      })
      return newEmployeesPayroll
    })
  }

  useEffect(() => {

    if (!companyId || !date) return

    setLoading(true)

    getEmployeesPayrollFetch({ companyId, date }).then((response) => {

      setEmployeesPayroll(response.employeesPayroll)

    }).catch((error) => {

      ToastDanger(error.message)
      setError(error)
    })

    setLoading(false)

  }, [companyId, date])

  return { employeesPayroll, replaceReport, replaceSupervisorReport, loading, error }
}