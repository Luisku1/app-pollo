/* eslint-disable react/prop-types */
import { useMemo, useState } from "react"
import Amount from "../Incomes/Amount"
import RowItem from "../RowItem"

export default function StockByBranch({ stock }) {
  const [selectedBranchId, setSelectedBranchId] = useState(null)
  const [branchStockIsOpen, setBranchStockIsOpen] = useState(false)

  const stockByBranch = (stock) => {
    const branchMap = stock.reduce((acc, stockItem) => {
      const branchId = stockItem.branch._id
      if (!acc[branchId]) {
        acc[branchId] = {
          branch: stockItem.branch,
          stockItems: [stockItem],
          pieces: stockItem.pieces,
          amount: stockItem.amount,
          weight: stockItem.weight,
          price: stockItem.price
        }
      } else {
        acc[branchId].stockItems.push(stockItem)
        acc[branchId].weight += stockItem.weight
        acc[branchId].amount += stockItem.amount
        acc[branchId].pieces += stockItem.pieces
        acc[branchId].price += stockItem.price
      }
      acc[branchId].stockItems.sort((a, b) => b.amount - a.amount)
      return acc
    }, {})
    return Object.values(branchMap)
  }

  const selectedBranch = (branchId) => {
    if (branchId !== selectedBranchId) {
      setSelectedBranchId(branchId)
      if (!branchStockIsOpen) {
        setBranchStockIsOpen((prev) => !prev)
      }
    } else {
      setBranchStockIsOpen((prev) => !prev)
      setSelectedBranchId(null)
    }
  }

  const stockByBranchArray = useMemo(() => {
    if (!stock) return []
    return stockByBranch(stock.flat() ?? [])
  }, [stock])

  const totalInMoney = useMemo(() => {
    if (!stockByBranchArray) return 0
    return stockByBranchArray.reduce((acc, stock) => acc + stock.amount, 0)
  }, [stockByBranchArray])

  return (
    <div className="grid grid-cols-1 max-w-lg items-center mx-auto">
      {stockByBranchArray && stockByBranchArray.length > 0 && stockByBranchArray.map((stock) => {
        return (
          <div key={stock.branch._id} className="rounded-lg mb-1">
            <button className="p-2 shadow-sm rounded-md w-full hover:bg-slate-100 active:bg-gray-300 border" onClick={() => { selectedBranch(stock.branch._id) }}>
              <RowItem>
                <p className="font-bold text-red-800 mb-1 text-left">{stock.branch.branch}</p>
                <p className="text-center">{stock.pieces} pz</p>
                <p>{`${stock.weight.toFixed(2)} Kg`}</p>
              {Amount({ amount: stock.amount, className: 'items-center text-red-800 font-semibold' })}
              </RowItem>
            </button>
            {stock.branch._id === selectedBranchId &&
              <div className="border-b border-red-800">
                {stock.stockItems.length > 0 && stock.stockItems.map((stockItem) => {
                  return (

                    <div key={stockItem._id} className={(branchStockIsOpen ? '' : 'hidden ') + 'border-red-800 border-l py-2'}>
                      <RowItem>
                        <p className="font-bold">{stockItem.product.name}</p>
                        <p className="text-center">{stockItem.pieces} pz</p>
                        {Amount({ amount: stockItem.price, className: 'items-center' })}
                        <p>{stockItem.weight.toFixed(2) + ' Kg'}</p>
                        {Amount({ amount: stockItem.amount, className: 'items-center' })}
                      </RowItem>
                    </div>
                  )
                })}
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
