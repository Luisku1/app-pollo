import { useEffect, useState } from "react"
import { getStockFetch } from "../../services/Stock/getStock"

export const useStock = ({ branchId, date }) => {

  const [stock, setStock] = useState([])
  const [totalStock, setTotalStock] = useState(0.0)
  const [loading, setLoading] = useState(false)

  const pushStock = ({ stock }) => {

    setStock((prevStock) => [stock, ...prevStock])
    setTotalStock((prevTotal) => prevTotal + stock.amount)
  }

  const spliceStock = ({ index }) => {

    const removedStock = stock.splice(index, 1)
    setTotalStock((prevTotal) => prevTotal - removedStock[0].amount)
  }

  const updateLastStockId = ({ stockId }) => {

    setStock((prevStock) => prevStock.map((stock, index) =>

      index == 0 ? { _id: stockId, ...stock } : stock
    ))
  }

  useEffect(() => {

    if (!branchId || !date) return

    setLoading(true)
    setStock([])
    setTotalStock(0.0)

    getStockFetch({ branchId, date }).then((response) => {

      setStock(response.stock)
      setTotalStock(response.totalStock)

    }).catch((error) => {

      console.log(error)
    })

    setLoading(false)
  }, [branchId, date])

  return { stock, totalStock, pushStock, spliceStock, updateLastStockId, loading }
}