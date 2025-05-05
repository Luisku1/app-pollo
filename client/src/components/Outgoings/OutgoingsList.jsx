/* eslint-disable react/prop-types */
import { useSelector } from "react-redux"
import { currency } from "../../helpers/Functions"
import DeleteButton from "../Buttons/DeleteButton"
import { useRoles } from "../../context/RolesContext"
import { useMemo, useState } from "react"
import ShowDetails from "../ShowDetails"
import { formatDateAndTime, formatTime } from "../../helpers/DatePickerFunctions"
import RowItem from "../RowItem"
import { CgProfile } from "react-icons/cg"
import ConfirmationButton from "../Buttons/ConfirmationButton"
import { CiSquareInfo } from "react-icons/ci"
import EmployeeInfo from "../EmployeeInfo"
import { MoneyBag } from "../Reutilizable/Labels"

export default function OutgoingsList({ outgoings, onDelete, modifyBalance }) {
  const { currentUser } = useSelector((state) => state.user)
  const { roles, isManager } = useRoles()
  const [selectedOutgoing, setSelectedOutgoing] = useState(null)
  const isEmpty = !outgoings || outgoings.length === 0
  const deletable = onDelete
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const amount = useMemo(() => outgoings.reduce((acc, outgoing) => acc + outgoing.amount, 0), [outgoings])

  const fields = [
    { key: 'amount', label: 'Monto', format: (data) => currency({ amount: data.amount }) },
    { key: 'employee.name', label: 'Vendedor', format: (data) => `${data.employee.name} ${data.employee.lastName}` },
    { key: 'concept', label: 'Concepto' },
    { key: 'createdAt', label: 'Hora', format: (data) => formatDateAndTime(data.createdAt) },
  ]

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-orange-500 font-bold text-lg'>
          {currency({ amount: amount })}
        </p>
      </div>
    )
  }

  const renderOutgoingItem = ({ outgoing, index }) => {
    const { _id, employee, concept, amount, createdAt } = outgoing
    const tempOutgoing = { ...outgoing, index }
    const employeeName = `${employee.name || employee}`
    const isAuthorized = currentUser._id == employee._id || isManager(currentUser.role)
    const shouldRender = isAuthorized || isManager(currentUser.role)

    return (
      shouldRender && (
        <div key={_id} className='grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1'>
          <div
            id="list-element"
            className="col-span-10 items-center"
          >
            <div id='list-element' className='w-full'>
              <div className="mb-1">
                <RowItem>
                  <button onClick={() => setSelectedEmployee(employee)} className="font-bold text-md flex gap-1 truncate items-center"><span><CgProfile /></span>{employeeName}</button>
                  <div className="text-sm text-black flex justify-self-end">
                    {formatDateAndTime(createdAt)}
                  </div>
                </RowItem>
              </div>
              <RowItem>
                <p className='ml-1 text-md font-semibold'>{concept}</p>
                <p className='flex gap-1 items-center text-orange-700'><MoneyBag />{currency({ amount })}</p>
              </RowItem>
            </div>
          </div>
          <div className="col-span-2 my-auto">
            <div className="flex flex-col gap-2 justify-center my-auto items-center">
              <button
                onClick={() => {
                  setSelectedOutgoing(tempOutgoing);
                }}
                className="border rounded-lg shadow-md w-10 h-10 flex justify-center items-center"
              >
                <CiSquareInfo className="w-full h-full text-blue-600" />
              </button>
              {deletable && (
                <DeleteButton
                  id={outgoing._id}
                  deleteFunction={() => onDelete(tempOutgoing, modifyBalance)} />
              )}
            </div>
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
        {!isEmpty && roles?.manager && outgoings.map((outgoing, index) => renderOutgoingItem({ outgoing, index }))}
      </div>
    )
  }

  return (
    <div>
      {renderOutgoingsList()}
      <EmployeeInfo employee={selectedEmployee} toggleInfo={() => setSelectedEmployee(null)} />
      {selectedOutgoing && (
        <ShowDetails
          data={selectedOutgoing}
          actions={renderActions}
          fields={fields}
          title={"Detalles del gasto de " + selectedOutgoing.employee.name}
          closeModal={() => setSelectedOutgoing(false)}
        />
      )}
    </div>
  )
}
