/* eslint-disable react/prop-types */
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { isToday } from '../../helpers/DatePickerFunctions'
import SectionHeader from '../SectionHeader'
import ShowListModal from '../Modals/ShowListModal'
import OutgoingsList from './OutgoingsList'

export default function AddOutgoing({ outgoings, modifyBalance, listButton, outgoingsTotal, onAddOutgoing, onDeleteOutgoing, employee, branch, date, isEditing }) {

  const { company } = useSelector((state) => state.user)
  const [outgoingFormData, setOutgoingFormData] = useState({})
  const [loading, setLoading] = useState(false)

  const handleOutgoingInputsChange = (e) => {
    setOutgoingFormData({
      ...outgoingFormData,
      [e.target.id]: e.target.value,
    })
  }

  const outgoingsButtonControl = () => {

    const amountInput = document.getElementById('amount')
    const conceptInput = document.getElementById('concept')
    const button = document.getElementById('outgoing-button')
    const employeeSelect = employee != null
    const branchSelect = branch != null

    let filledInputs = true

    if (amountInput.value == '')
      filledInputs = false


    if (conceptInput.value == '')
      filledInputs = false

    if (filledInputs && branchSelect && employeeSelect && !loading) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  const addOutgoingSubmit = async (e) => {

    const conceptInput = document.getElementById('concept')
    const amountInput = document.getElementById('amount')
    const button = document.getElementById('outgoing-button')
    const createdAt = isToday(date) ? new Date().toISOString() : new Date(date).toISOString()

    e.preventDefault()

    const { amount, concept } = outgoingFormData

    const outgoing = {
      amount: parseFloat(amount),
      concept,
      company: company._id,
      employee: employee,
      branch: branch,
      createdAt
    }

    conceptInput.value = ''
    amountInput.value = ''
    conceptInput.focus()
    button.disabled = true

    setLoading(true)

    onAddOutgoing(outgoing, modifyBalance)

    setLoading(false)

    button.disabled = false
  }

  return (
    <div className='border border-header rounded-md p-3 mt-4 bg-white'>
      <div className='grid grid-cols-1'>
        <SectionHeader label={'Gastos'} />
      </div>
      {isEditing && (
        <form id='outgoingForm' onSubmit={addOutgoingSubmit} className="grid grid-cols-3 gap-2">
          <div className='relative'>
            <input type="text" name="concept" id="concept" placeholder='Concepto' className='w-full p-3 rounded-lg border border-black' required onInput={outgoingsButtonControl} onChange={handleOutgoingInputsChange} />
            <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
              Concepto <span>*</span>
            </label>
          </div>
          <div className='relative'>
            <input type="number" name="amount" id="amount" placeholder='$0.00' step={0.01} className='border border-black w-full p-3 rounded-lg' required onInput={outgoingsButtonControl} onChange={handleOutgoingInputsChange} />
            <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
              Monto ($) <span>*</span>
            </label>
          </div>
          <button type='submit' id='outgoing-button' disabled className='bg-button text-white p-3 rounded-lg'>Agregar</button>
        </form>
      )}
      <div className='w-full mt-2'>
        <ShowListModal
          title={'Gastos'}
          ListComponent={OutgoingsList}
          ListComponentProps={{ outgoings, amount: outgoingsTotal, onDelete: onDeleteOutgoing, modifyBalance }}
          clickableComponent={listButton}
        />
      </div>
    </div>
  )
}
