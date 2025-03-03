/* eslint-disable react/prop-types */
import { useMemo, useState } from "react"

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
          total: stockItem.weight
        }
      } else {
        acc[branchId].stockItems.push(stockItem)
        acc[branchId].total += stockItem.weight
      }
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
    }
  }

  const stockByBranchArray = useMemo(() => {
    if (!stock) return []
    return stockByBranch(stock.flat() ?? [])
  }, [stock])

  const totalInMoney = useMemo(() => {
    if (!stockByBranchArray) return 0
    return stockByBranchArray.reduce((acc, stock) => acc + stock.total, 0)
  }, [stockByBranchArray])

  return (
    <div className="grid grid-cols-1 max-w-lg items-center mx-auto">
      {stockByBranchArray && stockByBranchArray.length > 0 && stockByBranchArray.map((stock) => (
        <div key={stock.branch._id} className="rounded-lg">
          <button className="text-center p-2 shadow-lg w-full hover:bg-slate-100 active:bg-gray-300 border" onClick={() => { selectedBranch(stock.branch._id) }}>
            <p className="font-bold text-red-800">{stock.branch.branch}</p>
            <p>{stock.total.toFixed(2) + ' Kg'}</p>
          </button>
          {stock.branch._id === selectedBranchId && stock.stockItems.length > 0 && stock.stockItems.map((stockItem) => (
            <div key={stockItem._id} className={(branchStockIsOpen ? '' : 'hidden ') + 'border-l p-3 ml-2 grid grid-cols-3'}>
              <p className="font-bold">{stockItem.product.name}</p>
              <p className="text-center">{stockItem.pieces}</p>
              <p>{stockItem.weight.toFixed(2) + ' Kg'}</p>
            </div>
          ))}
        </div>
      ))}
      <div className='grid grid-span-1 grid-cols-2 max-w-lg mx-auto text-center w-full border border-opacity-30 shadow-lg border-black fixed bottom-0 left-0 rounded-lg p-2 bg-slate-500 text-white text-m'>
        <p className=' text-center'>Total:</p>
        <p className=' text-center'>{totalInMoney.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
      </div>
    </div>
  )
}
