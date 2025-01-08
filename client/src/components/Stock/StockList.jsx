/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux'
import DeleteButton from '../Buttons/DeleteButton'
import { useRoles } from '../../context/RolesContext'

export default function StockList({ stock, total, onDeleteStock }) {

  const { currentUser } = useSelector((state) => state.user)
  const isEmpty = stock.length === 0
  const { roles } = useRoles()

  const renderTotal = () => {
    return (
      <div>
        <h2>Total: {total}</h2>
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

    return (
      <div key={stock._id} className={(currentUser._id == stock.employee || currentUser.role == roles.managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>
        <div id='list-element' className='flex col-span-10 items-center '>
          <p className='text-center w-4/12'>{stock.product.name ?? stock.product.label}</p>
          <p className='text-center w-4/12'>{stock.pieces}</p>
          <p className='text-center w-4/12'>{stock.weight}</p>
          <p className='text-right w-4/12'>{stock.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
        </div>
        {currentUser._id == stock.employee._id || currentUser.role == roles.managerRole._id ?
          <DeleteButton
            id={stock._id}
            item={stock}
            index={index}
            deleteFunction={onDeleteStock}
          />
          : ''}
      </div>
    )
  }

  const renderStockList = () => {
    return (
      <div>
        {!isEmpty && roles?.managerRole && stock.map((stock, index) => (renderStock({ stock, index })))}
      </div>
    )
  }

  return (
    <div>
      {renderTotal()}
      {renderHeader()}
      {renderStockList()}
    </div>
  )
}
