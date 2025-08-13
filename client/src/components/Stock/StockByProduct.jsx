/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import Amount from "../Incomes/Amount";
import RowItem from "../RowItem";
import Modal from "../Modals/Modal";
import StockList from "./StockList";

export default function StockByProduct({ stock }) {

  const [stockToShow, setStockToShow] = useState([])

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

  const stockByProductArray = useMemo(() => {
    if (!stock) return []
    return stockByProduct(stock.flat().sort((a, b) => b.amount - a.amount) ?? [])
  }, [stock])

  const totalInMoney = useMemo(() => {
    if (!stockByProductArray) return 0
    return stockByProductArray.reduce((acc, stock) => acc + stock.amount, 0)
  }, [stockByProductArray])

  return (
    <div>
      <Modal
        isShown={stockToShow && stockToShow.length > 0}
        closeModal={() => { setStockToShow([]) }}
        title={`Concentrados de ${stockToShow?.[0]?.product.name}`}
        content={<StockList showBranch={true} stock={stockToShow} />}
      />
      <div className="grid grid-cols-1 max-w-lg items-center mx-auto">
        {stockByProductArray && stockByProductArray.length > 0 && stockByProductArray.map((stock) => {
          const averagePrice = stock.price / stock.stockItems.length
          return (
            <div key={stock.product._id} className="rounded-lg mb-1">
              <button className="p-2 shadow-sm rounded-md w-full hover:bg-slate-100 active:bg-gray-300 border" onClick={() => { setStockToShow(stock.stockItems) }}>
                <p className="font-bold text-blue-700 mb-1 text-left">{stock.product.name}</p>
                <RowItem>
                  <p className="text-center">{stock.pieces} pz</p>
                  {Amount({ amount: averagePrice, className: 'items-center' })}
                  <p>{`${stock.weight.toFixed(2)} Kg`}</p>
                  {Amount({ amount: stock.amount, className: 'items-center text-red-800 font-semibold' })}
                </RowItem>
              </button>
            </div>
          )
        })}
        <div className='grid grid-span-1 grid-cols-2 max-w-lg mx-auto text-center w-full border border-opacity-30 shadow-lg border-black fixed bottom-0 left-0 rounded-lg p-2 bg-slate-500 text-white text-m'>
          <p className=' text-center'>Total:</p>
          <p className=' text-center'>{totalInMoney.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
        </div>
      </div>
    </div>
  )
}
