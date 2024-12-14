import { useState } from "react"
import { deleteExtraOutgoingFetch } from "../../services/ExtraOutgoings/deleteExtraOutgoing"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { stringToCurrency } from "../../helpers/Functions"

export const useDeleteExtraOutgoing = () => {

  const [loading, setLoading] = useState(false)

  const deleteExtraOutgoing = ({ extraOutgoing, spliceExtraOutgoing, index }) => {

    setLoading(true)

    spliceExtraOutgoing({ index })
    ToastSuccess(`Se borró el gasto fuera de cuentas de ${stringToCurrency({ amount: extraOutgoing.amount })}`)

    deleteExtraOutgoingFetch({ extraOutgoingId: extraOutgoing._id }).catch((error) => {

      console.log(error)
      ToastDanger(`No se borró el gasto fuera de cuentas de ${stringToCurrency({ amount: extraOutgoing.amount })}`)

    })

    setLoading(false)
  }

  return { deleteExtraOutgoing, loading }
}