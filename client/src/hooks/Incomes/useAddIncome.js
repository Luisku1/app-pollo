import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { addIncomeFetch } from "../../services/Incomes/addIncome"

export const useAddIncome = () => {

  const [loading, setLoading] = useState(false)

  const addIncome = ({ income, group, pushIncome, spliceIncome, updateLastIncomeId }) => {

    setLoading(true)

    pushIncome(income)
    ToastSuccess(`Se registró el efectivo de ${income.amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}`)

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

      updateLastIncomeId(response._id)

    }).catch((error) => {

      spliceIncome(0)
      ToastDanger(`No se registró el efectivo de ${income.amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}`)
      console.log(error)
    })

    setLoading(false)
  }

  return { addIncome, loading }
}