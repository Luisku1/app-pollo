import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { deleteProviderMovementFetch } from "../../services/Providers/deleteProviderMovement"

export const useDeleteProviderMovement = () => {

  const [loading, setLoading] = useState(false)

  const deleteProviderMovement = async (purchase) => {

    setLoading(true)

    try {
      ToastSuccess(`Se borró la compra del proveedor ${purchase.provider?.name ?? purchase.provider?.label}`)

      await deleteProviderMovementFetch({ purchaseId: purchase._id })
    } catch (error) {
      ToastDanger(`No se encontró la compra del proveedor ${purchase.provider?.name || purchase.provider?.label}`)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return { deleteProviderMovement, loading }
}
