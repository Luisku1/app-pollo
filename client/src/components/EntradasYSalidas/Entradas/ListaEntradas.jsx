/* eslint-disable react/prop-types */
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useDeleteInput } from '../../../hooks/Inputs/useDeleteInput'
import { formatTime } from '../../../helpers/DatePickerFunctions'
import { useRoles } from '../../../context/RolesContext'
import { useInputs } from '../../../hooks/Inputs/useInputs'
import DeleteButton from '../../Buttons/DeleteButton'
import { stringToCurrency } from '../../../helpers/Functions'
import Modal from '../../Modals/Modal'

export default function ListaEntradas({ initialInputs }) {

  const { currentUser } = useSelector((state) => state.user)
  const { roles, loading: rolesIsLoading } = useRoles()
  const { inputs, totalWeight, spliceInput } = useInputs({ initialInputs })
  const [selectedInput, setSelectedInput] = useState(null)
  const { deleteInput } = useDeleteInput()
  const [toggleMovementDetails, setToggleMovementDetails] = useState(false)
  const isEmpty = inputs.length === 0

  const toggleDetails = () => {
    setToggleMovementDetails((prev) => !prev)
  }

  const handleSelectInput = (input) => {
    setSelectedInput(input);
    toggleDetails();
  }

  const ShowMovementDetails = ({ movement }) => {

    const { branch, customer, amount, weight, employee, product, createdAt, specialPrice, price, comment, pieces } = movement

    return (

      <div>

        {toggleMovementDetails && !isEmpty && (
          <div className=''>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Hora:'}</p>
              <p>{formatTime(createdAt)}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Destino:'}</p>
              <p>{(branch?.branch ?? branch?.label) ?? (customer?.label ?? customer?.name)}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Encargado:'}</p>
              <p className=''>{employee.name + ' ' + employee.lastName}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Comentario:'}</p>
              <p>{comment}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Producto:'}</p>
              <p>{product?.name ?? product?.label}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Piezas:'}</p>
              <p>{pieces.toFixed(2)}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className={(specialPrice ? 'text-red-500' : '') + " font-bold text-lg"}>{specialPrice ? 'Precio especial:' : 'Precio:'}</p>
              <p>{stringToCurrency({ amount: price })}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Peso:'}</p>
              <p>{weight.toFixed(2) + ' Kg'}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Monto:'}</p>
              <p>{stringToCurrency({ amount })}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-green-800 font-bold text-lg'>
          {`${totalWeight} Kg`}
        </p>
      </div>
    )
  }

  const renderListHeader = () => {
    return (
      <div>
        {!isEmpty && (
          <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
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
    const isAuthorized = currentUser._id === employee._id || currentUser.role === roles.managerRole._id;

    return (
      <div key={_id}>
        {isAuthorized && (
          <div className={(currentUser._id == input.employee._id || currentUser.role == roles.managerRole._id ? '' : 'py-3 ') + (input.specialPrice ? 'border border-red-500 ' : 'border border-black ') + 'grid grid-cols-12 items-center border-opacity-70 rounded-lg shadow-sm mt-2'}>

            <button onClick={() => handleSelectInput(input)} id='list-element' className='flex col-span-10 items-center justify-around h-full'>
              <p className='text-center text-xs  w-3/12'>{branchInfo || customerInfo}</p>
              <p className='text-center text-xs w-3/12'>{employeeName}</p>
              <p className='text-center text-xs w-3/12'>{product.name || product.label}</p>
              <p className='text-center text-xs w-1/12'>{weight}</p>
            </button>
            {selectedInput != null && selectedInput._id == _id && toggleMovementDetails && (
              <Modal
                title={'Entrada'}
                closeModal={toggleDetails}
                content={<ShowMovementDetails movement={input} />}
                ableToClose={true}
              />
            )}
            {isAuthorized && (
              <DeleteButton
                id={_id}
                deleteFunction={deleteInput}
                index={index}
                item={input}
                spliceFunction={spliceInput}
              />
            )}

          </div>
        )}
      </div>
    )
  }

  const renderInputList = () => {

    const showTotal = currentUser.role === roles.managerRole._id

    return (
      <div>
        {showTotal && renderTotal()}
        {renderListHeader()}
        {!rolesIsLoading && !isEmpty && inputs.map((input, index) => renderInputItem({ input, index }))}
      </div>
    )
  }

  return (
    <div>
      {renderInputList()}
    </div>
  )
}
