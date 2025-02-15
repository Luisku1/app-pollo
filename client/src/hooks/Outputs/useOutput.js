import { useEffect, useMemo, useState } from "react"
import { getOutputs } from "../../services/Outputs/getOutputs"
import { useAddOutput } from "./useAddOutput"
import { useDeleteOutput } from "./useDeleteOutput"
import { Types } from "mongoose"

export const useOutput = ({ companyId = null, date = null, initialOutputs = null }) => {

  const [outputs, setOutputs] = useState([])
  const { addOutput, loading: addLoading } = useAddOutput()
  const { deleteOutput, loading: deleteLoading } = useDeleteOutput()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const initialize = (initialArray) => {
    setOutputs(initialArray);
  };

  const pushOutput = (output) => {

    setOutputs((prevOutputs) => [output, ...prevOutputs])
  }

  const spliceOutput = (index) => {
    setOutputs((prevOutputs) => {
      const newOutputs = prevOutputs.filter((_, i) => i !== index);
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

  const onDeleteOutput = async (output) => {

    try {

      spliceOutput(output.index)
      await deleteOutput(output)

    } catch (error) {

      pushOutput(output)
      console.log(error)
    }
  }

  useEffect(() => {
    if (!initialOutputs) return
    initialize(initialOutputs)
  }, [initialOutputs, outputs])

  useEffect(() => {

    if (!companyId || !date) return

    const fetchOutputs = async () => {
      setLoading(true)
      setOutputs([])

      try {
        const response = await getOutputs({ companyId, date })
        setOutputs(response.outputs)
      } catch (error) {
        setError(error)

      } finally {
        setLoading(false)
      }
    }

    fetchOutputs()

  }, [companyId, date])

  const { totalWeight, totalAmount } = useMemo(() => {

    const totalWeight = outputs.reduce((acc, output) => acc + output.weight, 0)
    const totalAmount = outputs.reduce((acc, output) => acc + output.amount, 0)

    return { totalWeight, totalAmount }

  }, [outputs])

  const sortedOutputs = useMemo(() => {

    const clientsOutputs = outputs.filter((output) => !output.branch)
    const branchesOutputs = outputs
      .filter((output) => output.branch)
      .sort((a, b) => a.branch.position - b.branch.position)

    return [...branchesOutputs, ...clientsOutputs]

  }, [outputs])

  return {
    outputs: sortedOutputs,
    totalWeight,
    totalAmount,
    onAddOutput,
    onDeleteOutput,
    loading: loading || addLoading || deleteLoading,
    error,
    pushOutput,
    spliceOutput,
    initialize
  }
}