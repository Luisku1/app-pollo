/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import BranchAndCustomerSelect from '../Select/BranchAndCustomerSelect'
import { useSelector } from 'react-redux'
import { useCreateProviderInput } from '../../hooks/ProviderInputs/useCreateProviderInput'
import Select from 'react-select'
import { customSelectStyles } from '../../helpers/Constants'
import { useBranchCustomerProductPrice } from '../../hooks/Prices/useBranchCustomerProductPrice'

export default function MenuSucursal({ branchAndCustomerSelectOptions, date, pushProviderInput, spliceProviderInput, selectedProduct, updateLastProviderInputId }) {

  const { currentUser, company } = useSelector((state) => state.user)
  const [selectedBranchCustomerOption, setSelectedBranchCustomerOption] = useState(null)
  const { createProviderInput, loading: createInputLoading } = useCreateProviderInput()
  const [selectedGroup, setSelectedGroup] = useState('')
  const { price } = useBranchCustomerProductPrice({ branchCustomerId: selectedBranchCustomerOption ? selectedBranchCustomerOption.value : null, productId: selectedProduct ? selectedProduct.value : null, date, group: selectedGroup == '' ? null : selectedGroup })
  const [providerInputFormData, setProviderInputFormData] = useState({})
  const [amount, setAmount] = useState(0)

  const generarMonto = () => {

    const priceInput = document.getElementById('provider-input-price')
    const weightInput = document.getElementById('provider-input-weight')

    const price = parseFloat(priceInput.value == '' ? priceInput.placeholder : priceInput.value)
    const weight = parseFloat(weightInput.value != '' ? weightInput.value : '0.0')

    setAmount((price * weight).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }))
  }

  useEffect(() => {

    generarMonto()

  }, [price])

  const handleProviderInputInputsChange = (e) => {

    generarMonto()

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

    if (filledInputs && selectedBranchCustomerOption != null && !createInputLoading) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  useEffect(providerInputButtonControl, [createInputLoading, selectedBranchCustomerOption, selectedProduct])

  const submitProviderInput = async (e) => {

    const piecesInput = document.getElementById('provider-input-pieces')
    const weightInput = document.getElementById('provider-input-weight')
    const priceInput = document.getElementById('provider-input-price')
    const commentInput = document.getElementById('provider-input-comment')
    const inputButton = document.getElementById('providerInputButton')

    e.preventDefault()

    const price = parseFloat(priceInput.value == '' ? priceInput.placeholder : priceInput.value)

    inputButton.disabled = true

    const { weight, pieces } = providerInputFormData

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
        employee: currentUser,
        createdAt: date
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
        employee: currentUser,
        customer: selectedBranchCustomerOption,
        createdAt: date
      }
    }

    createProviderInput({ providerInput, group, pushProviderInput, spliceProviderInput, updateLastProviderInputId })

    piecesInput.value = ''
    weightInput.value = ''
    commentInput.value = ''
    generarMonto()
    inputButton.disabled = false
  }


  return (

    <form onSubmit={submitProviderInput} className="flex flex-col space-y-2">

      <Select
        options={[]}
        styles={customSelectStyles}
        placeholder={'Proveedor'}
      />

      <BranchAndCustomerSelect options={branchAndCustomerSelectOptions} defaultLabel={'Sucursal o Cliente'} selectedOption={selectedBranchCustomerOption} handleSelectChange={handleBranchCustomerSelectChange}></BranchAndCustomerSelect>

      <div className='grid grid-cols-3 gap-2'>

        <div className='relative'>
          <input type="number" name="pieces" id="provider-input-pieces" placeholder='0.00' step={0.01} className='border border-black p-3 rounded-lg w-full' required onInput={providerInputButtonControl} onChange={handleProviderInputInputsChange} />
          <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
            Piezas <span>*</span>
          </label>
        </div>

        <div className='relative'>
          <input type="number" name="weight" id="provider-input-weight" placeholder='0.000 kg' step={0.001} className='border border-black p-3 rounded-lg w-full' required onInput={providerInputButtonControl} onChange={handleProviderInputInputsChange} />
          <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
            Kilos <span>*</span>
          </label>
        </div>


        <div className="relative">
          <span className="absolute text-red-700 font-semibold left-3 top-3">$</span>
          <input className='pl-6 w-full rounded-lg p-3 text-red-700 font-semibold border border-red-600' name='price' placeholder={price.toFixed(2)} onChange={() => {generarMonto()}} id='provider-input-price' step={0.01} type="number" />
          <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
            Precio
          </label>
        </div>
      </div>

      <div className='grid grid-cols-4 gap-1'>

        <input className='col-span-3 text-sm border border-black rounded-lg p-3' name="comment" id="provider-input-comment" placeholder='Comentario del producto (Opcional)' onChange={handleProviderInputInputsChange}></input>

        <div className='relative'>
          <p type="text" name="amount" id="input-amount" className='text-green-700 w-full border border-black rounded-md p-3' >{amount}</p>
          <label htmlFor="compact-input" className=" -translate-y-full px-1 absolute top-1/4 left-2 rounded-sm bg-white text-green-700 text-sm font-bold">
            Total
          </label>
        </div>
      </div>
      <button type='submit' id='providerInputButton' disabled className='bg-slate-500 text-white p-3 rounded-lg col-span-4 mt-8'>Agregar</button>

    </form>
  )
}

