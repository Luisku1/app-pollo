/* eslint-disable react/prop-types */
import { FaListAlt } from "react-icons/fa"
import SectionHeader from "../../SectionHeader"
import { useEffect, useState } from "react"
import ListaSalidas from "./ListaSalidas"
import { useOutput } from "../../../hooks/Outputs/useOutput"
import { useSelector } from "react-redux"
import Select from 'react-select'
import { customSelectStyles } from "../../../helpers/Constants"
import { today } from "../../../helpers/DatePickerFunctions"
import BranchAndCustomerSelect from "../../Select/BranchAndCustomerSelect"
import { useLoading } from "../../../hooks/loading"
import Loading from "../../Loading"
import { ToastDanger, ToastSuccess } from "../../../helpers/toastify"
import { useBranchCustomerProductPrice } from "../../../hooks/Prices/useBranchCustomerProductPrice"

export default function Salidas({ branchAndCustomerSelectOptions, products, date, roles }) {

  const { company, currentUser } = useSelector((state) => state.user)
  const { outputs, totalWeight, pushOutput, sliceOutput, loading: outputLoading } = useOutput({ companyId: company._id, date })
  const [outputsIsOpen, setOutputsIsOpen] = useState(false)
  const [outputFormData, setOutputFormData] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedCustomerBranchOption, setSelectedCustomerBranchOption] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState('');
  const { price } = useBranchCustomerProductPrice({ branchCustomerId: selectedCustomerBranchOption ? selectedCustomerBranchOption.value : null, productId: selectedProduct ? selectedProduct.value : null, date, group: selectedGroup == '' ? null : selectedGroup })
  const [amount, setAmount] = useState('$0.00')
  const [loading, setLoading] = useState(false)

  const isLoading = useLoading(outputLoading)

  const generarMonto = () => {

    const priceInput = document.getElementById('output-price')
    const weightInput = document.getElementById('output-weight')

    const price = parseFloat(priceInput.value == '' ? priceInput.placeholder : priceInput.value)
    const weight = parseFloat(weightInput.value != '' ? weightInput.value : '0.0')

    setAmount((price * weight).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }))
  }

  useEffect(() => {

    generarMonto()

  }, [price])

  const handleOutputInputsChange = (e) => {

    generarMonto()

    setOutputFormData({

      ...outputFormData,
      [e.target.name]: e.target.value,

    })

  }

  const addOutput = async (e) => {

    const piecesInput = document.getElementById('output-pieces')
    const weightInput = document.getElementById('output-weight')
    const commentInput = document.getElementById('output-comment')
    const priceInput = document.getElementById('price')
    const date = today ? new Date().toISOString() : new Date(date).toISOString()

    e.preventDefault()

    const price = parseFloat(priceInput.value == '' ? priceInput.placeholder : priceInput.value)

    setLoading(true)

    try {

      const { weight, pieces } = outputFormData

      const output = {
        _id: 'temp',
        price,
        amount: parseFloat(amount.replace(/[$,]/g, '')),
        comment: commentInput.value,
        weight,
        pieces,
        specialPrice: priceInput.value == '' ? false : true,
        company: company._id,
        product: selectedProduct,
        employee: currentUser,
        branchCustomer: selectedCustomerBranchOption,
        createdAt: date
      }

      const group = selectedGroup == 'Sucursales' ? 'branch' : 'customer'

      const res = await fetch(`/api/output/${group}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(output)
      })

      const data = await res.json()

      if (data.success === false) {

        ToastDanger(data.message)
        setLoading(false)
        return
      }

      ToastSuccess('Salida registrada')

      data.output.branch = selectedCustomerBranchOption.label
      data.output.product = selectedProduct.label
      data.output.employee = currentUser

      pushOutput(output)

      piecesInput.value = ''
      weightInput.value = ''
      priceInput.value = ''
      setSelectedProduct(null)

      setLoading(false)

    } catch (error) {

      ToastDanger(error.message)
      setLoading(false)

    }
  }

  const outputButtonControl = () => {

    const weightInput = document.getElementById('output-weight')
    const piecesInput = document.getElementById('output-pieces')
    const button = document.getElementById('outputButton')

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

  const handleProductSelectChange = (product) => {

    setSelectedProduct(product)
  }

  const changeOutputsIsOpenValue = () => {

    setOutputsIsOpen(prev => !prev)
  }

  const handleBranchCustomerSelectChange = (option) => {

    const group = branchAndCustomerSelectOptions.find(g => g.options.some(opt => opt.value === option.value));
    setSelectedGroup(group ? group.label : '');
    setSelectedCustomerBranchOption(option)
  }

  if (isLoading) {

    return <Loading></Loading>

  } else {




    return (

      <div>

        <div className='border bg-white p-3 mt-4'>

          <div className='grid grid-cols-3'>
            <SectionHeader label={'Salidas'} />
            <div className="h-10 w-10 shadow-lg justify-self-end">
              <button className="w-full h-full" onClick={() => { setOutputsIsOpen(true) }}><FaListAlt className="h-full w-full text-red-600" />
              </button>
            </div>

            <p className='font-bold text-lg text-red-700 text-center'>{totalWeight ? totalWeight.toFixed(2) : '0.00' + ' Kg'}</p>

          </div>

          <form onSubmit={addOutput} className="flex flex-col space-y-2">

            <div>

              <BranchAndCustomerSelect options={branchAndCustomerSelectOptions} defaultLabel={'Sucursal o Cliente'} selectedOption={selectedCustomerBranchOption} handleSelectChange={handleBranchCustomerSelectChange}></BranchAndCustomerSelect>

            </div>

            <div className=" border-black rounded-lg">
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
              <input type="number" name="pieces" id="output-pieces" placeholder='Piezas' step={0.1} className='border border-black p-3 rounded-lg' required onInput={outputButtonControl} onChange={handleOutputInputsChange} />

              <input type="number" name="weight" id="output-weight" placeholder='0.000 kg' step={0.001} className='border border-black p-3 rounded-lg' required onInput={outputButtonControl} onChange={handleOutputInputsChange} />

              <div className="relative">
                <span className="absolute text-red-700 font-semibold left-3 top-3">$</span>
                <input className='pl-6 w-full rounded-lg p-3 text-red-700 font-semibold border border-red-600' name='price' placeholder={price.toFixed(2)} id='output-price' step={0.01} type="number" onChange={handleOutputInputsChange} />
              </div>

            </div>

            <div className='grid grid-cols-4 gap-1'>

              <input className='col-span-3 text-sm border border-black rounded-lg p-3 mt-2' name="comment" id="output-comment" placeholder='Comentario del producto (Opcional)' onChange={handleOutputInputsChange}></input>

              <div className='w-full h-fit'>
                <label htmlFor="input-field" className="block text-sm font-medium text-gray-600 mb-1">
                  Monto total
                </label>
                <p type="text" name="amount" id="output-amount" className='text-green-700 w-full border border-gray-300 rounded-md p-1 focus:outline-none focus:border-blue-500' >{amount}</p>
              </div>
            </div>

            <button type='submit' id='outputButton' disabled className='bg-slate-500 text-white p-3 rounded-lg col-span-12 mt-8'>Agregar</button>

          </form>


        </div>



        {roles && Object.getOwnPropertyNames(roles).length > 0 ?
          <ListaSalidas outputs={outputs} totalWeight={totalWeight} sliceOutput={sliceOutput} changeOutputsIsOpenValue={changeOutputsIsOpenValue} outputsIsOpen={outputsIsOpen} roles={roles}></ListaSalidas>

          : ''}

      </div>
    )
  }
}
