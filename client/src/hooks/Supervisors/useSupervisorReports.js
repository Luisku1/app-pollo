import { useEffect, useState } from "react"
import { getSupervisorReportsFetch } from "../../services/Supervisors/getSupervisorReports"

export const useSupervisorReports = ({ supervisorId }) => {

  const [supervisorReports, setSupervisorReports] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const replaceReport = (updatedReport) => {

    setSupervisorReports((prev) => prev.map((report) => {

      if (report._id === updatedReport._id) {

        return updatedReport
      }

      return report
    }))
  }

  useEffect(() => {

    if (!supervisorId) return

    setLoading(true)

    getSupervisorReportsFetch({supervisorId}).then((response) => {

      console.log(response)
      setSupervisorReports(response)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [supervisorId])

  return {supervisorReports, replaceReport, loading, error}
}