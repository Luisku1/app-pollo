import { useState } from "react"
import { ToastDanger, ToastSuccess } from "../../helpers/toastify"
import { addStockFetch } from "../../services/Stock/addStock"

export const useAddStock = () => {

  const [loading, setLoading] = useState(false)

  const addStock = ({ stock, pushStock, spliceStock, updateLastStockId }) => {

    setLoading(true)

    pushStock({ stock })
    ToastSuccess(`Se registró el sobrante de ${stock.product?.name ?? stock.product?.label}`)

    addStockFetch({
      stock: {
        pieces: stock.pieces,
        weight: stock.weight,
        amount: stock.amount,
        price: stock.price,
        employee: stock.employee.value,
        product: stock.product.value,
        branch: stock.branch.value,
        createdAt: stock.createdAt,
        company: stock.company
      }
    }).then((response) => {

      updateLastStockId({ stockId: response.stock._id })

    }).catch((error) => {

      spliceStock({ index: 0 })
      ToastDanger(`No se registró el sobrante de ${stock.product?.name ?? stock.product?.label}`)
      console.log(error)
    })

    setLoading(false)
  }

  return {addStock, loading}
}