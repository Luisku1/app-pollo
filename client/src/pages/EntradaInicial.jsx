import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams } from 'react-router-dom';
import SectionHeader from "../components/SectionHeader";
import { fetchBranches } from "../helpers/FetchFunctions";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import { FaTrash } from "react-icons/fa";

export default function EntradaInicial() {

  const { company, currentUser } = useSelector((state) => state.user)
  const { productId, productName } = useParams()
  const [providerInputs, setProviderInputs] = useState([])
  const [branches, setBranches] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [providerInputFormData, setProviderInputFormData] = useState({})
  const [providerInputsTotal, setProviderInputsTotal] = useState(0.0)
  const [branchName, setBranchName] = useState(null)
  const [providerInputsIsOpen, setProviderInputsIsOpen] = useState(true)
  const [buttonId, setButtonId] = useState(null)
  const [isOpen, setIsOpen] = useState(false)

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

    const weightInput = document.getElementById('weight')
    const piecesInput = document.getElementById('pieces')
    const button = document.getElementById('input-button')
    const branchSelect = document.getElementById('branch')

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

  const submitInput = async (e) => {

    const piecesInput = document.getElementById('pieces')
    const weightInput = document.getElementById('weight')
    const branchInput = document.getElementById('branch')
    const commentInput = document.getElementById('comment')

    e.preventDefault()

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
          comment: commentInput.value
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      data.providerInput.branch = branchName
      data.providerInput.product = productName
      data.providerInput.employee = currentUser

      setError(null)
      setProviderInputs([...providerInputs, data.providerInput])
      setProviderInputsTotal((prev) => prev + data.providerInput.weight)

      piecesInput.value = ''
      weightInput.value = ''
      branchInput.value = 'none'

      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)

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

      const date = new Date().toISOString()
      setProviderInputsTotal(0.0)

      try {

        const res = await fetch('/api/input/get-provider-inputs/' + company._id + '/' + productId + '/' + date)
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

  }, [company._id, productId])

  return (
    <main className="p-3 max-w-lg mx-auto">
      {error ? <p>{error}</p> : ''}

      <h1 className='text-3xl text-center font-semibold mt-7'>
        {productName}
      </h1>

      <div className='border bg-white p-3 mt-4'>

        <SectionHeader label={productName + ' de proveedor'} />

        <form onSubmit={submitInput} className="grid grid-cols-4 items-center justify-between">
          <select name="provider" id="provider" className='border p-3 rounded-lg text-xs'>

            <option value="none" disabled selected hidden>Proveedor</option>


          </select>

          <select name="branch" id="branch" onChange={(e) => { providerInputButtonControl(), saveBranchName(e) }} className='border p-3 rounded-lg text-xs'>

            <option value="none" disabled selected hidden >Sucursal</option>

            {branches && branches.length == 0 ? <option> No hay sucursales registradas </option> : ''}
            {branches && branches.length > 0 && branches.map((branch) => (

              <option key={branch._id} value={branch._id}>{branch.branch}</option>

            ))}
          </select>

          <input type="number" name="pieces" id="pieces" placeholder='Piezas' step={0.1} className='border p-3 rounded-lg' required onInput={providerInputButtonControl} onChange={handleProviderInputInputsChange} />
          <input type="number" name="weight" id="weight" placeholder='0.00 kg' step={0.01} className='border p-3 rounded-lg' required onInput={providerInputButtonControl} onChange={handleProviderInputInputsChange} />

          <textarea className='col-span-4 rounded-lg p-3 shadow mt-2' name="comment" id="comment" cols="30" rows="2" defaultValue={'Todo bien'} onChange={handleProviderInputInputsChange}></textarea>


          <button type='submit' id='input-button' disabled className='bg-slate-500 text-white p-3 rounded-lg col-span-4 mt-8'>Agregar</button>

        </form>


      </div>

      <div className="grid my-4 grid-cols-1 rounded-lg" id="list-element">

        {providerInputs && providerInputs.length > 0 ?
          < div className='border bg-white shadow-lg p-3 mt-4'>

            <div className='flex gap-4 display-flex justify-between' onClick={() => setProviderInputsIsOpen(!providerInputsIsOpen)} >

              <SectionHeader label={'Entradas'} />
              {providerInputsIsOpen ? <MdKeyboardArrowDown className='text-5xl' /> : <MdKeyboardArrowRight className='text-5xl' />}

            </div>

            <div className={providerInputsIsOpen ? '' : 'hidden'} >

              {providerInputs && providerInputs.length > 0 ?
                <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
                  <p className='col-span-3 text-center'>Sucursal</p>
                  <p className='col-span-3 text-center'>Encargado</p>
                  <p className='col-span-3 text-center'>Producto</p>
                  <p className='col-span-1 text-center'>Kg</p>
                </div>
                : ''}
              {providerInputs && providerInputs.length > 0 && providerInputs.map((providerInput, index) => (


                <div key={providerInput._id} className={(currentUser._id == providerInput.employee ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

                  <div id='list-element' className='flex col-span-10 items-center justify-around'>
                    <p className='text-center text-xs  w-3/12'>{providerInput.branch.branch ? providerInput.branch.branch : providerInput.branch}</p>
                    <p className='text-center text-xs w-3/12'>{providerInput.employee != null ? providerInput.employee.name + ' ' + providerInput.employee.lastName : ''}</p>
                    <p className='text-center text-xs w-3/12'>{productName}</p>
                    <p className='text-center text-xs w-1/12'>{providerInput.weight}</p>
                  </div>

                  {

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

                    }

                </div>

              ))}
            </div>

            {providerInputs && providerInputs.length > 0 ?

              <div className='flex mt-4 border border-opacity-30 shadow-lg border-black rounded-lg p-3'>
                <p className='w-6/12 text-center'>Total {'(Kg)'}:</p>
                <p className='w-6/12 text-center'>{providerInputsTotal}</p>

              </div>

              : ''}
          </div>
          : ''}
      </div>

    </main>
  )
}
