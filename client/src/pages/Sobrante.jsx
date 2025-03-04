/* eslint-disable react/prop-types */
import { useMemo, useState } from "react"
import StockByProduct from "../components/Stock/StockByProduct"
import StockByBranch from "../components/Stock/StockByBranch"

export default function Sobrante({ branchReports }) {

  const [filterByProduct, setFilterByProduct] = useState(false)
  const [filterByBranch, setFilterByBranch] = useState(true)
  const [isInitial, setIsInitial] = useState(true)
  const [isFinal, setIsFinal] = useState(false)

  const handleShowInitialStock = () => {

    setIsInitial(true)
    setIsFinal(false)
  }

  const handleShowFinalStock = () => {

    setIsInitial(false)
    setIsFinal(true)
  }

  const handleProductFilterButton = () => {

    setFilterByProduct(true)
    setFilterByBranch(false)
  }

  const handleBranchFilterButton = () => {

    setFilterByBranch(true)
    setFilterByProduct(false)
  }

  const initialStock = useMemo(() => {
    if (!branchReports) return
    return branchReports.map((branchReport) => {
      return branchReport.initialStockArray
    }).flat()
  }, [branchReports])

  const finalStock = useMemo(() => {
    if (!branchReports) return
    return branchReports.map((branchReport) => {
      return branchReport.finalStockArray
    }).flat()
  }, [branchReports])

  return (

    <main className="max-w-lg mx-auto">

      <div className="bg-white p-3 mt-4 w-full">

        <div className="grid grid-cols-3 border w-full mb-1 border-black rounded-lg">
          <button className={"h-full rounded-tl-lg rounded-bl-lg hover:shadow-xl " + (isInitial ? 'bg-options-bar text-white' : 'bg-gray-300')} onClick={() => { handleShowInitialStock() }}>Inicial</button>
          <button className={"h-full hover:shadow-xl " + (isFinal ? 'bg-options-bar text-white' : ' bg-gray-300 border-r border-black')} onClick={() => { handleShowFinalStock() }}>De Medio Día</button>
          <button className={"h-full rounded-tr-lg rounded-br-lg hover:shadow-xl " + (isFinal ? 'bg-options-bar text-white' : ' bg-gray-300')} onClick={() => { handleShowFinalStock() }}>Final</button>
        </div>

        <div className="grid grid-cols-2 border w-full mb-4 border-black rounded-lg">
          <button className={"h-full rounded-tl-lg rounded-bl-lg hover:shadow-xl " + (filterByBranch ? 'bg-options-bar text-white' : 'bg-gray-300')} onClick={() => { handleBranchFilterButton() }}>Sucursal</button>
          <button className={"h-full rounded-tr-lg rounded-br-lg hover:shadow-xl " + (filterByProduct ? 'bg-options-bar text-white' : ' bg-gray-300')} onClick={() => { handleProductFilterButton() }}>Producto</button>
        </div>

        {filterByProduct &&
          <StockByProduct stock={isInitial ? initialStock : finalStock} />
        }


        {filterByBranch &&
          <StockByBranch stock={isInitial ? initialStock : finalStock} />
        }

      </div>

    </main>
  )
}
