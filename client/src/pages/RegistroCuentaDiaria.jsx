/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FaTrash } from "react-icons/fa";


export default function RegistroCuentaDiaria() {

  const [error, setError] = useState(null)
  const [outgoingFormData, setOutgoingFormData] = useState({})
  const [stockFormData, setStockFormData] = useState({})
  const [employees, setEmployees] = useState([])
  const [branches, setBranches] = useState([])
  const { currentUser, company } = useSelector((state) => state.user)
  const [outgoings, setOutgoings] = useState([])
  const [outgoingsTotal, setOutgoingsTotal] = useState(0)
  const [stockItems, setStockItems] = useState([])
  const [stockTotal, setStockTotal] = useState(0)
  const [products, setProducts] = useState([])
  const [prices, setPrices] = useState([])
  const date = new Date().toLocaleDateString('es-mx', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })

  const GetProductName = (props) => {

    const productIndex = products.findIndex((product) => (product._id == props.product))
    return (
      <p className='text-center border border-r-blue-700 w-6/12'>
        {products[productIndex].name}
      </p>
      )

  }

  const getProductPrice = (productId) => {

    const priceIndex = prices.findIndex((price) => (price.product == productId))
    return prices[priceIndex].price
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

  const outgoingsButtonControl = () => {

    const amountInput = document.getElementById('amount')
    const conceptInput = document.getElementById('concept')
    const button = document.getElementById('outgoing-button')
    const branchSelect = document.getElementById('branch')

    let filledInputs = true

    if (amountInput.value == '') {

      filledInputs = false

    }

    if (conceptInput.value == '') {

      filledInputs = false
    }

    if (filledInputs && branchSelect.value != 'none') {

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

    let filledInputs = true

    if (productSelect.value == 'none') {

      filledInputs = false

    }

    if (weightInput.value == '') {

      filledInputs = false
    }

    if (filledInputs && branchSelect.value != 'none') {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  const addOutgoing = async (e) => {

    const conceptInput = document.getElementById('concept')
    const amountInput = document.getElementById('amount')

    e.preventDefault()

    const branchSelected = document.getElementById('branch')

    try {

      const res = await fetch('/api/outgoing/outgoing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...outgoingFormData,
          branch: branchSelected.value
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

    } catch (error) {

      setError(error.message)

    }
  }

  const deleteOutgoing = async (outgoingId, index) => {

    try {

      const res = await fetch('/api/outgoing/delete/' + outgoingId, {

        method: 'DELETE'

      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        return
      }

      setError(null)
      setOutgoingsTotal(outgoingsTotal - parseFloat(outgoings[index].amount))
      outgoings.splice(index, 1)

    } catch (error) {

      setError(error.message)
    }
  }

  const addStockItem = async (e) => {

    e.preventDefault()

    const branchSelected = document.getElementById('branch')
    const productSelect = document.getElementById('product')
    const piecesInput = document.getElementById('pieces')
    const weightInput = document.getElementById('weight')
    const amount = parseFloat(getProductPrice(productSelect.value) * stockFormData.weight)

    try {

      const res = await fetch('/api/stock/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...stockFormData,
          amount: amount,
          product: productSelect.value,
          branch: branchSelected.value
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        return
      }

      setError(null)
      setStockItems([...stockItems, data.stock])
      setStockTotal(stockTotal + data.stock.amount)

      productSelect.value = 'none'
      weightInput.value = ''
      piecesInput.value = ''

    } catch (error) {

      setError(error.message)

    }
  }

  const deleteStock = async (stockId, index) => {

    try {

      const res = await fetch('/api/stock/delete/' + stockId, {

        method: 'DELETE'

      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        return
      }

      setError(null)
      setStockTotal(stockTotal - parseFloat(stockItems[index].amount))
      stockItems.splice(index, 1)

    } catch (error) {

      setError(error.message)
    }
  }

  const fetchPrices = async () => {

    const branchSelected = document.getElementById('branch')

    try {

      const res = await fetch('api/product/price/prices/' + branchSelected.value)
      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        return
      }

      if (!data.prices.length == 0) {

        setError(null)
        setPrices(data.prices)

      } else {

        setError('No hay precios registrados')
      }

    } catch (error) {

      setError(error.message)

    }
  }

  const fetchOutgoings = async () => {

    const date = new Date().toISOString()
    const branch = document.getElementById('branch')

    try {

      const res = await fetch('/api/outgoing/daily-outgoings/' + branch.value + '/'+ date)
      const data = await res.json()

      if(data.success === false) {

        setError(data.message)
        return
      }

      setOutgoings(data.outgoings)
      setOutgoingsTotalFunction(data.outgoings)
      setError(null)

    } catch (error) {

      setError(error.message)
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

    try {

      const res = await fetch('/api/stock/daily-stock/' + branch.value + '/'+ date)
      const data = await res.json()

      if(data.success === false) {

        setError(data.message)
        return
      }

      setStockItems(data.stock)
      setStockTotalFunction(data.stock)
      setError(null)

    } catch (error) {

      setError(error.message)
    }
  }

  const setStockTotalFunction = (stockItems) => {

    let total = 0
    stockItems.forEach((stockItem) => {
      total += parseFloat(stockItem.amount)
    })

    setStockTotal(total)
  }

  useEffect(() => {

    const fetchEmployees = async () => {

      try {

        const res = await fetch('/api/employee/get-employees/' + company._id)
        const data = await res.json()


        if (data.success === false) {

          setError(data.message)
          return
        }

        if (!data.employees.length == 0) {
          setError(null)
          setEmployees(data.employees)
        } else {

          setError('No hay empleados registrados.')
        }

      } catch (error) {

        setError(error.message)

      }
    }

    const fetchBranches = async () => {

      try {

        const res = await fetch('/api/branch/branches/' + company._id)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          return
        }

        if (!data.branches.length == 0) {

          setError(null)
          setBranches(data.branches)

        } else {

          setError('No hay sucursales registradas')
        }

      } catch (error) {

        setError(error.message)
      }
    }

    const fetchProducts = async () => {

      try {

        const res = await fetch('/api/product/products/' + company._id)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          return
        }

        if (!data.products.length == 0) {

          setError(null)
          setProducts(data.products)

        } else {

          setError('No hay productos registrados')
        }

      } catch (error) {

        setError(error.message)

      }
    }



    fetchEmployees()
    fetchBranches()
    fetchProducts()

  }, [employees, company._id])

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
        <select name="employee" id="employee" className='border p-3 rounded-lg'>
          {employees && employees.length == 0 ? <option> No hay empleados </option> : ''}
          {employees && employees.length > 0 && employees.map((employee) => (

            <option selected={employee._id == currentUser._id ? 'selected' : ''} key={employee.id} value={employee._id}>{employee.name}</option>

          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">

        <p>Auxiliar:</p>
        <select name="employee" id="employee" className='border p-3 rounded-lg'>

          <option value="none" disabled hidden selected >Sin auxiliar</option>

          {employees && employees.length == 0 ? <option> No hay empleados </option> : ''}
          {employees && employees.length > 0 && employees.map((employee) => (

            <option key={employee.id} value={employee._id}>{employee.name}</option>

          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">

        <p>Sucursal:</p>
        <select name="branch" id="branch" onChange={() => { stockButtonControl(); outgoingsButtonControl(); fetchPrices(); fetchOutgoings(); fetchStock() }} className='border p-3 rounded-lg'>

          <option value="none" disabled selected hidden >Selecciona una sucursal</option>

          {branches && branches.length == 0 ? <option> No hay sucursales registradas </option> : ''}
          {branches && branches.length > 0 && branches.map((branch) => (

            <option key={branch._id} value={branch._id}>{branch.branch}</option>

          ))}
        </select>
      </div>

      <div className='border border-blue-400 p-3 mt-4'>
        <h2 className='flex text-2xl text-center font-semibold mb-4'>Gastos</h2>

        <form id='outgoingForm' onSubmit={addOutgoing} className="grid grid-cols-3 items-center justify-between">

          <input type="text" name="concept" id="concept" placeholder='Concepto' className='border p-3 rounded-lg' required onInput={outgoingsButtonControl} onChange={handleOutgoingInputsChange} />
          <input type="number" name="amount" id="amount" placeholder='$0.00' step={0.1} className='border p-3 rounded-lg' required onInput={outgoingsButtonControl} onChange={handleOutgoingInputsChange} />
          <button type='submit' id='outgoing-button' disabled className='bg-slate-500 text-white p-3 rounded-lg'>Agregar</button>

        </form>


        {outgoings && outgoings.length > 0 ?
          <div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold mt-4'>
            <p className='border p-3 rounded-lg col-span-5 text-center'>Concepto</p>
            <p className='border p-3 rounded-lg col-span-5 text-center'>Monto</p>
          </div>
          : ''}
        {outgoings && outgoings.length > 0 && outgoings.map((outgoing, index) => (


          <div key={outgoing._id} className='grid grid-cols-12 items-center'>

            <div id='list-element' className='flex col-span-10 items-center justify-around mt-2 border border-opacity-100 border-blue-400 rounded-lg p-3'>
              <p className='text-center border border-r-blue-700 w-6/12'>{outgoing.concept}</p>
              <p className='text-center w-6/12'>${outgoing.amount}</p>
            </div>

            <button type="submit" onClick={() => deleteOutgoing(outgoing._id, index)} className=' col-span-2 bg-slate-200 border border-black rounded-lg text-center h-10 w-10 m-3'>
              <span className=''>
                <FaTrash className='text-red-700 m-auto' />
              </span>
            </button>

          </div>

        ))}

        {outgoings && outgoings.length > 0 ?

          <div className='flex mt-4 border-black border rounded-lg p-3'>
            <p className='border border-r-black w-6/12'>Total:</p>
            <p className='w-6/12 text-center'>${outgoingsTotal}</p>

          </div>

          : ''}
      </div>

      <div className='border border-red-400 p-3 mt-4'>
        <h2 className='flex text-2xl text-center font-semibold mb-4'>Sobrante</h2>

        <form onSubmit={addStockItem} className="grid grid-cols-4 items-center justify-between">

          <select name="product" id="product" onChange={() => {stockButtonControl()}} className='border p-3 rounded-lg text-xs'>
            <option value="none" selected hidden >Productos</option>

            {products && products.length != 0 && products.map((product) => (

              <option key={product._id} value={product._id}>{product.name}</option>
            ))}
          </select>

          <input type="number" name="pieces" id="pieces" placeholder='Piezas' step={1} className='border p-3 rounded-lg' required onInput={stockButtonControl} onChange={handleStockInputsChange} />
          <input type="number" name="weight" id="weight" placeholder='0.00 kg' step={0.1} className='border p-3 rounded-lg' required onInput={stockButtonControl} onChange={handleStockInputsChange} />
          <button type='submit' id='stock-button' disabled className='bg-slate-500 text-white p-3 rounded-lg'>Agregar</button>

        </form>

        {stockItems && stockItems.length > 0 ?
          <div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold mt-4'>
            <p className='border p-3 rounded-lg col-span-5 text-center'>Concepto</p>
            <p className='border p-3 rounded-lg col-span-5 text-center'>Monto</p>
          </div>
          : ''}
        {stockItems && stockItems.length > 0 && stockItems.map((stock, index) => (


          <div key={stock._id} className='grid grid-cols-12 items-center'>

            <div id='list-element' className='flex col-span-10 items-center justify-around mt-2 border border-opacity-100 border-blue-400 rounded-lg p-3'>
              <GetProductName product={stock.product}/>
              <p className='text-center w-6/12'>${stock.amount}</p>
            </div>

            <button type="submit" onClick={() => deleteStock(stock._id, index)} className=' col-span-2 bg-slate-200 border border-black rounded-lg text-center h-10 w-10 m-3'>
              <span className=''>
                <FaTrash className='text-red-700 m-auto' />
              </span>
            </button>

          </div>

        ))}

        {stockItems && stockItems.length > 0 ?

          <div className='flex mt-4 border-black border rounded-lg p-3'>
            <p className='border border-r-black w-6/12'>Total:</p>
            <p className='w-6/12 text-center'>{stockTotal}</p>

          </div>

          : ''}

      </div>
    </main>
  )
}
