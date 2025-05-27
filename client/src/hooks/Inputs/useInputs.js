import { useEffect, useState } from "react"
import { getInputs } from "../../services/Inputs/getInputs"
import { useDeleteInput } from "./useDeleteInput"
import { useAddInput } from "./useAddInput"
import { Types } from "mongoose"
import { useQueryClient } from '@tanstack/react-query';

export const useInputs = ({ companyId = null, date = null, initialInputs = null }) => {

  const [inputs, setInputs] = useState([])
  const [totalWeight, setTotalWeight] = useState(0.0)
  const [totalAmount, setTotalAmount] = useState(0.0)
  const { deleteInput } = useDeleteInput()
  const { addInput } = useAddInput()
  const queryClient = useQueryClient();
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
      // --- ACTUALIZACIÓN OPTIMISTA DEL BRANCHREPORT ---
      if (input.branch) {
        queryClient.setQueryData(['branchReports', companyId, date], (oldReports) => {
          if (!oldReports) return oldReports;
          return oldReports.map(report => {
            if (report.branch._id === input.branch) {
              const newInputsArray = [tempInput, ...(report.inputsArray || [])];
              const newInputs = (report.inputs || 0) + input.amount;
              const updatedReport = {
                ...report,
                inputsArray: newInputsArray,
                inputs: newInputs,
              };
              return recalculateBranchReport(updatedReport);
            }
            return report;
          });
        });
      }
      // --- FIN ACTUALIZACIÓN OPTIMISTA ---
      await addInput(tempInput, group)

    } catch (error) {

      spliceInput(inputs.findIndex((input) => input._id === tempId))
      console.log(error)
    }
  }

  const onDeleteInput = async (input) => {

    try {

      spliceInput(input.index)
      await deleteInput(input)

    } catch (error) {

      pushInput(input)
      console.log(error)
    }
  }

  const initialize = (initialArray) => {
    setInputs(initialArray);
  };

  useEffect(() => {
    if (initialInputs) {
      initialize(initialInputs);
      calculateTotal(initialInputs);
    }
  }, [initialInputs])

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
        if (error.response && error.response.status === 404) {
          console.error("Inputs not found for the given date.");
        } else {
          setError(error);
        }
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
    error,
    initialize
  }
}