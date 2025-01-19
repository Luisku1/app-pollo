/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux'
import DeleteButton from '../Buttons/DeleteButton'
import { useRoles } from '../../context/RolesContext'
import ShowDetails from '../ShowDetails'
import { useState } from 'react'
import { stringToCurrency } from '../../helpers/Functions'
import { formatTime } from '../../helpers/DatePickerFunctions'

export default function StockList({ stock, weight, amount, onDeleteStock, modifyBalance }) {

  const { currentUser } = useSelector((state) => state.user)
  const isEmpty = stock.length === 0
  const { roles } = useRoles()
  const [selectedStock, setSelectedStock] = useState(null)
  const [movementDetailsIsOpen, setMovementDetailsIsOpen] = useState(false)

  const fields = [
    // { key: 'product.name', label: 'Producto', format: (data) => data.product.name },
    { key: 'weight', label: 'Peso', format: (data) => `${data.weight.toFixed(2)} Kg` },
    { key: 'pieces', label: 'Piezas', format: (data) => data.pieces.toFixed(2) },
    { key: 'price', label: 'Precio', format: (data) => stringToCurrency({ amount: data.price }) },
    { key: 'amount', label: 'Monto', format: (data) => stringToCurrency({ amount: data.amount }) },
    { key: 'branch.branch', label: 'Entró a', format: (data) => data.branch.branch },
    { key: 'employee.name', label: 'Encargado', format: (data) => `${data.employee.name} ${data.employee.lastName}` },
    { key: 'createdAt', label: 'Hora', format: (data) => formatTime(data.createdAt) },
  ]

  const renderTotal = () => {
    console.log(weight)
    return (
      <div className='justify-self-end'>
        <p className='text-green-800 font-bold text-lg'>
          {`${weight.toFixed(3)} Kg - ${stringToCurrency({ amount: amount })}`}
        </p>
      </div>
    )
  }

  const renderHeader = () => {
    return (
      <div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold mt-4 mb-4'>
        <p className='rounded-lg col-span-3 text-center'>Producto</p>
        <p className='rounded-lg col-span-2 text-center'>Piezas</p>
        <p className='rounded-lg col-span-2 text-center'>Kg</p>
        <p className='rounded-lg col-span-3 text-center'>Monto</p>
      </div>
    )
  }

  const renderStock = (stock, index) => {

    const isAuthorized = currentUser._id === stock.employee._id || currentUser.role === roles.managerRole._id
    const deletable = isAuthorized && onDeleteStock

    return (
      <div key={stock._id} className={'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>
        <button onClick={() => { setSelectedStock(stock); setMovementDetailsIsOpen(!movementDetailsIsOpen); }} id='list-element' className='grid col-span-10 items-center justify-around h-full'>
          <div id='list-element' className='flex col-span-10 items-center '>
            <p className='text-center w-4/12'>{stock.product.name ?? stock.product.label}</p>
            <p className='text-center w-4/12'>{stock.pieces}</p>
            <p className='text-center w-4/12'>{stock.weight}</p>
            <p className='text-center w-4/12'>{stock.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
          </div>
        </button>
        {deletable ?
          <DeleteButton
            id={stock._id}
            deleteFunction={() => onDeleteStock(stock, index, modifyBalance)}
          />
          : ''}
      </div>
    )
  }

  const renderStockList = () => {
    return (
      <div>
        {renderTotal()}
        {renderHeader()}
        {!isEmpty && roles?.managerRole && stock.map((stock, index) => (renderStock(stock, index)))}
      </div>
    )
  }

  return (
    <div>
      {renderStockList()}
      {selectedStock && movementDetailsIsOpen && (
        <ShowDetails
          data={selectedStock}
          fields={fields}
          title={"Detalles de sobrante de " + selectedStock.product.name}
          closeModal={() => setMovementDetailsIsOpen(false)}
        />
      )}
    </div>
  )
}
