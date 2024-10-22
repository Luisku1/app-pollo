/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import EmployeesSelect from './Select/EmployeesSelect'
import { useAddEmployeeRest } from '../hooks/Employees/useAddEmployeeRest'
import { useSelector } from 'react-redux'
import SectionHeader from './SectionHeader'
import ShowListButton from './Buttons/ShowListButton'
import RestsList from './RestsList'
import { formatDate } from '../helpers/DatePickerFunctions'

export default function CreateRest({ employees, pushPendingEmployeeRest, splicePendingEmployeeRest, updateLastEmployeeRestId, pendingEmployeesRests }) {

  const [datePickerValue, setDatePickerValue] = useState('')
  const { company } = useSelector((state) => state.user)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedReplacement, setSelectedReplacement] = useState(null)
  const { addEmployeeRest } = useAddEmployeeRest()

  console.log(pendingEmployeesRests)

  const handleEmployeeSelectChange = (selectedEmployee) => {

    setSelectedEmployee(selectedEmployee)
  }

  const handleReplacementSelectChange = (selectedReplacement) => {

    setSelectedReplacement(selectedReplacement)
  }

  const changeDatePickerValue = (e) => {

    setDatePickerValue(e.target.value)

  }

  useEffect(() => {

    let button = null

    if (!selectedEmployee || !selectedReplacement || !datePickerValue || formatDate(datePickerValue) < formatDate(new Date)) {

      button = document.getElementById('create-rest')
      button.disabled = true

    } else {

      button = document.getElementById('create-rest')
      button.disabled = false
    }

  }, [selectedEmployee, selectedReplacement, datePickerValue])

  const handleSubmit = (e) => {

    e.preventDefault()

    const employeeRest = {
      employee: selectedEmployee,
      replacement: selectedReplacement,
      companyId: company._id,
      date: datePickerValue
    }

    addEmployeeRest({ employeeRest, pushPendingEmployeeRest, splicePendingEmployeeRest, updateLastEmployeeRestId })
  }

  return (

    <div className='w-full bg-white p-3 mt-4'>
      <div className='flex'>
        <SectionHeader label={'Descansos'}></SectionHeader>
        <div className='ml-auto mr-auto'>
          <ShowListButton listTitle={'Descansos'} ListComponent={pendingEmployeesRests.length > 0 ? <RestsList rests={pendingEmployeesRests} spliceEmployeeRest={splicePendingEmployeeRest}></RestsList> : ''}></ShowListButton>
        </div>
      </div>

      <form action="submit" className='' onSubmit={handleSubmit}>
        <EmployeesSelect employees={employees} selectedEmployee={selectedEmployee} defaultLabel={'¿Quién descansa?'} handleEmployeeSelectChange={handleEmployeeSelectChange}></EmployeesSelect>
        <input className="p-3 border border-black rounded-lg w-full" type="date" name="date" id="date" onChange={changeDatePickerValue} defaultValue={datePickerValue} />
        <EmployeesSelect employees={employees} selectedEmployee={selectedReplacement} defaultLabel={'Remplazos'} handleEmployeeSelectChange={handleReplacementSelectChange}></EmployeesSelect>
        <button type='submit' id='create-rest' disabled className='bg-slate-500 text-white p-3 rounded-lg w-full mt-8'>Agregar</button>
      </form >
    </div>
  )
}
