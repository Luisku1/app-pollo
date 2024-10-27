/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux'
import DeleteButton from './Buttons/DeleteButton'
import { formatDateAndTime } from '../helpers/DatePickerFunctions'

export default function EmployeePaymentsList({ employeePayments, deleteEmployeePayment, spliceEmployeePayment, roles }) {

  const { currentUser } = useSelector((state) => state.user)

  console.log(employeePayments)

  return (

    <div>
      < div className='mt-4 mb-4'>
        <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
          <p className='col-span-3 text-center'>Fecha</p>
          <p className='col-span-3 text-center'>Detalle</p>
          <p className='col-span-3 text-center'>Monto</p>
        </div>
        {employeePayments.length > 0 && employeePayments.map((employeePayment, index) => (
          <div key={employeePayment._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 mt-2 shadow-m rounded-lg'>
            <div id='list-element' className='flex col-span-9 items-center justify-around pt-3 pb-3'>
              <p className='text-center text-xs w-3/12'>{formatDateAndTime(employeePayment.createdAt)}</p>
              <p className='text-center text-xs w-3/12'>{employeePayment.detail}</p>
              <p className='text-center text-xs w-3/12'>{employeePayment.amount}</p>
            </div>
            {(roles && currentUser.role == roles.managerRole._id) ?
              <DeleteButton
                deleteFunction={deleteEmployeePayment}
                id={employeePayment._id}
                index={index}
                item={employeePayment}
                spliceFunction={spliceEmployeePayment}
              />
              : ''}
          </div>
        ))}
      </div>
    </div>
  )
}
