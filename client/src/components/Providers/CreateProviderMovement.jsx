import { useEffect, useState } from "react"
import SectionHeader from "../SectionHeader"
import { useSelector } from "react-redux"
import { useProducts } from "../../hooks/Products/useProducts"
import ShowListModal from "../Modals/ShowListModal"
import Select from "react-select"
import { customSelectStyles } from "../../helpers/Constants"
import { currency, getArrayForSelects, getElementForSelect } from "../../helpers/Functions"
import { useProviders } from "../../hooks/Providers/useProviders"
import useProvidersMovements from "../../hooks/Providers/useProvidersMovements"
import ProviderMovementsList from "./ProviderMovementsList"
import { useDateNavigation } from "../../hooks/useDateNavigation"

export default function CreateProviderMovement() {
  const { company } = useSelector((state) => state.user)
  const { currentDate: date } = useDateNavigation()
  const { products } = useProducts({ companyId: company._id })
  const { providers } = useProviders(company._id)

  const [movementFormData, setMovementFormData] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [amount, setAmount] = useState('$0.00')
  const [changePrice, setChangePrice] = useState(false);
  const {
    movements,
    totalAmount,
    onAddMovement,
    onDeleteMovement,
    price: lastPrice,
    loading
  } = useProvidersMovements({ companyId: company._id, date, productId: selectedProduct?._id, providerId: selectedProvider?._id })

  // Generar monto automáticamente
  const generarMonto = () => {
    const weight = parseFloat(movementFormData.weight || 0);
    const priceValue = movementFormData.price != '' ? movementFormData.price : lastPrice;
    setAmount((priceValue * weight).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }));
  };

  const handleInputChange = (e) => {
    setMovementFormData({
      ...movementFormData,
      [e.target.name]: e.target.value
    });
  }

  const handleProductSelectChange = (product) => {
    setSelectedProduct(product)
  }

  const handleProviderSelectChange = (provider) => {
    setSelectedProvider(provider)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProduct || !selectedProvider) return
    const { weight, price, pieces, comment } = movementFormData
    const purchase = {
      product: selectedProduct.value,
      provider: selectedProvider.value,
      company: company._id,
      weight: parseFloat(weight),
      price: parseFloat(price),
      amount: parseFloat(amount.replace(/[$,]/g, '')),
      pieces: parseFloat(pieces),
      comment: comment || '',
      employee: currentUser._id,
      createdAt: new Date(date).toISOString()
    }
    await onAddMovement(purchase)
    setMovementFormData({})
    setSelectedProduct(null)
    setSelectedProvider(null)
    setAmount('$0.00')
  }

  useEffect(generarMonto, [movementFormData.price,movementFormData.weight, lastPrice])

  const onChangeCheck = (e) => {

    const priceInput = document.getElementById('input-price');
    setChangePrice(e.target.checked)

    if (e.target.checked) {
      priceInput.classList.remove('bg-gray-200');
      priceInput.classList.add('bg-white');
      priceInput.disabled = false;
      priceInput.focus();
    } else {
      priceInput.classList.add('bg-gray-200');
      priceInput.classList.remove('bg-white');
      priceInput.disabled = true;
      setMovementFormData({
        ...movementFormData,
        price: priceInput.value || 0
      });
      priceInput.select();
    }
  }

  return (
    <div className="w-full">
      <div className='border rounded-md p-3'>
        <div className='grid grid-cols-2'>
          <SectionHeader label={'Compras a Proveedor'} />
          <div className='flex items-center gap-4 justify-self-end mr-12'>
            <ShowListModal
              title={'Compras a Proveedor'}
              ListComponent={ProviderMovementsList}
              ListComponentProps={{ movements, totalAmount, onDelete: onDeleteMovement }}
              clickableComponent={<p className='font-bold text-lg text-center border border-header rounded-lg p-1'>{currency(totalAmount)}</p>}
            />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="product-select">Producto</label>
              <Select
                inputId="product-select"
                styles={customSelectStyles}
                onChange={handleProductSelectChange}
                value={getElementForSelect(selectedProduct, (product) => product.name)}
                options={getArrayForSelects(products, (product) => product.name)}
                placeholder={'Producto'}
                menuPortalTarget={document.body}
                isSearchable={true}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="provider-select">Proveedor</label>
              <Select
                inputId="provider-select"
                styles={customSelectStyles}
                onChange={handleProviderSelectChange}
                value={getElementForSelect(selectedProvider, (provider) => provider.name)}
                options={getArrayForSelects(providers, (provider) => provider.name)}
                placeholder={'Proveedor'}
                menuPortalTarget={document.body}
                isSearchable={true}
              />
            </div>
          </div>
          {/* Precio y cambiar precio */}
          <label htmlFor="input-price" className="block text-sm font-semibold mb-1">Precio</label>
          <div className="flex items-center gap-4 mb-2">
            <div className="relative w-1/2">
              <span className="absolute text-red-700 font-semibold left-3 top-3">$</span>
              <input
                className={`pl-6 w-full ${!changePrice ? 'bg-gray-100' : 'bg-white'} rounded-lg p-3 text-red-700 font-semibold border border-red-600`}
                name='price'
                id='input-price'
                step={0.01}
                placeholder={lastPrice.toFixed(2)}
                type="number"
                value={movementFormData.price || ''}
                onChange={handleInputChange}
                disabled={!changePrice}
              />
              <label htmlFor="input-price" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Precio
              </label>
            </div>
            <div className={`flex items-center gap-2 w-1/2 rounded-lg p-2 transition-colors duration-200`}>
              <input
                type="checkbox"
                id="changePriceInput"
                name="changePriceInput"
                className="w-5 h-5 accent-blue-600"
                checked={changePrice}
                onChange={onChangeCheck}
              />
              <label htmlFor="changePriceInput" className="text-md font-semibold">
                Cambiar precio
              </label>
            </div>
          </div>
          {/* Piezas, Peso, Total */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className='relative'>
              <label htmlFor="input-pieces" className="block text-sm font-semibold mb-1">Piezas <span>*</span></label>
              <input type="number" name="pieces" id="input-pieces" placeholder='0.00' step={0.01} className='w-full border border-black p-3 rounded-lg' required onChange={handleInputChange} value={movementFormData.pieces || ''} />
            </div>
            <div className='relative'>
              <label htmlFor="input-weight" className="block text-sm font-semibold mb-1">Kilos <span>*</span></label>
              <input type="number" name="weight" id="input-weight" placeholder='0.000 kg' step={0.001} className='w-full border border-black p-3 rounded-lg' required onChange={handleInputChange} value={movementFormData.weight || ''} />
            </div>
            <div className='relative items-center'>
              <label htmlFor="input-amount" className="block text-sm font-bold mb-1 text-green-700">Total</label>
              <p className='text-green-700 bg-gray-100 w-full border border-black rounded-md p-3'>{amount}</p>
            </div>
          </div>
          {/* Comentario ocupa todo el espacio */}
          <div className='w-full'>
            <label htmlFor="input-comment" className="block text-sm font-semibold mb-1">Comentario</label>
            <textarea className='w-full text-sm border border-black rounded-lg p-3' name="comment" id="input-comment" placeholder='Comentario (opcional, máx 200 caracteres)' maxLength={200} onChange={handleInputChange} value={movementFormData.comment || ''}></textarea>
          </div>
          <button type='submit' className='bg-button text-white p-3 rounded-lg col-span-12 mt-8'>Agregar</button>
        </form>
      </div>
    </div>
  )
}
