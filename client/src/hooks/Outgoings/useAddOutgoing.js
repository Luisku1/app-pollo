import { useState } from 'react'
import { addOutgoingFetch } from '../../services/Outgoings/addOutgoing'
import { ToastSuccess } from '../../helpers/toastify'

export const useAddOutgoing = () => {

  const [error, setError] = useState(null)

  const addOutgoing = async ({ outgoing, pushOutgoing, spliceOutgoing, updateOutgoingId }) => {

    pushOutgoing({ outgoing })

    addOutgoingFetch({ outgoing }).then((response) => {

      updateOutgoingId(outgoing._id, response._id)
      ToastSuccess(`Se agregó el gasto "${outgoing.concept}"`)

    }).catch((error) => {

      spliceOutgoing(0)
      setError(error)
    })
  }

  return { addOutgoing, error }

}