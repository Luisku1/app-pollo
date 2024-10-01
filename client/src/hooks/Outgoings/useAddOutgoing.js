import { useState } from 'react'
import { addOutgoingFetch } from '../../services/Outgoings/addOutgoing'
import { ToastDanger, ToastSuccess } from '../../helpers/toastify'

export const useAddOutgoing = () => {

  const [error, setError] = useState(null)

  const addOutgoing = async ({ outgoing, pushOutgoing, spliceOutgoing, updateOutgoingId }) => {

    pushOutgoing({ outgoing })
    ToastSuccess(`Se agregó el gasto de "${outgoing.concept.toLowerCase()}"`)

    addOutgoingFetch({ outgoing }).then((response) => {

      updateOutgoingId(outgoing._id, response._id)

    }).catch((error) => {

      spliceOutgoing(0)
      ToastDanger(`No se agregó el gasto de "${outgoing.concept.toLowerCase()}"`)
      setError(error)
    })
  }

  return { addOutgoing, error }

}