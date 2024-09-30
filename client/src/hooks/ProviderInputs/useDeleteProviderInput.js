import { useState } from "react"
import { deleteProviderInputFetch } from "../../services/ProvidersInputs/deleteProviderInput"
import { ToastDanger } from "../../helpers/toastify"

export const useDeleteProviderInput = () => {

  const [loading, setLoading] = useState(null)

  const deleteProviderInput = ({ providerInput, spliceProviderInput, pushProviderInput }) => {

    setLoading(true)

    spliceProviderInput({ providerInputId: providerInput._id })

    deleteProviderInputFetch({ providerInputId: providerInput._id }).catch((error) => {

      pushProviderInput({ providerInput })
      ToastDanger(error.message)
    })

    setLoading(false)

  }

  return { deleteProviderInput, loading }
}