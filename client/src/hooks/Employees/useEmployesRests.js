import { useEffect, useState } from "react"
import { getPendingEmployeesRestsFetch } from "../../services/employees/getPendingEmployeesRests"

export const usePendingEmployeesRests = ({ companyId }) => {

  const [pendingRests, setPendingRests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const pushPendingEmployeeRest = ({ employeeRest }) => {

    setPendingRests((prev) => [employeeRest, ...prev])
  }

  const splicePendingEmployeeRest = ({ index }) => {

    if (pendingRests.length == 0) {
      setPendingRests([])

    } else {

      setPendingRests((prev) => prev.filter((_,  i) => i != index))
    }
  }

  const updateLastEmployeeRestId = ({ createdEmployeeRestId }) => {


    setPendingRests((prev) => prev.map((employeeRest, index) =>

      index != 0 ? employeeRest : { _id: createdEmployeeRestId, ...employeeRest }
    ))
  }

  useEffect(() => {

    if (!companyId) return

    setLoading(true)

    getPendingEmployeesRestsFetch({ companyId }).then((response) => {

      setPendingRests(response.pendingEmployeesRests)

    }).catch((error) => {

      console.log(error)
      setError(error)
    })

    setLoading(false)
  }, [companyId])

  return {
    pendingRests,
    pushPendingEmployeeRest,
    splicePendingEmployeeRest,
    updateLastEmployeeRestId,
    loading,
    error
  }
}