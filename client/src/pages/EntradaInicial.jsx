/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams } from 'react-router-dom';
import SectionHeader from "../components/SectionHeader";
import { fetchBranches } from "../helpers/FetchFunctions";
import { MdCancel } from "react-icons/md";
import { FaListAlt, FaTrash } from "react-icons/fa";

export default function EntradaInicial({ products, defaultProduct, managerRole }) {

  let paramsDate = useParams().date
  const { company, currentUser } = useSelector((state) => state.user)
  const [providerInputs, setProviderInputs] = useState([])
  const [productName, setProductName] = useState('Elige un producto')
  const [productId, setProductId] = useState(null)
  const [branches, setBranches] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [providerInputFormData, setProviderInputFormData] = useState({})
  const [providerInputsTotal, setProviderInputsTotal] = useState(0.0)
  const [branchName, setBranchName] = useState(null)
  const [providerInputsIsOpen, setProviderInputsIsOpen] = useState(false)
  const [showProviderInputs, setShowProviderInputs] = useState(false)
  const [buttonId, setButtonId] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())

  const saveProductName = (e) => {

    let index = e.target.selectedIndex
    setProductName(e.target.options[index].text)
    setProductId(e.target.value)
  }

  const formatDate = (date) => {

    const actualLocaleDate = date

    return (actualLocaleDate.getFullYear() + '-' + (actualLocaleDate.getMonth() < 9 ? '0' + ((actualLocaleDate.getMonth()) + 1) : ((actualLocaleDate.getMonth()))) + '-' + ((actualLocaleDate.getDate() < 10 ? '0' : '') + actualLocaleDate.getDate()) + 'T06:00:00.000Z')

  }

  let stringDatePickerValue = formatDate(datePickerValue)

  const saveBranchName = (e) => {

    let index = e.target.selectedIndex
    setBranchName(e.target.options[index].text)
  }

  const handleProviderInputInputsChange = (e) => {

    setProviderInputFormData({

      ...providerInputFormData,
      [e.target.id]: e.target.value,

    })
  }

  const providerInputButtonControl = () => {

    const weightInput = document.getElementById('providerInputWeight')
    const piecesInput = document.getElementById('providerInputPieces')
    const button = document.getElementById('providerInputButton')
    const branchSelect = document.getElementById('providerInputBranch')

    let filledInputs = true

    if (piecesInput.value == '') {

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

  const showProviderInputsFunction = async () => {

    setShowProviderInputs(true)

  }

  const hideProviderInputs = async () => {

    setShowProviderInputs(false)
  }

  const submitProviderInput = async (e) => {

    const date = new Date(stringDatePickerValue).toISOString()
    const piecesInput = document.getElementById('providerInputPieces')
    const weightInput = document.getElementById('providerInputWeight')
    const branchInput = document.getElementById('providerInputBranch')
    const commentInput = document.getElementById('providerInputComment')
    const inputButton = document.getElementById('providerInputButton')
    const productId = (document.getElementById('providerInputProduct')).value

    e.preventDefault()

    inputButton.disabled = true
    setLoading(true)


    try {

      const res = await fetch('/api/input/create-provider-input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...providerInputFormData,
          product: productId,
          employee: currentUser._id,
          branch: branchInput.value,
          company: company._id,
          comment: commentInput.value,
          createdAt: date
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        inputButton.disabled = false
        return
      }

      data.providerInput.branch = branchName
      data.providerInput.product = productName
      data.providerInput.employee = currentUser

      setError(null)
      setProviderInputs([data.providerInput, ...providerInputs])
      setProviderInputsTotal((prev) => prev + data.providerInput.weight)

      piecesInput.value = ''
      weightInput.value = ''

      setLoading(false)
      inputButton.disabled = false


    } catch (error) {

      setError(error.message)
      setLoading(false)
      inputButton.disabled = false

    }
  }

  const deleteProviderInput = async (providerInputId, index) => {

    setLoading(true)

    try {

      const res = await fetch('/api/input/delete-provider-input/' + providerInputId, {

        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success === false) {

        setError(null)
        setLoading(false)
        return
      }

      setProviderInputsTotal(providerInputsTotal - parseFloat(providerInputs[index].weight))
      providerInputs.splice(index, 1)

      setError(null)
      setLoading(false)

    } catch (error) {

      setError(error.message)
    }
  }

  useEffect(() => {

    const setBranchesFunction = async () => {

      const { error, data } = await fetchBranches(company._id)

      if (error == null) {

        setError(null)
        setBranches(data)

      } else {

        setError(error)
      }
    }

    setBranchesFunction()
  }, [company])

  useEffect(() => {

    const fetchProviderInputs = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setProviderInputs([])
      setProviderInputsTotal(0.0)
      hideProviderInputs()

      const product = productId == null ? products[0]._id : productId

      console.log(product)

      try {

        const res = await fetch('/api/input/get-provider-inputs/' + company._id + '/' + product + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          return
        }

        data.providerInputs.sort((providerInput, nextProviderInput) => {

          return providerInput.branch.position - nextProviderInput.branch.position
        })

        data.providerInputs.forEach((providerInput) => {

          setProviderInputsTotal((prev) => prev + providerInput.weight)
        })

        setProviderInputs(data.providerInputs)
        setError(null)

      } catch (error) {

        setError(error.message)
      }

    }

    if (productId) {

      fetchProviderInputs()
    }

  }, [company._id, productId, stringDatePickerValue, products])

  useEffect(() => {

    if (defaultProduct) {

      setProductId(defaultProduct._id)
      setProductName(defaultProduct.name)
    }
  }, [defaultProduct])

  return (

    <main className="max-w-lg mx-auto">

      {error ? <p>{error}</p> : ''}

      <div className='border bg-white p-3 mt-4'>
        {/* <SectionHeader label={productName + ' de proveedor'} /> */}

        <div className="grid grid-cols-9 items-center justify-between pr-4">
          <h2 className='col-span-6 flex text-2xl text-center font-semibold mb-4 text-red-800 flex-wrap'>
            <div className="items-center">
              <select name="providerInputProduct" id="providerInputProduct" className=' border p-3 rounded-lg text-lg col-span-3' onChange={(e) => { providerInputButtonControl(), saveProductName(e) }}>

                <option hidden value={defaultProduct ? defaultProduct._id : 'none'}>{defaultProduct ? defaultProduct.name : productName}</option>

                {products && products.length != 0 && products.map((product) => (

                  <option key={product._id} value={product._id}>{product.name}</option>
                ))}
              </select>
            </div>
          </h2>
          <div className=" h-11 w-11 shadow-lg ">

            <button className="w-full h-full" onClick={showProviderInputsFunction}><FaListAlt className="h-full w-full text-red-600" />
            </button>
          </div>
        </div>
        <form onSubmit={submitProviderInput} className="grid grid-cols-4 items-center justify-between">
          <select name="provider" id="provider" className='border p-3 rounded-lg text-xs'>

            <option value="none" disabled selected hidden>Proveedor</option>


          </select>

          <select name="providerInputBranch" id="providerInputBranch" onChange={(e) => { providerInputButtonControl(), saveBranchName(e) }} className='border p-3 rounded-lg text-xs'>

            <option value="none" disabled selected hidden >Sucursal</option>

            {branches && branches.length == 0 ? <option> No hay sucursales registradas </option> : ''}
            {branches && branches.length > 0 && branches.map((branch) => (

              <option key={branch._id} value={branch._id}>{branch.branch}</option>

            ))}
          </select>

          <input type="number" name="providerInputPieces" id="providerInputPieces" placeholder='Piezas' step={0.1} className='border p-3 rounded-lg' required onInput={providerInputButtonControl} onChange={handleProviderInputInputsChange} />
          <input type="number" name="providerInputWeight" id="providerInputWeight" placeholder='0.00 kg' step={0.01} className='border p-3 rounded-lg' required onInput={providerInputButtonControl} onChange={handleProviderInputInputsChange} />

          <textarea className='col-span-4 rounded-lg p-3 shadow mt-2' name="providerInputComment" id="providerInputComment" cols="30" rows="2" defaultValue={'Todo bien'} onChange={handleProviderInputInputsChange}></textarea>


          <button type='submit' id='providerInputButton' disabled className='bg-slate-500 text-white p-3 rounded-lg col-span-4 mt-8'>Agregar</button>

        </form>


      </div>

      <div className="grid my-4 grid-cols-1 rounded-lg" id="list-element">

        {providerInputs && providerInputs.length > 0 && showProviderInputs ?

          <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg max my-auto mx-auto z-10'>
            <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto w-11/12'>
              <button className="" onClick={hideProviderInputs}><MdCancel className="h-7 w-7" /></button>
              < div className='border bg-white shadow-lg  mt-4 mb-4 h-full overflow-y-scroll'>



                <SectionHeader label={'Entradas'} />


                <div>

                  {providerInputs && providerInputs.length > 0 ?
                    <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-0 sticky top-0 bg-white'>
                      <p className='col-span-3 text-center'>Sucursal</p>
                      <p className='col-span-3 text-center'>Encargado</p>
                      <p className='col-span-3 text-center'>Piezas</p>
                      <p className='col-span-1 text-center'>Kg</p>
                    </div>
                    : ''}



                  {providerInputs && providerInputs.length > 0 && providerInputs.map((providerInput, index) => (


                    <div key={providerInput._id} className={(currentUser._id == providerInput.employee || currentUser.role == managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

                      <div id='list-element' className='flex col-span-10 items-center justify-around'>
                        <p className='text-center text-xs  w-3/12'>{providerInput.branch.branch ? providerInput.branch.branch : providerInput.branch}</p>
                        <p className='text-center text-xs w-3/12'>{providerInput.employee != null ? providerInput.employee.name + ' ' + providerInput.employee.lastName : ''}</p>
                        <p className='text-center text-xs w-3/12'>{providerInput.pieces ? providerInput.pieces : '0'}</p>
                        <p className='text-center text-xs w-1/12'>{providerInput.weight}</p>
                      </div>

                      {providerInput.employee._id == currentUser._id || managerRole._id == currentUser.role ?

                        <div>
                          <button id={providerInput._id} onClick={() => { setIsOpen(!isOpen), setButtonId(providerInput._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                            <span>
                              <FaTrash className='text-red-700 m-auto' />
                            </span>
                          </button>

                          {isOpen && providerInput._id == buttonId ?
                            <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                              <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                                <div>
                                  <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                                </div>
                                <div className='flex gap-10'>
                                  <div>
                                    <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteProviderInput(providerInput._id, index), setIsOpen(!isOpen) }}>Si</button>
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

                </div>

                {providerInputs && providerInputs.length > 0 ?

                  <div className='flex my-4 border border-opacity-30 shadow-lg border-black rounded-lg p-3'>
                    <p className='w-6/12 text-center'>Total {'(Kg)'}:</p>
                    <p className='w-6/12 text-center'>{providerInputsTotal}</p>

                  </div>

                  : ''}
              </div>
            </div>
          </div>
          : ''}
      </div>

    </main >
  )
}
