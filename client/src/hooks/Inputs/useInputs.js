import { useEffect, useState } from "react"
import { getInputs } from "../../services/Inputs/getInputs"
import { useDeleteInput } from "./useDeleteInput"
import { useAddInput } from "./useAddInput"
import { Types } from "mongoose"
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { recalculateBranchReport } from '../../../../common/recalculateReports';
import { optimisticUpdateReport, rollbackReport } from "../../helpers/optimisticReportUpdate"
import { addToArrayAndSum, removeFromArrayAndSum } from '../../helpers/reportActions';

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
    let prevBranchReports = null;
    try {
      const tempInput = { ...input, _id: tempId }
      pushInput(tempInput)
      // --- ACTUALIZACIÓN OPTIMISTA DEL BRANCHREPORT ---
      if (input.branch) {
        prevBranchReports = optimisticUpdateReport({
          queryClient,
          queryKey: ['branchReports', companyId, date],
          matchFn: (report, item) => report.branch._id === item.branch,
          updateFn: (report, item) => addToArrayAndSum(report, 'inputsArray', 'inputs', item),
          item: tempInput
        });
      }
      // --- FIN ACTUALIZACIÓN OPTIMISTA ---
      await addInput(tempInput, group)
    } catch (error) {
      spliceInput(inputs.findIndex((input) => input._id === tempId))
      // Rollback branchReports si corresponde
      if (input.branch && prevBranchReports) {
        rollbackReport({
          queryClient,
          queryKey: ['branchReports', companyId, date],
          prevReports: prevBranchReports
        });
      }
      console.log(error)
    }
  }

  const onDeleteInput = async (input) => {
    let prevBranchReports = null;
    let prevInputs = inputs;
    try {
      spliceInput(input.index)
      // --- ACTUALIZACIÓN OPTIMISTA DEL BRANCHREPORT ---
      if (input.branch) {
        prevBranchReports = optimisticUpdateReport({
          queryClient,
          queryKey: ['branchReports', companyId, date],
          matchFn: (report, item) => report.branch._id === item.branch,
          updateFn: (report, item) => removeFromArrayAndSum(report, 'inputsArray', 'inputs', item),
          item: input
        });
      }
      // --- FIN ACTUALIZACIÓN OPTIMISTA ---
      await deleteInput(input)
    } catch (error) {
      setInputs(prevInputs);
      // Rollback branchReports si corresponde
      if (input.branch && prevBranchReports) {
        rollbackReport({
          queryClient,
          queryKey: ['branchReports', companyId, date],
          prevReports: prevBranchReports
        });
      }
      console.log(error)
    }
  }

  const initialize = (initialArray) => {
    setInputs(initialArray);
  };

  // TanStack Query para fetchInputs
  const {
    data: queryInputs,
    isLoading: queryLoading,
    error: queryError
  } = useQuery({
    queryKey: ["inputs", companyId, date],
    queryFn: () => getInputs({ companyId, date }).then(res => res.inputs),
    enabled: !!companyId && !!date,
    staleTime: 1000 * 60 * 3
  });

  // Sincroniza con el estado local si cambia el resultado de la query
  useEffect(() => {
    if (queryInputs) {
      setInputs(queryInputs);
      calculateTotal(queryInputs);
    }
  }, [queryInputs]);

  useEffect(() => {
    if (initialInputs) {
      initialize(initialInputs);
      calculateTotal(initialInputs);
    }
  }, [initialInputs])

  return {
    inputs,
    totalWeight,
    totalAmount,
    onAddInput,
    onDeleteInput,
    loading: loading || queryLoading,
    pushInput,
    spliceInput,
    error: error || queryError,
    initialize
  }
}