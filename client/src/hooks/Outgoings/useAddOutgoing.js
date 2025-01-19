import { useState } from 'react'
import { addOutgoingFetch } from '../../services/Outgoings/addOutgoing'
import { ToastDanger, ToastSuccess } from '../../helpers/toastify'

export const useAddOutgoing = () => {

  const [error, setError] = useState(null)

  const addOutgoing = async (outgoing) => {
    try {
      ToastSuccess(`Se agregó el gasto de "${outgoing.concept}"`)
      await addOutgoingFetch(outgoing)
    } catch (error) {
      ToastDanger(`No se agregó el gasto de "${outgoing.concept}"`)
      setError(error)
    }
  }

  return { addOutgoing, error }

}