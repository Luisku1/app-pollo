/* eslint-disable react/prop-types */
import { CgProfile } from 'react-icons/cg'
import { formatDateAndTime } from '../helpers/DatePickerFunctions'
import DeleteButton from './Buttons/DeleteButton'
import RowItem from './RowItem'
import EmployeeInfo from './EmployeeInfo'
import { useState } from 'react'
import { getEmployeeFullName } from '../helpers/Functions'

export default function RestsList({ rests, onDelete }) {
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  return (
    <div>
      <EmployeeInfo employee={selectedEmployee} toggleInfo={() => setSelectedEmployee(null)} />
      {rests && rests.length != 0 && rests.map((rest, index) => {
        const { _id, employee, replacement } = rest
        return (
          <div key={_id} className='grid grid-cols-12 mt-4 border border-black rounded-lg shadow-lg p-3 gap-2'>
            <div className="col-span-10 items-center">
              <RowItem>
                <button onClick={() => setSelectedEmployee(employee)} className="text-red-800 font-bold text-md flex gap-1 items-center w-full"><span><CgProfile /></span>{getEmployeeFullName(employee)}</button>
                <button onClick={() => setSelectedEmployee(replacement)} className="text-red-800 font-bold text-md flex gap-1 items-center w-full"><span><CgProfile /></span>{getEmployeeFullName(replacement)}</button>
              </RowItem>
              <RowItem>
                <p>{`${formatDateAndTime(rest.date)}`}</p>
              </RowItem>
            </div>
            <div className="col-span-2 flex justify-end items-center">
              <div className='w-10 h-10'>
                <DeleteButton
                  id={rest._id}
                  deleteFunction={() => onDelete(rest, index)}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
