/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { deleteOutgoingFetch, deleteProductLossItemFetch, deleteStockFetch, fetchBranches, fetchEmployees, fetchPrices, fetchProducts } from '../helpers/FetchFunctions';
import { FaTrash } from 'react-icons/fa';

export default function RegistroCuentaDiaria() {

  const { currentUser, company } = useSelector((state) => state.user)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [outgoingFormData, setOutgoingFormData] = useState({})
  const [stockFormData, setStockFormData] = useState({})
  const [productLossFormData, setProductLossFormData] = useState({})
  const [employees, setEmployees] = useState([])
  const [branches, setBranches] = useState([])
  const [outgoings, setOutgoings] = useState([])
  const [outgoingsTotal, setOutgoingsTotal] = useState(0.0)
  const [outputs, setOutputs] = useState([])
  const [outputsTotal, setOutputsTotal] = useState(0.0)
  const [inputs, setInputs] = useState([])
  const [inputsTotal, setInputsTotal] = useState(0.0)
  const [incomes, setIncomes] = useState([])
  const [incomesTotal, setIncomesTotal] = useState(0.0)
  const [initialStock, setInitialStock] = useState(0.0)
  const [stockItems, setStockItems] = useState([])
  const [stockTotal, setStockTotal] = useState(0.0)
  const [productLossItems, setProductLossItems] = useState([])
  const [productLossTotal, setProductLossTotal] = useState(0.0)
  const [products, setProducts] = useState([])
  const [branchPrices, setPrices] = useState([])
  const [productName, setProductName] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [buttonId, setButtonId] = useState(null)
  const date = new Date().toLocaleDateString('es-mx', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })

  const saveProductName = (e) => {

    let index = e.target.selectedIndex
    setProductName(e.target.options[index].text)
  }

  const getProductPrice = (productId) => {

    const priceIndex = branchPrices.prices.findIndex((price) => (price.productId == productId))
    return branchPrices.prices[priceIndex].latestPrice
  }

  const handleOutgoingInputsChange = (e) => {

    setOutgoingFormData({

      ...outgoingFormData,
      [e.target.id]: e.target.value,

    })

  }

  const handleStockInputsChange = (e) => {

    setStockFormData({
      ...stockFormData,
      [e.target.id]: e.target.value,
    })
  }

  const handleProductLossInputsChange = (e) => {

    setProductLossFormData({
      ...productLossFormData,
      [e.target.id]: e.target.value,
    })
  }

  const outgoingsButtonControl = () => {

    const amountInput = document.getElementById('amount')
    const conceptInput = document.getElementById('concept')
    const employee = document.getElementById('employee')
    const button = document.getElementById('outgoing-button')
    const branchSelect = document.getElementById('branch')

    let filledInputs = true

    if (amountInput.value == '') {

      filledInputs = false

    }

    if (conceptInput.value == '') {

      filledInputs = false
    }

    if (filledInputs && branchSelect.value != 'none' && employee.value != 'none') {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  const stockButtonControl = () => {

    const productSelect = document.getElementById('product')
    const weightInput = document.getElementById('weight')
    const button = document.getElementById('stock-button')
    const branchSelect = document.getElementById('branch')
    const employeeSelect = document.getElementById('employee')

    let filledInputs = true

    if (productSelect.value == 'none') {

      filledInputs = false

    }

    if (weightInput.value == '') {

      filledInputs = false
    }

    if (filledInputs && branchSelect.value != 'none' && employeeSelect.value != 'none') {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  const productLossButtonControl = () => {

    const productSelect = document.getElementById('product-loss')
    const weightInput = document.getElementById('productLossWeight')
    const button = document.getElementById('product-loss-button')
    const branchSelect = document.getElementById('branch')
    const employeeSelect = document.getElementById('employee')

    let filledInputs = true

    if (productSelect.value == 'none') {

      filledInputs = false

    }

    if (weightInput.value == '') {

      filledInputs = false
    }

    if (filledInputs && branchSelect.value != 'none' && employeeSelect.value != 'none') {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  const addOutgoing = async (e) => {

    const conceptInput = document.getElementById('concept')
    const amountInput = document.getElementById('amount')
    const employee = document.getElementById('employee')

    e.preventDefault()

    const branchSelected = document.getElementById('branch')

    setLoading(true)

    try {

      const res = await fetch('/api/outgoing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...outgoingFormData,
          employee: employee.value,
          branch: branchSelected.value,
          company: company._id
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        return
      }

      setError(null)
      setOutgoings([...outgoings, data.outgoing])
      setOutgoingsTotal(outgoingsTotal + parseFloat(data.outgoing.amount))

      conceptInput.value = ''
      amountInput.value = ''
      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)

    }
  }

  const deleteOutgoing = async (outgoingId, index) => {

    setLoading(true)

    const { error } = await deleteOutgoingFetch(outgoingId)

    setLoading(false)

    if (error == null) {

      setOutgoingsTotal(outgoingsTotal - parseFloat(outgoings[index].amount))
      outgoings.splice(index, 1)
    }
  }

  const addStockItem = async (e) => {

    e.preventDefault()

    const branchSelected = document.getElementById('branch')
    const productSelect = document.getElementById('product')
    const piecesInput = document.getElementById('pieces')
    const weightInput = document.getElementById('weight')
    const employeeSelect = document.getElementById('employee')
    const amount = parseFloat(getProductPrice(productSelect.value) * stockFormData.weight)

    setLoading(true)

    try {

      const res = await fetch('/api/stock/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...stockFormData,
          amount: amount,
          employee: employeeSelect.value,
          product: productSelect.value,
          branch: branchSelected.value,
          company: company._id
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      data.stock.product = productName

      setError(null)
      setStockItems([...stockItems, data.stock])
      setStockTotal(stockTotal + data.stock.amount)

      productSelect.value = 'none'
      weightInput.value = ''
      piecesInput.value = ''

      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)

    }
  }

  const addProductLossItem = async (e) => {

    e.preventDefault()

    const branchSelect = document.getElementById('branch')
    const employeeSelect = document.getElementById('employee')
    const productSelect = document.getElementById('product-loss')
    const weightInput = document.getElementById('productLossWeight')
    const commentInput = document.getElementById('comment')
    const amount = parseFloat(getProductPrice(productSelect.value) * productLossFormData.productLossWeight)

    setLoading(true)

    try {

      const res = await fetch('/api/outgoing/product-loss/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...productLossFormData,
          amount: amount,
          product: productSelect.value,
          employee: employeeSelect.value,
          branch: branchSelect.value,
          company: company._id
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      data.productLossItem.product = productName

      setError(null)
      setProductLossItems([...productLossItems, data.productLossItem])
      setProductLossTotal(productLossTotal + data.productLossItem.amount)

      productSelect.value = 'none'
      weightInput.value = ''
      commentInput.value = ''

      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)
    }
  }

  const deleteStockItem = async (stockId, index) => {

    setLoading(true)

    const { error } = await deleteStockFetch(stockId)

    setLoading(false)

    if (error == null) {

      setStockTotal(stockTotal - parseFloat(stockItems[index].amount))
      stockItems.splice(index, 1)
    }
  }

  const deleteProductLossItem = async (productLossItemId, index) => {

    setLoading(true)

    const { error } = await deleteProductLossItemFetch(productLossItemId)

    setLoading(false)

    if (error == null) {

      setProductLossTotal(productLossTotal - productLossItems[index].amount)
      productLossItems.splice(index, 1)
    }
  }

  const setPricesFunction = async () => {

    setLoading(true)

    const { error, data } = await fetchPrices()

    setLoading(false)

    if (error == null) {
      setPrices(data)
      setError(null)

    } else {

      setError(error)
    }
  }

  const fetchOutgoings = async () => {

    const date = new Date().toISOString()
    const branch = document.getElementById('branch')

    setLoading(true)

    try {

      const res = await fetch('/api/outgoing/branch-outgoings/' + branch.value + '/' + date)
      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      setOutgoings(data.outgoings)
      setOutgoingsTotalFunction(data.outgoings)
      setError(null)
      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)
    }
  }

  const setOutgoingsTotalFunction = (outgoings) => {

    let total = 0
    outgoings.forEach((outgoing) => {
      total += parseFloat(outgoing.amount)
    })

    setOutgoingsTotal(total)
  }

  const fetchStock = async () => {

    const date = new Date().toISOString()
    const branch = document.getElementById('branch')

    setLoading(true)

    try {

      const res = await fetch('/api/stock/get-branch-stock/' + branch.value + '/' + date)
      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      setStockItems(data.stock)
      setStockTotalFunction(data.stock)
      setError(null)

      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)
    }
  }

  const setStockTotalFunction = (stockItems) => {

    let total = 0
    stockItems.forEach((stockItem) => {
      total += parseFloat(stockItem.amount)
    })

    setStockTotal(total)
  }

  const fetchInitialStock = async () => {

    const branch = document.getElementById('branch')
    let date = new Date()
    date = date.toISOString()

    setLoading(true)

    try {

      const res = await fetch('/api/stock/initial-stock/' + branch.value + '/' + date)
      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      setInitialStock(data.initialStock)
      setError(null)
      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)
    }

  }

  const fetchInputs = async () => {

    const branch = document.getElementById('branch')
    const date = new Date().toISOString()

    setLoading(true)

    try {

      const res = await fetch('/api/input/get-branch-inputs/' + branch.value + '/' + date)
      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      setInputs(data.inputs)
      setInputsTotalFunction(data.inputs)
      setError(null)
      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)
    }
  }

  const setInputsTotalFunction = (inputs) => {

    let total = 0

    inputs.forEach((input) => {

      total += parseFloat(input.amount)
    })

    setInputsTotal(total)
  }

  const fetchOutputs = async () => {

    const branch = document.getElementById('branch')
    const date = new Date().toISOString()

    setLoading(true)

    try {

      const res = await fetch('/api/output/get-branch-outputs/' + branch.value + '/' + date)
      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      setOutputs(data.outputs)
      setOutputsTotalFunction(data.outputs)
      setError(null)
      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)

    }
  }

  const setOutputsTotalFunction = (outputs) => {

    let total = 0

    outputs.forEach((output) => {

      total += parseFloat(output.amount)
    })

    setOutputsTotal(total)
  }

  const fetchIncomes = async () => {

    const branch = document.getElementById('branch')
    const date = new Date().toISOString()

    setLoading(true)

    try {

      const res = await fetch('/api/income/branch-incomes/' + branch.value + '/' + date)
      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      setIncomes(data.branchIncomes)
      setIncomesTotalFunction(data.branchIncomes)
      setError(null)
      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)

    }
  }

  const setIncomesTotalFunction = (incomes) => {

    let total = 0

    incomes.forEach((incomes) => {

      total += parseFloat(incomes.amount)
    })

    setIncomesTotal(total)
  }

  const fetchProductLosses = async () => {

    const branch = document.getElementById('branch')
    const date = new Date().toISOString()

    setLoading(true)

    try {

      const res = await fetch('/api/outgoing/product-loss/get/' + branch.value + '/' + date)
      const data = await res.json()

      if (date.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      setProductLossItems(data.productLosses)
      setProductLossTotalFunction(data.productLosses)
      setError(null)
      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)
    }
  }

  const setProductLossTotalFunction = (productLosses) => {

    let total = 0

    productLosses.forEach((productLoss) => {

      total += parseFloat(productLoss.amount)
    })

    setProductLossTotal(total)
  }

  const fetchs = () => {

    fetchInitialStock()
    setPricesFunction()
    fetchOutgoings()
    fetchStock()
    fetchIncomes()
    fetchInputs()
    fetchOutputs()
    fetchProductLosses()
  }

  const handleSubmit = async () => {

    const employee = document.getElementById('employee')
    const assistant = document.getElementById('assistant')
    const branch = document.getElementById('branch')
    const assistantValue = assistant.value == 'none' ? null : assistant.value

    setLoading(true)

    try {

      const res = await fetch('/api/branch/report/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employee: employee.value,
          assistant: assistantValue,
          branch: branch.value,
          company: company._id,
          initialStock: initialStock,
          finalStock: stockTotal,
          inputs: inputsTotal,
          outputs: outputsTotal,
          outgoings: outgoingsTotal + productLossTotal,
          incomes: incomesTotal,

        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      setLoading(false)
      setError(null)
      setSuccessMessage('Formato registrado, puedes salir de esta página')

    } catch (error) {

      setLoading(false)
      setError(error.message)

    }

  }

  useEffect(() => {

    const setEmployeesFunction = async () => {

      const { error, data } = await fetchEmployees(company._id)

      if (error == null) {

        setError(null)
        setEmployees(data)

      } else {

        setError(error)
      }

    }

    const setBranchesFunction = async () => {

      const { error, data } = await fetchBranches(company._id)

      if (error == null) {

        setError(null)
        setBranches(data)

      } else {

        setError(error)
      }

    }

    const setProductsFunction = async () => {

      const { error, data } = await fetchProducts(company._id)

      if (error == null) {

        setError(null)
        setProducts(data)

      } else {

        setError(error)
      }

    }

    setEmployeesFunction()
    setBranchesFunction()
    setProductsFunction()

  }, [company])

  return (

    <main className="p-3 max-w-lg mx-auto">
      <h1 className='text-3xl text-center font-semibold mt-7'>
        Formato
        <br />
      </h1>
      <p className='text-center mb-7'>{date}</p>

      <p className='text-red-700 font-semibold'>{error}</p>


      <h2 className='flex text-2xl text-center font-semibold mb-4'>Información básica</h2>

      <div className="flex items-center justify-between">

        <p>Encargado:</p>
        <select name="employee" id="employee" className='border p-3 rounded-lg' onChange={() => { outgoingsButtonControl(), stockButtonControl(), productLossButtonControl() }}>

          <option value="none" selected disabled hidden>Sin encargado</option>

          {employees && employees.length == 0 ? <option> No hay empleados </option> : ''}
          {employees && employees.length > 0 && employees.map((employee) => (

            <option selected={employee._id == currentUser._id ? 'selected' : ''} key={employee._id} value={employee._id}>{employee.name + ' ' + employee.lastName}</option>

          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">

        <p>Auxiliar:</p>
        <select name="assistant" id="assistant" className='border p-3 rounded-lg'>

          <option value="none" selected hidden disabled >Sin auxiliar</option>

          {employees && employees.length == 0 ? <option> No hay empleados </option> : ''}
          {employees && employees.length > 0 && employees.map((employee) => (

            <option key={employee._id} value={employee._id}>{employee.name + ' ' + employee.lastName}</option>

          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">

        <p>Sucursal:</p>
        <select name="branch" id="branch" onChange={() => { fetchs(), outgoingsButtonControl(), stockButtonControl(), productLossButtonControl() }} className='border p-3 rounded-lg'>

          <option value="none" disabled selected hidden >Selecciona una sucursal</option>

          {branches && branches.length == 0 ? <option> No hay sucursales registradas </option> : ''}
          {branches && branches.length > 0 && branches.map((branch) => (

            <option key={branch._id} value={branch._id}>{branch.branch}</option>

          ))}
        </select>

      </div>

      <div className='grid grid-cols-5'>
        {branchPrices && branchPrices.prices && branchPrices.prices.length > 0 ? <p className='col-span-2 my-auto'>Precios:</p> : ''}

        <div className='col-span-3'>

          {branchPrices && branchPrices.prices && branchPrices.prices.length > 0 && branchPrices.prices.map((price) => (

            <div key={price.priceId} className='grid grid-cols-2 bg-white gap-2 p-1 mt-1 shadow-sm'>

              <p className='truncate'>{price.product}:</p>
              <p className=''>{price.latestPrice}</p>
            </div>

          ))}
        </div>

      </div>

      <div className="flex items-center justify-between">

        <p>Sobrante inicial: </p>
        <p className=' bg-white p-3 rounded-lg'>{initialStock ? initialStock.toLocaleString("es-Mx", { style: 'currency', currency: 'MXN' }) : '$0.00'}</p>

      </div>

      <div className='border p-3 mt-4 bg-white'>
        <h2 className='flex text-2xl text-center font-semibold mb-4'>Gastos</h2>

        <form id='outgoingForm' onSubmit={addOutgoing} className="grid grid-cols-3 items-center justify-between">

          <input type="text" name="concept" id="concept" placeholder='Concepto' className='border p-3 rounded-lg' required onInput={outgoingsButtonControl} onChange={handleOutgoingInputsChange} />
          <input type="number" name="amount" id="amount" placeholder='$0.00' step={0.01} className='border p-3 rounded-lg' required onInput={outgoingsButtonControl} onChange={handleOutgoingInputsChange} />
          <button type='submit' id='outgoing-button' disabled className='bg-slate-500 text-white p-3 rounded-lg'>Agregar</button>

        </form>


        {outgoings && outgoings.length > 0 ?
          <div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold'>
            <p className='p-3 rounded-lg col-span-5 text-center'>Concepto</p>
            <p className='p-3 rounded-lg col-span-5 text-center'>Monto</p>
          </div>
          : ''}
        {outgoings && outgoings.length > 0 && outgoings.map((outgoing, index) => (


          <div key={outgoing._id} className={(document.getElementById('employee').value == outgoing.employee ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

            <div id='list-element' className='flex col-span-10 items-center'>
              <p className='text-center text-xs w-6/12'>{outgoing.concept}</p>
              <p className='text-center text-xs w-6/12'>{outgoing.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
            </div>

            {document.getElementById('employee').value == outgoing.employee || currentUser._id == outgoing.employee ?

              <div>
                <button id={outgoing._id} onClick={() => { setIsOpen(isOpen ? false : true), setButtonId(outgoing._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                  <span>
                    <FaTrash className='text-red-700 m-auto' />
                  </span>
                </button>

                {isOpen && outgoing._id == buttonId ?
                  <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                    <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                      <div>
                        <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                      </div>
                      <div className='flex gap-10'>
                        <div>
                          <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteOutgoing(outgoing._id, index), setIsOpen(isOpen ? false : true) }}>Si</button>
                        </div>
                        <div>
                          <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setIsOpen(isOpen ? false : true) }}>No</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  : ''}

              </div>

              : ''}

          </div>

        ))}

        {outgoings && outgoings.length > 0 ?

          <div className='flex mt-4 border-black border rounded-lg p-3 border-opacity-30 shadow-lg'>
            <p className='w-6/12 text-center'>Total:</p>
            <p className='w-6/12 text-center font-bold'>{outgoingsTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>

          </div>

          : ''}
      </div>

      <div className='border bg-white p-3 mt-4'>
        <h2 className='flex text-2xl text-center font-semibold mb-4'>Sobrante</h2>

        <form onSubmit={addStockItem} className="grid grid-cols-4 items-center justify-between">

          <select name="product" id="product" onChange={(e) => { stockButtonControl(), saveProductName(e) }} className='border p-3 rounded-lg text-xs'>
            <option value="none" selected hidden >Productos</option>

            {products && products.length != 0 && products.map((product) => (

              <option key={product._id} value={product._id}>{product.name}</option>
            ))}
          </select>

          <input type="number" name="pieces" id="pieces" placeholder='Piezas' step={1} className='border p-3 rounded-lg' required onInput={stockButtonControl} onChange={handleStockInputsChange} />
          <input type="number" name="weight" id="weight" placeholder='0.00 kg' step={0.01} className='border p-3 rounded-lg' required onInput={stockButtonControl} onChange={handleStockInputsChange} />
          <button type='submit' id='stock-button' disabled className='bg-slate-500 text-white p-3 rounded-lg'>Agregar</button>

        </form>

        {stockItems && stockItems.length > 0 ?
          <div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold mt-4 mb-4'>
            <p className='rounded-lg col-span-3 text-center'>Producto</p>
            <p className='rounded-lg col-span-2 text-center'>Piezas</p>
            <p className='rounded-lg col-span-2 text-center'>Kg</p>
            <p className='rounded-lg col-span-3 text-center'>Monto</p>
          </div>
          : ''}
        {stockItems && stockItems.length > 0 && stockItems.map((stock, index) => (


          <div key={stock._id} className={(document.getElementById('employee').value == stock.employee ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

            <div id='list-element' className='flex col-span-10 items-center '>
              <p className='text-center w-4/12'>{stock.product.name ? stock.product.name : stock.product}</p>
              <p className='text-center w-4/12'>{stock.pieces}</p>
              <p className='text-center w-4/12'>{stock.weight}</p>
              <p className='text-right w-4/12'>{stock.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
            </div>


            {document.getElementById('employee').value == stock.employee || currentUser._id == stock.employee ?

              <div>
                <button id={stock._id} onClick={() => { setIsOpen(!isOpen), setButtonId(stock._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                  <span>
                    <FaTrash className='text-red-700 m-auto' />
                  </span>
                </button>

                {isOpen && stock._id == buttonId ?
                  <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                    <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                      <div>
                        <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                      </div>
                      <div className='flex gap-10'>
                        <div>
                          <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteStockItem(stock._id, index), setIsOpen(isOpen ? false : true) }}>Si</button>
                        </div>
                        <div>
                          <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setIsOpen(!isOpen) }}>No</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  : ''}

              </div>

              : ''}

          </div>

        ))}

        {stockItems && stockItems.length > 0 ?

          <div className='flex mt-4 border-black border rounded-lg p-3 border-opacity-30 shadow-lg'>
            <p className='w-6/12 text-center'>Total:</p>
            <p className='w-6/12 text-center font-bold'>{stockTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>

          </div>

          : ''}

      </div>

      <div className='border p-3 mt-4 bg-white'>
        <h2 className='flex text-2xl text-center font-semibold mb-4'>Mermas</h2>

        <form onSubmit={addProductLossItem} className="grid grid-cols-4 items-center justify-between">

          <select name="product-loss" id="product-loss" onChange={(e) => { productLossButtonControl(), saveProductName(e) }} className='border p-3 rounded-lg text-xs'>
            <option value="none" selected hidden >Productos</option>

            {products && products.length != 0 && products.map((product) => (

              <option key={product._id} value={product._id}>{product.name}</option>
            ))}
          </select>

          <input type="number" name="productLossWeight" id="productLossWeight" placeholder='0.00 kg' step={0.01} className='border p-3 rounded-lg' required onInput={productLossButtonControl} onChange={handleProductLossInputsChange} />
          <textarea name="comment" id="comment" cols="30" rows="0" placeholder='Comentario' onInput={productLossButtonControl} onChange={handleProductLossInputsChange}></textarea>
          <button type='submit' id='product-loss-button' disabled className='bg-slate-500 text-white p-3 rounded-lg'>Agregar</button>

        </form>

        {productLossItems && productLossItems.length > 0 ?
          <div id='header' className='grid grid-cols-11 gap-4 items-center justify-around font-semibold my-4'>
            <p className='col-span-3 text-center'>Producto</p>
            <p className='col-span-3 text-center'>Comentario</p>
            <p className='col-span-3 text-center'>Monto</p>
          </div>
          : ''}

        {productLossItems && productLossItems.length > 0 && productLossItems.map((productLossItem, index) => (


          <div key={productLossItem._id} className={(document.getElementById('employee').value == productLossItem.employee ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

            <div id='list-element' className='flex col-span-10 items-center'>
              <p className='text-center text-xs w-4/12'>{productLossItem.product.name ? productLossItem.product.name : productLossItem.product}</p>
              <p className='text-center text-xs w-4/12'>{productLossItem.comment}</p>
              <p className='text-center text-xs w-4/12'>{productLossItem.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
            </div>


            {document.getElementById('employee').value == productLossItem.employee || currentUser._id == productLossItem.employee ?

              <div>
                <button id={productLossItem._id} onClick={() => { setIsOpen(isOpen ? false : true), setButtonId(productLossItem._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                  <span>
                    <FaTrash className='text-red-700 m-auto' />
                  </span>
                </button>

                {isOpen && productLossItem._id == buttonId ?
                  <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                    <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                      <div>
                        <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                      </div>
                      <div className='flex gap-10'>
                        <div>
                          <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteProductLossItem(productLossItem._id, index), setIsOpen(isOpen ? false : true) }}>Si</button>
                        </div>
                        <div>
                          <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setIsOpen(isOpen ? false : true) }}>No</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  : ''}

              </div>

              : ''}


          </div>

        ))}

        {productLossItems && productLossItems.length > 0 ?

          <div className='flex mt-4 border-black border rounded-lg p-3 shadow-lg border-opacity-30'>
            <p className='w-6/12 text-center'>Total:</p>
            <p className='w-6/12 text-center font-bold'>{productLossTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>

          </div>

          : ''}

      </div>

      {inputs && inputs.length > 0 ?
        <div className='border bg-white p-3 mt-4'>
          <h2 className='flex text-2xl text-center font-semibold mb-4'>Entradas</h2>

          <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold my-4'>
            <p className='col-span-3 text-center'>Encargado</p>
            <p className='col-span-3 text-center'>Producto</p>
            <p className='col-span-2 text-center'>Piezas</p>
            <p className='col-span-2 text-center'>Kg</p>
            <p className='col-span-2 text-center'>Monto</p>
          </div>
          {inputs && inputs.length > 0 && inputs.map((input) => (


            <div key={input._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 rounded-lg shadow-sm mb-2 py-3'>
              <div id='list-element' className='flex col-span-12 items-center'>
                <p className='text-center text-xs w-3/12'>{input.employee.name + ' ' + input.employee.lastName}</p>
                <p className='text-center text-xs w-3/12'>{input.product.name}</p>
                <p className='text-center text-xs w-2/12'>{input.pieces}</p>
                <p className='text-center text-xs w-2/12'>{input.weight}</p>
                <p className='text-center text-xs w-2/12'>{input.amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
              </div>

              <div className='col-span-12'>
                <p className='text-m text-center font-semibold'>{input.comment}</p>
              </div>

            </div>

          ))}

          {inputs && inputs.length > 0 ?

            <div className='flex mt-4 border-black border rounded-lg p-3 shadow-lg border-opacity-30'>
              <p className='w-6/12 text-center'>Total:</p>
              <p className='w-6/12 text-center font-bold'>{inputsTotal.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>

            </div>

            : ''}
        </div>

        : ''}

      {outputs && outputs.length > 0 ?
        <div className='border bg-white p-3 mt-4'>
          <h2 className='flex text-2xl text-center font-semibold mb-4'>Salidas</h2>

          <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
            <p className='col-span-3 text-center'>Supervisor</p>
            <p className='col-span-3 text-center'>Producto</p>
            <p className='col-span-2 text-center'>Piezas</p>
            <p className='col-span-2 text-center'>Kg</p>
            <p className='col-span-2 text-center'>Monto</p>
          </div>
          {outputs && outputs.length > 0 && outputs.map((output) => (


            <div key={output._id} className='grid grid-cols-12 items-center my-2 py-3 border-opacity-30 rounded-lg border border-black shadow-sm gap-4'>
              <div id='list-element' className='flex col-span-12 items-center '>
                <p className='text-center text-xs w-3/12'>{output.employee.name + ' ' + output.employee.lastName}</p>
                <p className='text-center text-xs w-3/12'>{output.product.name}</p>
                <p className='text-center text-xs w-2/12'>{output.pieces}</p>
                <p className='text-center text-xs w-2/12'>{output.weight}</p>
                <p className='text-center text-xs w-2/12'>{output.amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
              </div>
              <div className='col-span-12'>
                <p className='text-m text-center font-semibold'>{output.comment}</p>
              </div>
            </div>

          ))}

          {outputs && outputs.length > 0 ?

            <div className='flex mt-4 border-black border rounded-lg p-3 border-opacity-30 shadow-lg'>
              <p className='w-6/12 text-center'>Total:</p>
              <p className='w-6/12 text-center font-bold'>{outputsTotal.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>

            </div>

            : ''}
        </div>

        : ''}


      {incomes && incomes.length > 0 ?
        <div className='border bg-white p-3 mt-4'>
          <h2 className='flex text-2xl text-center font-semibold mb-4'>Efectivos</h2>

          <div id='income-header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
            <p className='col-span-4 text-center'>Sucursal</p>
            <p className='col-span-2 text-center'>Tipo</p>
            <p className='col-span-3 text-center'>Supervisor</p>
            <p className='col-span-3 text-center'>Monto</p>
          </div>

          {incomes && incomes.length > 0 && incomes.map((income) => (


            <div key={incomes._id} className='grid grid-cols-12 items-center my-2 py-3 border border-black border-opacity-30 shadow-sm rounded-lg'>

              <div id='list-element' className=' flex col-span-12 items-center'>
                <p className='text-center text-xs w-4/12'>{income.branch.branch ? income.branch.branch : income.branch}</p>
                <p className='text-center text-xs w-2/12 truncate'>{income.type.name ? income.type.name : income.type}</p>
                <p className='text-center text-xs w-3/12 truncate'>{income.employee.name}</p>
                <p className='text-center text-xs w-3/12'>{income.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
              </div>

            </div>

          ))}

          {incomes && incomes.length > 0 ?

            <div className='flex mt-4 border-black border rounded-lg p-3 border-opacity-30 shadow-lg'>
              <p className='w-6/12 text-center'>Total:</p>
              <p className='w-6/12 text-center font-bold'>{incomesTotal.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>

            </div>

            : ''}
        </div>
        : ''}

      {successMessage ?
        <p className='bg-green-200 mb-4'>{successMessage}</p>
        : ''
      }

      <div className='flex flex-col gap-4 mt-4'>

        <button disabled={loading} className='bg-slate-600 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80' onClick={() => handleSubmit()}>Enviar formato</button>

      </div>

    </main>
  )
}
