import React, { useState } from 'react'

export default function ShowEmployeePayments({ employeeId }) {

  const [employeePaymentsIsOpen, setEmployeePaymentsIsOpen] = useState(false)
  const [employeePayments, setEmployeePayments] = useState({})
  const [employee, setEmployee] = useState(employeeId ? employeeId : null)


  return (
    <div className='bg-white'>
      <div className="h-10 w-10 shadow-lg ">
        {employeePayments && employeePayments.length > 0 ?
          <button className="w-full h-full" onClick={() => { setEmployeePaymentsIsOpen(true) }}>
            {employeePayments.total.toFixed(2)}
          </button>
          : '0'}
      </div>
    </div>
  )
}
