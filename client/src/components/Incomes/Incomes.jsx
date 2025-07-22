/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useIncomeTypes } from '../../hooks/Incomes/useIncomeTypes'
import { isToday } from '../../helpers/DatePickerFunctions'
import SectionHeader from '../SectionHeader'
import { customSelectStyles } from '../../helpers/Constants'
import Select from 'react-select'
import BranchAndCustomerSelect from '../Select/BranchAndCustomerSelect'
import { useRoles } from '../../context/RolesContext'
import { getArrayForSelects, currency } from '../../helpers/Functions'
import { FaListAlt } from 'react-icons/fa'
import ShowListModal from '../Modals/ShowListModal'
import IncomesList from './IncomesList'
import { ToastDanger, ToastInfo, ToastSuccess } from '../../helpers/toastify'
import { useSelector } from 'react-redux'
import { useDate } from '../../context/DateContext'
import { useIncomes } from '../../hooks/Incomes/useIncomes'
import { useBranches } from '../../hooks/Branches/useBranches'
import { useCustomers } from '../../hooks/Customers/useCustomers'
import { useEmployees } from '../../hooks/Employees/useEmployees'
import { useDateNavigation } from '../../hooks/useDateNavigation'
import RegisterDateSwitch from '../RegisterDateSwitch'

export default function Incomes({ showDateSwitch = true, useToday: useTodayProp }) {

  const { currentUser, company } = useSelector((state) => state.user)
  const [incomeFormData, setIncomeFormData] = useState({})
  const { isManager, isSupervisor } = useRoles()
  const { incomeTypes } = useIncomeTypes()
  const companyId = company?._id ?? company
  const [selectedCustomerBranchIncomesOption, setSelectedCustomerBranchIncomesOption] = useState(null)
  const [branchAndCustomerSelectOptions, setBranchAndCustomerSelectOptions] = useState([])
  const [selectedIncomeGroup, setSelectedIncomeGroup] = useState('')
  const [selectedIncomeType, setSelectedIncomeType] = useState(null)
  const { currentDate, today, dateFromYYYYMMDD } = useDateNavigation()
  const { incomes, incomesTotal, onAddIncome, onDeleteIncome } = useIncomes({ companyId, date: currentDate })
  const [useToday, setUseToday] = useState(false);
  const effectiveUseToday = useTodayProp !== undefined ? useTodayProp : useToday;
  const { branches } = useBranches({ companyId: company._id })
  const { employees } = useEmployees({ companyId: company._id })
  const { customers } = useCustomers({ companyId: company._id })

  useEffect(() => {
    setBranchAndCustomerSelectOptions([
      {
        label: 'Sucursales',
        options: getArrayForSelects(branches, (branch) => branch.branch)
      },
      {
        label: 'Empleados',
        options: getArrayForSelects(employees.filter(employee => isSupervisor(employee.role) && employee._id !== currentUser._id), (employee) => employee.name + ' ' + employee.lastName)
      },
      {
        label: 'Clientes',
        options: getArrayForSelects(customers, (customer) => customer.name + ' ' + (customer?.lastName ?? ''))
      }
    ])
  }, [branches, customers, employees, isSupervisor, currentUser])


  const resetInputs = () => {
    document.getElementById('income-amount').value = ''
    setSelectedIncomeType(null)
    setSelectedCustomerBranchIncomesOption(null)
    setIncomeFormData({})
    setUseToday(false)
  }

  const handleCustomerBranchIncomesSelectChange = (option) => {

    const group = branchAndCustomerSelectOptions.find(g => g.options.some(opt => opt.value === option.value));
    setSelectedIncomeGroup(group.label == 'Sucursales' ? 'branch' : group.label == 'Clientes' ? 'customer' : 'prevOwner');
    setSelectedCustomerBranchIncomesOption(option)
    incomesButtonControl()
  }

  const addIncomeSubmit = async (e) => {

    e.preventDefault()

    const createdAt = effectiveUseToday || today ? new Date().toISOString() : dateFromYYYYMMDD.toISOString()
    let income = null

    try {

      const { amount } = incomeFormData

      let prevOwnerIncome = null
      income = {
        amount: parseFloat(amount),
        company: companyId,
        customer: null,
        branch: null,
        prevOwner: null,
        prevOwnerIncome: null,
        employee: currentUser,
        partOfAPayment: false,
        type: selectedIncomeType,
        createdAt
      }

      income[selectedIncomeGroup] = selectedCustomerBranchIncomesOption

      if (income.prevOwner) {
        prevOwnerIncome = {
          ...income,
          type: income.type,
          prevOwner: null,
          amount: -income.amount,
          owner: currentUser,
          employee: selectedCustomerBranchIncomesOption,
        }
      }

      ToastSuccess(`Se registró el efectivo de ${income.amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}`)
      resetInputs()
      await onAddIncome(income, prevOwnerIncome ? prevOwnerIncome : null, selectedIncomeGroup)

    } catch (error) {

      if (error.message.includes('sólo') || error.message.includes('empleado') || error.message.includes('monto'))
        ToastInfo(error.message.replace(new RegExp('Error: ', 'g'), ''))
      ToastDanger(`No se registró el efectivo de ${income.amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}`)
      resetInputs()
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
      <div className='border bg-white p-3 rounded-lg'>
        <div className='grid grid-cols-2'>
          <SectionHeader label={'Efectivos'} />
          <div className='flex items-center gap-4 justify-self-end mr-12'>
            <ShowListModal
              title={'Ingresos'}
              ListComponent={IncomesList}
              ListComponentProps={{ incomes, incomesTotal, onDeleteIncome }}
              clickableComponent={
                isManager(currentUser?.role) ?
                  <p className='font-bold text-lg text-center'>{currency({ amount: incomesTotal ?? 0 })}</p>
                  :
                  <FaListAlt className="h-10 w-10 text-red-600" />
              }
            //Comparar con el monto para cubrir la nota de hoy.
            />
          </div>
        </div>
        <form onSubmit={addIncomeSubmit} className="">
          <div>
            {!today && showDateSwitch &&
              <RegisterDateSwitch
                useToday={effectiveUseToday}
                setUseToday={setUseToday}
              />
            }
          </div>
          <div className='grid grid-cols-3 gap-2 mt-2'>
            <BranchAndCustomerSelect defaultLabel={'Sucursal o Cliente'} options={branchAndCustomerSelectOptions} selectedOption={selectedCustomerBranchIncomesOption} handleSelectChange={handleCustomerBranchIncomesSelectChange}></BranchAndCustomerSelect>
            <Select
              styles={customSelectStyles}
              menuPortalTarget={document.body}
              value={selectedIncomeType}
              onChange={handleTypesSelectChange}
              options={getArrayForSelects(incomeTypes, (type) => { return type.name })}
              placeholder={'Tipo'}
              isSearchable={true}
            />
            <input type="number" name="amount" id="income-amount" placeholder='$0.00' step={0.10} className='border border-black p-2 rounded-lg' required onInput={incomesButtonControl} onChange={handleIncomesInputsChange} />
            <button type='submit' id='incomeButton' disabled className='bg-button text-white p-3 rounded-lg col-span-3 mt-4'>Agregar</button>
          </div>
        </form>
      </div>
    </div>
  )
}