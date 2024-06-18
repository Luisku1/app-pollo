import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"
import FechaDePagina from "../components/FechaDePagina"
import { formatDate } from "../helpers/DatePickerFunctions"

export default function Sobrante() {

  const { company } = useSelector((state) => state.user)
  const [stockByProduct, setStockByProduct] = useState({})
  const [stockByBranch, setStockByBranch] = useState({})
  const [loading, setLoading] = useState(false)
  const [productStockIsOpen, setProductStockIsOpen] = useState(false)
  const [branchStockIsOpen, setBranchStockIsOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [selectedBranchId, setSelectedBranchId] = useState(null)
  const [filterByProduct, setFilterByProduct] = useState(true)
  const [filterByBranch, setFilterByBranch] = useState(false)
  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const navigate = useNavigate()

  const changeDatePickerValue = (e) => {

    stringDatePickerValue = (e.target.value + 'T06:00:00.000Z')
    navigate('/sobrante/' + stringDatePickerValue)

  }

  const changeDay = (date) => {

    navigate('/sobrante/' + date)

  }

  const resetValues = () => {

    setBranchStockIsOpen(false)
    setProductStockIsOpen(false)
    setSelectedProductId(null)
    setSelectedBranchId(null)
  }

  const handleProductFilterButton = () => {

    setFilterByProduct(true)
    setFilterByBranch(false)
  }

  const handleBranchFilterButton = () => {

    setFilterByBranch(true)
    setFilterByProduct(false)
  }

  const selectedProduct = (productId) => {

    if (productId != selectedProductId) {

      setSelectedProductId(productId)

      if (!productStockIsOpen) {

        setProductStockIsOpen((prev) => !prev)
      }

    } else {

      setProductStockIsOpen((prev) => !prev)
    }
  }

  const selectedBranch = (branchId) => {

    if (branchId != selectedBranchId) {

      setSelectedBranchId(branchId)

      if (!branchStockIsOpen) {

        setBranchStockIsOpen((prev) => !prev)
      }

    } else {

      setBranchStockIsOpen((prev) => !prev)
    }
  }

  useEffect(() => {

    setStockByBranch([])
    setStockByProduct([])

    const fetchStockByProduct = async () => {

      setLoading(true)

      const date = (paramsDate ? new Date(paramsDate) : new Date()).toISOString()

      try {

        const res = await fetch('/api/stock/get-total-stock-by-product/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          console.log(data.message)
          setLoading(false)
          return
        }

        setStockByProduct(data.stock)

        setLoading(false)

      } catch (error) {

        setLoading(false)
        console.log(error)
      }
    }

    const fetchStockByBranch = async () => {

      setLoading(true)

      const date = (paramsDate ? new Date(paramsDate) : new Date()).toISOString()

      try {

        const res = await fetch('/api/stock/get-total-stock-by-branch/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          console.log(data.message)
          setLoading(false)
          return
        }
        setStockByBranch(data.stock)
        setLoading(false)

      } catch (error) {

        console.log(error.message)
      }
    }

    fetchStockByProduct()
    fetchStockByBranch()


  }, [company._id, paramsDate])

  return (

    <main className="p-3 max-w-lg mx-auto">


      <FechaDePagina changeDay={changeDay} stringDatePickerValue={stringDatePickerValue} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Sobrante
      </h1>

      <div className="bg-white p-3 mt-4 w-full">

        <div className="grid grid-cols-2 border w-full h-10 mb-4 border-black rounded-lg">
          <button className={"h-full rounded-lg hover:shadow-xl " + (filterByProduct ? 'bg-slate-500 text-white' : ' bg-white')} onClick={() => { resetValues(), handleProductFilterButton() }}>Producto</button>
          <button className={"h-full rounded-lg hover:shadow-xl " + (filterByBranch ? 'bg-slate-500 text-white' : 'bg-white')} onClick={() => { resetValues(), handleBranchFilterButton() }}>Sucursal</button>
        </div>

        {stockByProduct && Object.values(stockByProduct) && filterByProduct && Object.values(stockByProduct).length > 0 && Object.values(stockByProduct).map((stock) => (

          <div key={stock.product._id} className="rounded-lg">

            <button className="text-center p-2 shadow-lg w-full hover:bg-slate-100 active:bg-gray-300 border" onClick={() => { selectedProduct(stock.product._id) }}>
              <p className="font-bold text-red-800">{stock.product.name}</p>
              <p>{stock.total.toFixed(2) + ' Kg'}</p>
            </button>

            {stock.product._id == selectedProductId && Object.values(stock.branches).length > 0 && Object.values(stock.branches).map((branchStock) => (

              <div key={branchStock.branch._id} className={(productStockIsOpen ? '' : 'hidden ') + 'border-l p-3 ml-2 grid grid-cols-3'}>
                <p className="font-bold">{branchStock.branch.branch}</p>
                <p className="text-center">{branchStock.pieces}</p>
                <p>{branchStock.weight.toFixed(2) + ' Kg'}</p>
              </div>
            ))}

          </div>
        ))}

        {stockByBranch && Object.values(stockByBranch) && filterByBranch && Object.values(stockByBranch).length > 0 && Object.values(stockByBranch).map((stock) => (

          <div key={stock.branch._id} className="rounded-lg">

            <button className="text-center p-2 shadow-lg w-full hover:bg-slate-100 active:bg-gray-300 border" onClick={() => { selectedBranch(stock.branch._id) }}>
              <p className="font-bold text-red-800">{stock.branch.branch}</p>
              <p>{stock.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
            </button>

            {stock.branch._id == selectedBranchId && Object.values(stock.stockItems).length > 0 && Object.values(stock.stockItems).map((stockItem) => (

              <div key={stockItem.product._id} className={(branchStockIsOpen ? '' : 'hidden ') + 'border-l p-3 ml-2 grid grid-cols-3'}>
                <p className="font-bold">{stockItem.product.name}</p>
                <p className="text-center">{stockItem.pieces}</p>
                <p className="text-center">{stockItem.weight.toFixed(2) + ' Kg'}</p>
              </div>
            ))}

          </div>
        ))}

      </div>

    </main>
  )
}
