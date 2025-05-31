/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react"
import StockByProduct from "../components/Stock/StockByProduct"
import StockByBranch from "../components/Stock/StockByBranch"

export default function Sobrante({ branchReports, isInitial: isInitialParams = false }) {

  const [filterByProduct, setFilterByProduct] = useState(false)
  const [filterByBranch, setFilterByBranch] = useState(true)
  const [isInitial, setIsInitial] = useState(false)
  const [isFinal, setIsFinal] = useState(false)
  const [isMidDay, setIsMidDay] = useState(false)

  useEffect(() => {
    if (isInitialParams) {
      setIsInitial(true)
      setIsFinal(false)
      setIsMidDay(false)
    } else {
      setIsInitial(false)
      setIsFinal(true)
      setIsMidDay(false)
    }
  }, [])

  const handleShowInitialStock = () => {

    setIsMidDay(false)
    setIsInitial(true)
    setIsFinal(false)
  }

  const handleShowFinalStock = () => {

    setIsMidDay(false)
    setIsInitial(false)
    setIsFinal(true)
  }

  const handleShowMidDayStock = () => {

    setIsMidDay(true)
    setIsInitial(false)
    setIsFinal(false)
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
      return branchReport.initialStockArray ?? []
    }).flat()
  }, [branchReports])

  const midDayStock = useMemo(() => {
    if (!branchReports) return
    return branchReports.map((branchReport) => {
      return branchReport.midDayStockArray ?? []
    }).flat()
  }, [branchReports])

  const finalStock = useMemo(() => {
    if (!branchReports) return
    return branchReports.map((branchReport) => {
      return branchReport.finalStockArray ?? []
    }).flat()
  }, [branchReports])

  useEffect(() => {

    if (!(branchReports?.length > 0)) return

    if (!finalStock?.length > 0 && initialStock?.length > 0) {
      setIsInitial(true)
    }
    if (finalStock?.length > 0 && !isInitialParams) {
      setIsFinal(true)
    }

  }, [finalStock, initialStock])

  return (
    <main className="max-w-lg mx-auto">
      <div className="bg-white p-3 mt-4 w-full">
        <div className="grid grid-cols-3 border w-full mb-1 border-black rounded-lg">
          <button className={"h-full rounded-tl-lg rounded-bl-lg hover:shadow-xl text-md font-semibold " + (isInitial ? 'bg-options-bar text-white' : 'bg-gray-300')} onClick={() => { handleShowInitialStock() }}>Inicial</button>
          <button className={"h-full hover:shadow-xl " + (isMidDay ? 'bg-options-bar text-white' : ' bg-gray-300 border-x border-black')} onClick={() => { handleShowMidDayStock() }}>De Medio Día</button>
          <button className={"h-full rounded-tr-lg rounded-br-lg hover:shadow-xl text-md font-semibold " + (isFinal ? 'bg-options-bar text-white' : ' bg-gray-300')} onClick={() => { handleShowFinalStock() }}>Final</button>
        </div>
        <div className="grid grid-cols-2 border w-full mb-4 border-black rounded-lg">
          <button className={"h-full rounded-tl-lg rounded-bl-lg hover:shadow-xl text-md font-semibold " + (filterByBranch ? 'bg-options-bar text-white' : 'bg-gray-300')} onClick={() => { handleBranchFilterButton() }}>Sucursal</button>
          <button className={"h-full rounded-tr-lg rounded-br-lg hover:shadow-xl text-md font-semibold " + (filterByProduct ? 'bg-options-bar text-white' : ' bg-gray-300')} onClick={() => { handleProductFilterButton() }}>Producto</button>
        </div>
        {filterByProduct &&
          <StockByProduct stock={isInitial ? initialStock : isMidDay ? midDayStock : finalStock} />
        }
        {filterByBranch &&
          <StockByBranch stock={isInitial ? initialStock : isMidDay ? midDayStock : finalStock} />
        }
      </div>
    </main>
  )
}
