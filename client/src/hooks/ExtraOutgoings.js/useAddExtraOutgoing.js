import { useState } from "react"
import { addExtraOutgoingFetch } from "../../services/ExtraOutgoings/addExtraOutgoing"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { stringToCurrency } from "../../helpers/Functions"

export const useAddExtraOutgoing = () => {

  const [loading, setLoading] = useState(false)

  const addExtraOutgoing = ({extraOutgoing, pushExtraOutgoing, updateLastExtraOutgoingId}) => {

    setLoading(true)

    pushExtraOutgoing({extraOutgoing})

    ToastSuccess(`Se registró el gasto de ${stringToCurrency({amount: extraOutgoing.amount})} `)

    addExtraOutgoingFetch({extraOutgoing: {

      amount: extraOutgoing.amount,
      concept: extraOutgoing.concept,
      employee: extraOutgoing.employee._id,
      company: extraOutgoing.company,
      createdAt: extraOutgoing.createdAt

    }}).then((response) => {

      updateLastExtraOutgoingId({extraOutgoingId: response.extraOutgoing._id})

    }).catch((error) => {

      ToastDanger(`No se registró el gasto de ${stringToCurrency({amount: extraOutgoing.amount})} `)
      console.log(error)
    })

    setLoading(false)
  }

  return {addExtraOutgoing, loading}
}