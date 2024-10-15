import { useEffect, useState } from "react"
import { getIncomesFetch } from "../../services/Incomes/getIncomes"

export const useIncomes = ({ companyId, date }) => {

  const [incomes, setIncomes] = useState([])
  const [incomesTotal, setIncomesTotal] = useState(0.0)
  const [loading, setLoading] = useState(false)

  const pushIncome = ({ income }) => {

    setIncomes((prevIncomes) => [income, ...prevIncomes])
    setIncomesTotal((prevTotal) => prevTotal + income.amount)
  }

  const spliceIncome = ({ index }) => {

    const removedIncome = incomes.splice(index, 1)
    setIncomesTotal((prevTotal) => prevTotal - removedIncome[0].amount)
  }

  const spliceIncomeById = ({incomeId, amount}) => {

    setIncomes((prevIncomes) => prevIncomes.map((income) =>

      income._id != incomeId
    ))

    setIncomesTotal((prevTotal) => prevTotal - amount)
  }

  const updateLastIncomeId = ({ incomeId }) => {

    setIncomes((prevIncomes) => prevIncomes.map((income, index) =>

      index == 0 ? { _id: incomeId, ...income } : income
    ))
  }

  useEffect(() => {

    if (!companyId || !date) return

    setLoading(true)

    setIncomes([])
    setIncomesTotal(0.0)

    getIncomesFetch({ companyId, date }).then((response) => {

      setIncomes(response.incomes)
      setIncomesTotal(response.total)

    }).catch((error) => {

      console.log(error)
    })

    setLoading(false)

  }, [companyId, date])

  return {
    incomes, incomesTotal, loading, pushIncome, spliceIncome, spliceIncomeById, updateLastIncomeId
  }
}