import { useState } from "react"
import { deleteProviderInputFetch } from "../../services/ProvidersInputs/deleteProviderInput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useDeleteProviderInput = () => {

  const [loading, setLoading] = useState(null)

  const deleteProviderInput = ({ providerInput, spliceProviderInput, pushProviderInput, index }) => {

    setLoading(true)

    spliceProviderInput({ index })

    ToastSuccess(`Se borró la entrada de proveedor de ${providerInput.product?.name ?? providerInput.product?.label}`)

    deleteProviderInputFetch({ providerInputId: providerInput._id }).catch((error) => {

      console.log(error)
      pushProviderInput({ providerInput })
      ToastDanger(`No se borró la entrada de proveedor de ${providerInput.product?.name ?? providerInput.product?.label}`)
    })

    setLoading(false)

  }

  return { deleteProviderInput, loading }
}