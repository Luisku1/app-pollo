import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getIncomesFetch } from "../../services/Incomes/getIncomes";
import { useAddIncome } from "./useAddIncome";
import { useDeleteIncome } from "./useDeleteIncome";
import { Types } from "mongoose";
import { optimisticUpdateReport, rollbackReport } from "../../helpers/optimisticReportUpdate";
import { addToArrayAndSum, removeFromArrayAndSum } from '../../helpers/reportActions';
import { getId } from "../../helpers/Functions";


export const useIncomes = ({ companyId = null, date = null, initialIncomes = null }) => {
  const { addIncome, loading: addLoading } = useAddIncome();
  const { deleteIncome, loading: deleteLoading } = useDeleteIncome();
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

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
    if (incomesData) setIncomes(incomesData);
  }, [incomesData]);

  useEffect(() => {
    if (initialIncomes) setIncomes(initialIncomes);
  }, [initialIncomes]);

  const initialize = (initialArray) => {
    setIncomes(initialArray);
  };

  const pushIncome = (income) => {
    if (income?.length > 0)
      setIncomes((prevIncomes) => [...income, ...prevIncomes]);
    else
      setIncomes((prevIncomes) => [income, ...prevIncomes]);
  };

  const spliceIncome = (index) => {
    setIncomes((prevIncomes) => {
      const newIncomes = prevIncomes.filter((_, i) => i !== index);
      return newIncomes;
    });
  };

  const spliceIncomeById = (incomeId) => {
    if (incomeId.length > 0) {
      setIncomes((prevIncomes) => {
        const filteredIncomes = prevIncomes.filter((income) => !incomeId.includes(income._id));
        return filteredIncomes;
      });
    } else {
      setIncomes((prevIncomes) => {
        const filteredIncomes = prevIncomes.filter((income) => income._id !== incomeId);
        return filteredIncomes;
      });
    }
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

  const sortedIncomes = useMemo(() => {
    const branchesIncomes = incomes.filter((income) => income.branch).sort((a, b) => a.branch.position - b.branch.position);
    const clientsIncomes = incomes.filter((income) => !income.branch);
    return [...branchesIncomes, ...clientsIncomes];
  }, [incomes]);

  const payments = useMemo(() => incomes.filter((income) => income.partOfAPayment), [incomes]);
  const noPayments = useMemo(() => incomes.filter((income) => !income.partOfAPayment), [incomes]);
  const incomesTotal = useMemo(() => incomes.reduce((acc, income) => acc + income.amount, 0), [incomes])

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