/* eslint-disable react/prop-types */
import Select from 'react-select'
import { customSelectStyles } from '../../helpers/Constants'
import { getArrayForSelects, getElementForSelect, getEmployeeFullName } from '../../helpers/Functions'

export default function EmployeesSelect({ isEditing = true, defaultLabel, employees, selectedEmployee, handleEmployeeSelectChange }) {

  return (
    <div>
      <Select
        styles={customSelectStyles}
        value={getElementForSelect(selectedEmployee, getEmployeeFullName)}
        onChange={handleEmployeeSelectChange}
        options={getArrayForSelects(employees, getEmployeeFullName)}
        isClearable={true}
        menuPortalTarget={document.body}
        placeholder={defaultLabel}
        isDisabled={!isEditing}
        isSearchable={true}
      />
    </div>
  )
}
