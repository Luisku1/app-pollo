import { useEffect, useState } from "react"
import { getIncomesFetch } from "../../services/Incomes/getIncomes"

export const useIncomes = ({ companyId = null, date = null, initialIncomes = [] }) => {
  const [incomes, setIncomes] = useState(initialIncomes)
  const [incomesTotal, setIncomesTotal] = useState(
    initialIncomes.reduce((acc, income) => acc + income.amount, 0)
  )
  const [loading, setLoading] = useState(false)

  // Función para calcular el total
  const calculateTotal = (incomesList) =>
    incomesList.reduce((acc, income) => acc + income.amount, 0)

  // Agregar un nuevo ingreso
  const pushIncome = (income) => {
    setIncomes((prevIncomes) => [income, ...prevIncomes])
    setIncomesTotal((prevTotal) => prevTotal + income.amount)
  }

  // Eliminar ingreso por índice
  const spliceIncome = (index) => {
    setIncomes((prevIncomes) => {
      const newIncomes = [...prevIncomes];
      const [removedIncome] = newIncomes.splice(index, 1)
      setIncomesTotal((prevTotal) => prevTotal - removedIncome.amount)
      return newIncomes;
    })
  }

  // Eliminar ingreso por ID
  const spliceIncomeById = (incomeId) => {
    setIncomes((prevIncomes) => {
      const filteredIncomes = prevIncomes.filter((income) => income._id !== incomeId)
      setIncomesTotal(calculateTotal(filteredIncomes))
      return filteredIncomes
    })
  }

  // Actualizar el último ingreso con un ID
  const updateLastIncomeId = (incomeId) => {
    setIncomes((prevIncomes) =>
      prevIncomes.map((income, index) =>
        index === 0 ? { ...income, _id: incomeId } : income
      )
    )
  }

  // Efecto para obtener ingresos
  useEffect(() => {
    if (!companyId || !date) return;

    const fetchIncomes = async () => {
      setLoading(true)
      try {
        const response = await getIncomesFetch({ companyId, date })
        setIncomes(response.incomes)
        setIncomesTotal(response.total)
      } catch (error) {
        console.error('Error fetching incomes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIncomes()
  }, [companyId, date])

  return {
    incomes,
    incomesTotal,
    loading,
    pushIncome,
    spliceIncome,
    spliceIncomeById,
    updateLastIncomeId,
  }
}