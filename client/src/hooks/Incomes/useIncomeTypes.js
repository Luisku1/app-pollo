import { useEffect, useState } from "react"
import { getIncomeTypes } from "../../services/Incomes/getIncomeTypes"
import { ToastInfo } from "../../helpers/toastify"

export const useIncomeTypes = () => {

  const [incomeTypes, setIncomeTypes] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    setLoading(true)

    getIncomeTypes().then((incomeTypes) => {

      setIncomeTypes(incomeTypes)

    }).catch((error) => {

      ToastInfo(error.message)
    })

    setLoading(false)

  }, [])

  return {incomeTypes, loading}
}