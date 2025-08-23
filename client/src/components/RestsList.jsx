/* eslint-disable react/prop-types */
import { CgProfile } from 'react-icons/cg'
import { formatDateAndTime } from '../helpers/DatePickerFunctions'
import DeleteButton from './Buttons/DeleteButton'
import RowItem from './RowItem'
import EmployeeInfo from './EmployeeInfo'
import { useState } from 'react'
import { getEmployeeFullName } from '../helpers/Functions'
import { useSelector } from 'react-redux'

export default function RestsList({ rests, onDelete }) {
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const { currentUser } = useSelector((state) => state.user)
  return (
    <div>
      <EmployeeInfo employee={selectedEmployee} toggleInfo={() => setSelectedEmployee(null)} />
      {rests && rests.length != 0 && rests.map((rest, index) => {
        const employee = rest.employee || rest.deletedEmployee;
        const replacement = rest.replacement || rest.deletedEmployee;
        const { _id } = rest;
        const isMine = (employee?._id === currentUser?._id) || (replacement?._id === currentUser?._id)
        return (
          <div key={_id} className={`grid grid-cols-12 mt-4 rounded-lg shadow-lg p-3 gap-2 border ${isMine ? 'border-sky-300' : 'border-black border-opacity-30'}`}>
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
