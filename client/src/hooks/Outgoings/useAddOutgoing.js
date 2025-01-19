import { useState } from 'react'
import { addOutgoingFetch } from '../../services/Outgoings/addOutgoing'
import { ToastDanger, ToastSuccess } from '../../helpers/toastify'

export const useAddOutgoing = () => {

  const [error, setError] = useState(null)

  const addOutgoing = async (outgoing) => {
    try {
      ToastSuccess(`Se agregó el gasto de "${outgoing.concept}"`)
      await addOutgoingFetch(
        {
          _id: outgoing._id || null,
          company: outgoing.company,
          employee: outgoing?.employee?._id ? outgoing.employee._id : outgoing.employee,
          concept: outgoing.concept,
          amount: outgoing.amount,
          date: outgoing.date,
          branch: outgoing?.branch?._id ? outgoing.branch._id : outgoing.branch,
          createdAt: outgoing.createdAt
        }
      )
    } catch (error) {
      ToastDanger(`No se agregó el gasto de "${outgoing.concept}"`)
      setError(error)
    }
  }

  return { addOutgoing, error }

}