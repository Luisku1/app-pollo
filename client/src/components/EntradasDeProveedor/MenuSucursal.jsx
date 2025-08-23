// Permite enviar el formulario con Enter en los campos relevantes
const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (e.target.form) {
      e.target.form.requestSubmit();
    }
  }
};
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import BranchAndCustomerSelect from '../Select/BranchAndCustomerSelect'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import { customSelectStyles } from '../../helpers/Constants'
import { useBranchCustomerProductPrice } from '../../hooks/Prices/useBranchCustomerProductPrice'
import { ToastDanger, ToastInfo } from '../../helpers/toastify'
import { useDateNavigation } from '../../hooks/useDateNavigation'
import { useBranches } from '../../hooks/Branches/useBranches'
import { useCustomers } from '../../hooks/Customers/useCustomers'
import { getArrayForSelects } from '../../helpers/Functions'
import { calculateAmount } from '../../../../common/calculateAmount'
import { useProviders } from '../../hooks/Providers/useProviders';

export default function MenuSucursal({ selectedProduct, onAddProviderInput, registerDate }) {

  const { currentDate: date, dateFromYYYYMMDD, today } = useDateNavigation();
  const { currentUser, company } = useSelector((state) => state.user)
  const [selectedBranchCustomerOption, setSelectedBranchCustomerOption] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState('')
  const { price: lastPrice } = useBranchCustomerProductPrice({ branchCustomerId: selectedBranchCustomerOption ? selectedBranchCustomerOption.value : null, productId: selectedProduct ? selectedProduct._id : null, date, group: selectedGroup == '' ? null : selectedGroup })
  const [providerInputFormData, setProviderInputFormData] = useState({})
  const [amount, setAmount] = useState(0)

  const {
    branches
  } = useBranches({ companyId: company._id })
  const {
    providers
  } = useProviders(company._id)
  const {
    customers
  } = useCustomers({ companyId: company._id })

  const branchAndCustomerSelectOptions = [
    {
      label: 'Sucursales',
      options: getArrayForSelects(branches, (branch) => branch.branch)
    },
    {
      label: 'Clientes',
      options: getArrayForSelects(customers, (customer) => customer.name)
    }
  ]

  const generarMonto = () => {
    const priceInput = document.getElementById('provider-input-price');
    const piecesInput = document.getElementById('provider-input-pieces');
    const weightInput = document.getElementById('provider-input-weight');
    const byPieces = selectedProduct?.byPieces === true;
    const price = providerInputFormData.price !== undefined && providerInputFormData.price !== '' ? parseFloat(providerInputFormData.price) : lastPrice || 0;
    const weight = weightInput?.value !== '' ? parseFloat(weightInput.value) : 0;
    const pieces = piecesInput?.value !== '' ? parseFloat(piecesInput.value) : 0;
    if (price === 0) {
      ToastInfo('Recuerda verificar tu precio antes del registro');
      return;
    }
    const monto = calculateAmount(price, byPieces, weight, pieces);
    setAmount(monto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }));
  }

  useEffect(generarMonto, [providerInputFormData.price, providerInputFormData.weight, lastPrice])

  const handleProviderInputInputsChange = (e) => {
    setProviderInputFormData({
      ...providerInputFormData,
      [e.target.name]: e.target.value,
    })
  }

  const handleBranchCustomerSelectChange = (option) => {
    const group = branchAndCustomerSelectOptions.find(g => g.options.some(opt => opt.value === option.value));
    setSelectedGroup(group ? group.label : '');
    setSelectedBranchCustomerOption(option)
  }

  const providerInputButtonControl = () => {
    const weightInput = document.getElementById('provider-input-weight')
    const piecesInput = document.getElementById('provider-input-pieces')
    const button = document.getElementById('providerInputButton')

    let filledInputs = true

    if (piecesInput.value == '') {
      filledInputs = false
    }

    if (weightInput.value == '') {
      filledInputs = false
    }

    if (filledInputs && selectedBranchCustomerOption != null && selectedProduct != null) {
      button.disabled = false
    } else {
      button.disabled = true
    }
  }

  useEffect(providerInputButtonControl, [selectedBranchCustomerOption, selectedProduct])

  const resetData = () => {
    setProviderInputFormData({});
    setAmount(0);
    setSelectedBranchCustomerOption(null);
    const piecesInput = document.getElementById('provider-input-pieces');
    const weightInput = document.getElementById('provider-input-weight');
    const priceInput = document.getElementById('provider-input-price');
    const commentInput = document.getElementById('provider-input-comment');
    if (piecesInput) piecesInput.value = '';
    if (weightInput) weightInput.value = '';
    if (priceInput) priceInput.value = '';
    if (commentInput) commentInput.value = '';
  };

  const submitProviderInput = async (e) => {

    const priceInput = document.getElementById('provider-input-price')
    const commentInput = document.getElementById('provider-input-comment')
    const inputButton = document.getElementById('providerInputButton')

    e.preventDefault()

    try {
      const price = parseFloat(priceInput.value == '' ? priceInput.placeholder ?? 0 : priceInput.value ?? 0)
      inputButton.disabled = true
      const createdAt = registerDate ? registerDate : (today ? new Date().toISOString() : dateFromYYYYMMDD.toISOString())
      const { weight, pieces, provider } = providerInputFormData
      const group = selectedGroup == 'Sucursales' ? 'branch' : 'customer'

      let providerInput = {}

      if (group == 'branch') {
        providerInput = {
          weight: parseFloat(weight),
          amount: parseFloat(amount.replace(/[$,]/g, '')),
          price,
          comment: commentInput.value == '' ? 'Todo bien' : commentInput.value,
          pieces: parseFloat(pieces),
          specialPrice: priceInput.value == '' ? false : true,
          branch: selectedBranchCustomerOption,
          product: selectedProduct,
          company: company._id,
          provider: provider?.value || null,
          employee: currentUser,
          createdAt,
        }
      } else {
        providerInput = {
          price,
          amount: parseFloat(amount.replace(/[$,]/g, '')),
          comment: commentInput.value == '' ? 'Todo bien' : commentInput.value,
          weight: parseFloat(weight),
          pieces: parseFloat(pieces),
          specialPrice: priceInput.value == '' ? false : true,
          company: company._id,
          product: selectedProduct,
          provider: provider?.value || null,
          employee: currentUser,
          customer: selectedBranchCustomerOption,
          createdAt,
        }
      }

      if (price == 0 || amount == 0) {
        ToastDanger('El monto o precio no pueden tener un valor de $0.00')
        return
      }

      onAddProviderInput(providerInput, group)
      resetData();
      inputButton.disabled = false

    } catch (error) {
      resetData();
      console.log(error)
    }
  }

  return (
    <form onSubmit={submitProviderInput} className="flex flex-col space-y-2">
      <Select
        options={getArrayForSelects(providers, (provider) => provider.name)}
        onChange={(option) => setProviderInputFormData({ ...providerInputFormData, provider: option.value })}
        value={getArrayForSelects(providers, (provider) => provider.name).find(option => option.value === providerInputFormData.provider)}
        styles={customSelectStyles}
        placeholder={'Proveedor'}
      />
      <BranchAndCustomerSelect options={branchAndCustomerSelectOptions} defaultLabel={'Sucursal o Cliente'} selectedOption={selectedBranchCustomerOption} handleSelectChange={handleBranchCustomerSelectChange}></BranchAndCustomerSelect>
      <div className='grid grid-cols-3 gap-2'>
        <div className='relative'>
          <input type="number" name="pieces" id="provider-input-pieces" placeholder='0.00' step={0.01} className='border border-black p-3 rounded-lg w-full' required onInput={providerInputButtonControl} onChange={handleProviderInputInputsChange} onKeyDown={handleKeyDown} />
          <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
            Piezas <span>*</span>
          </label>
        </div>
        <div className='relative'>
          <input type="number" name="weight" id="provider-input-weight" placeholder='0.000 kg' step={0.001} className='border border-black p-3 rounded-lg w-full' required onInput={providerInputButtonControl} onChange={handleProviderInputInputsChange} onKeyDown={handleKeyDown} />
          <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
            Kilos <span>*</span>
          </label>
        </div>
        <div className="relative">
          <span className="absolute text-red-700 font-semibold left-3 top-3">$</span>
          <input className='pl-6 w-full rounded-lg p-3 text-red-700 font-semibold border border-red-600' name='price' placeholder={lastPrice.toFixed(2)} onChange={(e) => { handleProviderInputInputsChange(e); generarMonto() }} id='provider-input-price' step={0.01} type="number" onKeyDown={handleKeyDown} />
          <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
            Precio
          </label>
        </div>
      </div>
      <div className='grid grid-cols-4 gap-1'>
        <input className='col-span-3 text-sm border border-black rounded-lg p-3' name="comment" id="provider-input-comment" placeholder='Comentario del producto (Opcional)' onChange={handleProviderInputInputsChange} onKeyDown={handleKeyDown}></input>
        <div className='relative'>
          <p type="text" name="amount" id="input-amount" className='text-green-700 w-full border border-black rounded-md p-3' >{amount}</p>
          <label htmlFor="compact-input" className=" -translate-y-full px-1 absolute top-1/4 left-2 rounded-sm bg-white text-green-700 text-sm font-bold">
            Total
          </label>
        </div>
      </div>
      <button type='submit' id='providerInputButton' disabled className='bg-button text-white p-3 rounded-lg col-span-4 mt-8'>Agregar</button>
    </form>
  )
}

