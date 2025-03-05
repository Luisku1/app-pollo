/* eslint-disable react/prop-types */
import Select from 'react-select'
import { customSelectStyles } from '../../helpers/Constants'

export default function BranchAndCustomerSelect({ options, defaultLabel, selectedOption, handleSelectChange }) {
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
