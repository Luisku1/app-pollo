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

// Paletas de color: 'elegant' (nueva) y 'default' (original) para rollback rápido
const palettes = {
  elegant: {
    statusBarNegative: 'bg-rose-300',
    statusBarZero: 'bg-slate-300',
    statusBarPositive: 'bg-emerald-300',
    balanceTextNegative: 'text-rose-700',
    balanceTextZero: 'text-slate-700',
    balanceTextPositive: 'text-emerald-700',
    chipSales: 'bg-emerald-100',
    chipReturns: 'bg-rose-100',
    chipPayments: 'bg-sky-100',
    modalBtnSales: 'bg-emerald-50 border border-emerald-200',
    modalBtnReturns: 'bg-rose-50 border border-rose-200',
    modalBtnPayments: 'bg-sky-50 border border-sky-200'
  },
  default: {
    statusBarNegative: 'bg-red-500',
    statusBarZero: 'bg-yellow-200',
    statusBarPositive: 'bg-green-300',
    balanceTextNegative: 'text-red-600',
    balanceTextZero: 'text-gray-700',
    balanceTextPositive: 'text-green-600',
    chipSales: 'bg-green-200/60',
    chipReturns: 'bg-red-200/60',
    chipPayments: 'bg-blue-200/60',
    modalBtnSales: 'bg-green-400 bg-opacity-50',
    modalBtnReturns: 'bg-red-500 bg-opacity-40',
    modalBtnPayments: 'bg-blue-400 bg-opacity-40'
  }
}

