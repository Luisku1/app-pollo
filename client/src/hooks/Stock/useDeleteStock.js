import { useState } from "react"
import { deleteStockFetch } from "../../services/Stock/deleteStock"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"

export const useDeleteStock = () => {

  const [loading, setLoading] = useState()

  const deleteStock = ({ stock, spliceStock, index }) => {

    setLoading(true)

    spliceStock({ index })
    ToastSuccess(`Se eliminó el sobrante de ${stock.product.name ?? stock.product.label}`)

    deleteStockFetch({ stockId: stock._id }).catch((error) => {

      ToastDanger(`No se eliminó el sobrante de ${stock.product.name ?? stock.product.label}`)
      console.log(error)
    })

    setLoading(false)
  }

  return { deleteStock, loading }
}