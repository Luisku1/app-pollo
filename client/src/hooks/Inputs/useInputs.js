import { useEffect, useState } from "react"
import { getInputs } from "../../services/Inputs/getInputs"

export const useInputs = ({ companyId, date }) => {

  const [inputs, setInputs] = useState([])
  const [totalWeight, setTotalWeight] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const pushInput = ({ input }) => {

    setInputs((prevInputs) => [input, ...prevInputs])
    setTotalWeight((prevTotal) => prevTotal + input.weight)
  }

  const spliceInput = ({ index }) => {

    const removedInput = inputs.splice(index, 1)
    setTotalWeight((prevTotal) => prevTotal - removedInput[0].weight)
  }

  const updateLastInputId = ({ inputId }) => {

    setInputs((prevInputs) => prevInputs.map((input, index) =>

      index == 0 ? { _id: inputId, ...input } : input
    ))
  }

  useEffect(() => {

    if (!companyId || !date) return

    setLoading(true)

    setInputs([])
    setTotalWeight(0.0)

    getInputs({ companyId, date }).then((response) => {

      setInputs(response.inputs)
      setTotalWeight(response.totalWeight)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [companyId, date])

  return {

    inputs,
    totalWeight,
    loading,
    pushInput,
    spliceInput,
    updateLastInputId,
    error
  }
}