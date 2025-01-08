/* eslint-disable react/prop-types */
import { useState } from 'react'
import Modal from '../Modals/Modal'

export default function ChangeBranchPrices({ children, onChange, branch, pricesDate }) {

  const [isChanging, setIsChanging] = useState(false)

  const togglePriceChanger = () => {
    setIsChanging(prev => !prev)
  }

  const renderPricesChanger = () => {
    return (
      <div>

        {children}

      </div>
    )
  }

  const handlePricesChange = (e) => {
    e.preventDefault()
    onChange()
  }

  return (
    <div>
      {children && (
        <div>
          <button className="w-full h-full border rounded-lg border-black shadow-md" onClick={() => { togglePriceChanger() }}>
            {children}
          </button>
          {isChanging && (
            <Modal
              ref={branch}
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
