/* eslint-disable react/prop-types */
import Select from 'react-select'
import { customSelectStyles } from '../../helpers/Constants'
import { getArrayForSelects, getElementForSelect, getEmployeeFullName } from '../../helpers/Functions'
import { useRef } from 'react'

export default function EmployeesSelect({ isEditing = true, defaultLabel, employees, selectedEmployee, handleEmployeeSelectChange, isMultiSelect = false }) {

  const selectRef = useRef(null)

  return (
    <div>
      <Select
        ref={selectRef}
        styles={customSelectStyles}
        value={getElementForSelect(selectedEmployee, getEmployeeFullName)}
        onChange={handleEmployeeSelectChange}
        options={getArrayForSelects(employees, getEmployeeFullName)}
        isClearable={true}
        onFocus={() => {
          setTimeout(() => {
            selectRef.current?.focus();
            selectRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }}
        menuPortalTarget={document.body}
        placeholder={defaultLabel}
        isDisabled={!isEditing}
        isSearchable={true}
        isMulti={isMultiSelect}
      />
    </div>
  )
}
