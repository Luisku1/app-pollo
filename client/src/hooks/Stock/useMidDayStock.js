import { Types } from "mongoose";
import { useEffect, useMemo, useState } from "react"
import { useAddStock } from "./useAddStock";
import { useDeleteStock } from "./useDeleteStock";

export const useMidDayStock = ({ initialArray = null }) => {

  const [midDayStock, setMidDayStock] = useState([])
  const { deleteStock } = useDeleteStock()
  const { addStock } = useAddStock()

  const initialize = (array) => {
    setMidDayStock(array);
  };


  const pushStock = (stock) => {
    setMidDayStock((prevStock) => {
      const newStock = [stock, ...prevStock];
      return newStock;
    });
  }

  const spliceStock = (index) => {
    setMidDayStock((prevStock) => {
      const newStock = [...prevStock];
      newStock.splice(index, 1);
      return newStock;
    });
  }

  const onAddStock = async (stock) => {
    const tempId = new Types.ObjectId().toHexString();
    try {
      const tempStock = { ...stock, _id: tempId };
      pushStock(tempStock);
      await addStock(tempStock);
    } catch (error) {
      spliceStock(stock.findIndex((stock) => stock._id === tempId));
      console.log(error);
    }
  }

  const onDeleteStock = async (stock) => {
    try {
      spliceStock(stock.index);
      await deleteStock(stock);
    } catch (error) {
      pushStock(stock);
      console.log(error);
    }
  }

  useEffect(() => {
    if (initialArray) {
      initialize(initialArray)
    }
  }, [initialArray])

  const { midDayStockWeight, midDayStockAmount } = useMemo(() => {
    return {
      midDayStockWeight: midDayStock.reduce((acc, item) => acc + item.weight, 0),
      midDayStockAmount: midDayStock.reduce((acc, item) => acc + item.amount, 0)
    }
  }, [midDayStock])

  return {
    midDayStock,
    midDayStockWeight,
    onDeleteStock,
    onAddStock,
    midDayStockAmount,
    initialize
  }
}
