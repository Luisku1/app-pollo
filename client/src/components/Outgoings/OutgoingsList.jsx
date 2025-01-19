/* eslint-disable react/prop-types */
import { useSelector } from "react-redux"
import { stringToCurrency } from "../../helpers/Functions"
import DeleteButton from "../Buttons/DeleteButton"
import { useRoles } from "../../context/RolesContext"

export default function OutgoingsList({ outgoings, amount, onDeleteOutgoing, modifyBalance }) {

  const { currentUser } = useSelector((state) => state.user)
  const { roles } = useRoles()
  const isEmpty = !outgoings || outgoings.length === 0

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

            <div id='list-element' className='flex col-span-10 items-center'>
              <p className='text-center text-xs w-4/12'>{employeeName}</p>
              <p className='text-center text-xs w-4/12'>{concept}</p>
              <p className='text-center text-xs w-4/12'>{stringToCurrency({ amount })}</p>
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
    </div>
  )
}
