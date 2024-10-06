/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import SectionHeader from '../../SectionHeader'
import { FaListAlt } from 'react-icons/fa'
import ListaEntradas from './ListaEntradas'
import { useInputs } from '../../../hooks/Inputs/useInputs'
import Select from 'react-select'
import { useSelector } from 'react-redux'
import { today } from '../../../helpers/DatePickerFunctions'
import { customSelectStyles } from '../../../helpers/Constants'
import BranchAndCustomerSelect from '../../Select/BranchAndCustomerSelect'
import { useLoading } from '../../../hooks/loading'
import Loading from '../../Loading'
import { ToastDanger } from '../../../helpers/toastify'
import { useBranchCustomerProductPrice } from '../../../hooks/Prices/useBranchCustomerProductPrice'
import { useAddInput } from '../../../hooks/Inputs/useAddInput'

export default function Entradas({ branchAndCustomerSelectOptions, products, date: dateParams, roles, selectedProduct, setSelectedProduct, setSelectedProductToNull  }) {

  const { company, currentUser } = useSelector((state) => state.user)
  const [inputFormData, setInputFormData] = useState({})
  const {
    inputs,
    totalWeight,
    pushInput,
    spliceInput,
    updateLastInputId,
    loading: prodLoading
  } = useInputs({ companyId: company._id, date: dateParams })
  const { addInput } = useAddInput()
  const [inputsIsOpen, setInputsIsOpen] = useState(false)
  const [selectedCustomerBranchOption, setSelectedCustomerBranchOption] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState('')
  const { price } = useBranchCustomerProductPrice({ branchCustomerId: selectedCustomerBranchOption ? selectedCustomerBranchOption.value : null, productId: selectedProduct ? selectedProduct.value : null, date: dateParams, group: selectedGroup == '' ? null : selectedGroup })
  const [amount, setAmount] = useState('$0.00')
  const [loading, setLoading] = useState(false)

  const isLoading = useLoading(prodLoading, loading)

  const generarMonto = () => {

    const priceInput = document.getElementById('input-price')
    const weightInput = document.getElementById('input-weight')

    const price = parseFloat(priceInput.value == '' ? priceInput.placeholder : priceInput.value)
    const weight = parseFloat(weightInput.value != '' ? weightInput.value : '0.0')

    setAmount((price * weight).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }))
  }

  useEffect(() => {

    generarMonto()

  }, [price])

  const inputButtonControl = () => {

    const weightInput = document.getElementById('input-weight')
    const piecesInput = document.getElementById('input-pieces')
    const button = document.getElementById('input-button')

    let filledInputs = true

    if (piecesInput.value == '') {

      filledInputs = false

    }

    if (weightInput.value == '') {

      filledInputs = false
    }

    if (filledInputs && selectedCustomerBranchOption != null && selectedProduct != null && !loading) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  useEffect(inputButtonControl, [selectedProduct, selectedCustomerBranchOption, loading])

  if (isLoading) {

    return <Loading></Loading>
  }




  const changeInputsIsOpenValue = (value) => {

    setInputsIsOpen(value)
  }

  const handleProductSelectChange = (product) => {

    setSelectedProduct(product)
  }

  const handleInputInputsChange = (e) => {

    generarMonto()

    setInputFormData({

      ...inputFormData,
      [e.target.name]: e.target.value,

    })
  }

  const addInputSubmit = async (e) => {

    const piecesInput = document.getElementById('input-pieces')
    const weightInput = document.getElementById('input-weight')
    const commentInput = document.getElementById('input-comment')
    const priceInput = document.getElementById('input-price')
    const date = today(dateParams) ? new Date().toISOString() : new Date(dateParams).toISOString()

    e.preventDefault()

    setLoading(true)

    try {

      const { weight, pieces } = inputFormData

      const group = selectedGroup == 'Sucursales' ? 'branch' : 'customer'

      let input = {}

      if (group == 'branch') {

        input = {
          price,
          amount: parseFloat(amount.replace(/[$,]/g, '')),
          comment: commentInput.value == '' ? 'Todo bien' : commentInput.value,
          weight: parseFloat(weight),
          pieces: parseFloat(pieces),
          specialPrice: priceInput.value == '' ? false : true,
          company: company._id,
          product: selectedProduct,
          employee: currentUser,
          branch: selectedCustomerBranchOption,
          createdAt: date
        }

      } else {

        input = {
          price,
          amount: parseFloat(amount.replace(/[$,]/g, '')),
          comment: commentInput.value == '' ? 'Todo bien' : commentInput.value,
          weight: parseFloat(weight),
          pieces: parseFloat(pieces),
          specialPrice: priceInput.value == '' ? false : true,
          company: company._id,
          product: selectedProduct,
          employee: currentUser,
          customer: selectedCustomerBranchOption,
          createdAt: date
        }
      }

      addInput({ input, group, pushInput, spliceInput, updateLastInputId })

      piecesInput.value = ''
      weightInput.value = ''
      setSelectedProductToNull()
      priceInput.value = ''

      setLoading(false)

    } catch (error) {

      ToastDanger(error.message)
      setLoading(false)

    }
  }


  const handleBranchCustomerSelectChange = (option) => {

    const group = branchAndCustomerSelectOptions.find(g => g.options.some(opt => opt.value === option.value));
    setSelectedGroup(group ? group.label : '');
    setSelectedCustomerBranchOption(option)
  }



  return (
    <div>

      <div className='border bg-white p-3 mt-4'>

        <div className='grid grid-cols-3'>
          <SectionHeader label={'Entradas'} />
          <div className="h-10 w-10 shadow-lg justify-self-end">
            <button className="w-full h-full" onClick={() => { setInputsIsOpen(true) }}><FaListAlt className="h-full w-full text-red-600" />
            </button>
          </div>
          <p className='font-bold text-lg text-red-700 text-center'>{totalWeight ? totalWeight.toFixed(2) : '0.00' + ' Kg'}</p>
        </div>

        <form onSubmit={addInputSubmit} className="flex flex-col space-y-2">

          <div>

            <BranchAndCustomerSelect defaultLabel={'Sucursal o Cliente'} options={branchAndCustomerSelectOptions} selectedOption={selectedCustomerBranchOption} handleSelectChange={handleBranchCustomerSelectChange}></BranchAndCustomerSelect>
          </div>

          <div>
            <Select
              styles={customSelectStyles}
              value={selectedProduct}
              onChange={handleProductSelectChange}
              options={products}
              placeholder={'Producto'}
              isSearchable={true}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">

            <div className='relative'>
              <input type="number" name="pieces" id="input-pieces" placeholder='0.00' step={0.01} className='w-full border border-black p-3 rounded-lg' required onInput={inputButtonControl} onChange={handleInputInputsChange} />
              <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Piezas <span>*</span>
              </label>
            </div>

            <div className='relative'>
              <input type="number" name="weight" id="input-weight" placeholder='0.000 kg' step={0.001} className='w-full border border-black p-3 rounded-lg' required onInput={inputButtonControl} onChange={handleInputInputsChange} />
              <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Kilos <span>*</span>
              </label>
            </div>

            <div className='relative items-center'>
              <span className="absolute text-red-700 font-semibold left-3 top-3">$</span>
              <input className='pl-6 w-full rounded-lg p-3 text-red-700 font-semibold border border-red-600' name='price' id='input-price' step={0.01} placeholder={price.toFixed(2)} type="number" onChange={handleInputInputsChange} />
              <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Precio <span>*</span>
              </label>
            </div>

          </div>

          <div className='grid grid-cols-4 gap-1'>

            <input className='col-span-3 text-sm border border-black rounded-lg p-3' name="comment" id="input-comment" placeholder='Comentario del producto (Opcional)' onChange={handleInputInputsChange}></input>

            <div className='relative'>
              <p type="text" name="amount" id="input-amount" className='text-green-700 w-full border border-black rounded-md p-3' >{amount}</p>
              <label htmlFor="compact-input" className=" -translate-y-full px-1 absolute top-1/4 left-2 rounded-sm bg-white text-green-700 text-sm font-bold">
                Total
              </label>
            </div>
          </div>

          <button type='submit' id='input-button' disabled className='bg-slate-500 text-white p-3 rounded-lg col-span-12 mt-8'>Agregar</button>

        </form>
      </div>

      <ListaEntradas inputs={inputs} totalWeight={totalWeight} spliceInput={spliceInput} changeInputsIsOpenValue={changeInputsIsOpenValue} inputsIsOpen={inputsIsOpen} roles={roles}></ListaEntradas>

    </div>
  )
}
