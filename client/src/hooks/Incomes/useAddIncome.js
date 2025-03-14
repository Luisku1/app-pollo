import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { addIncomeFetch } from "../../services/Incomes/addIncome"

export const useAddIncome = () => {

  const [loading, setLoading] = useState(false)

  const addIncome = async (income, group) => {

    setLoading(true)

    try {

      ToastSuccess(`Se registró el efectivo de ${income.amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}`)

      await addIncomeFetch({
          _id: income._id || null,
          amount: income.amount,
          company: income.company,
          branch: income.branch?._id || null,
          customer: income.customer?._id || null,
          employee: income.employee?._id || null,
          prevOwner: income.prevOwner?._id || null,
          partOfAPayment: income.partOfAPayment,
          type: income.type._id,
          createdAt: income.createdAt
        }, group
      )

    } catch (error) {
      ToastDanger(`No se registró el efectivo de ${income.amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}`)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return { addIncome, loading }
}