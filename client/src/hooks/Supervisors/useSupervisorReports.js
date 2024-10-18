import { useEffect, useState } from "react"
import { getSupervisorReportsFetch } from "../../services/Supervisors/getSupervisorReports"

export const useSupervisorReports = ({ supervisorId }) => {

  const [supervisorReports, setSupervisorReports] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if (!supervisorId) return

    setLoading(true)

    getSupervisorReportsFetch({supervisorId}).then((response) => {

      setSupervisorReports(response.supervisorReports)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [supervisorId])

  return {supervisorReports, loading, error}
}