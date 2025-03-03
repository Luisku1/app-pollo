/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { currency } from "../../helpers/Functions";
import MoneyBag from "../Icons/MoneyBag";

export default function StockByProduct({ stock }) {
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [productStockIsOpen, setProductStockIsOpen] = useState(false)

  const stockByProduct = (stock) => {
    const productMap = stock.reduce((acc, stockItem) => {
      const productId = stockItem.product._id
      if (!acc[productId]) {
        acc[productId] = {
          product: stockItem.product,
          stockItems: [stockItem],
          weight: stockItem.weight,
          amount: stockItem.amount
        }
      } else {
        acc[productId].stockItems.push(stockItem)
        acc[productId].total += stockItem.weight
      }
      return acc
    }, {})
    return Object.values(productMap)
  }

  const selectedProduct = (productId) => {
    if (productId !== selectedProductId) {
      setSelectedProductId(productId)
      if (!productStockIsOpen) {
        setProductStockIsOpen((prev) => !prev)
      }
    } else {
      setProductStockIsOpen((prev) => !prev)
    }
  }

  const stockByProductArray = useMemo(() => {
    if (!stock) return []
    return stockByProduct(stock.flat() ?? [])
  }, [stock])

  const totalInMoney = useMemo(() => {
    if (!stockByProductArray) return 0
    return stockByProductArray.reduce((acc, stock) => acc + stock.total, 0)
  }, [stockByProductArray])

  return (
    <div className="grid grid-cols-1 max-w-lg items-center mx-auto">
      {stockByProductArray && stockByProductArray.length > 0 && stockByProductArray.map((stock) => {
        return (
          <div key={stock.product._id} className="rounded-lg">
            <button className="text-center p-2 shadow-lg w-full hover:bg-slate-100 active:bg-gray-300 border" onClick={() => { selectedProduct(stock.product._id) }}>
              <p className="font-bold text-red-800">{stock.product.name}</p>
              <div className="text-center">
                <p>{`${stock.weight.toFixed(2)} Kg`}</p>
                <p className="flex gap-2 items-center mx-auto"><MoneyBag />{`${currency({ amount: stock.amount })}`}</p>
              </div>
            </button>
            {stock.product._id === selectedProductId && stock.stockItems.length > 0 && stock.stockItems.map((stockItem) => (
              <div key={stockItem._id} className={(productStockIsOpen ? '' : 'hidden ') + 'border-l p-3 ml-2 grid grid-cols-3'}>
                <p className="font-bold">{stockItem.branch.branch}</p>
                <p className="text-center">{stockItem.pieces}</p>
                <p>{stockItem.weight.toFixed(2) + ' Kg'}</p>
              </div>
            ))}
          </div>
        )
      })}
      <div className='grid grid-span-1 grid-cols-2 max-w-lg mx-auto text-center w-full border border-opacity-30 shadow-lg border-black fixed bottom-0 left-0 rounded-lg p-2 bg-slate-500 text-white text-m'>
        <p className=' text-center'>Total:</p>
        <p className=' text-center'>{totalInMoney.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
      </div>
    </div>
  )
}
