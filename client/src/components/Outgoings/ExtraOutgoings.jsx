/* eslint-disable react/prop-types */
import { FaListAlt } from 'react-icons/fa'
import SectionHeader from '../SectionHeader'
import { currency } from '../../helpers/Functions'
import { useState, useRef, useEffect } from 'react'
import { useDayExtraOutgoings } from '../../hooks/ExtraOutgoings/useDayExtraOutgoings'
import { useRoles } from '../../context/RolesContext'
import ShowListModal from '../Modals/ShowListModal'
import { useSelector } from 'react-redux'
import ExtraOutgoingsList from './ExtraOutgoingsList'
import Payments from './Payments'
import { useDateNavigation } from '../../hooks/useDateNavigation'
import RegisterDateSwitch from '../RegisterDateSwitch'

export default function ExtraOutgoings({ useToday: useTodayProp, showDateSwitch = true }) {

  const { currentUser, company } = useSelector((state) => state.user)
  const { isManager } = useRoles()
  const { currentDate: date, today, dateFromYYYYMMDD } = useDateNavigation();
  const [extraOutgoingFormData, setExtraOutgoingFormData] = useState({})
  const { extraOutgoings, spliceExtraOutgoingById, totalExtraOutgoings, onAddExtraOutgoing, onDeleteExtraOutgoing } = useDayExtraOutgoings({ companyId: company._id, date })
  const [useToday, setUseToday] = useState(false);
  const effectiveUseToday = useTodayProp !== undefined ? useTodayProp : useToday;

  // Tab state: 'gasto' or 'pago'
  const [activeTab, setActiveTab] = useState('gasto')
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && activeTab !== 'gasto') {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  const addExtraOutgoingSubmit = async (e) => {
    const conceptInput = document.getElementById('extraOutgoingConcept')
    const amountInput = document.getElementById('extraOutgoingAmount')
    const createdAt = effectiveUseToday || today ? new Date().toISOString() : dateFromYYYYMMDD.toISOString()
    e.preventDefault()
    try {
      const { amount, concept } = extraOutgoingFormData
      const extraOutgoing = {
        amount: parseFloat(amount),
        concept,
        employee: currentUser,
        company: company._id,
        createdAt
      }
      onAddExtraOutgoing(extraOutgoing)
      conceptInput.value = ''
      amountInput.value = ''
    } catch (error) {
      console.log(error)
    }
  }

  const handleExtraOutgoingInputsChange = (e) => {
    setExtraOutgoingFormData({
      ...extraOutgoingFormData,
      [e.target.name]: e.target.value,
    })
  }

  const extraOutgoingsButtonControl = () => {
    const amountInput = document.getElementById('extraOutgoingAmount')
    const conceptInput = document.getElementById('extraOutgoingConcept')
    const button = document.getElementById('extraOutgoingButton')
    let filledInputs = true
    if (amountInput.value == '') filledInputs = false
    if (conceptInput.value == '') filledInputs = false
    button.disabled = !filledInputs
  }

  return (
    <div ref={containerRef} className="p-1 sm:p-8 mt-4 rounded-2xl bg-white shadow-lg max-w-2xl mx-auto animate-fade-in">
      <SectionHeader label={'Gastos fuera de cuentas'} />
      <div className="border bg-white p-1 mt-4 rounded-xl shadow-sm">
        {/* Tab Selector */}
        <div className="flex gap-2 mb-6">
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition text-base border ${activeTab === 'gasto' ? 'bg-blue-600 text-white shadow border-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'}`}
            onClick={() => setActiveTab('gasto')}
            type="button"
            aria-selected={activeTab === 'gasto'}
          >
            Registrar Gasto
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition text-base border ${activeTab === 'pago' ? 'bg-blue-600 text-white shadow border-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'}`}
            onClick={() => setActiveTab('pago')}
            type="button"
            aria-selected={activeTab === 'pago'}
          >
            Registrar Pago
          </button>
        </div>
        {/* Tab Content */}
        {activeTab === 'gasto' && (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 mb-4 gap-2'>
              <SectionHeader label={'Gasto Normal'} />
              <div className='flex items-center gap-4 justify-self-end sm:justify-self-end sm:mr-8'>
                <ShowListModal
                  title={'Gastos'}
                  ListComponent={ExtraOutgoingsList}
                  ListComponentProps={{ extraOutgoings, totalExtraOutgoings, onDelete: onDeleteExtraOutgoing }}
                  clickableComponent={
                    isManager(currentUser.companyData?.[0].role) ?
                      <p className='font-bold text-lg text-center'>{currency({ amount: totalExtraOutgoings })}</p>
                      :
                      <FaListAlt className="h-10 w-10 text-red-600" />
                  }
                />
              </div>
            </div>
            {!today && showDateSwitch &&
              <RegisterDateSwitch
                useToday={effectiveUseToday}
                setUseToday={setUseToday}
              />
            }
            <form id='extra-outgoing-form' onSubmit={addExtraOutgoingSubmit} className="flex flex-col sm:flex-row gap-3 items-center mt-2">
              <div className="flex-1 w-full">
                <input type="text" name="concept" id="extraOutgoingConcept" placeholder='Concepto' className='border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition' required onInput={extraOutgoingsButtonControl} onChange={handleExtraOutgoingInputsChange} />
              </div>
              <div className="flex-1 w-full">
                <input type="number" name="amount" id="extraOutgoingAmount" placeholder='$0.00' step={0.01} className='border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition' required onInput={extraOutgoingsButtonControl} onChange={handleExtraOutgoingInputsChange} />
              </div>
              <button type='submit' id='extraOutgoingButton' disabled className='bg-blue-600 text-white font-semibold p-3 rounded-lg transition disabled:opacity-60 w-full sm:w-auto'>Agregar</button>
            </form>
          </>
        )}
        {activeTab === 'pago' && (
          <div className="mt-2">
            <Payments showDateSwitch={false} useToday={effectiveUseToday} spliceExtraOutgoingById={spliceExtraOutgoingById} />
          </div>
        )}
      </div>
    </div>
  )
}
