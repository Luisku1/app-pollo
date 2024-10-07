import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { deleteOutgoingFetch } from "../../services/Outgoings/deleteOutgoing"

export const useDeleteOutgoing = () => {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteOutgoing = ({ outgoing, spliceOutgoing, pushOutgoing, index }) => {

    setLoading(true)

    spliceOutgoing({ index })
    ToastSuccess(`Se eliminó el gasto de "${outgoing.concept}"`)

    deleteOutgoingFetch({ outgoingId: outgoing._id }).catch((error) => {

      pushOutgoing({ outgoing })
      ToastDanger(`No se eliminó el gasto de "${outgoing.concept}"`)
      setError(error)
      console.log(error)
    })

    setLoading(false)

  }

  return { deleteOutgoing, loading, error }
}