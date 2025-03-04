import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { currency } from "../../helpers/Functions"
import { deleteIncomeFetch } from "../../services/Incomes/deleteIncome"

export const useDeleteIncome = () => {

  const [loading, setLoading] = useState(false)

  const deleteIncome = async (income) => {

    setLoading(true)

    try {
      ToastSuccess(`Se borró el efectivo de ${currency({ amount: income.amount })}`)

      await deleteIncomeFetch(income._id)
    } catch (error) {
      ToastDanger(`No se borró el efectivo de ${currency({ amount: income.amount })}`)
      console.log(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { deleteIncome, loading }
}