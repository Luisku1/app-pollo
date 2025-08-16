import { useEffect, useMemo, useState } from "react"
import { getOutputs } from "../../services/Outputs/getOutputs"
import { useAddOutput } from "./useAddOutput"
import { useDeleteOutput } from "./useDeleteOutput"
import { Types } from "mongoose"
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { optimisticUpdateReport, rollbackReport } from "../../helpers/optimisticReportUpdate";
import { addToArrayAndSum, removeFromArrayAndSum } from '../../helpers/reportActions';
import { useSelector } from "react-redux"
import { useRoles } from "../../context/RolesContext"

export const useOutput = ({ companyId = null, date = null, initialOutputs = null }) => {
  const [outputs, setOutputs] = useState([])
  const { deleteOutput } = useDeleteOutput()
  const { addOutput } = useAddOutput()
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { currentUser } = useSelector(state => state.user)
  const { isManager } = useRoles()

  const pushOutput = (output) => {
    setOutputs((prevOutputs) => {
      return [output, ...prevOutputs]
    })
  }

  const spliceOutput = (index) => {
    setOutputs((prevOutputs) => {
      const newOutputs = prevOutputs.filter((_, i) => i !== index);
      return newOutputs;
    });
  };

  const onAddOutput = async (output, group) => {
    const tempId = new Types.ObjectId().toHexString()
    let prevBranchReports = null;
    try {
      const tempOutput = { ...output, _id: tempId }
      pushOutput(tempOutput)
      // --- ACTUALIZACIÓN OPTIMISTA DEL BRANCHREPORT ---
      if (output.branch) {
        prevBranchReports = optimisticUpdateReport({
          queryClient,
          queryKey: ['branchReports', companyId, date],
          matchFn: (report, item) => report.branch._id === item.branch,
          updateFn: (report, item) => addToArrayAndSum(report, 'outputsArray', 'outputs', item),
          item: tempOutput
        });
      }
      // --- FIN ACTUALIZACIÓN OPTIMISTA ---
      await addOutput(tempOutput, group)
    } catch (error) {
      spliceOutput(outputs.findIndex((output) => output._id === tempId))
      // Rollback branchReports si corresponde
      if (output.branch && prevBranchReports) {
        rollbackReport({
          queryClient,
          queryKey: ['branchReports', companyId, date],
          prevReports: prevBranchReports
        });
      }
      setError(error)
    }
  }

  const onDeleteOutput = async (output) => {
    let prevBranchReports = null;
    let prevOutputs = outputs;
    try {
      spliceOutput(output.index)
      // --- ACTUALIZACIÓN OPTIMISTA DEL BRANCHREPORT ---
      if (output.branch) {
        prevBranchReports = optimisticUpdateReport({
          queryClient,
          queryKey: ['branchReports', companyId, date],
          matchFn: (report, item) => report.branch._id === item.branch,
          updateFn: (report, item) => removeFromArrayAndSum(report, 'outputsArray', 'outputs', item),
          item: output
        });
      }
      // --- FIN ACTUALIZACIÓN OPTIMISTA ---
      await deleteOutput(output)
    } catch (error) {
      setOutputs(prevOutputs);
      // Rollback branchReports si corresponde
      if (output.branch && prevBranchReports) {
        rollbackReport({
          queryClient,
          queryKey: ['branchReports', companyId, date],
          prevReports: prevBranchReports
        });
      }
      setError(error)
    }
  }

  const initialize = (initialArray) => {
    setOutputs(initialArray);
  };

  // TanStack Query para fetchOutputs
  const {
    data: queryOutputs,
    isLoading: queryLoading,
    error: queryError
  } = useQuery({
    queryKey: ["outputs", companyId, date],
    queryFn: () => getOutputs({ companyId, date }).then(res => res.outputs),
    enabled: !!companyId && !!date,
    staleTime: 1000 * 60 * 3
  });

  // Sincroniza con el estado local si cambia el resultado de la query
  useEffect(() => {
    if (queryOutputs) {
      setOutputs(queryOutputs);
    }
  }, [queryOutputs]);

  useEffect(() => {
    if (initialOutputs) {
      initialize(initialOutputs);
    }
  }, [initialOutputs])

  const { effectiveOutputs, totalWeight, totalAmount } = useMemo(() => {
    let list = outputs
    if (!isManager(currentUser?.companyData?.[0]?.role)) {
      const uid = currentUser?._id
      list = outputs.filter(o => {
        const employeeId = o.employee?._id || o.employee
        const createdById = o.createdBy?._id || o.createdBy
        return employeeId === uid || createdById === uid
      })
    }
    return {
      effectiveOutputs: list,
      totalWeight: list.reduce((a, o) => a + (o.weight || 0), 0),
      totalAmount: list.reduce((a, o) => a + (o.amount || 0), 0)
    }
  }, [outputs, currentUser, isManager])

  return {
    outputs: effectiveOutputs,
    totalWeight,
    totalAmount,
    onAddOutput,
    onDeleteOutput,
    loading: loading || queryLoading,
    pushOutput,
    spliceOutput,
    error: error || queryError,
    initialize
  }
}