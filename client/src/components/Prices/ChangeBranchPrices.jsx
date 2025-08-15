/* eslint-disable react/prop-types */
import { useState } from 'react'
import Modal from '../Modals/Modal'
import { useRoles } from '../../context/RolesContext'
import { useSelector } from 'react-redux'
import BranchPrices from './BranchPrices'
import { usePricesSelector } from '../../hooks/Prices/usePricesSelector'
import { FaArrowLeft, FaArrowRight, FaSpinner } from 'react-icons/fa'
import useChangePrices from '../../hooks/Prices/useChangePrices'
import { blockedButton } from '../../helpers/Constants'
import { ToastSuccess } from '../../helpers/toastify'

export default function ChangeBranchPrices({ children, onChange, branch, onUpdateBranchReport, date }) {

  const { isManager } = useRoles()
  const [pricesDate, setPricesDate] = useState(null)
  const [direction, setDirection] = useState(null)
  const [showResiduals, setShowResiduals] = useState(false)
  // Ensure usePricesSelector receives showResiduals and passes it to the query logic
  const { prices, loading } = usePricesSelector(branch, date, pricesDate, direction, showResiduals)
  const { changePrices } = useChangePrices()
  const [isLoading, setIsLoading] = useState(false)
  const { currentUser } = useSelector(state => state.user)
  const [isChanging, setIsChanging] = useState(false)
  const ableToModify = isManager(currentUser.companyData?.[0].role)
  const isEmpty = !prices || prices.length === 0
  const newestPricesDate = !isEmpty && prices.reduce((latest, price) => {
    if (!latest) {
      return price.date;
    } else {
      return price.date > latest ? price.date : latest;
    }
  }, null);

  const multiLoading = loading || isLoading

  const togglePriceChanger = () => {
    setPricesDate(null)
    setDirection(null)
    setIsChanging(prev => !prev)
  }

  const handleNextPrice = () => {
    // Lógica para avanzar al siguiente precio
    setPricesDate(newestPricesDate)
    setDirection('next');
  };

  const handlePreviousPrice = () => {
    // Lógica para retroceder al precio anterior
    setPricesDate(newestPricesDate)
    setDirection('prev');
  };

  const handleCurrentPrice = () => {
    setPricesDate(new Date().toISOString());
    setDirection('prev');
  };

  const handlePricesChange = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      if (onChange && onUpdateBranchReport) {
        await onChange(prices, date, newestPricesDate, onUpdateBranchReport)
      }

      if (onUpdateBranchReport && !onChange) {
        onUpdateBranchReport(await changePrices(branch, date, newestPricesDate))
      }

      setIsLoading(false)
      ToastSuccess('Precios cambiados correctamente')
      togglePriceChanger()
      setDirection(null)
    } catch (error) {
      setIsLoading(false)
      console.error('Error changing prices:', error)
    }
  }

  const renderPricesChanger = () => {
    return (
      <div className="relative">
        {multiLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
            <FaSpinner className="text-4xl animate-spin" />
          </div>
        )}
        <div className={`${multiLoading ? 'blur-sm' : ''}`}>
          <div className="flex justify-between mt-2 items-center gap-2">
            <button
              className="bg-button text-lg text-white p-2 rounded-lg uppercase hover:bg-gray-600 flex items-center"
              onClick={handlePreviousPrice}
            >
              <FaArrowLeft className="mr-2" />
            </button>
            {/* Toggle precios frescos/fríos */}
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-full px-1 py-1 border border-gray-300">
              <button
                type="button"
                className={`px-4 py-1 rounded-full text-xs font-bold transition-colors duration-200 focus:outline-none ${!showResiduals ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-blue-700'}`}
                onClick={() => setShowResiduals(false)}
                aria-pressed={!showResiduals}
              >
                Precios frescos
              </button>
              <button
                type="button"
                className={`px-4 py-1 rounded-full text-xs font-bold transition-colors duration-200 focus:outline-none ${showResiduals ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-blue-700'}`}
                onClick={() => setShowResiduals(true)}
                aria-pressed={showResiduals}
              >
                Precios fríos
              </button>
            </div>
            <button
              className="bg-button text-lg text-white p-2 rounded-lg uppercase hover:bg-gray-600 flex items-center"
              onClick={handleNextPrice}
            >
              <FaArrowRight className="ml-2" />
            </button>
          </div>
          <div>
            <button
              className="w-full bg-button text-lg text-white p-2 rounded-lg uppercase hover:bg-gray-600"
              onClick={handleCurrentPrice}
            >
              {`${!showResiduals ? ' Obtener últimos precios' : 'Obtener últimos precios fríos'}`}
            </button>
          </div>
          {prices && prices?.length > 0 && (
            <div>
              {!isEmpty && newestPricesDate && <p className="text-center text-lg mt-2">{`Precios creados el: ${(new Date(newestPricesDate)).toLocaleDateString()}`}</p>}
              {/* Pass showResiduals to BranchPrices for correct display */}
              <BranchPrices prices={prices} branch={branch} pricesDate={pricesDate} showResiduals={showResiduals} />
            </div>
          )}
          <button className='w-full bg-button text-lg text-white p-3 rounded-lg uppercase hover:opacity-95 mt-2' onClick={handlePricesChange}>Cambiar Precios</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {children && (
        <div className='mx-auto'>
          {ableToModify ? (
            <button className={`border border-black rounded-lg items-center ${!isManager(currentUser.companyData?.[0].role) ? blockedButton : ''}`} disabled={!isManager(currentUser.companyData?.[0].role)} onClick={() => { togglePriceChanger() }}  >
              {children}
            </button>
          ) : (
            children
          )}
          {isChanging && (
            <Modal
              title='Cambiar Precios'
              content={renderPricesChanger()}
              closeModal={togglePriceChanger}
            />
          )}
        </div>
      )}
    </div>
  )
}
