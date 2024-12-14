import { useEffect, useState } from "react"
import { getSupervisorReportFetch } from "../../services/Supervisors/getSupervisorReport"

export const useSupervisorReport = ({ supervisorId, date }) => {

  const [supervisorReport, setSupervisorReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateSupervisorReport = ({ updatedSupervisorReport }) => {

    if (supervisorReport != updatedSupervisorReport || supervisorReport.balance != updatedSupervisorReport.balance) {

      setSupervisorReport(updatedSupervisorReport)
    }
  }

  const getSupervisorReport = ({ supervisorId, date }) => {

    setLoading(true)

    getSupervisorReportFetch({ supervisorId, date }).then((response) => {

      setSupervisorReport(response.supervisorReport)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)
  }

  useEffect(() => {

    if (!supervisorId || !date) return

    setLoading(true)

    getSupervisorReportFetch({ supervisorId, date }).then((response) => {

      setSupervisorReport(response.supervisorReport)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [supervisorId, date])

  return { supervisorReport, getSupervisorReport, updateSupervisorReport, loading, error }
}