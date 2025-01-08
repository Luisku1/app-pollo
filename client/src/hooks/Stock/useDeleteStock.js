import { useState } from "react"
import { deleteStockFetch } from "../../services/Stock/deleteStock"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useDeleteStock = () => {

  const [loading, setLoading] = useState()

  const deleteStock = async (stock) => {

    setLoading(true)

    try {
      ToastSuccess(`Se eliminó el sobrante de ${stock.product.name ?? stock.product.label}`)

      await deleteStockFetch(stock._id)
    } catch (error) {
      ToastDanger(`No se eliminó el sobrante de ${stock.product.name ?? stock.product.label}`)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return { deleteStock, loading }
}