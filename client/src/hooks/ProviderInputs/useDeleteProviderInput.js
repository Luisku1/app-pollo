import { useState } from "react"
import { deleteProviderInputFetch } from "../../services/ProvidersInputs/deleteProviderInput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useDeleteProviderInput = () => {

  const [loading, setLoading] = useState(null)

  const deleteProviderInput = ({ providerInput, spliceProviderInput, pushProviderInput, index }) => {

    setLoading(true)

    spliceProviderInput({ index })

    ToastSuccess('La entrada de proveedor fue borrada')

    deleteProviderInputFetch({ providerInputId: providerInput._id }).catch((error) => {

      pushProviderInput({ providerInput })
      ToastDanger(error.message)
    })

    setLoading(false)

  }

  return { deleteProviderInput, loading }
}