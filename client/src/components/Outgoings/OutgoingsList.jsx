/* eslint-disable react/prop-types */
import { useSelector } from "react-redux"
import { stringToCurrency } from "../../helpers/Functions"
import DeleteButton from "../Buttons/DeleteButton"
import { useRoles } from "../../context/RolesContext"
import { useState } from "react"
import ShowDetails from "../ShowDetails"
import { formatTime } from "../../helpers/DatePickerFunctions"
import RowItem from "../RowItem"
import { CgProfile } from "react-icons/cg"
import ConfirmationButton from "../Buttons/ConfirmationButton"
import MoneyBag from "../Icons/MoneyBag"

export default function OutgoingsList({ outgoings, amount, onDelete, modifyBalance }) {
  const { currentUser } = useSelector((state) => state.user)
  const { roles } = useRoles()
  const [selectedOutgoing, setSelectedOutgoing] = useState(null)
  const [movementDetailsIsOpen, setMovementDetailsIsOpen] = useState(false)
  const isEmpty = !outgoings || outgoings.length === 0
  const deletable = onDelete

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

  const renderOutgoingItem = ({ outgoing, index }) => {
    const { _id, employee, concept, amount, createdAt } = outgoing
    const tempOutgoing = { ...outgoing, index }
    const employeeName = `${employee.name || employee}`
    const isAuthorized = currentUser._id == employee._id || currentUser.role == roles.managerRole._id
    const shouldRender = isAuthorized || currentUser.role === roles.managerRole._id

    return (
      shouldRender && (
        <div key={_id} className='grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1'>
          <button onClick={() => { setSelectedOutgoing(tempOutgoing); setMovementDetailsIsOpen(!movementDetailsIsOpen); }} id='list-element' className='col-span-10 items-center'>
            <div id='list-element' className='w-full'>
              <RowItem>
                <p className='font-bold text-md flex gap-1 items-center text-red-800'><CgProfile className="text-xl" />{employeeName}</p>
                <div className="text-sm text-black flex justify-self-end">
                  {formatTime(createdAt)}
                </div>
              </RowItem>
              <RowItem>
                <p className='ml-1 text-md font-semibold'>{concept}</p>
                <p className='flex gap-1 items-center text-orange-700'><MoneyBag />{stringToCurrency({ amount })}</p>
              </RowItem>
            </div>
          </button>
          <div className="col-span-2 my-auto">
            {deletable && (
              <DeleteButton
                id={outgoing._id}
                deleteFunction={() => onDelete(tempOutgoing, modifyBalance)}
              />
            )}
          </div>
        </div>
      )
    )
  }

  const renderActions = () => {
    return (
      <div>
        <div className="w-full flex justify-center">
          {deletable && selectedOutgoing && (
            <div className="w-full flex flex-col gap-2">
              <ConfirmationButton onConfirm={() => onDelete(selectedOutgoing, modifyBalance)} className="bg-delete-button text-white w-10/12 rounded-xl">
                Eliminar
              </ConfirmationButton>
              <ConfirmationButton onConfirm={() => console.log('Editing')} className="bg-update-button text-white w-10/12 rounded-xl">
                Actualizar
              </ConfirmationButton>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderOutgoingsList = () => {
    return (
      <div>
        {renderTotal()}
        {!isEmpty && roles?.managerRole && outgoings.map((outgoing, index) => renderOutgoingItem({ outgoing, index }))}
      </div>
    )
  }

  return (
    <div>
      {renderOutgoingsList()}
      {selectedOutgoing && movementDetailsIsOpen && (
        <ShowDetails
          data={selectedOutgoing}
          actions={renderActions}
          fields={fields}
          title={"Detalles del gasto de " + selectedOutgoing.employee.name}
          closeModal={() => setMovementDetailsIsOpen(false)}
        />
      )}
    </div>
  )
}
