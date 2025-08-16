import { useEffect, useMemo, useState } from "react"
import { getInputs } from "../../services/Inputs/getInputs"
import { useDeleteInput } from "./useDeleteInput"
import { useAddInput } from "./useAddInput"
import { Types } from "mongoose"
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { optimisticUpdateReport, rollbackReport } from "../../helpers/optimisticReportUpdate"
import { addToArrayAndSum, removeFromArrayAndSum } from '../../helpers/reportActions';
import { useSelector } from "react-redux"
import { useRoles } from "../../context/RolesContext"

export const useInputs = ({ companyId = null, date = null, initialInputs = null }) => {
  const [inputs, setInputs] = useState([])
  const { deleteInput } = useDeleteInput()
  const { addInput } = useAddInput()
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { currentUser } = useSelector(state => state.user)
  const { isManager } = useRoles()

  const pushInput = (input) => {
    setInputs((prevInputs) => {
      return [input, ...prevInputs]
    })
  }

  const spliceInput = (index) => {
    setInputs((prevInputs) => {
      const newInputs = prevInputs.filter((_, i) => i !== index);
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
    }
  }, [queryInputs]);

  useEffect(() => {
    if (initialInputs) {
      initialize(initialInputs);
    }
  }, [initialInputs])

  const { effectiveInputs, effectiveTotalWeight, effectiveTotalAmount } = useMemo(() => {
    let list = inputs
    if (!isManager(currentUser?.companyData?.[0]?.role)) {
      const uid = currentUser?._id
      list = inputs.filter(i => {
        const employeeId = i.employee?._id || i.employee
        const createdById = i.createdBy?._id || i.createdBy
        return employeeId === uid || createdById === uid
      })
    }
    return {
      effectiveInputs: list,
      effectiveTotalWeight: list.reduce((a, i) => a + (i.weight || 0), 0),
      effectiveTotalAmount: list.reduce((a, i) => a + (i.amount || 0), 0)
    }
  }, [inputs, currentUser, isManager])

  return {
    inputs: effectiveInputs,
    totalWeight: effectiveTotalWeight,
    totalAmount: effectiveTotalAmount,
    onAddInput,
    onDeleteInput,
    loading: loading || queryLoading,
    pushInput,
    spliceInput,
    error: error || queryError,
    initialize
  }
}