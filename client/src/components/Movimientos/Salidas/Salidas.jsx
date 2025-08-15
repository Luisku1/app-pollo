/* eslint-disable react/prop-types */
import SectionHeader from "../../SectionHeader"
import { useEffect, useState, useRef } from "react"
import ListaSalidas from "./ListaSalidas"
import { useOutput } from "../../../hooks/Outputs/useOutput"
import { useSelector } from "react-redux"
import Select from 'react-select'
import { customSelectStyles } from "../../../helpers/Constants"
import BranchAndCustomerSelect from "../../Select/BranchAndCustomerSelect"
import { ToastDanger } from "../../../helpers/toastify"
import { useBranchCustomerProductPrice } from "../../../hooks/Prices/useBranchCustomerProductPrice"
import { currency, getArrayForSelects, getElementForSelect, priceShouldNotBeZero } from "../../../helpers/Functions"
import ShowListModal from "../../Modals/ShowListModal"
import { useCustomers } from "../../../hooks/Customers/useCustomers"
import { useBranches } from "../../../hooks/Branches/useBranches"
import { useProducts } from "../../../hooks/Products/useProducts"
import { useDateNavigation } from "../../../hooks/useDateNavigation"
import { calculateAmount } from "../../../../../common/calculateAmount";

export default function Salidas({ selectedProduct, setSelectedProduct, date: registerDate = undefined }) {

  const { company, currentUser } = useSelector((state) => state.user)
  const { currentDate: date, dateFromYYYYMMDD, today } = useDateNavigation();
  const [outputFormData, setOutputFormData] = useState({})
  const {
    outputs,
    totalWeight,
    onAddOutput,
    totalAmount,
    onDeleteOutput
  } = useOutput({ companyId: company._id, date })
  const [selectedCustomerBranchOption, setSelectedCustomerBranchOption] = useState(null)
  const [internalSelectedProduct, setInternalSelectedProduct] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState('');
  const { price: lastPrice, loading: priceIsLoading } = useBranchCustomerProductPrice({ branchCustomerId: selectedCustomerBranchOption ? selectedCustomerBranchOption.value : null, productId: internalSelectedProduct ? internalSelectedProduct._id : null, date, group: selectedGroup == '' ? null : selectedGroup })
  const [amount, setAmount] = useState('$0.00')
  const [loading, setLoading] = useState(false)
  const [isRegisteredInSurplus, setIsRegisteredInSurplus] = useState(false);
  const [changePrice, setChangePrice] = useState(false);

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
    const weightInput = document.getElementById('output-weight');
    const piecesInput = document.getElementById('output-pieces');
    const byPieces = internalSelectedProduct?.byPieces === true;
    const price = outputFormData.price !== undefined && outputFormData.price !== '' ? parseFloat(outputFormData.price) : parseFloat(lastPrice) || 0;
    const weight = weightInput?.value !== '' ? parseFloat(weightInput.value) : 0;
    const pieces = piecesInput?.value !== '' ? parseFloat(piecesInput.value) : 0;
    const monto = calculateAmount(price, byPieces, weight, pieces);
    setAmount(currency(monto));
  }

  useEffect(() => {
    if (selectedProduct) {
      setInternalSelectedProduct(selectedProduct)
    }
  }, [selectedProduct])

  const resetData = () => {
    setOutputFormData({});
    setSelectedProduct(null);
    setSelectedCustomerBranchOption(null);
    setAmount('$0.00');
    const piecesInput = document.getElementById('output-pieces');
    const weightInput = document.getElementById('output-weight');
    const priceInput = document.getElementById('output-price');
    const commentInput = document.getElementById('output-comment');
    if (piecesInput) piecesInput.value = '';
    if (weightInput) weightInput.value = '';
    if (priceInput) priceInput.value = '';
    if (commentInput) commentInput.value = '';
  };

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.target.form) {
        e.target.form.requestSubmit();
      }
    }
  };

  const handleOutputInputsChange = (e) => {
    setOutputFormData({
      ...outputFormData,
      [e.target.name]: e.target.value,
    })
  }

  useEffect(generarMonto, [outputFormData.price, outputFormData.weight, lastPrice])

  useEffect(outputButtonControl, [selectedProduct, selectedCustomerBranchOption, loading, priceIsLoading])

  const addOutputSubmitButton = async (e) => {

    const commentInput = document.getElementById('output-comment')
    const priceInput = document.getElementById('output-price')
    const createdAt = registerDate ? registerDate : today ? new Date().toISOString() : dateFromYYYYMMDD.toISOString()

    e.preventDefault()

    if (priceInput.value != '' ? priceInput.value == 0 : lastPrice == 0) {

      priceShouldNotBeZero()
      return
    }

    setLoading(true)

    const finalPrice = priceInput.value != '' ? priceInput.value : lastPrice

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

      onAddOutput(output, group);
      resetData();
      setLoading(false);

    } catch (error) {
      ToastDanger(error.message);
      resetData();
      setLoading(false);
    }
  }

  const handleProductSelectChange = (product) => {

    setSelectedProduct(product)
  }

  const handleBranchCustomerSelectChange = (option) => {

    const group = branchAndCustomerSelectOptions.find(g => g.options.some(opt => opt.value === option.value));
    setSelectedGroup(group ? group.label : '');
    setSelectedCustomerBranchOption(option)
  }

  // Smooth scroll on focus (mainly for mobile usability)
  const rootRef = useRef(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const handleFocusIn = (e) => {
      // Limit to inputs/selects/textareas or react-select pseudo input (role=combobox)
      const t = e.target;
      const tag = t.tagName;
      const isField = tag === 'INPUT' || tag === 'TEXTAREA' || t.getAttribute('role') === 'combobox';
      if (!isField) return;
      // Only auto-scroll on smaller screens to avoid disruptive jumps on desktop
      if (window.innerWidth >= 1024) return; // lg breakpoint
      // Use rAF to wait layout shifts (e.g., mobile keyboard)
      requestAnimationFrame(() => {
        try {
          t.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        } catch { /* ignore */ }
      });
    };
    el.addEventListener('focusin', handleFocusIn, { passive: true });
    return () => el.removeEventListener('focusin', handleFocusIn);
  }, []);

  return (
    <div ref={rootRef}>
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
          <div className=''>
            <div className="mb-2">
              <BranchAndCustomerSelect options={branchAndCustomerSelectOptions} defaultLabel={'Sucursal o Cliente'} selectedOption={selectedCustomerBranchOption} handleSelectChange={handleBranchCustomerSelectChange}></BranchAndCustomerSelect>
            </div>
            <div className=" border-black rounded-lg">
              <Select
                styles={customSelectStyles}
                onChange={(product) => {
                  handleProductSelectChange(product);
                  setInternalSelectedProduct(product);
                }}
                value={getElementForSelect(internalSelectedProduct ?? selectedProduct, (product) => product.name)}
                options={getArrayForSelects(products, (product) => product.name)}
                placeholder={'Producto'}
                isSearchable={true}
              />
            </div>
          </div>
          {/* Nuevo bloque para precio y cambiar precio */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative w-1/2">
              <span className={`absolute text-red-700 font-semibold left-3 top-3`}>$</span>
              <input
                className={`pl-6 w-full ${!changePrice ? 'bg-gray-100' : 'bg-white'} rounded-lg p-3 text-red-700 font-semibold border border-red-600`}
                name='price'
                placeholder={lastPrice.toFixed(2)}
                id='output-price'
                step={0.01}
                type="number"
                disabled={!changePrice}
                onKeyDown={handleKeyDown}
              />
              <label htmlFor="output-price" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Precio
              </label>
            </div>
            <div className={`flex items-center gap-2 w-1/2 rounded-lg p-2 transition-colors duration-200 `}>
              <input
                type="checkbox"
                id="changePrice"
                name="changePrice"
                className="w-5 h-5 accent-blue-600"
                checked={changePrice}
                onChange={(e) => setChangePrice(e.target.checked)}
              />
              <label htmlFor="changePrice" className="text-md font-semibold">
                Cambiar precio
              </label>
            </div>
          </div>
          {/* Fin bloque precio */}
          <div className="grid grid-cols-3 gap-2">
            <div className="relative">
              <input type="number" name="pieces" id="output-pieces" placeholder='0.00' step={0.01} className='border border-black p-3 rounded-lg w-full' required onInput={outputButtonControl} onChange={handleOutputInputsChange} onKeyDown={handleKeyDown} />
              <label htmlFor="output-pieces" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Piezas <span>*</span>
              </label>
            </div>
            <div className="relative">
              <input type="number" name="weight" id="output-weight" placeholder='0.000 kg' step={0.001} className='border border-black p-3 rounded-lg w-full' required onInput={outputButtonControl} onChange={handleOutputInputsChange} onKeyDown={handleKeyDown} />
              <label htmlFor="output-weight" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Kilos <span>*</span>
              </label>
            </div>
            {/* Campo de amount ahora aquí */}
            <div className='relative'>
              <p type="text" name="amount" id="output-amount" className='text-green-700 bg-gray-100 w-full border border-black rounded-md p-3' >{amount}</p>
              <label htmlFor="output-amount" className=" -translate-y-full px-1 absolute top-1/4 left-2 rounded-sm bg-white text-green-700 text-sm font-bold">
                Total
              </label>
            </div>
          </div>
          {/* Comentario ocupa todo el espacio */}
          <div className='w-full'>
            <input className='w-full text-sm border border-black rounded-lg p-3' name="comment" id="output-comment" placeholder='Comentario del producto (Opcional)' onChange={handleOutputInputsChange} onKeyDown={handleKeyDown}></input>
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
