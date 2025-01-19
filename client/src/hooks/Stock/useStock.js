import { useEffect, useMemo, useState } from "react"
import { getStockFetch } from "../../services/Stock/getStock"
import { useDeleteStock } from "./useDeleteStock"
import { useAddStock } from "./useAddStock"
import { Types } from "mongoose"

export const useStock = ({ branchId, date, initialStock = null }) => {

  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(false)
  const { deleteStock } = useDeleteStock()
  const { addStock } = useAddStock()

  const initialize = (initialArray) => {
    setStock(initialArray);
  };

  const pushStock = (stock) => {
    setStock((prevStock) => {
      const newStock = [stock, ...prevStock];
      return newStock;
    });
  }

  const spliceStock = (index) => {
    setStock((prevStock) => {
      const newStock = [...prevStock];
      newStock.splice(index, 1);
      return newStock;
    });
  }

  const onAddStock = async (stock, modifyBalance) => {
    const tempId = new Types.ObjectId().toHexString();
    try {
      const tempStock = { ...stock, _id: tempId };

      modifyBalance(tempStock.amount, "add");
      pushStock(tempStock);
      await addStock(tempStock);
    } catch (error) {
      spliceStock(stock.findIndex((stock) => stock._id === tempId));
      console.log(error);
    }
  }

  const onDeleteStock = async (stock, index, modifyBalance) => {
    try {

      spliceStock(index);
      modifyBalance(stock.amount, "subtract");
      await deleteStock(stock);
    } catch (error) {
      pushStock(stock);
      console.log(error);
    }
  }

  useEffect(() => {

    if (!initialStock) return

    initialize(initialStock)

  }, [initialStock])

  useEffect(() => {

    if (!branchId || !date) return

    setLoading(true)

    const fetchStock = async () => {

      try {
        const response = await getStockFetch(branchId, date);
        setStock(response.stock);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchStock()

  }, [branchId, date])

  const { stockWeight, stockAmount } = useMemo(() => {

    const stockWeight = stock.reduce((acc, stock) => acc + stock.weight, 0)
    const stockAmount = stock.reduce((acc, stock) => acc + stock.amount, 0)

    return { stockWeight, stockAmount }

  }, [stock])

  const sortedStock = useMemo(() => stock.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), [stock])

  return {
    stock: sortedStock,
    stockAmount,
    stockWeight,
    pushStock,
    onAddStock,
    onDeleteStock,
    spliceStock,
    loading,
    initialize
  }
}