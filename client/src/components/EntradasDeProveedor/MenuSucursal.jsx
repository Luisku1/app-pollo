/* eslint-disable react/prop-types */
import { useState } from 'react'
import BranchAndCustomerSelect from '../Select/BranchAndCustomerSelect'
import { useSelector } from 'react-redux'
import { useCreateProviderInput } from '../../hooks/ProviderInputs/useCreateProviderInput'
import Select from 'react-select'
import { customSelectStyles } from '../../helpers/Constants'
import { useBranchCustomerProductPrice } from '../../hooks/Prices/useBranchCustomerProductPrice'

export default function MenuSucursal({ branchAndCustomerSelectOptions, date, pushProviderInput, spliceProviderInput, selectedProduct }) {

  const { currentUser, company } = useSelector((state) => state.user)
  const [selectedBranchCustomerOption, setSelectedBranchCustomerOption] = useState(null)
  const { createProviderInput, loading: createInputLoading } = useCreateProviderInput()
  const [selectedGroup, setSelectedGroup] = useState('')
  const { price } = useBranchCustomerProductPrice({ branchCustomerId: selectedBranchCustomerOption ? selectedBranchCustomerOption.value : null, productId: selectedProduct ? selectedProduct.value : null, date, group: selectedGroup == '' ? null : selectedGroup })
  const [providerInputFormData, setProviderInputFormData] = useState({})

  const handleProviderInputInputsChange = (e) => {

    setProviderInputFormData({

      ...providerInputFormData,
      [e.target.id]: e.target.value,

    })
  }
  const handleBranchCustomerSelectChange = (option) => {

    const group = branchAndCustomerSelectOptions.find(g => g.options.some(opt => opt.value === option.value));
    setSelectedGroup(group ? group.label : '');
    setSelectedBranchCustomerOption(option)
  }

  const providerInputButtonControl = () => {

    const weightInput = document.getElementById('weight')
    const piecesInput = document.getElementById('pieces')
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

  const submitProviderInput = async (e) => {

    const piecesInput = document.getElementById('pieces')
    const weightInput = document.getElementById('weight')
    const priceInput = document.getElementById('price')
    const commentInput = document.getElementById('comment')
    const inputButton = document.getElementById('providerInputButton')

    e.preventDefault()

    const price = parseFloat(priceInput.value == '' ? priceInput.placeholder : priceInput.value)

    inputButton.disabled = true

    const {weight, pieces} = providerInputFormData

    const providerInput = {

      weight,
      amount: price * weight,
      price,
      pieces,
      comment: commentInput.value ? commentInput.value : 'Todo bien',
      specialPrice: priceInput == '' ? false : true,
      branchCustomer: selectedBranchCustomerOption,
      product: selectedProduct,
      company: company._id,
      employee: currentUser,
      createdAt: date
    }

    createProviderInput({ providerInput, pushProviderInput, spliceProviderInput })

    piecesInput.value = ''
    weightInput.value = ''
    commentInput.value = ''
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
        <input type="number" name="pieces" id="pieces" placeholder='Piezas' step={0.1} className='border border-black p-3 rounded-lg' required onInput={providerInputButtonControl} onChange={handleProviderInputInputsChange} />

        <input type="number" name="weight" id="weight" placeholder='0.000 kg' step={0.001} className='border border-black p-3 rounded-lg' required onInput={providerInputButtonControl} onChange={handleProviderInputInputsChange} />


        <div className="relative">
          <span className="absolute text-red-700 font-semibold left-3 top-3">$</span>
          <input className='pl-6 w-full rounded-lg p-3 text-red-700 font-semibold border border-red-600' name='price' placeholder={price.toFixed(2)} id='price' step={0.01} type="number" />
        </div>
      </div>

      <input type="text" className='border border-black rounded-lg p-3 mt-2' name="comment" id="comment" placeholder={'Comentario del producto (Opcional)'} onChange={handleProviderInputInputsChange}></input>
      <button type='submit' id='providerInputButton' disabled className='bg-slate-500 text-white p-3 rounded-lg col-span-4 mt-8'>Agregar</button>

    </form>
  )
}

