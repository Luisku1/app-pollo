import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

export default function Precios() {

  const { company } = useSelector((state) => state.user)
  const [prices, setPrices] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [pricesFormData, setPricesFormData] = useState({})
  const navigate = useNavigate()
  const [buttonDisabled, setButonDisabled] = useState(true)


  const handleInputsChange = (e, productId, branchId) => {

    setButonDisabled(false)

    if(e.target.value == "") {

      delete pricesFormData[e.target.id]

      if(Object.keys(pricesFormData).length == 0) {

        setButonDisabled(true)

      }

    } else {

      setPricesFormData({
        ...pricesFormData,
        [e.target.id]: {
          product: productId,
          branch: branchId,
          price: e.target.value
        }
      })
    }
  }

  const submitPrices = async () => {

    setLoading(true)

    try {

      const res = await fetch('/api/product/price/new-prices/' + company._id, {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pricesFormData)
      })

      const data = await res.json()

      if(data.success === false) {

        setError(error)
        setLoading(false)
        return
      }

      setSuccessMessage('Precios actualizados')
      setError(null)
      setLoading(false)

      navigate('/precios')

    } catch (error) {

      setError(error)
    }
  }

  useEffect(() => {

    const fetchBranchPrices = async () => {

      try {

        const res = await fetch('/api/product/price/get-products-price/' + company._id)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          return
        }

        setPrices(data.data)
        setError(null)

      } catch (error) {

        setError(error.message)
      }

    }

    fetchBranchPrices()

  }, [company._id])

  return (
    <main className="p-3 max-w-lg mx-auto">

      {error ? <p>{error}</p> : ''}

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Precios
      </h1>

      <div className="grid my-4 grid-cols-1 rounded-lg" id="list-element">

        {prices && prices.length > 0 && prices.map((data) => (

          <div key={data._id.branchId} className="shadow-lg bg-gray-100 rounded-lg mt-4">

            <p className="text-center">{data._id.branchName}</p>

            {data.prices && data.prices.length > 0 && data.prices.map((price) => (

              <div key={price.productId} className="grid grid-cols-2 p-1 border ">

                <p>{price.product}:</p>
                <input type="number" name="price" id={price.productId + data._id.branchId} className="" onChange={(e) => {handleInputsChange(e, price.productId, data._id.branchId)}} placeholder={price.latestPrice ? price.latestPrice : '0'}/>

              </div>

            ))}

          </div>
        ))}
      </div>


      <div className="w-full">

        <button className='w-full bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80' id="button" onClick={() => {submitPrices()}} disabled={buttonDisabled || loading}>Guardar precios</button>

        {successMessage ? <p>{successMessage}</p>: ''}

      </div>

    </main>
  )
}