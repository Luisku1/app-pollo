import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams, useNavigate } from 'react-router-dom';

export default function EntradaInicial() {

  const { company, currentUser } = useSelector((state) => state.user)
  const { productId, productName } = useParams()
  const [initialInputs, setInitialInputs] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [initialInputsFormData, setInitialInputsFormData] = useState({})
  const navigate = useNavigate()
  const [total, setTotal] = useState(0.0)
  const [buttonDisabled, setButonDisabled] = useState(true)


  const handleInputsChange = (e, branchId) => {

    setButonDisabled(false)

    if (e.target.value == "") {

      delete initialInputsFormData[e.target.id]

      if (Object.keys(initialInputsFormData).length == 0) {

        setButonDisabled(true)

      }

    } else {

      setInitialInputsFormData({
        ...initialInputsFormData,
        [e.target.id]: {
          branch: branchId,
          weight: e.target.value,
          product: productId,
          employee: currentUser._id
        }
      })
    }
  }

  const submitinitialInputs = async () => {

    setLoading(true)

    try {

      const res = await fetch('/api/input/update-provider-inputs/', {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(initialInputsFormData)
      })

      const data = await res.json()

      if (data.success === false) {

        setError(error)
        setLoading(false)
        return
      }

      setSuccessMessage('Pesadas actualizados')
      setError(null)
      setLoading(false)

      navigate('/supervision-diaria')

    } catch (error) {

      setError(error)
    }
  }

  useEffect(() => {

    const fetchProviderInputs = async () => {

      const date = new Date().toISOString()

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

        data.providerInputs.forEach((input) => {

          setTotal((prev) => prev + input.weight)
        })
        setInitialInputs(data.providerInputs)
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

      <div className="grid my-4 grid-cols-1 rounded-lg" id="list-element">

        {initialInputs && initialInputs.length > 0 && initialInputs.map((initialInput) => (

          <div key={initialInput._id} className="shadow-lg bg-gray-100 rounded-lg mt-1">
            <div key={initialInput._id} className="grid grid-cols-2 p-1 border ">
              <p>{initialInput.branch.branch}:</p>
              <input type="number" name="weight" id={initialInput._id} className="" onChange={(e) => { handleInputsChange(e, initialInput.branch._id) }} placeholder={initialInput.weight ? initialInput.weight : '0.0'} />

            </div>
          </div>
        ))}
        <div className="my-4 bg-white p-3 flex justify-around font-bold shadow-lg rounded-lg">
          <p>Total (Kg): </p>
          <p>{total}</p>
        </div>
      </div>


      <div className="w-full">

        <button className='w-full bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80' id="button" onClick={() => { submitinitialInputs() }} disabled={buttonDisabled || loading}>Actualizar</button>

        {successMessage ? <p>{successMessage}</p> : ''}

      </div>
    </main>
  )
}
