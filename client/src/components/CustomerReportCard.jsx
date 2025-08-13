/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { toPng } from 'html-to-image'
import { AiOutlineDownload, AiOutlineCopy, AiOutlineLink } from 'react-icons/ai'
import { FaSpinner } from 'react-icons/fa'
import ShowListModal from './Modals/ShowListModal'
import { ToastDanger, ToastSuccess } from '../helpers/toastify'
import { formatInformationDate } from '../helpers/DatePickerFunctions'

// Utilidades simples
const currency = (n = 0) => (parseFloat(n || 0)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

// Listas internas (podrían extraerse si se reutilizan)
function CustomerSalesList({ sales = [], title = 'Ventas' }) {
  if (!sales.length) return <p className='text-center text-sm text-gray-500'>Sin {title.toLowerCase()}</p>
  return (
    <ul className='divide-y max-h-80 overflow-y-auto text-sm'>
      {sales.map(sale => (
        <li key={sale._id} className='flex justify-between gap-2 py-1 px-1'>
          <div className='flex flex-col'>
            <span className='font-semibold'>{sale?.product?.name || 'Producto'}</span>
            <span className='text-[11px] text-gray-500'>Cantidad: {sale?.quantity ?? sale?.qty ?? '-'}</span>
            {sale?.branch && <span className='text-[11px] text-gray-400'>{sale.branch.branch}</span>}
          </div>
          <span className='font-medium'>{currency(sale.amount || sale.total || sale.price)}</span>
        </li>
      ))}
    </ul>
  )
}

function CustomerReturnsList({ returnsArray = [] }) {
  if (!returnsArray.length) return <p className='text-center text-sm text-gray-500'>Sin devoluciones</p>
  return (
    <ul className='divide-y max-h-80 overflow-y-auto text-sm'>
      {returnsArray.map(ret => (
        <li key={ret._id} className='flex justify-between gap-2 py-1 px-1'>
          <div className='flex flex-col'>
            <span className='font-semibold'>{ret?.product?.name || 'Producto'}</span>
            <span className='text-[11px] text-gray-500'>Cant: {ret?.quantity ?? ret?.qty ?? '-'}</span>
            {ret?.branch && <span className='text-[11px] text-gray-400'>{ret.branch.branch}</span>}
          </div>
          <span className='font-medium'>{currency(ret.amount || ret.total || ret.price)}</span>
        </li>
      ))}
    </ul>
  )
}

function CustomerPaymentsList({ paymentsArray = [] }) {
  if (!paymentsArray.length) return <p className='text-center text-sm text-gray-500'>Sin pagos</p>
  return (
    <ul className='divide-y max-h-80 overflow-y-auto text-sm'>
      {paymentsArray.map(pay => (
        <li key={pay._id} className='flex justify-between gap-2 py-1 px-1'>
          <div className='flex flex-col'>
            <span className='font-semibold'>{pay?.type?.name || 'Pago'}</span>
            {pay?.employee && <span className='text-[11px] text-gray-500'>{pay.employee?.firstName || ''} {pay.employee?.lastName || ''}</span>}
            {pay?.branch && <span className='text-[11px] text-gray-400'>{pay.branch.branch}</span>}
          </div>
          <span className='font-medium'>{currency(pay.amount)}</span>
        </li>
      ))}
    </ul>
  )
}

export default function CustomerReportCard({ reportData = {} }) {
  const { customer, previousBalance = 0, sales = 0, returns = 0, payments = 0, balance = 0, branchSales = [], directSales = [], returnsArray = [], paymentsArray = [], createdAt } = reportData
  const [loadingImage, setLoadingImage] = useState(false)
  const { company } = useSelector(state => state.user)

  // Acciones de export/copy
  const handleDownloadImage = async () => {
    try {
      setLoadingImage(true)
      const node = document.getElementById(`customer-report-card-${reportData._id}`)
      const toolsDiv = node?.querySelector("[name='tools']")
      if (toolsDiv) toolsDiv.style.display = 'none'
      const dataUrl = await toPng(node)
      if (toolsDiv) toolsDiv.style.display = ''
      const link = document.createElement('a')
      link.download = `${customer?.name || 'cliente'}_${new Date(createdAt).toLocaleDateString('es-MX')}.png`
      link.href = dataUrl
      link.click()
      setLoadingImage(false)
    } catch (error) {
      console.error(error)
      ToastDanger('Error al descargar')
      setLoadingImage(false)
    }
  }

  const handleCopyImage = async () => {
    try {
      setLoadingImage(true)
      const node = document.getElementById(`customer-report-card-${reportData._id}`)
      const toolsDiv = node?.querySelector("[name='tools']")
      if (toolsDiv) toolsDiv.style.display = 'none'
      const dataUrl = await toPng(node)
      if (toolsDiv) toolsDiv.style.display = ''
      const blob = await (await fetch(dataUrl)).blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      ToastSuccess('Imagen copiada')
      setLoadingImage(false)
    } catch (error) {
      console.error(error)
      ToastDanger('Error al copiar imagen')
      setLoadingImage(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      const text = `${window.location.origin}/reporte-cliente/${reportData._id}`
      await navigator.clipboard.writeText(text)
      ToastSuccess('Link copiado')
    } catch (error) {
      ToastDanger('Error al copiar link')
    }
  }

  const totalSales = sales // backend ya acumula ventas (branch + direct) en campo sales
  const totalBranchSalesAmount = branchSales.reduce((a, b) => a + (b.amount || 0), 0)
  const totalDirectSalesAmount = directSales.reduce((a, b) => a + (b.amount || 0), 0)
  const totalReturnsAmount = returns
  const totalPaymentsAmount = payments

  return (
    <div id={`customer-report-wrapper-${reportData._id}`} className='w-full border border-black shadow-md bg-white rounded-lg'>
      {/* Barra superior estado */}
      <div className={`w-full h-2 rounded-t-lg ${balance < 0 ? 'bg-red-500' : balance === 0 ? 'bg-yellow-200' : 'bg-green-300'}`} />
      <div id={`customer-report-card-${reportData._id}`} className='bg-white rounded-b-lg p-3 relative'>
        {loadingImage && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/60 z-50'>
            <FaSpinner className='text-4xl animate-spin' />
          </div>)}
        <div className={`${loadingImage ? 'blur-sm' : ''}`}>
          {/* Header */}
          <div className='flex justify-between items-center mb-2'>
            <h2 className='text-lg font-semibold text-red-500'>{customer?.name || 'Cliente'}</h2>
            <p className='text-lg font-semibold text-red-500'>{createdAt ? formatInformationDate(new Date(createdAt)) : ''}</p>
          </div>
          {/* Tools */}
          <div name='tools' className='w-full flex flex-row-reverse text-2xl gap-3'>
            <button onClick={handleDownloadImage} className='border h-fit border-black rounded-lg p-1' title='Descargar imagen'><AiOutlineDownload /></button>
            <button onClick={handleCopyLink} className='border h-fit border-black rounded-lg p-1' title='Copiar link'><AiOutlineLink /></button>
            <button onClick={handleCopyImage} className='border h-fit border-black rounded-lg p-1' title='Copiar imagen'><AiOutlineCopy /></button>
          </div>
          {/* Resumen */}
          <div className='mt-2 space-y-3'>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <p className='text-xs uppercase text-gray-500'>Balance anterior</p>
                <p className='font-semibold'>{currency(previousBalance)}</p>
              </div>
              <div>
                <p className='text-xs uppercase text-gray-500'>Balance</p>
                <p className={`font-semibold ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>{currency(balance)}</p>
              </div>
              <div>
                <p className='text-xs uppercase text-gray-500'>Ventas sucursal</p>
                <p className='font-semibold'>{currency(totalBranchSalesAmount)}</p>
              </div>
              <div>
                <p className='text-xs uppercase text-gray-500'>Ventas directas</p>
                <p className='font-semibold'>{currency(totalDirectSalesAmount)}</p>
              </div>
              <div>
                <p className='text-xs uppercase text-gray-500'>Devoluciones</p>
                <p className='font-semibold'>{currency(totalReturnsAmount)}</p>
              </div>
              <div>
                <p className='text-xs uppercase text-gray-500'>Pagos</p>
                <p className='font-semibold'>{currency(totalPaymentsAmount)}</p>
              </div>
            </div>
            {/* Chips resumen */}
            <div className='flex flex-wrap gap-2'>
              <span className='px-2 py-1 bg-green-200/60 rounded-full text-xs font-semibold'>Ventas totales: {currency(totalSales)}</span>
              <span className='px-2 py-1 bg-red-200/60 rounded-full text-xs font-semibold'>Devoluciones: {currency(totalReturnsAmount)}</span>
              <span className='px-2 py-1 bg-blue-200/60 rounded-full text-xs font-semibold'>Pagos: {currency(totalPaymentsAmount)}</span>
            </div>
            {/* Modales de detalle */}
            <div className='grid grid-cols-2 gap-4'>
              <ShowListModal
                title={'Ventas Sucursal'}
                ListComponent={CustomerSalesList}
                ListComponentProps={{ sales: branchSales, title: 'Ventas Sucursal' }}
                clickableComponent={<p className='font-semibold text-center bg-green-400 bg-opacity-50 rounded-lg py-1'>Ventas Sucursal: {currency(totalBranchSalesAmount)}</p>}
              />
              <ShowListModal
                title={'Ventas Directas'}
                ListComponent={CustomerSalesList}
                ListComponentProps={{ sales: directSales, title: 'Ventas Directas' }}
                clickableComponent={<p className='font-semibold text-center bg-green-400 bg-opacity-50 rounded-lg py-1'>Ventas Directas: {currency(totalDirectSalesAmount)}</p>}
              />
              <ShowListModal
                title={'Devoluciones'}
                ListComponent={CustomerReturnsList}
                ListComponentProps={{ returnsArray }}
                clickableComponent={<p className='font-semibold text-center bg-red-500 bg-opacity-40 rounded-lg py-1'>Devoluciones: {currency(totalReturnsAmount)}</p>}
              />
              <ShowListModal
                title={'Pagos'}
                ListComponent={CustomerPaymentsList}
                ListComponentProps={{ paymentsArray }}
                clickableComponent={<p className='font-semibold text-center bg-blue-400 bg-opacity-40 rounded-lg py-1'>Pagos: {currency(totalPaymentsAmount)}</p>}
              />
            </div>
            <div className='flex justify-end'>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm ${balance < 0 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>Balance: {currency(balance)}</span>
            </div>
            <p className='text-[10px] text-gray-400 text-right'>Compañía: {company?.name || company?._id || ''}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

