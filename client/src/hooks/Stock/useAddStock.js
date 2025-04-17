import { useState } from "react"
import { ToastDanger } from "../../helpers/toastify"
import { addStockFetch } from "../../services/Stock/addStock"

export const useAddStock = () => {

  const [loading, setLoading] = useState(false)

  const addStock = async (stock) => {

    setLoading(true)

    try {
      await addStockFetch({
        _id: stock._id || null,
        pieces: stock.pieces,
        weight: stock.weight,
        amount: stock.amount,
        price: stock.price,
        midDay: stock.midDay,
        employee: stock.employee._id,
        product: stock.product._id,
        branch: stock.branch._id,
        createdAt: stock.createdAt,
        company: stock.company
      })
    } catch (error) {
      ToastDanger(`No se registró el sobrante de ${stock.product?.name ?? stock.product?.label}`)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return { addStock, loading }
}