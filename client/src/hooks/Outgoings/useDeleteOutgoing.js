import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { deleteOutgoingFetch } from "../../services/Outgoings/deleteOutgoing"

export const useDeleteOutgoing = () => {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteOutgoing = async (outgoing) => {
    setLoading(true)
    try {
      ToastSuccess(`Se eliminó el gasto de "${outgoing.concept}"`)
      await deleteOutgoingFetch(outgoing._id)
    } catch (error) {
      ToastDanger(`No se eliminó el gasto de "${outgoing.concept}"`)
      setError(error)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return { deleteOutgoing, loading, error }
}