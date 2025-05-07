import Select from 'react-select'
import { customSelectStyles } from '../../helpers/Constants'
import { getArrayForSelects, getElementForSelect } from "../../helpers/Functions"

export default function ProductsSelect({ options, defaultLabel, selectedOption, handleSelectChange }) {
  return (
    <div>
      <Select
        styles={customSelectStyles}
        value={getElementForSelect(selectedOption, (product) => product.name)}
        onChange={handleSelectChange}
        options={getArrayForSelects(options, (product) => product.name)}
        placeholder={defaultLabel}
        isSearchable={true}
      />
    </div>
  )
}