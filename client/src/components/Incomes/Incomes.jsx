/* eslint-disable react/prop-types */
import { useState } from 'react'
import { useAddIncome } from '../../hooks/Incomes/useAddIncome'
import { useIncomeTypes } from '../../hooks/Incomes/useIncomeTypes'
import { isToday } from '../../helpers/DatePickerFunctions'
import SectionHeader from '../SectionHeader'
import { customSelectStyles } from '../../helpers/Constants'
import Select from 'react-select'
import BranchAndCustomerSelect from '../Select/BranchAndCustomerSelect'
import { useRoles } from '../../context/RolesContext'
import { stringToCurrency } from '../../helpers/Functions'
import { FaListAlt } from 'react-icons/fa'
import ShowIncomesModal from './ShowIncomesModal'

export default function Incomes({ incomes, incomesTotal, pushIncome, spliceIncome, updateLastIncomeId, branchAndCustomerSelectOptions, date, companyId, currentUser }) {

  const [incomeFormData, setIncomeFormData] = useState({})
  const { roles } = useRoles()
  const { addIncome } = useAddIncome()
  const { incomeTypes } = useIncomeTypes()
  const [selectedCustomerBranchIncomesOption, setSelectedCustomerBranchIncomesOption] = useState(null)
  const [selectedIncomeGroup, setSelectedIncomeGroup] = useState('')
  const [selectedIncomeType, setSelectedIncomeType] = useState(null)

  const handleCustomerBranchIncomesSelectChange = (option) => {

    const group = branchAndCustomerSelectOptions.find(g => g.options.some(opt => opt.value === option.value));
    setSelectedIncomeGroup(group ? group.label : '');
    setSelectedCustomerBranchIncomesOption(option)
    incomesButtonControl()

  }

  const addIncomeSubmit = async (e) => {

    const amountInput = document.getElementById('income-amount')
    const createdAt = isToday(date) ? new Date().toISOString() : new Date(date).toISOString()

    e.preventDefault()


    try {

      const { amount } = incomeFormData

      const group = selectedIncomeGroup == 'Sucursales' ? 'branch' : 'customer'

      let income = {}

      if (group == 'branch') {

        income = {
          amount: parseFloat(amount),
          company: companyId,
          branch: selectedCustomerBranchIncomesOption,
          customer: null,
          employee: currentUser,
          partOfAPayment: false,
          type: selectedIncomeType,
          createdAt
        }

      } else {

        income = {
          amount: parseFloat(amount),
          company: companyId,
          customer: selectedCustomerBranchIncomesOption,
          branch: null,
          employee: currentUser,
          partOfAPayment: false,
          type: selectedIncomeType,
          createdAt
        }
      }


      addIncome({ income, group, pushIncome, spliceIncome, updateLastIncomeId })


      amountInput.value = ''
      setSelectedIncomeType(null)


    } catch (error) {

      console.log(error)
    }
  }

  const incomesButtonControl = () => {

    const amountInput = document.getElementById('income-amount')
    const button = document.getElementById('incomeButton')

    let filledInputs = true

    if (amountInput.value == '') {

      filledInputs = false
    }

    if (filledInputs && selectedCustomerBranchIncomesOption != null && selectedIncomeType != null) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  const handleIncomesInputsChange = (e) => {

    setIncomeFormData({

      ...incomeFormData,
      [e.target.name]: e.target.value,

    })
  }

  const handleTypesSelectChange = (option) => {

    setSelectedIncomeType(option)
    incomesButtonControl()
  }

  return (
    <div>

      <div className='border bg-white p-3 mt-4'>

        <div className='grid grid-cols-2'>
          <SectionHeader label={'Efectivos'} />
          <div className='flex items-center gap-4 justify-self-end mr-12'>
            <ShowIncomesModal
              title={'Ingresos'}
              clickableComponent={
                roles && roles.managerRole && currentUser.role == roles.managerRole._id ?
                  <p className='font-bold text-lg text-center'>{stringToCurrency({ amount: incomesTotal })}</p>
                  :
                  <FaListAlt className="h-10 w-10 text-red-600" />
              }
              incomes={incomes}
            />
          </div>
        </div>
        <form onSubmit={addIncomeSubmit} className="grid grid-cols-3 gap-2 mt-2">
          <BranchAndCustomerSelect defaultLabel={'Sucursal o Cliente'} options={branchAndCustomerSelectOptions} selectedOption={selectedCustomerBranchIncomesOption} handleSelectChange={handleCustomerBranchIncomesSelectChange}></BranchAndCustomerSelect>
          <Select
            styles={customSelectStyles}
            value={selectedIncomeType}
            onChange={handleTypesSelectChange}
            options={incomeTypes}
            placeholder={'Tipo'}
            isSearchable={true}
          />
          <input type="number" name="amount" id="income-amount" placeholder='$0.00' step={0.10} className='border border-black p-2 rounded-lg' required onInput={incomesButtonControl} onChange={handleIncomesInputsChange} />
          <button type='submit' id='incomeButton' disabled className='bg-slate-500 text-white p-3 rounded-lg col-span-3 mt-4'>Agregar</button>
        </form>
      </div>
    </div>
  )
}
