/* eslint-disable react/prop-types */
import { FaListAlt } from 'react-icons/fa'
import SectionHeader from '../SectionHeader'
import EmployeesSelect from '../Select/EmployeesSelect'
import Select from 'react-select'
import { currency } from '../../helpers/Functions'
import { isToday } from '../../helpers/DatePickerFunctions'
import { useState } from 'react'
import { useDayExtraOutgoings } from '../../hooks/ExtraOutgoings/useDayExtraOutgoings'
import { useRoles } from '../../context/RolesContext'
import ShowListModal from '../Modals/ShowListModal'
import { useSelector } from 'react-redux'
import ExtraOutgoingsList from './ExtraOutgoingsList'
import Payments from './Payments'

export default function ExtraOutgoings() {

  const { currentUser, company } = useSelector((state) => state.user)
  const { isManager } = useRoles()
  const [extraOutgoingFormData, setExtraOutgoingFormData] = useState({})
  const { extraOutgoings, spliceExtraOutgoingById, totalExtraOutgoings, onAddExtraOutgoing, onDeleteExtraOutgoing } = useDayExtraOutgoings({ companyId: company._id, date })

  const addExtraOutgoingSubmit = async (e) => {

    const conceptInput = document.getElementById('extraOutgoingConcept')
    const amountInput = document.getElementById('extraOutgoingAmount')
    const createdAt = isToday(date) ? new Date().toISOString() : new Date(date).toISOString()

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

    if (amountInput.value == '') {

      filledInputs = false

    }

    if (conceptInput.value == '') {

      filledInputs = false
    }

    if (filledInputs) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  return (
    <div className='border p-3 mt-4 rounded-lg bg-white'>
      <SectionHeader label={'Gastos'} />
      <div className='border bg-white p-3 mt-4'>
        <div className='grid grid-cols-2'>
          <SectionHeader label={'Gastos externos'} />
          <div className='flex items-center gap-4 justify-self-end mr-12'>
            <ShowListModal
              title={'Gastos'}
              ListComponent={ExtraOutgoingsList}
              ListComponentProps={{ extraOutgoings, totalExtraOutgoings, onDelete: onDeleteExtraOutgoing }}
              clickableComponent={
                isManager(currentUser.role) ?
                  <p className='font-bold text-lg text-center'>{currency({ amount: totalExtraOutgoings })}</p>
                  :
                  <FaListAlt className="h-10 w-10 text-red-600" />}
            />
          </div>
        </div>
        <form id='extra-outgoing-form' onSubmit={addExtraOutgoingSubmit} className="grid grid-cols-3 items-center gap-2">
          <input type="text" name="concept" id="extraOutgoingConcept" placeholder='Concepto' className='border border-black p-3 rounded-lg' required onInput={extraOutgoingsButtonControl} onChange={handleExtraOutgoingInputsChange} />
          <input type="number" name="amount" id="extraOutgoingAmount" placeholder='$0.00' step={0.01} className='border border-black p-3 rounded-lg' required onInput={extraOutgoingsButtonControl} onChange={handleExtraOutgoingInputsChange} />
          <button type='submit' id='extraOutgoingButton' disabled className='bg-button text-white font-semibold p-3 rounded-lg'>Agregar</button>
        </form>
      </div>
      <Payments spliceExtraOutgoingById={spliceExtraOutgoingById} pushExtraOutgoing pushIncome spliceIncomeById />
    </div>
  )
}
