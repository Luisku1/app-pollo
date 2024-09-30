import { useEffect, useState } from "react"
import { getOutputs } from "../../services/Outputs/getOutputs"

export const useOutput = ({ companyId, date }) => {

  const [outputs, setOutputs] = useState({})
  const [totalWeight, setTotalWeight] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const pushOutput = ({ output }) => {

    setOutputs((prevOutput) => [output, ...prevOutput])
    setTotalWeight((prevTotal) => prevTotal + output.weight)
  }

  const spliceOutput = ({ index }) => {

    const removedOutput = outputs.splice(index, 1)
    setTotalWeight((prevTotal) => prevTotal - removedOutput[0].weight)
  }

  const updateLastOutputId = ({ outputId }) => {

    outputs[0]._id = outputId
  }

  useEffect(() => {

    if (!companyId || !date) return

    setLoading(true)

    getOutputs({ companyId, date }).then((response) => {

      setOutputs(response.outputs)
      setTotalWeight(response.totalWeight)

    }).catch((error) => {

      setError(error)
    })

    setLoading(false)

  }, [companyId, date])


  return {
    outputs,
    totalWeight,
    loading,
    error,
    pushOutput,
    spliceOutput,
    updateLastOutputId
  }
}