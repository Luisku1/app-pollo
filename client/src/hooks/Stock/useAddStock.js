import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { addStockFetch } from "../../services/Stock/addStock"

export const useAddStock = () => {

  const [loading, setLoading] = useState(false)

  const addStock = async (stock) => {

    setLoading(true)

    ToastSuccess(`Se registró el sobrante de ${stock.product?.name ?? stock.product?.label}`)

    try {
      await addStockFetch({
        _id: stock._id || null,
        pieces: stock.pieces,
        weight: stock.weight,
        amount: stock.amount,
        price: stock.price,
        employee: stock.employee._id,
        product: stock.product.value,
        branch: stock.branch.value,
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