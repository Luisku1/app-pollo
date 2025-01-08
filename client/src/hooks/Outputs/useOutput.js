import { useEffect, useMemo, useState } from "react"
import { getOutputs } from "../../services/Outputs/getOutputs"
import { useAddOutput } from "./useAddOutput"
import { useDeleteOutput } from "./useDeleteOutput"
import { Types } from "mongoose"

export const useOutput = ({ companyId = null, date = null, initialOutputs = [] }) => {

  const [outputs, setOutputs] = useState(initialOutputs)
  const [totalWeight, setTotalWeight] = useState(
    initialOutputs.reduce((acc, output) => acc + output.weight, 0)
  )
  const [totalAmount, setTotalAmount] = useState(
    initialOutputs.reduce((acc, output) => acc + output.amount, 0)
  )
  const { addOutput, loading: addLoading } = useAddOutput()
  const {deleteOutput, loading: deleteLoading} = useDeleteOutput()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const calculateTotal = (outputsList) => {

    setTotalAmount(outputsList.reduce((acc, output) => acc + output.amount, 0))
    setTotalWeight(outputsList.reduce((acc, output) => acc + output.weight, 0))
  }

  const pushOutput = (output) => {

    setOutputs((prevOutputs) => [output, ...prevOutputs])
    setTotalWeight((prevTotal) => prevTotal + output.weight)
  }

  const spliceOutput = (index) => {
    setOutputs((prevOutputs) => {
      const removedOutput = prevOutputs[index];
      const newOutputs = prevOutputs.filter((_, i) => i !== index);
      setTotalWeight((prevTotal) => prevTotal - removedOutput.weight);
      return newOutputs;
    });
  };

  const onAddOutput = async (output, group) => {

    const tempId = new Types.ObjectId().toHexString()

    try {

      const tempOutput = { ...output, _id: tempId }

      pushOutput(tempOutput, group)
      await addOutput(tempOutput, group)

    } catch (error) {

      spliceOutput(outputs.findIndex((output) => output._id === tempId))
      console.log(error)
    }
  }

  const onDeleteOutput = async (output, index) => {

    try {

      spliceOutput(index)
      await deleteOutput(output)

    } catch (error) {

      pushOutput(output)
      console.log(error)
    }
  }

  const sortedOutputs = useMemo(() => {

    const clientsOutputs = outputs.filter((output) => !output.branch)
    const branchesOutputs = outputs
      .filter((output) => output.branch)
      .sort((a, b) => a.branch.position - b.branch.position)

    return [...branchesOutputs, ...clientsOutputs]

  }, [outputs])

  useEffect(() => {

    if (!companyId || !date) return
    if (initialOutputs.length > 0) return

    const fetchOutputs = async () => {
      setLoading(true)
      setOutputs([])
      setTotalWeight(0.0)

      try {
        const response = await getOutputs({ companyId, date })
        setOutputs(response.outputs)
        calculateTotal(response.outputs)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchOutputs()

  }, [companyId, date, initialOutputs.length])


  return {
    outputs: sortedOutputs,
    totalWeight,
    totalAmount,
    onAddOutput,
    onDeleteOutput,
    loading : loading || addLoading || deleteLoading,
    error,
    pushOutput,
    spliceOutput
  }
}