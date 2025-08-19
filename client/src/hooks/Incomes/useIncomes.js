import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getIncomesFetch } from "../../services/Incomes/getIncomes";
import { useAddIncome } from "./useAddIncome";
import { useDeleteIncome } from "./useDeleteIncome";
import { Types } from "mongoose";
import { optimisticUpdateReport, rollbackReport } from "../../helpers/optimisticReportUpdate";
import { addToArrayAndSum, removeFromArrayAndSum } from '../../helpers/reportActions';
import { getId } from "../../helpers/Functions";
import { formatDateYYYYMMDD } from "../../../../common/dateOps";
import { useRoles } from "../../context/RolesContext";
import { useSelector } from "react-redux";


export const useIncomes = ({ companyId = null, date = null, useToday, initialIncomes = null, isReport = false }) => {
  const { addIncome, loading: addLoading } = useAddIncome();
  const { deleteIncome, loading: deleteLoading } = useDeleteIncome();
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();
  const { currentUser } = useSelector(state => state.user)
  const { isManager } = useRoles();

  // React Query para obtener incomes
  const {
    data: incomesData,
    isLoading: loading,
    refetch: refetchIncomes
  } = useQuery({
    queryKey: ["incomes", companyId, date],
    queryFn: () => getIncomesFetch(companyId, date).then(res => res.incomes),
    enabled: !!companyId && !!date,
    staleTime: 1000 * 60 * 3
  });

  const [incomes, setIncomes] = useState([]);

  // Inicializa incomes desde React Query o initialIncomes
  useEffect(() => {
    if (!incomesData) {
      setIncomes([]);
      return;
    }
    if (incomesData.length >= 0) setIncomes(incomesData);
  }, [incomesData]);

  useEffect(() => {
    if (initialIncomes) setIncomes(initialIncomes);
  }, [initialIncomes]);

  const initialize = (initialArray) => {
    setIncomes(initialArray);
  };

  // Actualiza el caché de React Query directamente para evitar problemas de concurrencia
  const pushIncome = (income) => {

    const cacheDate = formatDateYYYYMMDD(new Date(income.createdAt));

    queryClient.setQueryData(["incomes", companyId, cacheDate], (prev = []) => {
      if (income?.length > 0) {
        return [...income, ...prev];
      } else {
        return [income, ...prev];
      }
    });
    if (!useToday) {
      setIncomes((prevIncomes) => {
        if (income?.length > 0) {
          return [...income, ...prevIncomes];
        } else {
          return [income, ...prevIncomes];
        }
      });
    }
  };

  const spliceIncome = (index) => {

    const cacheDate = formatDateYYYYMMDD(new Date(incomes[index].createdAt));
    // Actualiza el caché de React Query para eliminar el income eliminado
    queryClient.setQueryData(["incomes", companyId, cacheDate], (prev = []) => {
      if (prev.length === 1) {
        return [];
      }
      if (prev.length > 1) {
        return prev.filter((_, i) => i !== index);
      }
      return [];
    });


    if (!useToday) {

      setIncomes((prevIncomes) => {
        if (prevIncomes.length === 1) {
          return [];
        }
        if (prevIncomes.length > 1) {
          return prevIncomes.filter((_, i) => i !== index);
        }
        return [];
      });
    }
  };

  const spliceIncomeById = (incomeId) => {
    setIncomes((prevIncomes) => {
      let idsToRemove = Array.isArray(incomeId) ? incomeId : [incomeId];
      // Actualiza el caché de React Query para cada income eliminado
      idsToRemove.forEach(id => {
        const incomeToRemove = prevIncomes.find((income) => income._id === id);
        if (incomeToRemove) {
          const cacheDate = formatDateYYYYMMDD(new Date(incomeToRemove.createdAt));
          queryClient.setQueryData(["incomes", companyId, cacheDate], (prev = []) => prev.filter((income) => income._id !== id));
        }
      });
      return prevIncomes.filter((income) => !idsToRemove.includes(income._id));
    });
  };

  const updateLastIncomeId = (incomeId) => {
    setIncomes((prevIncomes) =>
      prevIncomes.map((income, index) =>
        index === 0 ? { ...income, _id: incomeId } : income
      )
    );
  };

  const onAddIncome = async (income, prevOwnerIncome, group) => {
    const tempId = new Types.ObjectId().toHexString();
    const tempPrevOwnerIncome = prevOwnerIncome ? { ...prevOwnerIncome, _id: new Types.ObjectId().toHexString() } : null;
    const tempIncome = { ...income, _id: tempId, prevOwnerIncome: tempPrevOwnerIncome?._id ?? null };
    // Guardar snapshots para posible rollback
    let prevBranchReports = null;
    let prevSupervisorsReports = null;
    try {
      if (prevOwnerIncome)
        pushIncome([tempIncome, tempPrevOwnerIncome]);
      else
        pushIncome(tempIncome);

      // --- ACTUALIZACIÓN OPTIMISTA DEL BRANCHREPORT ---
      if (income.branch) {
        prevBranchReports = optimisticUpdateReport({
          queryClient,
          queryKey: ['branchReports', companyId, date],
          matchFn: (report, item) => report.branch._id === item.branch._id,
          updateFn: (report, item) => addToArrayAndSum(report, 'incomesArray', 'incomes', item),
          item: tempIncome
        });
      }
      // --- ACTUALIZACIÓN OPTIMISTA DEL SUPERVISORREPORT (usa .employee y tipo de income) ---
      if (income.employee) {
        prevSupervisorsReports = optimisticUpdateReport({
          queryClient,
          queryKey: ['supervisorsReportInfo', companyId, date],
          matchFn: (report, item) => getId(report.supervisor) && getId(report.supervisor) === getId(item.employee),
          updateFn: (report, item) => {
            // Determinar el tipo de income
            let newReport = { ...report };
            const typeName = (item.type && item.type.name) ? item.type.name : null;
            if (typeName === 'Efectivo') {
              newReport.cashArray = [item, ...(report.cashArray || [])];
              newReport.cash = (report.cash || 0) + item.amount;
            } else if (typeName === 'Depósito') {
              newReport.depositsArray = [item, ...(report.depositsArray || [])];
              newReport.deposits = (report.deposits || 0) + item.amount;
            } else if (typeName === 'Terminal') {
              newReport.terminalIncomesArray = [item, ...(report.terminalIncomesArray || [])];
              newReport.terminalIncomes = (report.terminalIncomes || 0) + item.amount;
            }
            return newReport;
          },
          item: tempIncome
        });
      }


      await addIncome(tempIncome, tempPrevOwnerIncome, group);

    } catch (error) {

      spliceIncome(incomes.findIndex((income) => income._id === tempId));
      if (prevOwnerIncome)
        spliceIncomeById([tempPrevOwnerIncome._id, tempIncome._id]);
      else
        spliceIncomeById(tempIncome._id)
      // Rollback branchReports si corresponde
      if (income.branch && prevBranchReports) {
        rollbackReport({
          queryClient,
          queryKey: ['branchReports', companyId, date],
          prevReports: prevBranchReports
        });
      }
      // Rollback supervisorsReportInfo si corresponde
      if (income.employee && prevSupervisorsReports) {
        rollbackReport({
          queryClient,
          queryKey: ['supervisorsReportInfo', companyId, date],
          prevReports: prevSupervisorsReports
        });
      }
      setError(error);
      throw new Error(error);
    }
  };

  const onDeleteIncome = async (income) => {
    let prevBranchReports = null;
    let prevSupervisorsReports = null;
    let prevIncomes = incomes;
    try {
      if (income?.prevOwnerIncome)
        spliceIncomeById([income.prevOwnerIncome, income._id]);
      else
        spliceIncome(income.index);
      // --- ACTUALIZACIÓN OPTIMISTA DEL BRANCHREPORT ---
      if (income.branch) {
        prevBranchReports = optimisticUpdateReport({
          queryClient,
          queryKey: ['branchReports', companyId, date],
          matchFn: (report, item) => report.branch._id === item.branch._id,
          updateFn: (report, item) => removeFromArrayAndSum(report, 'incomesArray', 'incomes', item),
          item: income
        });
      }
      // --- ACTUALIZACIÓN OPTIMISTA DEL SUPERVISORREPORT (usa .employee y tipo de income) ---
      if (income.employee) {
        prevSupervisorsReports = optimisticUpdateReport({
          queryClient,
          queryKey: ['supervisorsReportInfo', companyId, date],
          matchFn: (report, item) => getId(report.supervisor) && getId(report.supervisor) === getId(item.employee),
          updateFn: (report, item) => {
            let newReport = { ...report };
            const typeName = (item.type && item.type.name) ? item.type.name : null;
            if (typeName === 'Efectivo') {
              newReport.cashArray = (report.cashArray || []).filter(i => i._id !== item._id);
              newReport.cash = (report.cash || 0) - item.amount;
            } else if (typeName === 'Depósito') {
              newReport.depositsArray = (report.depositsArray || []).filter(i => i._id !== item._id);
              newReport.deposits = (report.deposits || 0) - item.amount;
            } else if (typeName === 'Terminal') {
              newReport.terminalIncomesArray = (report.terminalIncomesArray || []).filter(i => i._id !== item._id);
              newReport.terminalIncomes = (report.terminalIncomes || 0) - item.amount;
            }
            return newReport;
          },
          item: income
        });
      }
      // --- FIN ACTUALIZACIÓN OPTIMISTA ---
      await deleteIncome(income);
    } catch (error) {
      setIncomes(prevIncomes);
      // Rollback branchReports si corresponde
      if (income.branch && prevBranchReports) {
        rollbackReport({
          queryClient,
          queryKey: ['branchReports', companyId, date],
          prevReports: prevBranchReports
        });
      }
      // Rollback supervisorsReportInfo si corresponde
      if (income.employee && prevSupervisorsReports) {
        rollbackReport({
          queryClient,
          queryKey: ['supervisorsReportInfo', companyId, date],
          prevReports: prevSupervisorsReports
        });
      }
      setError(error);
      throw new Error(error);
    }
  };

  const { effectiveIncomes, incomesTotal } = useMemo(() => {

    const effectiveIncomes = (isManager(currentUser?.companyData?.[0].role) || isReport) ? incomes : incomes.filter(income => income.employee._id === currentUser._id);
    const incomesTotal = effectiveIncomes.reduce((sum, income) => sum + (income.amount || 0), 0);

    return { effectiveIncomes, incomesTotal };

  }, [incomes])

  const sortedIncomes = useMemo(() => {
    const branchesIncomes = effectiveIncomes.filter((income) => income.branch).sort((a, b) => a.branch.position - b.branch.position);
    const clientsIncomes = effectiveIncomes.filter((income) => !income.branch);
    return [...branchesIncomes, ...clientsIncomes];
  }, [effectiveIncomes]);

  const payments = useMemo(() => sortedIncomes.filter((income) => income.partOfAPayment), [sortedIncomes]);
  const noPayments = useMemo(() => sortedIncomes.filter((income) => !income.partOfAPayment), [sortedIncomes]);

  return {
    incomes: sortedIncomes,
    incomesTotal,
    payments,
    noPayments,
    onAddIncome,
    onDeleteIncome,
    loading: loading || addLoading || deleteLoading,
    error,
    pushIncome,
    spliceIncome,
    spliceIncomeById,
    updateLastIncomeId,
    initialize,
    refetchIncomes
  };
};