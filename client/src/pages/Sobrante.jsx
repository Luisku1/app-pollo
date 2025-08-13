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
        {/* Botones de selección de stock (inicial, medio día, final) */}
        <div className="flex w-full mb-2 gap-2">
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition-all border border-black ${isInitial ? 'bg-options-bar text-white shadow' : 'bg-gray-200 text-gray-800 hover:bg-options-bar hover:text-white'} ${isInitial ? '' : 'hover:shadow-lg'}`}
            onClick={handleShowInitialStock}
          >
            Inicial
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition-all border border-black ${isMidDay ? 'bg-options-bar text-white shadow' : 'bg-gray-200 text-gray-800 hover:bg-options-bar hover:text-white'} ${isMidDay ? '' : 'hover:shadow-lg'}`}
            onClick={handleShowMidDayStock}
          >
            De Medio Día
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition-all border border-black ${isFinal ? 'bg-options-bar text-white shadow' : 'bg-gray-200 text-gray-800 hover:bg-options-bar hover:text-white'} ${isFinal ? '' : 'hover:shadow-lg'}`}
            onClick={handleShowFinalStock}
          >
            Final
          </button>
        </div>
        {/* Botones de filtro por sucursal/producto (azul para diferenciarlos) */}
        <div className="flex w-full mb-4 gap-2">
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition-all border border-blue-400 ${filterByBranch ? 'bg-blue-600 text-white shadow' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'} ${filterByBranch ? '' : 'hover:shadow-lg'}`}
            onClick={handleBranchFilterButton}
          >
            Sucursal
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition-all border border-blue-400 ${filterByProduct ? 'bg-blue-600 text-white shadow' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'} ${filterByProduct ? '' : 'hover:shadow-lg'}`}
            onClick={handleProductFilterButton}
          >
            Producto
          </button>
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
