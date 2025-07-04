/* eslint-disable react/prop-types */
import SectionHeader from "../../SectionHeader"
import { useEffect, useState } from "react"
import ListaSalidas from "./ListaSalidas"
import { useOutput } from "../../../hooks/Outputs/useOutput"
import { useSelector } from "react-redux"
import Select from 'react-select'
import { customSelectStyles } from "../../../helpers/Constants"
import { isToday } from "../../../helpers/DatePickerFunctions"
import BranchAndCustomerSelect from "../../Select/BranchAndCustomerSelect"
import { ToastDanger } from "../../../helpers/toastify"
import { useBranchCustomerProductPrice } from "../../../hooks/Prices/useBranchCustomerProductPrice"
import { getArrayForSelects, getElementForSelect, priceShouldNotBeZero } from "../../../helpers/Functions"
import ShowListModal from "../../Modals/ShowListModal"
import { useBranches } from '../../../hooks/Branches/useBranches'
import { useCustomers } from '../../../hooks/Customers/useCustomers'
import { useProducts } from '../../../hooks/Products/useProducts'

export default function Salidas({ selectedProduct, setSelectedProduct, setSelectedProductToNull }) {

  const { company, currentUser } = useSelector((state) => state.user)
  const [outputFormData, setOutputFormData] = useState({})
  const {
    outputs,
    totalWeight,
    onAddOutput,
    totalAmount,
    onDeleteOutput
  } = useOutput({ companyId: company._id, date })
  const [selectedCustomerBranchOption, setSelectedCustomerBranchOption] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState('');
  const { price, loading: priceIsLoading } = useBranchCustomerProductPrice({ branchCustomerId: selectedCustomerBranchOption ? selectedCustomerBranchOption.value : null, productId: selectedProduct ? selectedProduct.value : null, date, group: selectedGroup == '' ? null : selectedGroup })
  const [amount, setAmount] = useState('$0.00')
  const [loading, setLoading] = useState(false)
  const [isRegisteredInSurplus, setIsRegisteredInSurplus] = useState(false);

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

  const generarMonto = () => {

    const priceInput = document.getElementById('output-price')
    const weightInput = document.getElementById('output-weight')

    const price = parseFloat(priceInput.value == '' ? priceInput.placeholder : priceInput.value)
    const weight = parseFloat(weightInput.value != '' ? weightInput.value : '0.0')

    setAmount((price * weight).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }))
  }

  const outputButtonControl = () => {

    const weightInput = document.getElementById('output-weight')
    const piecesInput = document.getElementById('output-pieces')
    const button = document.getElementById('outputButton')

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

  const handleOutputInputsChange = (e) => {

    generarMonto()

    setOutputFormData({

      ...outputFormData,
      [e.target.name]: e.target.value,

    })
  }

  useEffect(() => {

    generarMonto()

  }, [price])

  useEffect(outputButtonControl, [selectedProduct, selectedCustomerBranchOption, loading, priceIsLoading])

  const addOutputSubmitButton = async (e) => {

    const piecesInput = document.getElementById('output-pieces')
    const weightInput = document.getElementById('output-weight')
    const commentInput = document.getElementById('output-comment')
    const priceInput = document.getElementById('output-price')
    const createdAt = isToday(date) ? new Date().toISOString() : new Date(date).toISOString()

    e.preventDefault()

    if (priceInput.value != '' ? priceInput.value == 0 : price == 0) {

      priceShouldNotBeZero()
      return
    }

    setLoading(true)

    const finalPrice = priceInput.value != '' ? priceInput.value : price

    try {

      const { weight, pieces } = outputFormData


      const group = selectedGroup == 'Sucursales' ? 'branch' : 'customer'
      let output = {}

      if (group == 'branch') {

        output = {
          price: finalPrice,
          amount: parseFloat(amount.replace(/[$,]/g, '')),
          comment: commentInput.value == '' ? 'Todo bien' : commentInput.value,
          weight: parseFloat(weight),
          pieces: parseFloat(pieces),
          specialPrice: priceInput.value == '' ? false : true,
          company: company._id,
          product: selectedProduct,
          employee: currentUser,
          fromStock: isRegisteredInSurplus,
          branch: selectedCustomerBranchOption,
          createdAt: createdAt
        }

      } else {

        output = {
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
          createdAt: createdAt
        }
      }

      onAddOutput(output, group)

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

  // Estado interno para el producto seleccionado
  const [internalSelectedProduct, setInternalSelectedProduct] = useState(selectedProduct);

  // Sincroniza el estado interno cuando cambia el del padre
  useEffect(() => {
    setInternalSelectedProduct(selectedProduct);
  }, [selectedProduct]);

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

  return (
    <div>
      <div className='border rounded-md p-3 mt-4'>
        <div className='grid grid-cols-2'>
          <SectionHeader label={'Salidas'} />
          <div className='flex items-center gap-4 justify-self-end mr-12'>
            <ShowListModal
              title={'Salidas'}
              ListComponent={ListaSalidas}
              ListComponentProps={{ outputs, totalWeight, totalAmount, onDelete: onDeleteOutput }}
              clickableComponent={<p className='font-bold text-lg text-center border border-header rounded-lg p-1'>{(totalWeight ? totalWeight.toFixed(2) : '0.00') + ' Kg'}</p>}
            />
          </div>
        </div>
        <form onSubmit={addOutputSubmitButton} className="flex flex-col space-y-2">
          <div>
            <BranchAndCustomerSelect options={branchAndCustomerSelectOptions} defaultLabel={'Sucursal o Cliente'} selectedOption={selectedCustomerBranchOption} handleSelectChange={handleBranchCustomerSelectChange}></BranchAndCustomerSelect>
          </div>
          <div className=" border-black rounded-lg">
            <Select
              styles={customSelectStyles}
              onChange={handleProductSelectChange}
              value={getElementForSelect(internalSelectedProduct, (product) => product.name)}
              options={getArrayForSelects(products, (product) => product.name)}
              placeholder={'Producto'}
              isSearchable={true}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="relative">
              <input type="number" name="pieces" id="output-pieces" placeholder='0.00' step={0.01} className='border border-black p-3 rounded-lg w-full' required onInput={outputButtonControl} onChange={handleOutputInputsChange} />
              <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Piezas <span>*</span>
              </label>
            </div>
            <div className="relative">
              <input type="number" name="weight" id="output-weight" placeholder='0.000 kg' step={0.001} className='border border-black p-3 rounded-lg w-full' required onInput={outputButtonControl} onChange={handleOutputInputsChange} />
              <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Kilos <span>*</span>
              </label>
            </div>
            <div className="relative">
              <span className="absolute text-red-700 font-semibold left-3 top-3">$</span>
              <input className='pl-6 w-full rounded-lg p-3 text-red-700 font-semibold border border-red-600' name='price' placeholder={price.toFixed(2)} id='output-price' step={0.01} type="number" onChange={(e) => { handleOutputInputsChange(e), generarMonto() }} />
              <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Precio
              </label>
            </div>
          </div>
          <div className='grid grid-cols-4 gap-1'>
            <input className='col-span-3 text-sm border border-black rounded-lg p-3 ' name="comment" id="output-comment" placeholder='Comentario del producto (Opcional)' onChange={handleOutputInputsChange}></input>
            <div className='relative'>
              <p type="text" name="amount" id="output-amount" className='text-green-700 bg-gray-100 w-full border border-black rounded-md p-3' >{amount}</p>
              <label htmlFor="compact-input" className=" -translate-y-full px-1 absolute top-1/4 left-2 rounded-sm bg-white text-green-700 text-sm font-bold">
                Total
              </label>
            </div>
          </div>
          {selectedGroup === 'Sucursales' && (
            <div className="flex items-center gap-4 mt-4">
              <input
                type="checkbox"
                id="isRegisteredInSurplus"
                name="isRegisteredInSurplus"
                className="w-6 h-6 accent-blue-600"
                checked={isRegisteredInSurplus}
                onChange={(e) => setIsRegisteredInSurplus(e.target.checked)}
              />
              <label htmlFor="isRegisteredInSurplus" className="text-lg font-bold w-full">
                ¿Está registrada en el sobrante?
              </label>
            </div>
          )}
          <button type='submit' id='outputButton' disabled className='bg-button text-white p-3 rounded-lg col-span-12 mt-8'>Agregar</button>
        </form>
      </div>
    </div>
  )
}
