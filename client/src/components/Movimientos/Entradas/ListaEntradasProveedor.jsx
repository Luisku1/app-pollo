/* eslint-disable react/prop-types */
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { formatTime } from '../../../helpers/DatePickerFunctions'
import { useRoles } from '../../../context/RolesContext'
import DeleteButton from '../../Buttons/DeleteButton'
import { currency } from '../../../helpers/Functions'
import ShowDetails from '../../ShowDetails'

export default function ListaEntradasProveedor({ inputs, totalWeight, onDeleteInput }) {

  const { currentUser } = useSelector((state) => state.user)
  const { roles, isManager } = useRoles()
  const [selectedInput, setSelectedInput] = useState(null)
  const [movementDetailsIsOpen, setMovementDetailsIsOpen] = useState(false)

  const fields = [
    // { key: 'product.name', label: 'Producto', format: (data) => data.product.name },
    { key: 'weight', label: 'Peso', format: (data) => `${data.weight.toFixed(2)} Kg` },
    { key: 'pieces', label: 'Piezas', format: (data) => data.pieces.toFixed(2) },
    { key: 'price', label: 'Precio', format: (data) => currency({ amount: data.price }) },
    { key: 'amount', label: 'Monto', format: (data) => currency({ amount: data.amount }) },
    { key: 'branch.branch', label: 'Entró a', format: (data) => data.branch.branch },
    { key: 'employee.name', label: 'Encargado', format: (data) => `${data.employee.name} ${data.employee.lastName}` },
    { key: 'comment', label: 'Comentario' },
    { key: 'createdAt', label: 'Hora', format: (data) => formatTime(data.createdAt) },
  ]

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-green-800 font-bold text-lg'>
          {`${totalWeight.toFixed(3)} Kg`}
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
    const { branch, customer, weight, product, _id } = input
    const employee = input.employee || input.deletedEmployee;
    const branchInfo = branch?.branch || branch?.label
    const customerInfo = `${customer?.name || ''} ${customer?.lastName || ''}`.trim() || customer?.label
    const employeeName = `${employee?.name ?? 'Ex empleado'}${employee?.lastName ? ' ' + employee.lastName : ''}`
    const isAuthorized = currentUser._id === (employee?._id) || isManager(currentUser.companyData?.[0].role)

    return (
      isAuthorized && (
        <div key={_id || index}>
          <div className={(currentUser._id === employee._id || isManager(currentUser.companyData?.[0].role) ? '' : 'py-3 ') + (input.specialPrice ? 'border border-red-500 ' : 'border border-black ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-70 shadow-sm mt-2'}>
            <div id="list-element" className="col-span-10 items-center">
              <p className='text-center text-xs w-3/12'>{branchInfo || customerInfo}</p>
              <p className='text-center text-xs w-3/12'>{employeeName}</p>
              <p className='text-center text-xs w-3/12'>{product.name || product.label}</p>
              <p className='text-center text-xs w-1/12'>{weight}</p>
            </div>
            <div className="col-span-2 my-auto">
              <div className="flex flex-col gap-2 justify-center my-auto items-center">
                <button
                  onClick={() => {
                    setSelectedInput(input);
                  }}
                  className="border rounded-lg shadow-md w-10 h-10 flex justify-center items-center" >
                  <CiSquareInfo className="w-full h-full text-blue-600" />
                </button>
                {isAuthorized && (
                  <DeleteButton
                    id={_id}
                    deleteFunction={() => onDeleteInput(input, index)} />
                )}
              </div>
            </div>
          </div>
        </div>
      )
    )
  }

  const renderInputsList = () => {
    return (
      <div>
        {renderListHeader()}
        {inputs && inputs.length > 0 && inputs.map((input, index) => renderInputItem({ input, index }))}
      </div>
    )
  }

  return (
    <div>
      {renderTotal()}
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
