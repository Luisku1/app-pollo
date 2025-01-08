import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { deleteProviderPurchaseFetch } from "../../services/Providers/deleteProviderPurchase"

export const useDeleteProviderPurchase = () => {

  const [loading, setLoading] = useState(false)

  const deleteProviderPurchase = async (purchase) => {

    setLoading(true)

    try {
      ToastSuccess(`Se borró la compra del proveedor ${purchase.provider?.name ?? purchase.provider?.label}`)

      await deleteProviderPurchaseFetch({ purchaseId: purchase._id })
    } catch (error) {
      ToastDanger(`No se encontró la compra del proveedor ${purchase.provider?.name || purchase.provider?.label}`)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return { deleteProviderPurchase, loading }
}
