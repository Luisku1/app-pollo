import Select from 'react-select'
import { customSelectStyles } from '../../helpers/Constants'
import { getArrayForSelects, getElementForSelect } from "../../helpers/Functions"

export default function ProvidersSelect({ options, defaultLabel, selectedOption, handleSelectChange }) {
  return (
    <div>
      <Select
        styles={customSelectStyles}
        value={getElementForSelect(selectedOption, (provider) => provider.name)}
        onChange={handleSelectChange}
        options={getArrayForSelects(options, (provider) => provider.name)}
        placeholder={defaultLabel}
        isSearchable={true}
      />
    </div>
  )
}