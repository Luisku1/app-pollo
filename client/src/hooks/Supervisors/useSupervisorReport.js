import { useEffect, useState } from "react"
import { getSupervisorReportFetch } from "../../services/Supervisors/getSupervisorReport"

export const useSupervisorReport = ({ supervisorId, date }) => {

  const [supervisorReport, setSupervisorReport] = useState(null)
  const [loading, setLoading] = useState(false)

  const getSupervisorReport = ({ supervisorId, date }) => {

    setLoading(true)

    getSupervisorReportFetch({ supervisorId, date }).then((response) => {

      setSupervisorReport(response.supervisorReport)

    }).catch((error) => {

      console.log(error)
    })

    setLoading(false)
  }

  useEffect(() => {

    if (!supervisorId || !date) return

    setLoading(true)

    getSupervisorReportFetch({ supervisorId, date }).then((response) => {

      setSupervisorReport(response.supervisorReport)

    }).catch((error) => {

      console.log(error)
    })

    setLoading(false)

  }, [supervisorId, date])

  return {supervisorReport, getSupervisorReport, loading}
}