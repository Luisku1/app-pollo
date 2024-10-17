/* eslint-disable react/prop-types */
import { useState } from 'react'

export default function MoneyInput({ onChange }) {

  const [currencyValue, setCurrencyValue] = useState('')

  const handleOnChange = (e) => {
    let newValue = e.target.value;

    setCurrencyValue(newValue);
    onChange(newValue);
  };

  return (
    <input
      className='border border-black p-3 rounded-md w-full'
      type="text"
      name=""
      id=""
      onFocus={(e) => { e.target.select() }}
      value={currencyValue}
      onChange={handleOnChange}
    />
  )
}
