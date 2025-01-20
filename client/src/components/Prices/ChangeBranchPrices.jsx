/* eslint-disable react/prop-types */
import { useState } from 'react'
import Modal from '../Modals/Modal'
import { useRoles } from '../../context/RolesContext'
import { useSelector } from 'react-redux'
import BranchPrices from './BranchPrices'
import { usePricesSelector } from '../../hooks/Prices/usePricesSelector'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

export default function ChangeBranchPrices({ children, onChange, branch, date, onUpdateBranchReport }) {

  const { roles } = useRoles()
  const [pricesDate, setPricesDate] = useState(null)
  const [direction, setDirection] = useState(null)
  const { prices, loading } = usePricesSelector(branch, date, pricesDate, direction)
  const { currentUser } = useSelector(state => state.user)
  const [isChanging, setIsChanging] = useState(false)
  const ableToModify = roles.managerRole._id == currentUser.role
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
    await onChange(prices, date, newestPricesDate, onUpdateBranchReport)
    togglePriceChanger()
    setDirection(null)
  }

  const renderPricesChanger = () => {
    return (
      <div>
        <div className="flex justify-between mt-2">
          <button
            className="bg-button text-white p-2 rounded-lg uppercase hover:bg-gray-600 flex items-center"
            onClick={handlePreviousPrice}
          >
            <FaArrowLeft className="mr-2" />
          </button>
          <button
            className="bg-button text-white p-2 rounded-lg uppercase hover:bg-gray-600"
            onClick={handleCurrentPrice}
          >
            Precio Actual
          </button>
          <button
            className="bg-button text-white p-2 rounded-lg uppercase hover:bg-gray-600 flex items-center"
            onClick={handleNextPrice}
          >
            <FaArrowRight className="ml-2" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-full mt-4">
            <p>Cargando...</p>
          </div>
        ) : (
          prices && prices?.length > 0 && (
            <div>
              {!isEmpty && newestPricesDate && <p className="text-center mt-2">{`Precios creados el: ${(new Date(newestPricesDate)).toLocaleDateString()}`}</p>}
              <BranchPrices prices={prices} branch={branch} pricesDate={pricesDate} />
            </div>
          )
        )}

        <button className='w-full bg-button text-white p-3 rounded-lg uppercase hover:opacity-95 mt-2' onClick={handlePricesChange}>Cambiar Precios</button>
      </div>
    )
  }

  return (
    <div>
      {children && (
        <div>
          {ableToModify ? (
            <button className="w-full h-full border rounded-lg border-black shadow-md" onClick={() => { togglePriceChanger() }}>
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
