import { useEffect, useMemo, useState } from "react"
import { getStockFetch } from "../../services/Stock/getStock"
import { useDeleteStock } from "./useDeleteStock"
import { useAddStock } from "./useAddStock"
import { Types } from "mongoose"

export const useStock = ({ branchId, date, initialStock = [] }) => {

  const [stock, setStock] = useState(initialStock)
  const [totalStock, setTotalStock] = useState(
    initialStock.reduce((acc, item) => acc + item.amount, 0)
  )
  const [loading, setLoading] = useState(false)
  const { deleteStock } = useDeleteStock()
  const { addStock } = useAddStock()

  const pushStock = (stock) => {

    setStock((prevStock) => [stock, ...prevStock])
    setTotalStock((prevTotal) => prevTotal + stock.amount)
  }

  const spliceStock = (index) => {

    const removedStock = stock.splice(index, 1)
    setTotalStock((prevTotal) => prevTotal - removedStock[0].amount)
  }

  const onAddStock = async (stock) => {

    const tempId = new Types.ObjectId().toHexString()

    try {

      const tempStock = { ...stock, _id: tempId }

      pushStock(tempStock)
      await addStock(tempStock)

    } catch (error) {

      spliceStock(stock.findIndex((stock) => stock._id === tempId))
      console.log(error)
    }
  }

  const onDeleteStock = async (stock, index) => {

    try {

      spliceStock(index)
      await deleteStock(stock)

    } catch (error) {

      pushStock(stock)
      console.log(error)
    }
  }

  const sortedStock = useMemo(() => stock.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), [stock])

  useEffect(() => {

    if (initialStock.length > 0) return
    if (!branchId || !date) return

    setLoading(true)
    setStock([])
    setTotalStock(0.0)

    const fetchStock = async () => {

      try {
        const response = await getStockFetch(branchId, date);
        setStock(response.stock);
        setTotalStock(response.totalStock);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchStock()

  }, [branchId, date, initialStock])

  return {
    stock: sortedStock,
    totalStock,
    pushStock,
    onAddStock,
    onDeleteStock,
    spliceStock,
    loading
  }
}