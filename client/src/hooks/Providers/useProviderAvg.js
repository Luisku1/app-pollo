import { useEffect, useState } from "react"
import { getProviderAvg } from "../../services/Providers/getProviderAvg"

export const useProviderAvg = ({providerId}) => {

  const [providerAvg, setProviderAvg] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    if(!providerId) return

    setLoading(true)

    getProviderAvg({providerId}).then((response) => {

      setProviderAvg(response)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [providerId])

  return {providerAvg, loading, error}
}