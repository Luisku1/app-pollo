import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"

export default function Sobrante() {

  const { company } = useSelector((state) => state.user)
  const [stock, setStock] = useState({})
  const [loading, setLoading] = useState(false)
  const [branchStockIsOpen, setBranchStockIsOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
  let paramsDate = useParams().date
  const navigate = useNavigate()

  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())

  const formatDate = (date) => {

    const actualLocaleDate = date

    return (actualLocaleDate.getFullYear() + '-' + (actualLocaleDate.getMonth() < 9 ? '0' + ((actualLocaleDate.getMonth()) + 1) : ((actualLocaleDate.getMonth()))) + '-' + ((actualLocaleDate.getDate() < 10 ? '0' : '') + actualLocaleDate.getDate()) + 'T06:00:00.000Z')

  }

  let stringDatePickerValue = formatDate(datePickerValue)

  const changeDatePickerValue = (e) => {

    datePickerValue = new Date(e.target.value)
    stringDatePickerValue = formatDate(new Date(e.target.value + 'T06:00:00.000Z'))

    navigate('/sobrante/' + stringDatePickerValue)

  }

  const productsBranches = (productId) => {

    if(productId != selectedProductId) {

      setSelectedProductId(productId)

      if(!branchStockIsOpen) {

        setBranchStockIsOpen((prev) => !prev)
      }

    } else {

      setBranchStockIsOpen((prev) => !prev)
    }

  }

  useEffect(() => {

    const fetchStock = async () => {

      setLoading(true)

      const date = (paramsDate ? new Date(paramsDate) : new Date()).toISOString()

      try {

        const res = await fetch('/api/stock/get-total-stock/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          console.log(data.message)
          setLoading(false)
          return
        }

        setStock(data.stock)

        setLoading(false)

      } catch (error) {

        setLoading(false)
        console.log(error)
      }
    }

    fetchStock()

  }, [company._id, paramsDate])

  return (

    <main className="p-3 max-w-lg mx-auto">

      <div className="flex justify-center">
        <input className="p-1" type="date" name="date" id="date" onChange={changeDatePickerValue} defaultValue={stringDatePickerValue.slice(0, 10)} />
      </div>

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Sobrante
      </h1>

      <div className="bg-white p-3 mt-4 w-full">

        {stock && Object.values(stock) && Object.values(stock).length > 0 && Object.values(stock).map((stock) => (

          <div key={stock.product._id} onClick={() => {productsBranches(stock.product._id)}} className="rounded-lg">

            <button className="text-center p-2 shadow-lg w-full hover:bg-slate-100 active:bg-gray-300 border">
              <p className="font-bold text-red-800">{stock.product.name}</p>
              <p>{stock.total.toFixed(2) + ' Kg'}</p>
            </button>

            {stock.product._id == selectedProductId && Object.values(stock.branches).length > 0 && Object.values(stock.branches).map((branchStock) => (

              <div key={branchStock.branch._id} className={(branchStockIsOpen ? '' : 'hidden ') + 'border-l p-3 ml-2 grid grid-cols-2'}>
                <p className="font-bold">{branchStock.branch.branch}</p>
                <p>{branchStock.weight.toFixed(2) + ' Kg'}</p>
              </div>
            ))}

          </div>
        ))}

      </div>

    </main>
  )
}
