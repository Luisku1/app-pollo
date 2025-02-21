/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { isToday } from "../../helpers/DatePickerFunctions"
import Select from 'react-select'
import SectionHeader from "../SectionHeader"
import ShowListModal from "../Modals/ShowListModal"
import StockList from "./StockList"
import { getArrayForSelects, getElementForSelect } from "../../helpers/Functions"

export default function AddStock({ modifyBalance, stock, listButton, weight, amount, products, onAddStock, onDeleteStock, branch, employee, date, branchPrices, isEditing }) {

  const { company } = useSelector((state) => state.user)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [stockFormData, setStockFormData] = useState({})

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

  const stockButtonControl = () => {

    const productSelect = selectedProduct != null
    const branchSelect = branch != null
    const employeeSelect = employee != null

    if (branchSelect && employeeSelect && productSelect) {

      const weightInput = document.getElementById('weight')
      const button = document.getElementById('stock-button')

      let filledInputs = true

      if (weightInput.value == '') {

        filledInputs = false
      }

      if (filledInputs) {

        button.disabled = false

      } else {

        button.disabled = true
      }
    }
  }

  useEffect(stockButtonControl, [branch, employee, selectedProduct])

  const addStockItem = async (e) => {

    e.preventDefault()

    const button = document.getElementById('stock-button')

    button.disabled = true

    const piecesInput = document.getElementById('pieces')
    const weightInput = document.getElementById('weight')
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
        createdAt,
        company: company._id
      }

      onAddStock(stock, modifyBalance)

      weightInput.value = ''
      piecesInput.value = ''

      button.disabled = false

    } catch (error) {

      button.disabled = false
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
        <SectionHeader label={'Sobrante'} />
      </div>
      {isEditing && (
        <form onSubmit={addStockItem} className="grid grid-cols-4">
          <Select
            styles={customStockSelectStyles}
            options={getArrayForSelects(products, (product) => { return product.name })}
            isSearchable={true}
            value={getElementForSelect(selectedProduct, (product) => { return product.name }) || null}
            onChange={handleProductSelectChange}
            placeholder={'Productos'}
          />
          <div className='relative'>
            <input type="number" name="pieces" id="pieces" placeholder='Piezas' step={0.1} className='w-full border border-black p-3 rounded-lg' required onInput={stockButtonControl} onChange={handleStockInputsChange} />
            <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
              Piezas <span>*</span>
            </label>
          </div>
          <div className='relative'>
            <input type="number" name="weight" id="weight" placeholder='0.00 kg' step={0.001} className='w-full border border-black p-3 rounded-lg' required onInput={stockButtonControl} onChange={handleStockInputsChange} />
            <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
              Kilos<span>*</span>
            </label>
          </div>
          <button type='submit' id='stock-button' disabled className='bg-button text-white p-3 rounded-lg'>Agregar</button>
        </form>
      )}
      <div className='w-full mt-2'>
        <ShowListModal
          title={'Sobrante'}
          ListComponent={StockList}
          ListComponentProps={{ stock, weight, amount, onDelete: onDeleteStock, modifyBalance }}
          clickableComponent={listButton}
        />
      </div>
    </div>
  )
}
