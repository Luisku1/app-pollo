/* eslint-disable react/prop-types */
import { useState } from 'react'
import Select from 'react-select'
import { customSelectStyles } from '../../helpers/Constants'

export default function EmployeeMultiSelect({ employees, setSelectedEmployees }) {

  const [selectedOptions, setSelectedOptions] = useState([])

  console.log(employees)

  const handleSelectChange = (options) => {

    setSelectedOptions(options)
    setSelectedEmployees(options)
  }

  return (
    <div>
      <Select
        defaultValue={null}
        styles={customSelectStyles}
        isMulti
        value={selectedOptions}
        name="employees"
        options={employees}
        onChange={handleSelectChange}
        placeholder={'Selección de empleados'}
        className="basic-multi-select"
        classNamePrefix="select"
      />
    </div>
  )
}
