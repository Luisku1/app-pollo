import { useEffect, useState, useMemo } from "react";
import { getIncomesFetch } from "../../services/Incomes/getIncomes";
import { useAddIncome } from "./useAddIncome";
import { useDeleteIncome } from "./useDeleteIncome";
import { Types } from "mongoose";

export const useIncomes = ({ companyId = null, date = null, initialIncomes = null}) => {
  const [incomes, setIncomes] = useState([]);
  const { addIncome, loading: addLoading } = useAddIncome();
  const { deleteIncome, loading: deleteLoading } = useDeleteIncome();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialize = (initialArray) => {
    setIncomes(initialArray);
  };

  const pushIncome = (income) => {
    setIncomes((prevIncomes) => [income, ...prevIncomes]);
  };

  const spliceIncome = (index) => {
    setIncomes((prevIncomes) => {
      const newIncomes = prevIncomes.filter((_, i) => i !== index);
      return newIncomes;
    });
  };

  const spliceIncomeById = (incomeId) => {
    setIncomes((prevIncomes) => {
      const filteredIncomes = prevIncomes.filter((income) => income._id !== incomeId);
      return filteredIncomes;
    });
  };

  const updateLastIncomeId = (incomeId) => {
    setIncomes((prevIncomes) =>
      prevIncomes.map((income, index) =>
        index === 0 ? { ...income, _id: incomeId } : income
      )
    );
  };

  const onAddIncome = async (income, group) => {
    const tempId = new Types.ObjectId().toHexString();

    try {
      const tempIncome = { ...income, _id: tempId };
      pushIncome(tempIncome);
      await addIncome(tempIncome, group);
    } catch (error) {
      spliceIncome(incomes.findIndex((income) => income._id === tempId));
      console.log(error);
    }
  };

  const onDeleteIncome = async (income) => {
    try {
      spliceIncome(income.index);
      await deleteIncome(income);
    } catch (error) {
      pushIncome(income);
      console.log(error);
    }
  };

  useEffect(() => {

    if (!initialIncomes) return;
    setIncomes(initialIncomes);

  }, [initialIncomes, incomes])

  useEffect(() => {

    if (!companyId || !date) return;

    const fetchIncomes = async () => {
      setLoading(true);
      setIncomes([]);

      try {
        const response = await getIncomesFetch(companyId, date);
        setIncomes(response.incomes);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomes();
  }, [companyId, date]);


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
    initialize
  };
};