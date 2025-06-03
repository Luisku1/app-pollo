import { useState } from "react"
import SectionHeader from "../SectionHeader"
import { useSelector } from "react-redux"
import { useDate } from "../../context/DateContext"
import { useProducts } from "../../hooks/Products/useProducts"
import useProvidersPurchases from "../../hooks/Providers/useProvidersPurchases"
import ShowListModal from "../Modals/ShowListModal"
import Select from "react-select"
import { customSelectStyles } from "../../helpers/Constants"
import { currency, getArrayForSelects, getElementForSelect } from "../../helpers/Functions"
import PurchasesList from "./PurchasesList"

export default function CreateProviderPurchase() {
  const { company } = useSelector((state) => state.user)
  const { currentDate: date } = useDate()
  const { products } = useProducts({ companyId: company._id })
  const { providers } = useProviders({ companyId: company._id })
  const {
    purchases,
    totalAmount,
    onAddPurchase,
    onDeletePurchase,
    loading
  } = useProvidersPurchases({ companyId: company._id, date })

  const [purchaseFormData, setPurchaseFormData] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [amount, setAmount] = useState('$0.00')
  const [showList, setShowList] = useState(false)

  const handleInputChange = (e) => {
    setPurchaseFormData({
      ...purchaseFormData,
      [e.target.name]: e.target.value
    })
    if (e.target.name === 'price' || e.target.name === 'weight') {
      const price = parseFloat(e.target.name === 'price' ? e.target.value : purchaseFormData.price || 0)
      const weight = parseFloat(e.target.name === 'weight' ? e.target.value : purchaseFormData.weight || 0)
      setAmount((price * weight).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }))
    }
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
    const { weight, price, pieces, comment } = purchaseFormData
    const purchase = {
      product: selectedProduct.value,
      provider: selectedProvider.value,
      company: company._id,
      weight: parseFloat(weight),
      price: parseFloat(price),
      amount: parseFloat(amount.replace(/[$,]/g, '')),
      pieces: parseFloat(pieces),
      comment: comment || '',
      // supervisor: currentUser._id, // Si se requiere, agregar aquí
      createdAt: new Date(date).toISOString()
    }
    await onAddPurchase(purchase)
    setPurchaseFormData({})
    setSelectedProduct(null)
    setSelectedProvider(null)
    setAmount('$0.00')
  }

  return (
    <div>
      <div className='border rounded-md p-3 mt-4'>
        <div className='grid grid-cols-2'>
          <SectionHeader label={'Compras a Proveedor'} />
          <div className='flex items-center gap-4 justify-self-end mr-12'>
            <ShowListModal
              title={'Compras a Proveedor'}
              ListComponent={PurchasesList}
              ListComponentProps={{ purchases, totalAmount, onDelete: onDeletePurchase }}
              clickableComponent={<p className='font-bold text-lg text-center border border-header rounded-lg p-1'>{currency(totalAmount)}</p>}
            />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Select
              styles={customSelectStyles}
              onChange={handleProductSelectChange}
              value={getElementForSelect(selectedProduct, (product) => product.name)}
              options={getArrayForSelects(products, (product) => product.name)}
              placeholder={'Producto'}
              isSearchable={true}
            />
            <Select
              styles={customSelectStyles}
              onChange={handleProviderSelectChange}
              value={getElementForSelect(selectedProvider, (provider) => provider.name)}
              options={getArrayForSelects(providers, (provider) => provider.name)}
              placeholder={'Proveedor'}
              isSearchable={true}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <input type="number" name="weight" placeholder='0.000 kg' step={0.001} className='border border-black p-3 rounded-lg w-full' required onChange={handleInputChange} />
            <input type="number" name="pieces" placeholder='0.00' step={0.01} className='border border-black p-3 rounded-lg w-full' required onChange={handleInputChange} />
            <input type="number" name="price" placeholder='$0.00' step={0.01} className='border border-black p-3 rounded-lg w-full' required onChange={handleInputChange} />
            <input className='w-full rounded-lg p-3 text-green-700 font-semibold border border-green-600' name='amount' value={amount} readOnly />
          </div>
          <textarea className='text-sm border border-black rounded-lg p-3' name="comment" placeholder='Comentario (opcional, máx 200 caracteres)' maxLength={200} onChange={handleInputChange} value={purchaseFormData.comment || ''}></textarea>
          <button type='submit' className='bg-button text-white p-3 rounded-lg col-span-12 mt-8'>Agregar</button>
        </form>
      </div>
    </div>
  )
}
