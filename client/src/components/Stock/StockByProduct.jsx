/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import Amount from "../Incomes/Amount";
import RowItem from "../RowItem";

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
          amount: stockItem.amount,
          pieces: stockItem.pieces,
          price: stockItem.price
        }
      } else {
        acc[productId].stockItems.push(stockItem)
        acc[productId].weight += stockItem.weight
        acc[productId].amount += stockItem.amount
        acc[productId].pieces += stockItem.pieces
        acc[productId].price += stockItem.price
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
      setSelectedProductId(null)
      setProductStockIsOpen((prev) => !prev)
    }
  }

  const stockByProductArray = useMemo(() => {
    if (!stock) return []
    return stockByProduct(stock.flat().sort((a, b) => b.amount - a.amount) ?? [])
  }, [stock])

  const totalInMoney = useMemo(() => {
    if (!stockByProductArray) return 0
    return stockByProductArray.reduce((acc, stock) => acc + stock.amount, 0)
  }, [stockByProductArray])

  return (
    <div className="grid grid-cols-1 max-w-lg items-center mx-auto">
      {stockByProductArray && stockByProductArray.length > 0 && stockByProductArray.map((stock) => {
        const averagePrice = stock.price / stock.stockItems.length
        return (
          <div key={stock.product._id} className="rounded-lg mb-1">
            <button className="p-2 shadow-sm rounded-md w-full hover:bg-slate-100 active:bg-gray-300 border" onClick={() => { selectedProduct(stock.product._id) }}>
              <RowItem>
                <p className="font-bold text-red-800 mb-1 text-left">{stock.product.name}</p>
                <p className="text-center">{stock.pieces} pz</p>
                {Amount({ amount: averagePrice, className: 'items-center' })}
                <p>{`${stock.weight.toFixed(2)} Kg`}</p>
                {Amount({ amount: stock.amount, className: 'items-center text-red-800 font-semibold' })}
              </RowItem>
            </button>
            {stock.product._id === selectedProductId &&
              <div className="border-b border-red-800">
                {stock.product._id === selectedProductId && stock.stockItems.length > 0 && stock.stockItems.map((stockItem) => (
                  <div key={stockItem._id} className={(productStockIsOpen ? '' : 'hidden ') + 'border-l border-red-800 py-2'}>
                    <RowItem>
                      <p className="font-bold">{stockItem.branch.branch}</p>
                      <p className="text-center">{stockItem.pieces} pz</p>
                      {Amount({ amount: stockItem.price, className: 'items-center' })}
                      <p>{stockItem.weight.toFixed(2) + ' Kg'}</p>
                      {Amount({ amount: stockItem.amount, className: 'items-center font-semibold' })}
                    </RowItem>
                  </div>
                ))}
              </div>
            }
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
