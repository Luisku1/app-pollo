import { useEffect, useState, useMemo } from "react";
import { getIncomesFetch } from "../../services/Incomes/getIncomes";
import { useAddIncome } from "./useAddIncome";
import { useDeleteIncome } from "./useDeleteIncome";
import { Types } from "mongoose";

export const useIncomes = ({ companyId = null, date = null, initialIncomes = null }) => {
  const [incomes, setIncomes] = useState([]);
  const { addIncome, loading: addLoading } = useAddIncome();
  const { deleteIncome, loading: deleteLoading } = useDeleteIncome();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      await addIncome(tempIncome, tempPrevOwnerIncome, group);
    } catch (error) {
      spliceIncome(incomes.findIndex((income) => income._id === tempId));
      if (prevOwnerIncome)
        spliceIncome(incomes.findIndex((income) => income._id === tempPrevOwnerIncome._id));
      console.log(error);
    }
  };

  const onDeleteIncome = async (income) => {
    try {
      console.log(income, income.prevOwnerIncome)
      if (income?.prevOwnerIncome)
        spliceIncomeById([income.prevOwnerIncome, income._id]);
      else
        spliceIncome(income.index);
      await deleteIncome(income);
    } catch (error) {
      pushIncome(income);
      if (income.prevOwnerIncome)
        pushIncome({ ...income, _id: income.prevOwnerIncome, owner: income.employee, amount: -income.amount, employee: income.prevOwner });
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