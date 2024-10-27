/* eslint-disable react/prop-types */
import { useState } from 'react'
import { useAddIncome } from '../../hooks/Incomes/useAddIncome'
import { useDeleteIncome } from '../../hooks/Incomes/useDeleteIncome'
import { useIncomeTypes } from '../../hooks/Incomes/useIncomeTypes'
import { isToday } from '../../helpers/DatePickerFunctions'
import SectionHeader from '../SectionHeader'
import { FaListAlt } from 'react-icons/fa'
import { customSelectStyles } from '../../helpers/Constants'
import Select from 'react-select'
import BranchAndCustomerSelect from '../Select/BranchAndCustomerSelect'
import { MdCancel } from 'react-icons/md'
import DeleteButton from '../Buttons/DeleteButton'

export default function Incomes({ incomes, incomesTotal, pushIncome, spliceIncome, updateLastIncomeId, branchAndCustomerSelectOptions, date, companyId, currentUser, roles }) {

  const [incomeFormData, setIncomeFormData] = useState({})
  const { addIncome } = useAddIncome()
  const { deleteIncome } = useDeleteIncome()
  const { incomeTypes } = useIncomeTypes()
  const [selectedCustomerBranchIncomesOption, setSelectedCustomerBranchIncomesOption] = useState(null)
  const [selectedIncomeGroup, setSelectedIncomeGroup] = useState('')
  const [selectedIncomeType, setSelectedIncomeType] = useState(null)
  const [incomesIsOpen, setIncomesIsOpen] = useState(false)

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

        <div className='grid grid-cols-3'>
          <SectionHeader label={'Efectivos'} />
          <div className="h-10 w-10 shadow-lg justify-self-end">
            <button className="w-full h-full" onClick={() => { setIncomesIsOpen(true) }}><FaListAlt className="h-full w-full text-red-600" />
            </button>
          </div>
          {roles && roles.managerRole && currentUser.role == roles.managerRole._id ?
            <p className='font-bold text-lg text-red-700 text-center'>{incomesTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
            : ''}
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

      {incomesIsOpen && incomes && incomes.length > 0 ?

        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
          <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
            <button className="" onClick={() => { setIncomesIsOpen(false) }}><MdCancel className="h-7 w-7" /></button>
            < div className='bg-white mt-4 mb-4'>

              <SectionHeader label={'Efectivos'} />

              <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
                <p className='col-span-3 text-center'>Sucursal o Cliente</p>
                <p className='col-span-2 text-center'>Encargado</p>
                <p className='col-span-3 text-center'>Tipo</p>
                <p className='col-span-1 text-center'>Monto</p>
              </div>

              {incomes.map((income, index) => (

                <div key={income._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 mt-2 shadow-m rounded-lg'>

                  <div id='list-element' className=' flex col-span-10 items-center justify-around pt-3 pb-3'>
                    <p className='text-center text-xs w-3/12'>
                      {(() => {
                        const branchInfo = income.branch?.branch || income.branch?.label;
                        const customerInfo = `${income.customer?.name || ''} ${income.customer?.lastName || ''}`.trim() || income.customer?.label;

                        return branchInfo || customerInfo;
                      })()}</p>
                    <p className='text-center text-xs w-3/12'>{income.employee.name + ' ' + income.employee.lastName}</p>
                    <p className='text-center text-xs w-2/12'>{income.type.name || income.type.label}</p>
                    <p className='text-center text-xs w-3/12'>{income.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                  </div>

                  {((currentUser._id == income.employee._id || currentUser.role == roles.managerRole._id) && !income.partOfAPayment) ?

                    <DeleteButton
                      id={income._id}
                      deleteFunction={deleteIncome}
                      index={index}
                      item={income}
                      spliceFunction={spliceIncome}
                    />
                    : ''}

                </div>

              ))}

            </div>
          </div>
        </div>
        : ''
      }
    </div>
  )
}
