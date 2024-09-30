import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { addIncomeFetch } from "../../services/Incomes/addIncome"

export const useAddIncome = () => {

  const [loading, setLoading] = useState(false)

  const addIncome = ({ income, group, pushIncome, spliceIncome, updateLastIncomeId }) => {

    setLoading(true)

    pushIncome({ income })

    addIncomeFetch({
      income: {
        amount: income.amount,
        company: income.company,
        branch: income.branch?.value || null,
        customer: income.customer?.value || null,
        employee: income.employee._id,
        partOfAPayment: income.partOfAPayment,
        type: income.type.value,
        createdAt: income.createdAt

      }, group
    }).then((response) => {

      updateLastIncomeId({ incomeId: response._id })
      ToastSuccess(`Se registró el efectivo de ${income.amount.toLocaleString('es-Mx', {style: 'currency', currency: 'MXN'})}`)

    }).catch((error) => {

      spliceIncome({ index: 0 })
      ToastDanger(error.message)
    })

    setLoading(false)
  }

  return {addIncome, loading}
}