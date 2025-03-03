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

    <main className="p-3 max-w-lg mx-auto">

      <div className="bg-white p-3 mt-4 w-full">

        <div className="grid grid-cols-2 border w-full h-10 mb-4 border-black rounded-lg">
          <button className={"h-full rounded-lg hover:shadow-xl " + (isInitial ? 'bg-options-bar text-white' : 'bg-white')} onClick={() => { handleShowInitialStock() }}>Inicial</button>
          <button className={"h-full rounded-lg hover:shadow-xl " + (isFinal ? 'bg-options-bar text-white' : ' bg-white')} onClick={() => { handleShowFinalStock() }}>Final</button>
        </div>

        <div className="grid grid-cols-2 border w-full h-10 mb-4 border-black rounded-lg">
          <button className={"h-full rounded-lg hover:shadow-xl " + (filterByBranch ? 'bg-options-bar text-white' : 'bg-white')} onClick={() => { handleBranchFilterButton() }}>Sucursal</button>
          <button className={"h-full rounded-lg hover:shadow-xl " + (filterByProduct ? 'bg-options-bar text-white' : ' bg-white')} onClick={() => { handleProductFilterButton() }}>Producto</button>
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
