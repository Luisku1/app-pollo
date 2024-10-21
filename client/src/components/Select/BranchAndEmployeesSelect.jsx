/* eslint-disable react/prop-types */
import { customSelectStyles } from "../../helpers/Constants";
import Select from 'react-select'

export default function BranchAndEmployeesSelect({ selectedOption, handleSelectChange, branches, employees, defaultLabel }) {

  const options = [{

    label: 'Empleados',
    options: employees
  },
  {
    label: 'Sucursales',
    options: branches
  }]

  return (
    <div>
      <Select
        styles={customSelectStyles}
        value={selectedOption}
        onChange={handleSelectChange}
        options={options}
        placeholder={defaultLabel}
        isSearchable={true}
      />
    </div>
  )
}

