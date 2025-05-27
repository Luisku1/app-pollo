import { useEffect, useState, useMemo } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getIncomesFetch } from "../../services/Incomes/getIncomes";
import { useAddIncome } from "./useAddIncome";
import { useDeleteIncome } from "./useDeleteIncome";
import { Types } from "mongoose";
import { recalculateBranchReport } from "../../../../common/recalculateReports";


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
    try {
      if (prevOwnerIncome)
        pushIncome([tempIncome, tempPrevOwnerIncome]);
      else
        pushIncome(tempIncome);

      // --- ACTUALIZACIÓN OPTIMISTA DEL BRANCHREPORT ---
      if (income.branch) {
        queryClient.setQueryData(['branchReports', companyId, date], (oldReports) => {
          if (!oldReports) return oldReports;
          return oldReports.map(report => {
            if (report.branch._id === income.branch) {
              const newIncomesArray = [tempIncome, ...(report.incomesArray || [])];
              const newIncomes = (report.incomes || 0) + income.amount;
              const updatedReport = {
                ...report,
                incomesArray: newIncomesArray,
                incomes: newIncomes,
              };
              return recalculateBranchReport(updatedReport);
            }
            return report;
          });
        });
      }
      // --- ACTUALIZACIÓN OPTIMISTA DEL SUPERVISORREPORT ---
      if (income.supervisor) {
        queryClient.setQueryData(['supervisorsReportInfo', companyId, date], (oldReports) => {
          if (!oldReports) return oldReports;
          return oldReports.map(report => {
            if (report.supervisor && report.supervisor._id === income.supervisor) {
              const newCashArray = [tempIncome, ...(report.cashArray || [])];
              const newCash = (report.cash || 0) + income.amount;
              return {
                ...report,
                cashArray: newCashArray,
                cash: newCash,
              };
            }
            return report;
          });
        });
      }
      // --- FIN ACTUALIZACIÓN OPTIMISTA ---

      await addIncome(tempIncome, tempPrevOwnerIncome, group);
    } catch (error) {
      spliceIncome(incomes.findIndex((income) => income._id === tempId));
      if (prevOwnerIncome)
        spliceIncomeById([tempPrevOwnerIncome._id, tempIncome._id]);
      else
        spliceIncomeById(tempIncome._id)
      setError(error);
      throw new Error(error);
    }
  };

  const onDeleteIncome = async (income) => {
    try {
      if (income?.prevOwnerIncome)
        spliceIncomeById([income.prevOwnerIncome, income._id]);
      else
        spliceIncome(income.index);
      await deleteIncome(income);
    } catch (error) {
      pushIncome(income);
      if (income.prevOwnerIncome)
        pushIncome({ ...income, _id: income.prevOwnerIncome, owner: income.employee, amount: -income.amount, employee: income.prevOwner });
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