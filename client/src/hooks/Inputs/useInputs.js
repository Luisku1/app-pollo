import { useEffect, useState } from "react"
import { getInputs } from "../../services/Inputs/getInputs"
import { useDeleteInput } from "./useDeleteInput"
import { useAddInput } from "./useAddInput"
import { Types } from "mongoose"

export const useInputs = ({ companyId = null, date = null, initialInputs = [] }) => {

  const [inputs, setInputs] = useState(initialInputs)
  const [totalWeight, setTotalWeight] = useState(
    initialInputs.reduce((acc, input) => acc + input.weight, 0)
  )
  const [totalAmount, setTotalAmount] = useState(
    initialInputs.reduce((acc, input) => acc + input.amount, 0)
  )
  const { deleteInput } = useDeleteInput()
  const { addInput } = useAddInput()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const calculateTotal = (inputsList) => {
    setTotalWeight(inputsList.reduce((acc, input) => acc + input.weight, 0))
    setTotalAmount(inputsList.reduce((acc, input) => acc + input.amount, 0))
  }

  const pushInput = (input) => {
    setInputs((prevInputs) => {
      calculateTotal([input, ...prevInputs])
      return [input, ...prevInputs]
    })
    setTotalWeight((prevTotal) => prevTotal + input.weight)
  }

  const spliceInput = (index) => {
    setInputs((prevInputs) => {
      const newInputs = prevInputs.filter((_, i) => i !== index);
      calculateTotal(newInputs)
      return newInputs;
    });
  };

  const onAddInput = async (input, group) => {

    const tempId = new Types.ObjectId().toHexString()

    try {

      const tempInput = { ...input, _id: tempId }

      pushInput(tempInput)
      await addInput(tempInput, group)

    } catch (error) {

      spliceInput(inputs.findIndex((input) => input._id === tempId))
      console.log(error)
    }
  }

  const onDeleteInput = async (input, index) => {

    try {

      spliceInput(index)
      await deleteInput(input)

    } catch (error) {

      pushInput(input)
      console.log(error)
    }
  }

  useEffect(() => {
    if (!companyId || !date) return;

    const fetchInputs = async () => {
      setLoading(true);
      setInputs([]);
      setTotalWeight(0.0);

      try {
        const response = await getInputs({ companyId, date });
        setInputs(response.inputs);
        calculateTotal(response.inputs);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInputs();

  }, [companyId, date]);

  return {

    inputs,
    totalWeight,
    totalAmount,
    onAddInput,
    onDeleteInput,
    loading,
    pushInput,
    spliceInput,
    error
  }
}