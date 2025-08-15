/*
  Componente combinado para manejar Sobrante (Stock) y Gastos en una sola vista.
  Mejora principal:
    - Tabs en mobile (permite alternar entre formularios sin hacer scroll largo).
    - En pantallas medianas+ se muestran ambos formularios lado a lado (grid responsive).
    - Barra de resumen arriba con totales y balance neto (Sobrante - Gastos) para visión rápida.
    - Cálculo de totales derivado si no se pasan por props (mantiene compatibilidad con usos actuales).
  NOTA: No se modifican los componentes originales AddStock / AddOutgoing para preservar su vista individual.
*/

import { useMemo, useState } from 'react'
import AddStock from './Stock/AddStock'
import AddOutgoing from './Outgoings/AddOutgoing'
import { currency } from '../helpers/Functions'

export default function StockAndOutgoings({
  // Datos Sobrante
  stock = [],
  weight, // total weight opcional
  amount, // total amount opcional
  products = [],
  branchPrices = [],
  onAddStock = () => { },
  onDeleteStock = () => { },
  midDay = false,
  stockTitle = 'Sobrante',
  stockListButton,

  // Datos Gastos
  outgoings = [],
  outgoingsTotal, // total opcional
  onAddOutgoing = () => { },
  onDeleteOutgoing = () => { },
  outgoingTitle = 'Gastos',
  outgoingListButton,

  // Contexto común
  branch,
  employee,
  modifyBalance = false,
  isReport = false,
}) {

  const [activeTab, setActiveTab] = useState('stock') // 'stock' | 'outgoings'

  // Derivar totales si no se proporcionan
  const { totalStockWeight, totalStockAmount, totalOutgoingsAmount, netBalance } = useMemo(() => {
    const totalStockWeightCalc = weight ?? stock.reduce((acc, s) => acc + (parseFloat(s.weight) || 0), 0)
    const totalStockAmountCalc = amount ?? stock.reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0)
    const totalOutgoingsCalc = outgoingsTotal ?? outgoings.reduce((acc, g) => acc + (parseFloat(g.amount) || 0), 0)
    return {
      totalStockWeight: totalStockWeightCalc,
      totalStockAmount: totalStockAmountCalc,
      totalOutgoingsAmount: totalOutgoingsCalc,
      netBalance: totalStockAmountCalc - totalOutgoingsCalc
    }
  }, [stock, weight, amount, outgoings, outgoingsTotal])

  return (
    <div className="flex flex-col gap-4">
      {/* Barra Resumen */}
      <div className="bg-white border border-header rounded-md p-3 flex flex-wrap gap-4 text-sm font-semibold">
        <span className="inline-flex items-center gap-1"><span className="text-gray-500">Sobrante:</span> {currency(totalStockAmount)}</span>
        <span className="inline-flex items-center gap-1"><span className="text-gray-500">Gastos:</span> {currency(totalOutgoingsAmount)}</span>
        <span className={`inline-flex items-center gap-1 ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <span className="text-gray-500">Balance Neto:</span> {currency(netBalance)}
        </span>
        <span className="inline-flex items-center gap-1 text-gray-500">Peso Total: {Number(totalStockWeight).toFixed(3)} kg</span>
      </div>

      {/* Tabs móviles */}
      <div className="md:hidden flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`flex-1 py-2 rounded-md text-sm font-medium border ${activeTab === 'stock' ? 'bg-button text-white border-button' : 'bg-white text-black border-gray-300'}`}
          aria-pressed={activeTab === 'stock'}
          aria-label="Mostrar formulario de sobrante"
        >
          {stockTitle}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('outgoings')}
          className={`flex-1 py-2 rounded-md text-sm font-medium border ${activeTab === 'outgoings' ? 'bg-button text-white border-button' : 'bg-white text-black border-gray-300'}`}
          aria-pressed={activeTab === 'outgoings'}
          aria-label="Mostrar formulario de gastos"
        >
          {outgoingTitle}
        </button>
      </div>

      {/* Contenido */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className={activeTab === 'stock' ? 'block' : 'hidden md:block'}>
          <AddStock
            title={stockTitle}
            midDay={midDay}
            modifyBalance={modifyBalance}
            stock={stock}
            isReport={isReport}
            listButton={stockListButton}
            weight={totalStockWeight}
            amount={totalStockAmount}
            products={products}
            onAddStock={onAddStock}
            onDeleteStock={onDeleteStock}
            branch={branch}
            employee={employee}
            branchPrices={branchPrices}
          />
        </div>
        <div className={activeTab === 'outgoings' ? 'block' : 'hidden md:block'}>
          <AddOutgoing
            outgoings={outgoings}
            modifyBalance={modifyBalance}
            isReport={isReport}
            listButton={outgoingListButton}
            outgoingsTotal={totalOutgoingsAmount}
            onAddOutgoing={onAddOutgoing}
            onDeleteOutgoing={onDeleteOutgoing}
            employee={employee}
            branch={branch}
          />
        </div>
      </div>
    </div>
  )
}
