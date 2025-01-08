import { useEffect, useMemo, useState } from "react"
import { getProvidersInputs } from "../../services/ProvidersInputs/getProvidersInputs"
import { useCreateProviderInput } from "./useCreateProviderInput"
import { useDeleteProviderInput } from "./useDeleteProviderInput"
import { Types } from "mongoose"

export const useProviderInputs = ({ companyId = null, productId = null, date = null, initialInputs = [] }) => {

  const [providerInputs, setProviderInputs] = useState(initialInputs)
  const [providerInputsWeight, setProviderInputsWeight] = useState(
    initialInputs.reduce((acc, input) => acc + input.weight, 0)
  )
  const [providerInputsPieces, setProviderInputsPieces] = useState(
    initialInputs.reduce((acc, input) => acc + input.pieces, 0)
  )
  const [providerInputsAmount, setProviderInputsAmount] = useState(
    initialInputs.reduce((acc, input) => acc + input.amount, 0)
  )
  const { createProviderInput } = useCreateProviderInput()
  const { deleteProviderInput } = useDeleteProviderInput()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const calculateTotal = (providerInputsList) => {

    setProviderInputsAmount(providerInputsList.reduce((acc, input) => acc + input.amount, 0))
    setProviderInputsWeight(providerInputsList.reduce((acc, input) => acc + input.weight, 0))
    setProviderInputsPieces(providerInputsList.reduce((acc, input) => acc + input.pieces, 0))
  }

  const spliceProviderInput = ({ index }) => {

    setProviderInputs((prevInputs) => {
      const newInputs = prevInputs.filter((_, i) => i !== index)
      calculateTotal(newInputs)
      return newInputs
    })

  }

  const pushProviderInput = ({ providerInput }) => {

    setProviderInputs((prevInputs) => {
      calculateTotal([providerInput])
      return [providerInput, ...prevInputs]
    })
  }

  const onAddProviderInput = async (providerInput, group) => {

    const tempId = new Types.ObjectId().toHexString()

    try {

      const tempProviderInput = { ...providerInput, _id: tempId }

      pushProviderInput(tempProviderInput, group)
      await createProviderInput(tempProviderInput, group)

    } catch (error) {

      spliceProviderInput(providerInputs.findIndex((input) => input._id === tempId))
      console.log(error)
    }
  }

  const onDeleteProviderInput = async (providerInput, index) => {

    try {

      spliceProviderInput(index)
      await deleteProviderInput(providerInput)

    } catch (error) {

      pushProviderInput(providerInput)
      console.log(error)
    }
  }

  const sortedProviderInputs = useMemo(() => {

    const clientsInputs = providerInputs.filter((input) => !input.branch)
    const branchesInputs = providerInputs
    return [...branchesInputs, ...clientsInputs]
  }, [providerInputs])

  useEffect(() => {

    if (!companyId || !date || !productId) return

    setLoading(true)

    setProviderInputs([])
    setProviderInputsWeight(0.0)
    setProviderInputsPieces(0.0)
    setProviderInputsAmount(0.0)

    getProvidersInputs({ companyId, productId, date }).then((response) => {

      setProviderInputs(response.providerInputs)
      setProviderInputsAmount(response.providerInputsAmount)
      setProviderInputsWeight(response.providerInputsWeight)
      setProviderInputsPieces(response.providerInputsPieces)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [companyId, date, productId])

  return {
    providerInputs: sortedProviderInputs,
    providerInputsAmount,
    providerInputsWeight,
    providerInputsPieces,
    onAddProviderInput,
    onDeleteProviderInput,
    pushProviderInput,
    spliceProviderInput,
    loading,
    error
  }
}