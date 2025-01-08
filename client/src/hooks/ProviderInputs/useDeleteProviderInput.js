import { useState } from "react"
import { deleteProviderInputFetch } from "../../services/ProvidersInputs/deleteProviderInput"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useDeleteProviderInput = () => {

  const [loading, setLoading] = useState(null)

  const deleteProviderInput = async (providerInput) => {

    setLoading(true)

    try {

      ToastSuccess(`Se borró la entrada de proveedor de ${providerInput.product?.name ?? providerInput.product?.label}`)

      await deleteProviderInputFetch(providerInput._id)

    } catch (error) {
      console.log(error)
      ToastDanger(`No se borró la entrada de proveedor de ${providerInput.product?.name ?? providerInput.product?.label}`)
    } finally {
      setLoading(false)
    }
  }

  return { deleteProviderInput, loading }
}