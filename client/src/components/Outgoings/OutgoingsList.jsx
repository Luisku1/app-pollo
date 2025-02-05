/* eslint-disable react/prop-types */
import { useSelector } from "react-redux"
import { stringToCurrency } from "../../helpers/Functions"
import DeleteButton from "../Buttons/DeleteButton"
import { useRoles } from "../../context/RolesContext"
import { useState } from "react"
import ShowDetails from "../ShowDetails"
import { formatTime } from "../../helpers/DatePickerFunctions"

export default function OutgoingsList({ outgoings, amount, onDeleteOutgoing, modifyBalance }) {

  const { currentUser } = useSelector((state) => state.user)
  const { roles } = useRoles()
  const [selectedOutgoing, setSelectedOutgoing] = useState(null)
  const [movementDetailsIsOpen, setMovementDetailsIsOpen] = useState(false)
  const isEmpty = !outgoings || outgoings.length === 0

  const fields = [
    { key: 'amount', label: 'Monto', format: (data) => stringToCurrency({ amount: data.amount }) },
    { key: 'employee.name', label: 'Vendedor', format: (data) => `${data.employee.name} ${data.employee.lastName}` },
    { key: 'concept', label: 'Concepto' },
    { key: 'createdAt', label: 'Hora', format: (data) => formatTime(data.createdAt) },
  ]

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-orange-500 font-bold text-lg'>
          {stringToCurrency({ amount: amount })}
        </p>
      </div>
    )
  }

  const renderListHeader = () => {
    return (
      <div>
        {!isEmpty && (
          <div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold'>
            <div className="flex col-span-10 items-center justify-around">

              <p className='p-3 rounded-lg w-4/12 text-center'>Empleado</p>
              <p className='p-3 rounded-lg w-4/12 text-center'>Concepto</p>
              <p className='p-3 rounded-lg w-4/12 text-center'>Monto</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderOutgoingItem = (outgoing, index) => {

    const { _id, employee, concept, amount } = outgoing
    const employeeName = `${employee.name || employee}`
    const isAuthorized = currentUser._id == employee._id || currentUser.role == roles.managerRole._id
    const shouldRender = isAuthorized || currentUser.role === roles.managerRole._id;
    const shouldShowDeleteButton = isAuthorized && onDeleteOutgoing;

    return (
      <div key={_id} >
        {shouldRender && (
          <div className={(currentUser._id == outgoing.employee || currentUser.role == roles.managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

            <div className="grid col-span-10 items-center">
              <button onClick={() => { setSelectedOutgoing(outgoing); setMovementDetailsIsOpen(!movementDetailsIsOpen); }} id='list-element' className='grid grid-cols-12 items-center'>
                <div id='' className='flex col-span-12 items-center justify-around'>
                  <p className='text-center text-xs w-4/12'>{employeeName}</p>
                  <p className='text-center text-xs w-4/12'>{concept}</p>
                  <p className='text-center text-xs w-4/12'>{stringToCurrency({ amount })}</p>
                </div>
              </button>
            </div>

            {shouldShowDeleteButton && (
              <DeleteButton
                id={outgoing._id}
                deleteFunction={() => onDeleteOutgoing(outgoing, index, modifyBalance)}
              />
            )}


          </div>
        )}
      </div>
    )
  }

  const renderOutgoingsList = () => {

    const showTotal = currentUser.role === roles.managerRole._id

    return (
      <div>
        {showTotal && renderTotal()}
        {renderListHeader()}
        {roles && roles.managerRole && !isEmpty && outgoings.map((outgoing, index) => renderOutgoingItem(outgoing, index))}
      </div>
    )
  }

  return (
    <div>
      {renderOutgoingsList()}
      {selectedOutgoing && movementDetailsIsOpen && (
        <ShowDetails
          data={selectedOutgoing}
          fields={fields}
          title={"Detalles del gasto de " + selectedOutgoing.employee.name}
          closeModal={() => setMovementDetailsIsOpen(false)}
        />
      )}
    </div>
  )
}
