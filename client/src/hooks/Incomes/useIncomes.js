import { useEffect, useState, useMemo } from "react";
import { getIncomesFetch } from "../../services/Incomes/getIncomes";
import { useAddIncome } from "./useAddIncome";
import { useDeleteIncome } from "./useDeleteIncome";
import { Types } from "mongoose";

export const useIncomes = ({ companyId, date }) => {
  const [incomes, setIncomes] = useState([]);
  const [incomesTotal, setIncomesTotal] = useState(0);
  const { addIncome, loading: addLoading } = useAddIncome();
  const { deleteIncome, loading: deleteLoading } = useDeleteIncome();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pushIncome = (income) => {
    setIncomes((prevIncomes) => [income, ...prevIncomes]);
    setIncomesTotal((prevTotal) => prevTotal + income.amount);
  };

  const spliceIncome = (index) => {
    setIncomes((prevIncomes) => {
      const removedIncome = prevIncomes[index];
      const newIncomes = prevIncomes.filter((_, i) => i !== index);
      setIncomesTotal((prevTotal) => prevTotal - removedIncome.amount);
      return newIncomes;
    });
  };

  const spliceIncomeById = (incomeId) => {
    setIncomes((prevIncomes) => {
      const filteredIncomes = prevIncomes.filter((income) => income._id !== incomeId);
      setIncomesTotal(filteredIncomes.reduce((acc, income) => acc + income.amount, 0));
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

  const onDeleteIncome = async (income, index) => {
    try {
      spliceIncome(index);
      await deleteIncome(income);
    } catch (error) {
      pushIncome(income);
      console.log(error);
    }
  };

  const sortedIncomes = useMemo(() => {
    const clientsIncomes = incomes.filter((income) => !income.branch);
    const branchesIncomes = incomes
      .filter((income) => income.branch)
      .sort((a, b) => a.branch.position - b.branch.position);

    return [...branchesIncomes, ...clientsIncomes];
  }, [incomes]);

  useEffect(() => {
    if (!companyId || !date) return;

    const fetchIncomes = async () => {
      setLoading(true);
      setIncomes([]);
      setIncomesTotal(0);

      try {
        const response = await getIncomesFetch(companyId, date);
        setIncomes(response.incomes);
        setIncomesTotal(response.total);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomes();
  }, [companyId, date]);

  return {
    incomes: sortedIncomes,
    incomesTotal,
    onAddIncome,
    onDeleteIncome,
    loading: loading || addLoading || deleteLoading,
    error,
    pushIncome,
    spliceIncome,
    spliceIncomeById,
    updateLastIncomeId,
  };
};