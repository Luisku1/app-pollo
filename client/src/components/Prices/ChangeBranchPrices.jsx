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

export default function ChangeBranchPrices({ children, onChange, branch, date, onUpdateBranchReport }) {

  const { isManager } = useRoles()
  const [pricesDate, setPricesDate] = useState(null)
  const [direction, setDirection] = useState(null)
  const { prices, loading } = usePricesSelector(branch, date, pricesDate, direction)
  const { changePrices } = useChangePrices()
  const { currentUser } = useSelector(state => state.user)
  const [isChanging, setIsChanging] = useState(false)
  const ableToModify = isManager(currentUser.role)
  const isEmpty = !prices || prices.length === 0
  const newestPricesDate = !isEmpty && prices.reduce((latest, price) => {
    if (!latest) {
      return price.date;
    } else {
      return price.date > latest ? price.date : latest;
    }
  }, null);

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
      if (onChange && onUpdateBranchReport) {
        await onChange(prices, date, newestPricesDate, onUpdateBranchReport)
      }

      if (onUpdateBranchReport && !onChange) {
        onUpdateBranchReport(await changePrices(branch, date, newestPricesDate))
      }

      togglePriceChanger()
      setDirection(null)
    } catch (error) {
      console.error('Error changing prices:', error)
    }
  }

  const renderPricesChanger = () => {
    return (
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
            <FaSpinner className="text-4xl animate-spin" />
          </div>
        )}
        <div className={`${loading ? 'blur-sm' : ''}`}>
          <div className="flex justify-between mt-2">
            <button
              className="bg-button text-lg text-white p-2 rounded-lg uppercase hover:bg-gray-600 flex items-center"
              onClick={handlePreviousPrice}
            >
              <FaArrowLeft className="mr-2" />
            </button>
            <button
              className="bg-button text-lg text-white p-2 rounded-lg uppercase hover:bg-gray-600"
              onClick={handleCurrentPrice}
            >
              Precio Actual
            </button>
            <button
              className="bg-button text-lg text-white p-2 rounded-lg uppercase hover:bg-gray-600 flex items-center"
              onClick={handleNextPrice}
            >
              <FaArrowRight className="ml-2" />
            </button>
          </div>

          {prices && prices?.length > 0 && (
            <div>
              {!isEmpty && newestPricesDate && <p className="text-center text-lg mt-2">{`Precios creados el: ${(new Date(newestPricesDate)).toLocaleDateString()}`}</p>}
              <BranchPrices prices={prices} branch={branch} pricesDate={pricesDate} />
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
        <div>
          {ableToModify ? (
            <button className={`border border-black rounded-lg ${!isManager(currentUser.role) ? blockedButton : ''}`} disabled={!isManager(currentUser.role)} onClick={() => { togglePriceChanger() }}  >
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
