import { useEffect, useMemo, useState } from "react"
import { getSupervisorReportsFetch } from "../../services/Supervisors/getSupervisorReports"

export const useSupervisorReports = ({ supervisorId = null, supervisorReports = [] }) => {

  const [finalReports, setFinalReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const replaceReport = (updatedReport) => {

    setFinalReports((prev) => prev.map((report) => {

      if (report._id === updatedReport._id) {

        return updatedReport
      }

      return report
    }))
  }

  useEffect(() => {

    if (supervisorReports.length > 0 && finalReports === null) {
      setFinalReports(supervisorReports)
    }

  }, [supervisorReports, finalReports])

  useEffect(() => {

    if (!supervisorId) return

    setLoading(true)

    getSupervisorReportsFetch({supervisorId}).then((response) => {

      setFinalReports(response)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [supervisorId])


  const totalBalance = useMemo(() => {

    if (!finalReports) return 0

    return finalReports.reduce((acc, report) => acc + report.balance, 0)

  }, [finalReports])

  return {supervisorReports: finalReports, totalBalance, setSupervisorReports: setFinalReports, replaceReport, loading, error}
}