/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import EmployeesSelect from './Select/EmployeesSelect'
import { useSelector } from 'react-redux'
import SectionHeader from './SectionHeader'
import RestsList from './RestsList'
import { formatDate } from '../../../api/utils/formatDate'
import ShowListModal from './Modals/ShowListModal'

export default function CreateRest({ employees, pendingEmployeesRests, onAddEmployeeRest, onDeleteEmployeeRest }) {

  const [datePickerValue, setDatePickerValue] = useState('')
  const [replacements, setReplacements] = useState(employees)
  const { company } = useSelector((state) => state.user)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedReplacement, setSelectedReplacement] = useState(null)

  useEffect(() => {

    setReplacements(employees)

  }, [employees])

  const handleEmployeeSelectChange = (selectedEmployee) => {

    setSelectedEmployee(selectedEmployee)

    setReplacements((prev) => prev.map((replacement) =>

      (selectedEmployee && replacement._id == selectedEmployee._id) ? { ...replacement, isDisabled: true } : { ...replacement, isDisabled: false }
    ))
  }

  const handleReplacementSelectChange = (selectedReplacement) => {

    setSelectedReplacement(selectedReplacement)
  }

  const changeDatePickerValue = (e) => {

    setDatePickerValue(e.target._id)

  }

  useEffect(() => {

    let button = document.getElementById('create-rest')

    if (!selectedEmployee || !datePickerValue || formatDate(datePickerValue) < formatDate(new Date())) {

      button.disabled = true

    } else {

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

    onAddEmployeeRest(employeeRest)
  }

  return (
    <div className='w-full bg-white p-3 mt-4'>
      <div className='grid grid-cols-2'>
        <SectionHeader label={'Descansos'} />
        <div className='flex items-center gap-4 justify-self-end mr-12'>
          <ShowListModal
            title={'Descansos'}
            ListComponent={RestsList}
            ListComponentProps={{ rests: pendingEmployeesRests, onDelete: onDeleteEmployeeRest }}
            clickableComponent={

              <p className='font-bold text-lg text-center p-1 border border-header rounded-md'>{`${pendingEmployeesRests.length} ${pendingEmployeesRests.length == 0 || pendingEmployeesRests.length > 1 ? 'Pendientes' : 'Pendiente'}`}</p>
            }
          />
        </div>
      </div>
      <form action="submit" className='' onSubmit={handleSubmit}>
        <EmployeesSelect employees={employees} selectedEmployee={selectedEmployee} defaultLabel={'¿Quién descansa?'} handleEmployeeSelectChange={handleEmployeeSelectChange}></EmployeesSelect>
        <input className="p-3 border border-black rounded-lg w-full" type="date" min={new Date().toISOString().split('T')[0]} name="date" id="date" onChange={changeDatePickerValue} defaultValue={datePickerValue} />
        <div className='z-60'>
          <EmployeesSelect employees={replacements} selectedEmployee={selectedReplacement} defaultLabel={'Remplazos'} handleEmployeeSelectChange={handleReplacementSelectChange}></EmployeesSelect>
        </div>
        <button type='submit' id='create-rest' className='bg-button text-white p-3 rounded-lg w-full mt-8'>Agregar</button>
      </form >
    </div>
  )
}
