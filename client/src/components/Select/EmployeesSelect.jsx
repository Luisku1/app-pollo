/* eslint-disable react/prop-types */
import Select from 'react-select'
import { customSelectStyles } from '../../helpers/Constants'

export default function EmployeesSelect({ defaultLabel, employees, selectedEmployee, handleEmployeeSelectChange }) {

  return (
    <div>
      <Select
        styles={customSelectStyles}
        value={selectedEmployee}
        onChange={handleEmployeeSelectChange}
        options={employees}
        isClearable={true}
        placeholder={defaultLabel}
        isSearchable={true}
      />
    </div>
  )
}
