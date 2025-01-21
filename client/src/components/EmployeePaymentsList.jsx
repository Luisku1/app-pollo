/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux'
import DeleteButton from './Buttons/DeleteButton'
import { formatDateAndTime } from '../helpers/DatePickerFunctions'
import { useRoles } from '../context/RolesContext'
import { getEmployeeFullName, stringToCurrency } from '../helpers/Functions'

export default function EmployeePaymentsList({ payments, total, onDeletePayment, spliceIncome, spliceExtraOutgoing }) {

  const { currentUser } = useSelector((state) => state.user)
  const { roles } = useRoles()
  const isEmpty = !payments || payments.length === 0

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-green-800 font-bold text-lg'>
          {stringToCurrency({ amount: total })}
        </p>
      </div>
    )
  }

  const renderListHeader = () => {
    <div>
      {!isEmpty && (
        <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
          <p className='col-span-3 text-center'>Fecha</p>
          <p className='col-span-3 text-center'>Supervisor</p>
          <p className='col-span-3 text-center'>Detalle</p>
          <p className='col-span-3 text-center'>Monto</p>
        </div>
      )}
    </div>
  }

  const renderEmployeePayment = ({ employeePayment, index }) => {

    const { _id, employee, amount, detail, createdAt, supervisor } = employeePayment
    const isAuthorized = currentUser._id == employee._id || currentUser.role == roles.managerRole._id
    const shouldRender = isAuthorized || currentUser.role === roles.managerRole._id

    return (
      <div key={_id} >
        {shouldRender && (
          <div className={(currentUser._id == employee._id || currentUser.role == roles.managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>
            <div id='list-element' className='flex col-span-9 items-center justify-around pt-3 pb-3'>
              <p className='text-center text-xs w-3/12'>{formatDateAndTime(createdAt)}</p>
              <p className='text-center text-xs w-3/12'>{supervisor.name}</p>
              <p className='text-center text-xs w-3/12'>{`${detail} [${getEmployeeFullName(employee)}]`}</p>
              <p className='text-center text-xs w-3/12'>{stringToCurrency({ amount })}</p>
            </div>
            {isAuthorized && (
              <DeleteButton
                deleteFunction={() => onDeletePayment(employeePayment, index, spliceIncome, spliceExtraOutgoing)}
                id={_id}
              />
            )}
          </div>
        )}
      </div>
    )
  }

  const renderEmployeesPayments = () => {

    const showTotal = currentUser.role === roles.managerRole._id

    return (
      <div>
        {showTotal && renderTotal()}
        {renderListHeader()}
        {!isEmpty && payments.map((employeePayment, index) => renderEmployeePayment({ employeePayment, index }))}
      </div>
    )
  }

  return (
    <div>
      {renderEmployeesPayments()}
    </div>
  )
}
