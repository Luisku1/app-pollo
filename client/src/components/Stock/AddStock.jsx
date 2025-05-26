/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { isToday } from "../../helpers/DatePickerFunctions"
import Select from 'react-select'
import SectionHeader from "../SectionHeader"
import ShowListModal from "../Modals/ShowListModal"
import StockList from "./StockList"
import { getArrayForSelects, getElementForSelect } from "../../helpers/Functions"
import { ToastInfo, ToastSuccess } from "../../helpers/toastify"

export default function AddStock({ title, midDay, modifyBalance, stock, isReport = false, listButton, weight, amount, products, onAddStock, onDeleteStock, branch, employee, date, branchPrices }) {

  const { company } = useSelector((state) => state.user)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [stockFormData, setStockFormData] = useState({ pieces: '', weight: '' })
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)

  const handleProductSelectChange = (option) => {
    setSelectedProduct(option)
  }

  const getProductPrice = (productId) => {
    const priceIndex = branchPrices.findIndex((price) => (price.productId == productId))
    return branchPrices[priceIndex].latestPrice
  }

  const handleStockInputsChange = (e) => {
    setStockFormData({
      ...stockFormData,
      [e.target.id]: e.target.value,
    })
  }

  useEffect(() => {
    const stockButtonControl = () => {
      const productSelect = selectedProduct != null
      const employeeSelect = employee != null
      const weightInput = stockFormData.weight !== ''
      const piecesInput = stockFormData.pieces !== ''

      setIsButtonDisabled(!(productSelect && employeeSelect && weightInput && piecesInput))
    }

    stockButtonControl()
  }, [branch, employee, selectedProduct, stockFormData])

  const addStockItem = async (e) => {
    e.preventDefault()
    setIsButtonDisabled(true)

    if (!branch) {
      ToastInfo('Selecciona una sucursal')
      setIsButtonDisabled(false)
      return
    }

    const price = getProductPrice(selectedProduct.value)
    const amount = parseFloat(price * stockFormData.weight)
    const createdAt = isToday(date) ? new Date().toISOString() : new Date(date).toISOString()

    try {
      const { pieces, weight } = stockFormData

      const stock = {
        pieces: parseFloat(pieces),
        weight: parseFloat(weight),
        amount: amount,
        price,
        employee: employee,
        product: selectedProduct,
        branch: branch,
        midDay,
        createdAt,
        company: company._id
      }

      ToastSuccess(`Se registró el sobrante de ${stock.product?.name ?? stock.product?.label}`)
      if (isReport)
        ToastInfo('Recuerda enviar tu formato al finalizar el llenado')
      onAddStock(stock, modifyBalance)

      setStockFormData({ pieces: '', weight: '' })
      setSelectedProduct(null)
    } catch (error) {
      console.log(error)
    } finally {
      setIsButtonDisabled(false)
    }
  }

  const customStockSelectStyles = {
    container: (provided) => ({
      ...provided,
      width: 'fit', // Fija el ancho del select
      height: 'fit',
      borderRadius: '0.5rem',
      border: 'black'
    }),
    control: (provided) => ({
      ...provided,
      minHeight: 'auto', // Ajusta la altura del control
      height: 'fit', // Altura fija
      overflow: 'hidden', // Evita expansión
      borderRadius: '0.5rem',
      border: '1px solid black',
      padding: '.5rem',
      fontSize: '14px'
    }),
    singleValue: (provided) => ({
      ...provided,
      whiteSpace: 'nowrap', // Evita el salto de línea
      overflow: 'hidden', // Oculta el desbordamiento
      textOverflow: 'ellipsis', // Agrega puntos suspensivos
    }),
    clearIndicator: (provided) => ({
      ...provided,
      cursor: 'pointer', // Asegura que el botón sea clickeable
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      display: 'none', // Oculta el Dropdown Indicator
    }),
    placeholder: (provided) => ({
      ...provided,
      fontSize: '14px',
      color: 'black',
    }),
  }

  return (
    <div className='border border-header rounded-md bg-white p-3 mt-4'>
      <div className='grid grid-cols-1'>
        <SectionHeader label={title} />
      </div>
      <form onSubmit={addStockItem} className="grid grid-cols-4">
        <Select
          styles={customStockSelectStyles}
          options={getArrayForSelects(products, (product) => { return product.name })}
          isSearchable={true}
          value={getElementForSelect(selectedProduct, (product) => { return product.name }) || null}
          onChange={handleProductSelectChange}
          placeholder={'Productos'}
        />
        <div className=''>
          <input type="number" name="pieces" id="pieces" placeholder='Piezas' step={0.1} className='w-full border border-black p-3 rounded-lg' required value={stockFormData.pieces} onChange={handleStockInputsChange} />
        </div>
        <div className=''>
          <input type="number" name="weight" id="weight" placeholder='0.00 kg' step={0.001} className='w-full border border-black p-3 rounded-lg' required value={stockFormData.weight} onChange={handleStockInputsChange} />
        </div>
        <button type='submit' id='stock-button' disabled={isButtonDisabled} className='bg-button text-white p-3 rounded-lg'>Agregar</button>
      </form>
      <div className='w-full mt-2'>
        <ShowListModal
          title={'Sobrante'}
          ListComponent={StockList}
          className={'w-full'}
          ListComponentProps={{ stock, weight, amount, onDelete: onDeleteStock, modifyBalance }}
          clickableComponent={listButton}
        />
      </div>
    </div>
  )
}
