/* eslint-disable react/prop-types */
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { formatTime } from '../../../helpers/DatePickerFunctions'
import { useRoles } from '../../../context/RolesContext'
import DeleteButton from '../../Buttons/DeleteButton'
import { stringToCurrency } from '../../../helpers/Functions'
import ShowDetails from '../../ShowDetails'

export default function ListaEntradas({ inputs, totalWeight, totalAmount, onDeleteInput }) {

  const { currentUser } = useSelector((state) => state.user)
  const { roles } = useRoles()
  const [selectedInput, setSelectedInput] = useState(null)
  const [movementDetailsIsOpen, setMovementDetailsIsOpen] = useState(false)

  const fields = [
    // { key: 'product.name', label: 'Producto', format: (data) => data.product.name },
    { key: 'weight', label: 'Peso', format: (data) => `${data.weight.toFixed(2)} Kg` },
    { key: 'pieces', label: 'Piezas', format: (data) => data.pieces.toFixed(2) },
    { key: 'price', label: 'Precio', format: (data) => stringToCurrency({ amount: data.price }) },
    { key: 'amount', label: 'Monto', format: (data) => stringToCurrency({ amount: data.amount }) },
    { key: 'branch.branch', label: 'Entró a', format: (data) => data.branch.branch },
    { key: 'employee.name', label: 'Encargado', format: (data) => `${data.employee.name} ${data.employee.lastName}` },
    { key: 'comment', label: 'Comentario' },
    { key: 'createdAt', label: 'Hora', format: (data) => formatTime(data.createdAt) },
  ]

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-green-800 font-bold text-lg'>
          {`${totalWeight.toFixed(3)} Kg - ${stringToCurrency({ amount: totalAmount })}`}
        </p>
      </div>
    )
  }

  const renderListHeader = () => {
    return (
      <div>
        {inputs && inputs.length > 0 && (
          <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4 border-b border-gray-300'>
            <p className='col-span-3 text-center'>Sucursal / Cliente</p>
            <p className='col-span-3 text-center'>Encargado</p>
            <p className='col-span-3 text-center'>Producto</p>
            <p className='col-span-1 text-center'>Kg</p>
          </div>
        )}
      </div>
    )
  }

  const renderInputItem = ({ input, index }) => {

    const { branch, customer, weight, employee, product, _id } = input
    const branchInfo = branch?.branch || branch?.label
    const customerInfo = `${customer?.name || ''} ${customer?.lastName || ''}`.trim() || customer?.label
    const employeeName = `${employee.name} ${employee.lastName}`
    const isAuthorized = (currentUser._id === employee._id || currentUser.role === roles.managerRole._id) || !onDeleteInput
    const deletable = isAuthorized && onDeleteInput
    return (
      isAuthorized && (
        <div key={_id || index}>
          <div className={(currentUser._id === employee._id || currentUser.role === roles.managerRole._id ? '' : 'py-3 ') + (input.specialPrice ? 'border border-red-500 ' : 'border border-black ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-70 shadow-sm mt-2'}>
            <button onClick={() => { setSelectedInput(input); setMovementDetailsIsOpen(!movementDetailsIsOpen); }} id='list-element' className='flex col-span-10 items-center justify-around h-full'>
              <p className='text-center text-xs w-3/12'>{branchInfo || customerInfo}</p>
              <p className='text-center text-xs w-3/12'>{employeeName}</p>
              <p className='text-center text-xs w-3/12'>{product.name || product.label}</p>
              <p className='text-center text-xs w-1/12'>{weight}</p>
            </button>
            {deletable && (
              <DeleteButton
                id={_id}
                deleteFunction={() => onDeleteInput(input, index)}
              />
            )}
          </div>
        </div>
      )
    )
  }

  const renderInputsList = () => {
    return (
      <div>
        {renderTotal()}
        {renderListHeader()}
        {inputs && inputs.length > 0 && inputs.map((input, index) => renderInputItem({ input, index }))}
      </div>
    )
  }

  return (
    <div>
      {renderInputsList()}
      {selectedInput && movementDetailsIsOpen && (
        <ShowDetails
          data={selectedInput}
          fields={fields}
          title={"Detalles de la entrada de " + selectedInput.product.name}
          closeModal={() => setMovementDetailsIsOpen(false)}
        />
      )}
    </div>
  )
}
