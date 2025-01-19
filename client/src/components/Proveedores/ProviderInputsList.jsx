/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import { useRoles } from "../../context/RolesContext";
import DeleteButton from "../Buttons/DeleteButton"
import { getEmployeeFullName, stringToCurrency } from "../../helpers/Functions";
import { formatTime } from "../../helpers/DatePickerFunctions";
import { useState } from "react";
import ShowDetails from "../ShowDetails";

export default function ProviderInputsList({ inputs, totalWeight = 0, totalAmount = 0, onDelete }) {

  const { currentUser } = useSelector((state) => state.user);
  const { roles } = useRoles();
  const [selectedInput, setSelectedInput] = useState(null)
  const [movementDetailsIsOpen, setMovementDetailsIsOpen] = useState(false)

  const fields = [
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
      <div>
        {totalAmount || totalWeight && (
          <span>{`${totalAmount ? (`Monto: ${totalAmount}`) : (`Peso: ${totalWeight}`)}`}</span>
        )}
      </div>
    )
  }

  const renderHeader = () => {
    return (
      <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold my-4'>
        <p className='col-span-3 text-center'>Encargado</p>
        <p className='col-span-3 text-center'>Producto</p>
        <p className='col-span-2 text-center'>Piezas</p>
        <p className='col-span-2 text-center'>Kg</p>
        <p className='col-span-2 text-center'>Monto</p>
      </div>
    )
  }

  const renderInputItem = (input, index) => {

    const { employee, product, pieces, weight, amount } = input
    const isAuthorized = currentUser._id === employee._id || currentUser.role === roles.managerRole._id
    const deletable = onDelete ? isAuthorized : false

    return (
      isAuthorized && (
        <div key={input._id}>
          {input.weight != 0 ?
            <div className='grid grid-cols-12 items-center border border-black border-opacity-30 rounded-lg shadow-sm mb-2 py-3'>
              <button onClick={() => { setSelectedInput(input); setMovementDetailsIsOpen(!movementDetailsIsOpen); }} id='list-element' className='flex col-span-12 items-center'>
                <p className='text-center text-xs w-3/12'>{getEmployeeFullName(employee)}</p>
                <p className='text-center text-xs w-3/12'>{product.name}</p>
                <p className='text-center text-xs w-2/12'>{pieces}</p>
                <p className='text-center text-xs w-2/12'>{weight}</p>
                <p className='text-center text-xs w-2/12'>{amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                <div className='w-full'>
                  <p className='text-m text-center font-semibold'>{`${input.provider || 'Sin proveedor'}`}</p>
                </div>
              </button>
            </div>
            : ''}
          {deletable && (<DeleteButton id={input._id} deleteFunction={() => onDelete(input, index)} />)}
        </div>
      )
    )
  }

  const renderInputList = () => {
    return (
      <div>
        {renderTotal()}
        {renderHeader()}
        {inputs && inputs.length > 0 && inputs.map((input, index) => (renderInputItem(input, index)))}
      </div>
    )
  }

  return (
    <div>
      {renderInputList()}
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
