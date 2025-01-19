import { useEffect, useMemo, useState } from "react"
import { getProvidersInputs } from "../../services/ProvidersInputs/getProvidersInputs"
import { useCreateProviderInput } from "./useCreateProviderInput"
import { useDeleteProviderInput } from "./useDeleteProviderInput"
import { Types } from "mongoose"

export const useProviderInputs = ({ companyId = null, productId = null, date = null, initialInputs = null }) => {

  const [providerInputs, setProviderInputs] = useState([])
  const [providerInputsWeight, setProviderInputsWeight] = useState(0)
  const [providerInputsPieces, setProviderInputsPieces] = useState(0)
  const [providerInputsAmount, setProviderInputsAmount] = useState(0)
  const { createProviderInput } = useCreateProviderInput()
  const { deleteProviderInput } = useDeleteProviderInput()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const calculateTotal = (providerInputsList) => {

    setProviderInputsAmount(providerInputsList.reduce((acc, input) => acc + input.amount, 0))
    setProviderInputsWeight(providerInputsList.reduce((acc, input) => acc + input.weight, 0))
    setProviderInputsPieces(providerInputsList.reduce((acc, input) => acc + input.pieces, 0))
  }

  const spliceProviderInput = (index) => {
    setProviderInputs((prevInputs) => {
      const newInputs = prevInputs.filter((_, i) => i !== index)
      calculateTotal(newInputs)
      return newInputs
    })
  }

  const pushProviderInput = (providerInput) => {
    setProviderInputs((prevInputs) => {
      const newInputs = [providerInput, ...prevInputs]
      calculateTotal(newInputs)
      return newInputs
    })
  }

  const onAddProviderInput = async (providerInput, group) => {

    const tempId = new Types.ObjectId().toHexString()

    try {

      const tempProviderInput = { ...providerInput, _id: tempId }

      pushProviderInput(tempProviderInput)
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

  const initialize = (initialArray) => {
    setProviderInputs(initialArray);
  };

  useEffect(() => {

    if (!initialInputs) return

    initialize(initialInputs)
    calculateTotal(initialInputs)

  }, [initialInputs])

  useEffect(() => {

    if (!companyId || !date || !productId) return

    setLoading(true)
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

  const sortedProviderInputs = useMemo(() => {
    let clientsInputs = providerInputs.filter((input) => !input.branch)
    clientsInputs = clientsInputs.sort((a, b) => a.name - b.name)
    let branchesInputs = providerInputs
      .filter((input) => input.branch)
      .sort((a, b) => a.branch.position - b.branch.position)
    return [...branchesInputs, ...clientsInputs]
  }, [providerInputs])

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
    error,
    initialize
  }
}