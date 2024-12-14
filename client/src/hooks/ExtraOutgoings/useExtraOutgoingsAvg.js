import { useEffect, useState } from "react"
import { getExtraOutgoingsAvg } from "../../services/ExtraOutgoings/getExtraOutgoingsAvg"

export const useExtraOutgoingsAvg = ({ companyId }) => {

  const [extraOutgoingsAvg, setExtraOutgoingsAvg] = useState(0.0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if (!companyId) return

    setLoading(true)

    setExtraOutgoingsAvg(0.0)

    getExtraOutgoingsAvg({companyId}).then((response) => {

      setExtraOutgoingsAvg(response.extraOutgoingsAvg)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [companyId])

  return { extraOutgoingsAvg, loading, error }

}