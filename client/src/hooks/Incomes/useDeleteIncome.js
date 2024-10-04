import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { stringToCurrency } from "../../helpers/Functions"
import { deleteIncomeFetch } from "../../services/Incomes/deleteIncome"

export const useDeleteIncome = () => {

  const [loading, setLoading] = useState(false)

  const deleteIncome = ({ income, spliceIncome, index }) => {

    setLoading(true)

    spliceIncome({ index })
    ToastSuccess(`Se borró el efectivo de ${stringToCurrency({ amount: income.amount })}`)

    deleteIncomeFetch({ incomeId: income._id }).then(() => {


    }).catch((error) => {

      ToastDanger(`No se borró el efectivo de ${stringToCurrency({ amount: income.amount })}`)
      console.log(error)
    })

    setLoading(false)
  }

  return { deleteIncome, loading }
}