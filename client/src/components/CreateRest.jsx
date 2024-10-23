/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import EmployeesSelect from './Select/EmployeesSelect'
import { useAddEmployeeRest } from '../hooks/Employees/useAddEmployeeRest'
import { useSelector } from 'react-redux'
import SectionHeader from './SectionHeader'
import ShowListButton from './Buttons/ShowListButton'
import RestsList from './RestsList'
import { formatDate } from '../../../api/utils/formatDate'

export default function CreateRest({ employees, pushPendingEmployeeRest, splicePendingEmployeeRest, updateLastEmployeeRestId, pendingEmployeesRests }) {

  const [datePickerValue, setDatePickerValue] = useState('')
  const [replacements, setReplacements] = useState(employees)
  const { company } = useSelector((state) => state.user)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedReplacement, setSelectedReplacement] = useState(null)
  const { addEmployeeRest } = useAddEmployeeRest()

  useEffect(() => {

    setReplacements(employees)

  }, [employees])

  const handleEmployeeSelectChange = (selectedEmployee) => {

    setSelectedEmployee(selectedEmployee)

    setReplacements((prev) => prev.map((replacement) =>

      (selectedEmployee && replacement.value == selectedEmployee.value) ? { ...replacement, isDisabled: true } : { ...replacement, isDisabled: false }
    ))
  }

  const handleReplacementSelectChange = (selectedReplacement) => {

    setSelectedReplacement(selectedReplacement)
  }

  const changeDatePickerValue = (e) => {

    setDatePickerValue(e.target.value)

  }

  useEffect(() => {

    let button = null

    if (!selectedEmployee || !datePickerValue || formatDate(datePickerValue) < formatDate(new Date)) {

      button = document.getElementById('create-rest')
      button.disabled = true

    } else {

      button = document.getElementById('create-rest')
      button.disabled = false
    }

  }, [selectedEmployee, datePickerValue])

  const handleSubmit = (e) => {

    e.preventDefault()

    const employeeRest = {
      employee: selectedEmployee,
      replacement: selectedReplacement,
      companyId: company._id,
      date: datePickerValue + 'T06:00:00.000Z'
    }

    setSelectedEmployee(null)
    setSelectedReplacement(null)
    setReplacements(employees)

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
        <EmployeesSelect employees={replacements} selectedEmployee={selectedReplacement} defaultLabel={'Remplazos'} handleEmployeeSelectChange={handleReplacementSelectChange}></EmployeesSelect>
        <button type='submit' id='create-rest' disabled className='bg-slate-500 text-white p-3 rounded-lg w-full mt-8'>Agregar</button>
      </form >
    </div>
  )
}
