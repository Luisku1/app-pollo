import { useEffect, useState } from "react"
import { getProvidersInputs } from "../../services/ProvidersInputs/getProvidersInputs"

export const useProviderInputs = ({ companyId, productId, date }) => {

  const [providerInputs, setProviderInputs] = useState([])
  const [providerInputsWeight, setProviderInputsWeight] = useState(0.0)
  const [providerInputsPieces, setProviderInputsPieces] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const spliceProviderInput = ({ index }) => {

    const removedProviderInput = providerInputs.splice(index, 1)
    setProviderInputsWeight((prevTotal) => prevTotal - removedProviderInput.weight)
    setProviderInputsPieces((prevTotal) => prevTotal - removedProviderInput.pieces)

  }

  const pushProviderInput = ({ providerInput }) => {

    console.log(providerInput)

    setProviderInputs((prevProviderInputs) => [providerInput, ...prevProviderInputs])
    setProviderInputsWeight((prevTotal) => parseFloat(providerInput.weight) + prevTotal)
    setProviderInputsPieces((prevTotal) => parseFloat(providerInput.pieces) + prevTotal)
  }

  useEffect(() => {

    if (!companyId || !date || !productId) return

    setLoading(true)

    getProvidersInputs({ companyId, productId, date }).then((response) => {

      setProviderInputs(response.providerInputs)
      setProviderInputsWeight(response.providerInputsWeight)
      setProviderInputsPieces(response.providerInputsPieces)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [companyId, date, productId])

  return { providerInputs, providerInputsWeight, providerInputsPieces, pushProviderInput, spliceProviderInput, loading, error }
}