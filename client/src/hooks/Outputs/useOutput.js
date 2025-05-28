import { useEffect, useMemo, useState } from "react"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAddOutput } from "./useAddOutput"
import { useDeleteOutput } from "./useDeleteOutput"
import { Types } from "mongoose"
import { recalculateBranchReport } from '../../../../common/recalculateReports';
import { optimisticUpdateReport, rollbackReport } from "../../helpers/optimisticReportUpdate";
import { addToArrayAndSum, removeFromArrayAndSum } from '../../helpers/reportActions';

export const useOutput = ({ companyId = null, date = null, initialOutputs = null }) => {
  const [outputs, setOutputs] = useState(initialOutputs || []);
  const { addOutput, loading: addLoading } = useAddOutput();
  const { deleteOutput, loading: deleteLoading } = useDeleteOutput();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  // Mutación para eliminar output (optimista)
  const deleteMutation = useMutation({
    mutationFn: (output) => deleteOutput(output),
    onMutate: (output) => {
      if (initialOutputs !== null) {
        setOutputs((prev) => prev.filter((o) => o._id !== output._id));
      }
    },
    onError: (err, output, context) => {
      // Revertir si hay error
      if (initialOutputs !== null) {
        setOutputs((prev) => [output, ...prev]);
      }
      setError(err);
    },
    // No se hace nada en onSuccess ni onSettled
  });

  // Mutación para agregar output (opcional, solo si se usa el estado local)
  const onAddOutput = async (output, group) => {
    const tempId = new Types.ObjectId().toHexString();
    let prevBranchReports = null;
    try {
      const tempOutput = { ...output, _id: tempId };
      if (initialOutputs !== null) setOutputs((prev) => [tempOutput, ...prev]);
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
      await addOutput(tempOutput, group);
    } catch (error) {
      if (initialOutputs !== null) setOutputs((prev) => prev.filter((o) => o._id !== tempId));
      // Rollback branchReports si corresponde
      if (output.branch && prevBranchReports) {
        rollbackReport({
          queryClient,
          queryKey: ['branchReports', companyId, date],
          prevReports: prevBranchReports
        });
      }
      setError(error);
    }
  };

  // Mutación para eliminar output (optimista y con rollback)
  const onDeleteOutput = async (output) => {
    let prevBranchReports = null;
    let prevOutputs = outputs;
    try {
      if (initialOutputs !== null) setOutputs((prev) => prev.filter((o) => o._id !== output._id));
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
      await deleteOutput(output);
    } catch (error) {
      if (initialOutputs !== null) setOutputs(prevOutputs);
      // Rollback branchReports si corresponde
      if (output.branch && prevBranchReports) {
        rollbackReport({
          queryClient,
          queryKey: ['branchReports', companyId, date],
          prevReports: prevBranchReports
        });
      }
      setError(error);
    }
  };

  // Sincroniza outputs solo si initialOutputs está definido
  useEffect(() => {
    if (initialOutputs !== null) setOutputs(initialOutputs);
  }, [initialOutputs]);

  // Si initialOutputs es null, outputs no se expone ni se sincroniza

  const { totalWeight, totalAmount } = useMemo(() => {
    const arr = initialOutputs !== null ? outputs : [];
    const totalWeight = arr.reduce((acc, output) => acc + (output.weight || 0), 0);
    const totalAmount = arr.reduce((acc, output) => acc + (output.amount || 0), 0);
    return { totalWeight, totalAmount };
  }, [outputs, initialOutputs]);

  return {
    ...(initialOutputs !== null ? { outputs, totalWeight, totalAmount } : { totalWeight, totalAmount }),
    onAddOutput,
    onDeleteOutput,
    loading: loading || addLoading || deleteLoading || deleteMutation.isLoading,
    error: error || deleteMutation.error
  };
}