// Listas internas (podrían extraerse si se reutilizan)
function CustomerSalesList({ sales = [], title = 'Ventas' }) {
  if (!sales.length) return <p className='text-center text-sm text-gray-500'>Sin {title.toLowerCase()}</p>
  return (
    <ul className='divide-y max-h-80 overflow-y-auto text-sm'>
      {sales.map(sale => (
        <li key={sale._id} className='flex justify-between gap-2 py-1 px-1'>
          <div className='flex flex-col'>
            <span className='font-semibold'>{sale?.product?.name || 'Producto'}</span>
            <span className='text-[11px] text-gray-500'>Cantidad: {(sale?.weight ?? '-') + ' kg'}</span>
            {sale?.branch && <span className='text-[11px] text-gray-400'>{sale.branch.branch}</span>}
            {sale?.price != null && <span className='text-[11px] text-gray-500'>Precio: {currency(sale.price)}</span>}
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
            <span className='text-[11px] text-gray-500'>Cantidad: {(ret?.weight ?? '-') + ' kg'}</span>
            {ret?.branch && <span className='text-[11px] text-gray-400'>{ret.branch.branch}</span>}
            {ret?.price != null && <span className='text-[11px] text-gray-500'>Precio: {currency(ret.price)}</span>}
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

// Lista de resumen (ventas de sucursal + directas) visible en la tarjeta
// (Resumen de ventas visible fue reemplazado por la nota del día estilo mercado)

// useElegantColors=true aplica la paleta "elegant"; ponlo en false para volver a la original
export default function CustomerReportCard({ reportData = {}, useElegantColors = true }) {
  const { customer, previousBalance = 0, sales = 0, returns = 0, payments = 0, balance = 0, branchSales = [], directSales = [], returnsArray = [], paymentsArray = [], createdAt } = reportData
  const [loadingImage, setLoadingImage] = useState(false)
  const { company } = useSelector(state => state.user)
  const palette = useElegantColors ? palettes.elegant : palettes.default

  // Acciones de export/copy
  const handleDownloadImage = async () => {
    try {
      setLoadingImage(true)
      const node = document.getElementById(`customer-report-card-${reportData._id}`)
      const toolsDiv = node?.querySelector("[name='tools']")
      const bottomControls = node?.querySelector("[name='bottom-controls']")
      if (toolsDiv) toolsDiv.style.display = 'none'
      if (bottomControls) bottomControls.style.display = 'none'
      const dataUrl = await toPng(node)
      if (toolsDiv) toolsDiv.style.display = ''
      if (bottomControls) bottomControls.style.display = ''
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
      const node = document.getElementById(`customer-report-card-${reportData._id}`)
      const toolsDiv = node?.querySelector("[name='tools']")
      const bottomControls = node?.querySelector("[name='bottom-controls']")
      if (toolsDiv) toolsDiv.style.display = 'none'
      if (bottomControls) bottomControls.style.display = 'none'
      const dataUrl = await toPng(node)
      if (toolsDiv) toolsDiv.style.display = ''
      if (bottomControls) bottomControls.style.display = ''
      const blob = await (await fetch(dataUrl)).blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      ToastSuccess('Imagen copiada')
    } catch (error) {
      console.error(error)
      ToastDanger('Error al copiar imagen')
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

  const totalBranchSalesAmount = branchSales.reduce((a, b) => a + (b.amount || 0), 0)
  const totalDirectSalesAmount = directSales.reduce((a, b) => a + (b.amount || 0), 0)
  const totalReturnsAmount = returns
  const totalPaymentsAmount = payments
  const returnsAmountFromArray = returnsArray?.reduce((a, b) => a + (b.amount || b.total || 0), 0)
  const netOfDay = (totalBranchSalesAmount + totalDirectSalesAmount) - (returnsAmountFromArray || totalReturnsAmount)
  const saldoDia = (typeof balance === 'number' && typeof previousBalance === 'number')
    ? (balance - previousBalance)
    : (netOfDay - totalPaymentsAmount)
  const displayReturnsTotal = (returnsAmountFromArray ?? totalReturnsAmount)

  return (
    <div id={`customer-report-wrapper-${reportData._id}`} className='w-full border border-black shadow-md bg-white rounded-lg'>
      {/* Barra superior estado */}
      <div className={`w-full h-2 rounded-t-lg ${balance < 0 ? palette.statusBarNegative : balance === 0 ? palette.statusBarZero : palette.statusBarPositive}`} />
      <div id={`customer-report-card-${reportData._id}`} className='bg-white rounded-b-lg p-3 relative'>
        {loadingImage && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/60 z-50'>
            <FaSpinner className='text-4xl animate-spin' />
          </div>)}
        <div className={`${loadingImage ? 'blur-sm' : ''}`}>
          {/* Letterhead */}
          <div className='text-center mb-1'>
            <h1 className='text-2xl font-extrabold text-gray-800 tracking-tight'>{company?.name || 'Compañía'}</h1>
            <p className='text-[11px] text-gray-500'>Estado de cuenta de cliente</p>
          </div>
          {/* Header */}
          <div className='flex justify-between items-center mb-2'>
            <h2 className='text-xl font-bold text-gray-900'>{customer?.name || 'Cliente'}</h2>
            <p className='text-sm font-semibold text-gray-700'>{createdAt ? formatInformationDate(new Date(createdAt)) : ''}</p>
          </div>
          {/* Tools */}
          <div name='tools' className='w-full flex flex-row-reverse text-2xl gap-3'>
            <button onClick={handleDownloadImage} className='border h-fit border-black rounded-lg p-1' title='Descargar imagen'><AiOutlineDownload /></button>
            <button onClick={handleCopyLink} className='border h-fit border-black rounded-lg p-1' title='Copiar link'><AiOutlineLink /></button>
            <button onClick={handleCopyImage} className='border h-fit border-black rounded-lg p-1' title='Copiar imagen'><AiOutlineCopy /></button>
          </div>
          {/* Resumen (compacto) */}
          <div className='mt-2 space-y-3'>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <p className='text-xs uppercase text-gray-500'>Balance anterior</p>
                <p className='font-semibold'>{currency(previousBalance)}</p>
              </div>
              <div>
                <p className='text-xs uppercase text-gray-500'>Balance actual</p>
                <p className={`font-semibold ${balance < 0 ? palette.balanceTextNegative : balance === 0 ? palette.balanceTextZero : palette.balanceTextPositive}`}>{currency(balance)}</p>
              </div>
            </div>

            {/* Nota del día (formato estilo mercado) */}
            <div className='border-2 border-red-600 rounded-md'>
              <div className='px-2 py-1 border-b-2 border-red-600'>
                <p className='text-[12px] font-bold text-red-700 uppercase tracking-wide'>Detalle del día</p>
              </div>
              <div className='px-2 py-2'>
                {/* Encabezados */}
                <div className='grid grid-cols-4 text-[12px] font-semibold text-red-700 border-b border-red-600 pb-1'>
                  <span>Cant.</span>
                  <span className='col-span-2'>Descripción</span>
                  <span className='text-right'>Importe</span>
                </div>
                {/* Filas ventas */}
                <ul className='divide-y max-h-60 overflow-y-auto'>
                  {[...branchSales.map(s => ({ ...s, _type: 'VENTA' })), ...directSales.map(s => ({ ...s, _type: 'VENTA' })), ...returnsArray.map(r => ({ ...r, _type: 'DEV' }))]
                    .map((row) => {
                      const qty = row?.weight ?? row?.pieces ?? 0
                      const isByPieces = row?.product?.byPieces
                      const qtyLabel = isByPieces ? 'pz' : 'kg'
                      const amount = row.amount || row.total || row.price || 0
                      const isReturn = row._type === 'DEV'
                      return (
                        <li key={`${row._id}-${row._type}`} className='grid grid-cols-4 gap-2 py-1 text-[12px]'>
                          <span>{qty} {qtyLabel}</span>
                          <span className='col-span-2'>{isReturn ? 'DEV • ' : ''}{row?.product?.name || (isReturn ? 'Devolución' : 'Producto')}</span>
                          <span className={`text-right ${isReturn ? 'text-rose-700' : ''}`}>{isReturn ? '-' : ''}{currency(amount)}</span>
                        </li>
                      )
                    })}
                </ul>
                {/* Totales día */}
                <div className='mt-2 grid grid-cols-3 gap-2 text-[12px]'>
                  <div className='border border-red-600 rounded p-2 text-center'>
                    <p className='font-semibold text-red-700'>A CUENTA</p>
                    <p className='font-bold'>{currency(totalPaymentsAmount)}</p>
                    <p className='text-[10px] text-gray-500'>(pagos hoy)</p>
                  </div>
                  <div className='border border-red-600 rounded p-2 text-center'>
                    <p className='font-semibold text-red-700'>RESTA</p>
                    <p className={`font-bold ${saldoDia < 0 ? 'text-rose-700' : saldoDia > 0 ? 'text-green-700' : ''}`}>{currency(saldoDia)}</p>
                    <p className='text-[10px] text-gray-500'>(hoy)</p>
                  </div>
                  <div className='border border-red-600 rounded p-2 text-center'>
                    <p className='font-semibold text-red-700'>TOTAL</p>
                    <p className='font-bold text-green-700'>{currency(netOfDay)}</p>
                    <p className='text-[10px] text-gray-500'>(ventas - devoluciones)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modales de detalle (ligeros) */}
            <div className='grid grid-cols-2 gap-4' name='bottom-controls'>
              <ShowListModal
                title={'Ventas Sucursal'}
                ListComponent={CustomerSalesList}
                ListComponentProps={{ sales: branchSales, title: 'Ventas Sucursal' }}
                clickableComponent={<p className={`text-center rounded-lg py-1 text-sm underline ${palette.modalBtnSales}`}>Ver ventas de sucursal: {currency(totalBranchSalesAmount)}</p>}
              />
              <ShowListModal
                title={'Ventas Directas'}
                ListComponent={CustomerSalesList}
                ListComponentProps={{ sales: directSales, title: 'Ventas Directas' }}
                clickableComponent={<p className={`text-center rounded-lg py-1 text-sm underline ${palette.modalBtnSales}`}>Ver ventas de proveedores: {currency(totalDirectSalesAmount)}</p>}
              />
              <ShowListModal
                title={'Devoluciones'}
                ListComponent={CustomerReturnsList}
                ListComponentProps={{ returnsArray }}
                clickableComponent={<p className={`text-center rounded-lg py-1 text-sm underline ${palette.modalBtnReturns}`}>Ver devoluciones: {currency(displayReturnsTotal)}</p>}
              />
              <ShowListModal
                title={'Pagos'}
                ListComponent={CustomerPaymentsList}
                ListComponentProps={{ paymentsArray }}
                clickableComponent={<p className={`text-center rounded-lg py-1 text-sm underline ${palette.modalBtnPayments}`}>Ver pagos: {currency(totalPaymentsAmount)}</p>}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

