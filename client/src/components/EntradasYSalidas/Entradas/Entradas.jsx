/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import SectionHeader from '../../SectionHeader'
import { useInputs } from '../../../hooks/Inputs/useInputs'
import Select from 'react-select'
import { useSelector } from 'react-redux'
import { isToday } from '../../../helpers/DatePickerFunctions'
import { customSelectStyles } from '../../../helpers/Constants'
import BranchAndCustomerSelect from '../../Select/BranchAndCustomerSelect'
import { ToastDanger } from '../../../helpers/toastify'
import { useBranchCustomerProductPrice } from '../../../hooks/Prices/useBranchCustomerProductPrice'
import { getArrayForSelects, getElementForSelect, priceShouldNotBeZero } from '../../../helpers/Functions'
import ShowListModal from '../../Modals/ShowListModal'
import ListaEntradas from './ListaEntradas'
import { useDate } from '../../../context/DateContext'
import { useBranches } from '../../../hooks/Branches/useBranches'
import { useCustomers } from '../../../hooks/Customers/useCustomers'
import { useProducts } from '../../../hooks/Products/useProducts'
import { useCurrencyInput } from '../../../hooks/InputHooks/useCurrency';

export default function Entradas({ selectedProduct, setSelectedProduct, setSelectedProductToNull }) {

  const { company, currentUser } = useSelector((state) => state.user)
  const { currentDate: date } = useDate()
  const [inputFormData, setInputFormData] = useState({})
  const {
    inputs,
    totalWeight,
    onDeleteInput,
    totalAmount,
    onAddInput,
  } = useInputs({ companyId: company._id, date })
  const {
    branches
  } = useBranches({ companyId: company._id })
  const {
    customers
  } = useCustomers({ companyId: company._id })
  const {
    products
  } = useProducts({ companyId: company._id })

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

  const [selectedCustomerBranchOption, setSelectedCustomerBranchOption] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState('')
  const { price, loading: priceIsLoading } = useBranchCustomerProductPrice({ branchCustomerId: selectedCustomerBranchOption ? selectedCustomerBranchOption.value : null, productId: selectedProduct?._id || null, date, group: selectedGroup == '' ? null : selectedGroup })
  const [amount, setAmount] = useState('$0.00')
  const [loading, setLoading] = useState(false)
  const [isRegisteredInSurplus, setIsRegisteredInSurplus] = useState(false)
  const [changePrice, setChangePrice] = useState(false)

  // Estado interno para el producto seleccionado
  const [internalSelectedProduct, setInternalSelectedProduct] = useState(selectedProduct);

  // Sincroniza el estado interno cuando cambia el del padre
  useEffect(() => {
    setInternalSelectedProduct(selectedProduct);
  }, [selectedProduct]);

  const priceCurrency = useCurrencyInput(price ? price : '');

  const generarMonto = () => {
    const weightInput = document.getElementById('input-weight')
    const priceValue = priceCurrency.raw ?? price;
    const weight = parseFloat(weightInput.value != '' ? weightInput.value : '0.0')
    setAmount((priceValue * weight).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }))
  }

  const inputButtonControl = () => {

    const weightInput = document.getElementById('input-weight')
    const piecesInput = document.getElementById('input-pieces')
    const button = document.getElementById('input-button')

    if (!weightInput || !piecesInput || !button) return

    let filledInputs = true

    if (piecesInput.value == '') {

      filledInputs = false

    }

    if (weightInput.value == '') {

      filledInputs = false
    }

    if (filledInputs && selectedCustomerBranchOption != null && !priceIsLoading && selectedProduct != null && !loading) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  const handleInputInputsChange = (e) => {
    generarMonto()
    setInputFormData({
      ...inputFormData,
      [e.target.name]: e.target.value,
    })
  }

  useEffect(() => {

    if (!selectedProduct) return
    if (!selectedCustomerBranchOption) return
    if (priceIsLoading) return
    if (price === null || price === undefined) {
      setInputFormData({
        ...inputFormData,
        price: ''
      })
      return
    }

    setInputFormData({
      ...inputFormData,
      price: price,
    })

    generarMonto()

  }, [price])

  useEffect(inputButtonControl, [selectedProduct, selectedCustomerBranchOption, loading, priceIsLoading])

  const addInputSubmit = async (e) => {

    const piecesInput = document.getElementById('input-pieces')
    const weightInput = document.getElementById('input-weight')
    const commentInput = document.getElementById('input-comment')
    const priceInput = document.getElementById('input-price')
    const createdAt = isToday(date) ? new Date().toISOString() : new Date(date).toISOString()

    if (priceInput.value != '' ? priceInput.value == 0 : price == 0) {

      priceShouldNotBeZero()
      return
    }

    e.preventDefault()

    let finalPrice = 0

    if (priceInput.value != '' && changePrice) {
    finalPrice = priceInput.value
    } else {
      finalPrice = price
    }

    setLoading(true)

    try {

      const { weight, pieces } = inputFormData

      const group = selectedGroup == 'Sucursales' ? 'branch' : 'customer'
      let input = {}

      if (group == 'branch') {

        input = {
          price: finalPrice,
          amount: parseFloat(amount.replace(/[$,]/g, '')),
          comment: commentInput.value == '' ? 'Todo bien' : commentInput.value,
          weight: parseFloat(weight),
          pieces: parseFloat(pieces),
          specialPrice: priceInput.value == '' ? false : true,
          company: company._id,
          product: selectedProduct,
          addInStock: isRegisteredInSurplus,
          employee: currentUser,
          branch: selectedCustomerBranchOption,
          createdAt
        }

      } else {

        input = {
          price: finalPrice,
          amount: parseFloat(amount.replace(/[$,]/g, '')),
          comment: commentInput.value == '' ? 'Todo bien' : commentInput.value,
          weight: parseFloat(weight),
          pieces: parseFloat(pieces),
          specialPrice: priceInput.value == '' ? false : true,
          company: company._id,
          product: selectedProduct,
          employee: currentUser,
          customer: selectedCustomerBranchOption,
          createdAt
        }
      }

      onAddInput(input, group)

      piecesInput.value = ''
      weightInput.value = ''
      priceInput.value = ''
      setSelectedProductToNull()
      setLoading(false)

    } catch (error) {

      ToastDanger(error.message)
      setLoading(false)

    }
  }

  // Cuando cambia el select, actualiza ambos estados
  const handleProductSelectChange = (product) => {
    setInternalSelectedProduct(product);
    setSelectedProduct(product);
  }

  const handleBranchCustomerSelectChange = (option) => {

    const group = branchAndCustomerSelectOptions.find(g => g.options.some(opt => opt.value === option.value));
    setSelectedGroup(group ? group.label : '');
    setSelectedCustomerBranchOption(option)
  }

  const onChangeCheck = (e) => {

    const priceInput = document.getElementById('input-price');
    setChangePrice(e.target.checked)

    if (e.target.checked) {
      priceInput.classList.remove('bg-gray-200');
      priceInput.classList.add('bg-white');
      priceInput.disabled = false;
      priceInput.focus();
    } else {
      priceInput.classList.add('bg-gray-200');
      priceInput.classList.remove('bg-white');
      priceInput.disabled = true;
      setInputFormData({
        ...inputFormData,
        price: ''
      });
    }
    generarMonto();
  }

  return (
    <div>
      <div className='border rounded-md p-3'>
        <div className='grid grid-cols-2'>
          <SectionHeader label={'Entradas'} />
          <div className='flex items-center gap-4 justify-self-end mr-12'>
            <ShowListModal
              title={'Entradas'}
              ListComponent={ListaEntradas}
              ListComponentProps={{ inputs, totalWeight, totalAmount, onDelete: onDeleteInput }}
              clickableComponent={<p className='font-bold text-lg text-center border border-header rounded-lg p-1'>{(totalWeight ? totalWeight.toFixed(2) : '0.00') + ' Kg'}</p>}
            />
          </div>
        </div>
        <form onSubmit={addInputSubmit} className="flex flex-col space-y-2">
          <div>
            <BranchAndCustomerSelect defaultLabel={'Sucursal o Cliente'} options={branchAndCustomerSelectOptions} selectedOption={selectedCustomerBranchOption} handleSelectChange={handleBranchCustomerSelectChange}></BranchAndCustomerSelect>
          </div>
          <div>
            <Select
              styles={customSelectStyles}
              value={getElementForSelect(internalSelectedProduct, (product) => product.name)}
              onChange={handleProductSelectChange}
              options={getArrayForSelects(products, (product) => product.name)}
              placeholder={'Producto'}
              isSearchable={true}
            />
          </div>
          {/* Nuevo bloque para precio y cambiar precio */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative w-1/2">
              <span className="absolute text-red-700 font-semibold left-3 top-3">$</span>
              <input
                {...priceCurrency.bind}
                className='pl-6 w-full rounded-lg p-3 text-red-700 font-semibold border border-red-600'
                name='price'
                id='input-price'
                step={0.01}
                placeholder={price.toFixed(2)}
                type="text"
                onBlur={generarMonto}
                disabled={!changePrice}
              />
              <label htmlFor="input-price" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Precio
              </label>
            </div>
            <div className={`flex items-center gap-2 w-1/2 rounded-lg p-2 transition-colors duration-200 ${!changePrice ? 'bg-gray-100' : 'bg-white'}`}>
              <input
                type="checkbox"
                id="changePriceInput"
                name="changePriceInput"
                className="w-5 h-5 accent-blue-600"
                checked={changePrice}
                onChange={(e) => setChangePrice(e.target.checked)}
              />
              <label htmlFor="changePriceInput" className="text-md font-semibold">
                Cambiar precio
              </label>
            </div>
          </div>
          {/* Fin bloque precio */}
          <div className="grid grid-cols-3 gap-2">
            <div className='relative'>
              <input type="number" name="pieces" id="input-pieces" placeholder='0.00' step={0.01} className='w-full border border-black p-3 rounded-lg' required onInput={inputButtonControl} onChange={handleInputInputsChange} />
              <label htmlFor="input-pieces" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Piezas <span>*</span>
              </label>
            </div>
            <div className='relative'>
              <input type="number" name="weight" id="input-weight" placeholder='0.000 kg' step={0.001} className='w-full border border-black p-3 rounded-lg' required onInput={inputButtonControl} onChange={handleInputInputsChange} />
              <label htmlFor="input-weight" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Kilos <span>*</span>
              </label>
            </div>
            {/* Campo de amount ahora aquí */}
            <div className='relative items-center'>
              <p type="text" name="amount" id="input-amount" className='text-green-700 bg-gray-100 w-full border border-black rounded-md p-3' >{amount}</p>
              <label htmlFor="input-amount" className=" -translate-y-full px-1 absolute top-1/4 left-2 rounded-sm bg-white text-green-700 text-sm font-bold">
                Total
              </label>
            </div>
          </div>
          {/* Comentario ocupa todo el espacio */}
          <div className='w-full'>
            <input className='w-full text-sm border border-black rounded-lg p-3' name="comment" id="input-comment" placeholder='Comentario del producto (Opcional)' onChange={handleInputInputsChange}></input>
          </div>
          {selectedGroup === 'Sucursales' && (
            <div className="flex items-center gap-4 mt-4 w-full">
              <input
                type="checkbox"
                id="isRegisteredInSurplusInputs"
                name="isRegisteredInSurplusInputs"
                className="w-6 h-6 accent-blue-600"
                checked={isRegisteredInSurplus}
                onChange={(e) => setIsRegisteredInSurplus(e.target.checked)}
              />
              <label htmlFor="isRegisteredInSurplusInputs" className="text-lg font-bold w-full">
                Agregar al sobrante
              </label>
            </div>
          )}
          <button type='submit' id='input-button' disabled className='bg-button text-white p-3 rounded-lg col-span-12 mt-8'>Agregar</button>
        </form>
      </div>
    </div>
  )
}
