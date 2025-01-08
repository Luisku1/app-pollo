/* eslint-disable react/prop-types */
import { useState } from 'react'
import DeleteButton from '../Buttons/DeleteButton'
import { useSelector } from 'react-redux'
import { isToday } from '../../helpers/DatePickerFunctions'
import { useRoles } from '../../context/RolesContext'
import SectionHeader from '../SectionHeader'

export default function AddOutgoing({ outgoings, outgoingsTotal, onAddOutgoing, onDeleteOutgoing, employee, branch, date }) {

  const { currentUser, company } = useSelector((state) => state.user)
  const [outgoingFormData, setOutgoingFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const { roles } = useRoles()

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

    if (amountInput.value == '') {

      filledInputs = false

    }

    if (conceptInput.value == '') {

      filledInputs = false
    }

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

      _id: 'TempId',
      amount: parseFloat(amount),
      concept,
      company: company._id,
      employee: employee._id,
      branch: branch.value,
      message: 'Soy el nuevo',
      createdAt

    }

    conceptInput.value = ''
    amountInput.value = ''
    conceptInput.focus()
    button.disabled = true

    setLoading(true)

    onAddOutgoing(outgoing)

    setLoading(false)

    button.disabled = false
  }

  return (
    <div className='border p-3 mt-4 bg-white'>
      <SectionHeader label={'Gastos'} />

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
        <button type='submit' id='outgoing-button' disabled className='bg-slate-500 text-white p-3 rounded-lg'>Agregar</button>

      </form>


      {outgoings && outgoings.length > 0 ?
        <div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold'>
          <p className='p-3 rounded-lg col-span-5 text-center'>Concepto</p>
          <p className='p-3 rounded-lg col-span-5 text-center'>Monto</p>
        </div>
        : ''}
      {outgoings && outgoings.length > 0 && outgoings.map((outgoing, index) => (

        <div key={outgoing._id}>

          {currentUser._id == outgoing.employee || currentUser.role == roles.managerRole._id ?

            <div className={(currentUser._id == outgoing.employee || currentUser.role == roles.managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

              <div id='list-element' className='flex col-span-10 items-center'>
                <p className='text-center text-xs w-6/12'>{outgoing.concept}</p>
                <p className='text-center text-xs w-6/12'>{outgoing.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
              </div>


              <DeleteButton
                id={outgoing._id}
                item={outgoing}
                index={index}
                deleteFunction={onDeleteOutgoing}
              />


            </div>

            : ''}
        </div>
      ))}

      {outgoings && outgoings.length > 0 && currentUser._id == (employee ? employee._id : 'none') || currentUser.role == roles.managerRole._id ?


        <div className='flex mt-4 border-black border rounded-lg p-3 border-opacity-30 shadow-lg'>
          <p className='w-6/12 text-center'>Total:</p>
          <p className='w-6/12 text-center font-bold'>{outgoingsTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>

        </div>

        : ''}
    </div>
  )
}
