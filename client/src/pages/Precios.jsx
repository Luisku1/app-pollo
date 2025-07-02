import { useEffect, useState, useMemo } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { currency } from "../helpers/Functions"
import { ToastSuccess, ToastDanger, ToastContainerComponent } from "../helpers/toastify"
import { useBranch } from "../hooks/Branches/useBranch"
import "../assets/super-xl.css"

export default function Precios() {

  const { company } = useSelector((state) => state.user)
  const [prices, setPrices] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState({})
  const [successMessage, setSuccessMessage] = useState({})
  const [pricesFormData, setPricesFormData] = useState({})
  const [residualFormData, setResidualFormData] = useState({})
  const [showResidual, setShowResidual] = useState({})
  const { onUpdateResidualUse } = useBranch()
  const [buttonDisabled, setButtonDisabled] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [applyChanges, setApplyChanges] = useState({});

  // Maneja cambios para precios normales y residuales
  const handleInputsChange = (e, productId, branchId, isResidual = false) => {
    const key = `${productId}${branchId}`

    if (!e.target.value || isNaN(e.target.value) || e.target.value < 0) {

      if (e.target.value === '') {
        if (isResidual) {
          setResidualFormData(prev => {
            const newData = { ...prev }
            if (newData[branchId]) {
              delete newData[branchId][key]
            }
            if (Object.keys(newData[branchId] || {}).length === 0) {
              delete newData[branchId]
            }
            return newData
          })
        } else {
          setPricesFormData(prev => {
            const newData = { ...prev }
            if (newData[branchId]) {
              delete newData[branchId][key]
            }
            if (Object.keys(newData[branchId] || {}).length === 0) {
              delete newData[branchId]
            }
            return newData
          })
        }
        return
      }
    }

    if (isResidual) {
      setResidualFormData(prev => ({
        ...prev,
        [branchId]: {
          ...prev[branchId],
          [key]: {
            product: productId,
            branch: branchId,
            price: e.target.value,
            residual: true
          }
        }
      }))
    } else {
      setPricesFormData(prev => ({
        ...prev,
        [branchId]: {
          ...prev[branchId],
          [key]: {
            product: productId,
            branch: branchId,
            price: e.target.value,
            residual: false
          }
        }
      }))
    }
    setButtonDisabled(prev => ({
      ...prev,
      [branchId]: false
    }))
  }

  const submitBranchPrices = async (branchId) => {
    const normal = pricesFormData[branchId] || {}
    const residual = residualFormData[branchId] || {}
    let payload = showResidual[branchId] ? residual : normal
    if (Object.keys(payload).length === 0) return
    if (applyChanges[branchId]) {
      payload = { ...payload, applyChanges: true }
    }
    setLoading(prev => ({ ...prev, [branchId]: true }))
    setError(null)
    setSuccessMessage(prev => ({ ...prev, [branchId]: null }))
    try {
      const res = await fetch('/api/product/price/new-prices/' + company._id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success === false) {
        ToastDanger(data.message || 'Error al guardar precios')
        setError(data.message || 'Error al guardar precios')
        setLoading(prev => ({ ...prev, [branchId]: false }))
        return
      }
      ToastSuccess('Precios actualizados')
      setSuccessMessage(prev => ({ ...prev, [branchId]: 'Precios actualizados' }))
      setPricesFormData(prev => ({ ...prev, [branchId]: {} }))
      setResidualFormData(prev => ({ ...prev, [branchId]: {} }))
      setButtonDisabled(prev => ({ ...prev, [branchId]: true }))
      setLoading(prev => ({ ...prev, [branchId]: false }))
    } catch (error) {
      ToastDanger(error.message)
      setError(error.message)
      setLoading(prev => ({ ...prev, [branchId]: false }))
    }
  }

  useEffect(() => {

    const fetchBranchPrices = async () => {

      try {

        const res = await fetch('/api/product/price/get-products-price/' + company._id)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          return
        }

        setPrices(data.data)
        setError(null)

      } catch (error) {

        setError(error.message)
      }

    }

    fetchBranchPrices()

  }, [company._id])

  const handleUpdateResidualsUse = async (branchId) => {
    try {

      setPrices(prev => prev.map(item => {
        if (item._id.branchId === branchId) {
          setShowResidual(prev => ({ ...prev, [branchId]: false }))
          return {
            ...item,
            residualPrices: !item.residualPrices
          }

        }
        return item
      }))
      await onUpdateResidualUse(branchId)
      ToastSuccess('Uso de precios fríos actualizado')
      ToastInfo('Recuerda actualizar los precios para productos fríos')

    } catch (error) {
      ToastDanger(error.message || 'Error al actualizar uso de precios fríos')
    }
  }

  useEffect(() => {

    document.title = 'Precios'
  }, [])

  // Switch para alternar precios frescos/fríos
  const handleToggleResidual = (branchId) => {
    setShowResidual(prev => ({ ...prev, [branchId]: !prev[branchId] }))
  }

  const filteredPrices = useMemo(() => {
    if (!searchTerm) return prices;
    return prices.filter((data) =>
      `${data._id.branchName ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase()
      )
    );
  }, [searchTerm, prices]);

  return (
    <main className="p-2 md:p-6 max-w-5xl mx-auto mb-32">

      <ToastContainerComponent />

      <h1 className="text-3xl md:text-4xl text-center font-bold mt-7 mb-6 text-gray-800">
        Precios por Sucursal
      </h1>

      {error && <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-4 text-center">{error}</div>}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar sucursal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 super-xl:grid-cols-3 gap-6">
        {filteredPrices && filteredPrices.length > 0 && filteredPrices.map((data) => {
          const isResidual = showResidual[data._id.branchId]
          // Agrupar productos en pares para doble columna
          const productPairs = []
          if (data.prices && data.prices.length > 0) {
            for (let i = 0; i < data.prices.length; i += 2) {
              productPairs.push([
                data.prices[i],
                data.prices[i + 1] || null
              ])
            }
          }
          return (
            <div key={data._id.branchId} className="rounded-2xl shadow-md bg-white border border-gray-200 flex flex-col p-4 transition hover:shadow-lg">
              <div className="flex items-center justify-between mb-2 gap-2">
                <h2 className="text-xl text-blue-700 font-bold">{data._id.branchName}</h2>
                <div className="flex gap-2 items-center">
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition flex items-center gap-2
                      ${data.residualPrices ? 'bg-blue-800 font-bold text-white border-blue-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
                    onClick={() => handleUpdateResidualsUse(data._id.branchId)}
                    title="Alternar uso de precios fríos en esta sucursal"
                    type="button"
                  >
                    <span className={`inline-block w-3 h-3 rounded-full border-2 mr-1
                      ${data.residualPrices ? 'bg-white border-white' : 'bg-gray-400 border-gray-400'}`}></span>
                    Uso de precios fríos
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition ${isResidual ? 'bg-blue-800 text-white border-blue-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
                    disabled={!data.residualPrices}
                    onClick={() => handleToggleResidual(data._id.branchId)}
                    type="button"
                  >
                    {isResidual ? 'Precios Fríos' : 'Precios Frescos'}
                  </button>
                </div>
              </div>
              <div className="w-full">
                <table className="w-full text-sm table-fixed">
                  <colgroup>
                    <col className="w-1/4" />
                    <col className="w-1/4" />
                    <col className="w-1/4" />
                    <col className="w-1/4" />
                  </colgroup>
                  <thead>
                    <tr className="bg-gray-100 text-xs text-gray-700">
                      <th className="px-2 py-1 text-left">Producto</th>
                      <th className={`px-2 py-1 text-center rounded transition ${isResidual ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{isResidual ? 'Precio Frío' : 'Precio'}</th>
                      <th className="px-2 py-1 text-left">Producto</th>
                      <th className={`px-2 py-1 text-center rounded transition ${isResidual ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{isResidual ? 'Precio Frío' : 'Precio'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productPairs.map((pair, idx) => {
                      const [left, right] = pair
                      const leftKey = left ? `${left.productId}${data._id.branchId}` : null
                      const rightKey = right ? `${right.productId}${data._id.branchId}` : null
                      return (
                        <tr key={idx} className="border-b last:border-b-0">
                          {/* Columna izquierda */}
                          <td className="px-2 py-1 font-medium text-gray-700 whitespace-normal">
                            {left ? left.product : ''}
                          </td>
                          <td className="px-2 py-1">
                            {left && (
                              <input
                                type="number"
                                autoComplete="off"
                                name={isResidual ? 'residualPrice' : 'price'}
                                id={isResidual ? leftKey + '-residual' : leftKey}
                                className={`${isResidual ? 'border border-blue-600' : 'border-gray-300'} w-full rounded-lg px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition`}
                                onChange={(e) => handleInputsChange(e, left.productId, data._id.branchId, isResidual)}
                                placeholder={isResidual ? (left.residualPrice ? currency(left.residualPrice) : '$0.00') : (left.latestPrice ? currency(left.latestPrice) : '$0.00')}
                                min="0"
                                step="0.01"
                              />
                            )}
                          </td>
                          {/* Columna derecha */}
                          <td className="px-2 py-1 font-medium text-gray-700 whitespace-normal break-words">
                            {right ? right.product : ''}
                          </td>
                          <td className="px-2 py-1">
                            {right && (
                              <input
                                type="number"
                                autoComplete="off"
                                name={isResidual ? 'residualPrice' : 'price'}
                                id={isResidual ? rightKey + '-residual' : rightKey}
                                className={`border ${isResidual ? 'border-blue-600' : 'border-gray-300'} w-full rounded-lg px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition`}
                                onChange={(e) => handleInputsChange(e, right.productId, data._id.branchId, isResidual)}
                                placeholder={isResidual ? (right.residualPrice ? currency(right.residualPrice) : '$0.00') : (right.latestPrice ? currency(right.latestPrice) : '$0.00')}
                                min="0"
                                step="0.01"
                              />
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <button
                className={`w-full mb-2 font-bold rounded-xl p-2 uppercase tracking-wide shadow transition border-2 flex items-center justify-center gap-2
    ${applyChanges[data._id.branchId] ? 'bg-yellow-400 text-yellow-900 border-yellow-500' : 'bg-white text-yellow-900 border-yellow-400 hover:bg-yellow-100'}`}
                type="button"
                onClick={() => setApplyChanges(prev => ({ ...prev, [data._id.branchId]: !prev[data._id.branchId] }))}
              >
                <span className={`inline-block w-4 h-4 rounded-full border-2 mr-1
    ${applyChanges[data._id.branchId] ? 'bg-yellow-400 border-yellow-600' : 'bg-white border-yellow-400'}`}></span>
                {applyChanges[data._id.branchId] ? 'FORMATO DE HOY ACTIVADO' : 'CAMBIAR PARA FORMATO DE HOY'}
              </button>
              <button
                className={`mt-0 w-full bg-[#3B82F6] opacity-90 text-white p-3 rounded-xl font-bold uppercase tracking-wide shadow transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed`}
                onClick={() => submitBranchPrices(data._id.branchId)}
                disabled={buttonDisabled[data._id.branchId] || loading[data._id.branchId]}
              >
                {loading[data._id.branchId] ? 'Guardando...' : 'Guardar precios'}
              </button>
              {successMessage[data._id.branchId] && (
                <div className="text-green-700 text-center mt-2 font-semibold animate-fade-in">{successMessage[data._id.branchId]}</div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}