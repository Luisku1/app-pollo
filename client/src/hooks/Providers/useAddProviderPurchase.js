import { useState } from "react"
import { addProviderPurchaseFetch } from "../../services/Providers/addProviderPurchase"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

//hook para agregar una compra a un proveedor
const useAddProviderPurchase = () => {
  const [loading, setLoading] = useState(false)

  const addPurchase = async (purchaseData) => {
    setLoading(true)

    try {
      ToastSuccess('Compra del proveedor guardada exitosamente')
      await addProviderPurchaseFetch(purchaseData)
    } catch (error) {
      console.error(error)
      ToastDanger('Error al guardar la compra del proveedor')
    } finally {
      setLoading(false)
    }
  }

  return { addPurchase, loading }
}

export default useAddProviderPurchase