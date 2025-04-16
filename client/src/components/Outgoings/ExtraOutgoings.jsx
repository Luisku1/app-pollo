/* eslint-disable react/prop-types */
import { FaListAlt } from 'react-icons/fa'
import SectionHeader from '../SectionHeader'
import EmployeesSelect from '../Select/EmployeesSelect'
import Select from 'react-select'
import { getArrayForSelects, getElementForSelect, currency } from '../../helpers/Functions'
import { isToday } from '../../helpers/DatePickerFunctions'
import { useEffect, useState } from 'react'
import { useEmployeesPayments } from '../../hooks/Employees/useEmployeesPayments'
import { useDayExtraOutgoings } from '../../hooks/ExtraOutgoings/useDayExtraOutgoings'
import { customSelectStyles } from '../../helpers/Constants'
import { useRoles } from '../../context/RolesContext'
import ShowListModal from '../Modals/ShowListModal'
import EmployeePaymentsList from '../EmployeePaymentsList'
import { useSelector } from 'react-redux'
import ExtraOutgoingsList from './ExtraOutgoingsList'

export default function ExtraOutgoings({ date, pushIncome, employees, branches, spliceIncomeById }) {

  const { currentUser, company } = useSelector((state) => state.user)
  const { isManager } = useRoles()
  const [extraOutgoingFormData, setExtraOutgoingFormData] = useState({})
  const { extraOutgoings, spliceExtraOutgoingById, totalExtraOutgoings, onAddExtraOutgoing, onDeleteExtraOutgoing, pushExtraOutgoing } = useDayExtraOutgoings({ companyId: company._id, date })
  const { payments, total: totalEmployeesPayments, onAddEmployeePayment, onDeleteEmployeePayment } = useEmployeesPayments({ companyId: company._id, date })
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isDirectFromBranch, setIsDirectFromBranch] = useState(false);

  const paymentsButtonControl = () => {

    const amountInput = document.getElementById('paymentAmount')
    const button = document.getElementById('paymentButton')

    let filledInputs = true

    if (amountInput.value == '') {

      filledInputs = false

    }

    if (filledInputs && selectedEmployee != null) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

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

  const addEmployeePaymentSubmit = async (e) => {

    const amount = document.getElementById('paymentAmount')
    const detail = document.getElementById('paymentDetail')
    const createdAt = isToday(date) ? new Date().toISOString() : new Date(date).toISOString()

    e.preventDefault()

    try {

      const employeePayment = {
        amount: parseFloat(amount.value),
        detail: detail.value,
        company: company._id,
        branch: selectedBranch,
        employee: selectedEmployee,
        supervisor: currentUser,
        createdAt
      }

      onAddEmployeePayment(employeePayment, pushIncome, spliceIncomeById, pushExtraOutgoing, spliceExtraOutgoingById)

      setIsDirectFromBranch(false)
      setSelectedEmployee(null)
      setSelectedBranch(null)
      amount.value = ''
      detail.value = ''

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

  const handleEmployeeSelectChange = (employee) => {

    setSelectedEmployee(employee)
  }

  const handleBranchSelectChange = (branch) => {

    setSelectedBranch(branch)
  }

  const handleCheckboxChange = (e) => {
    setIsDirectFromBranch(e.target.checked);
    if (!e.target.checked) {
      setSelectedBranch(null);
    }
  };

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

  useEffect(paymentsButtonControl, [selectedEmployee, selectedBranch])

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
      <div className='border bg-white p-3 mt-4'>
        <div className='grid grid-cols-2 items-center'>
          <SectionHeader label={'Pago a Empleados y Rentas'} />
          <div className='flex items-center gap-4 justify-self-end mr-12'>
            <ShowListModal
              title={'Pagos a empleados'}
              ListComponent={EmployeePaymentsList}
              ListComponentProps={{ payments, total: totalEmployeesPayments, onDelete: onDeleteEmployeePayment, spliceIncome: spliceIncomeById, spliceExtraOutgoing: spliceExtraOutgoingById }}
              clickableComponent={<p className='font-bold text-lg text-center'>{currency({ amount: totalEmployeesPayments })}</p>}
            />
          </div>
        </div>
        <form onSubmit={addEmployeePaymentSubmit} className="grid grid-cols-1 items-center justify-between gap-3">
          <div className=''>
            <EmployeesSelect defaultLabel={'¿A quién le pagas?'} employees={employees} handleEmployeeSelectChange={handleEmployeeSelectChange} selectedEmployee={selectedEmployee}></EmployeesSelect>
          </div>
          <div>
            <label className="flex items-center gap-2 ml-3">
              <input
                type="checkbox"
                checked={isDirectFromBranch}
                onChange={handleCheckboxChange}
                className="h-5 w-5"
              />
              ¿El dinero viene directo de una sucursal?
            </label>
          </div>
          <div>
            {isDirectFromBranch && (
              <div>
                <p className='text-xs text-red-700'>Si ya tenías el dinero deja vacío el campo de sucursal</p>
                <Select
                  id='branchSelect'
                  styles={customSelectStyles}
                  value={getElementForSelect(selectedBranch, (branch) => branch.branch)}
                  onChange={handleBranchSelectChange}
                  options={getArrayForSelects(branches, (branch) => branch.branch)}
                  isClearable={true}
                  placeholder='¿De qué sucursal salió el dinero?'
                  isSearchable={true}
                />
              </div>
            )}
          </div>
          <div className='relative'>
            <input type="number" name="paymentAmount" id="paymentAmount" placeholder='$0.00' step={0.01} className='w-full col-span-1 border p-3 rounded-lg border-black' required onInput={paymentsButtonControl} />
            <label htmlFor="compact-input" className=" -translate-y-full px-1 absolute top-1/4 left-2 rounded-sm bg-white text-red-700 text-sm font-semibold">
              Monto entregado al empleado <span>*</span>
            </label>
          </div>
          <div className='col-span-1 grid grid-cols-1'>
            <p className='text-xs text-red-700'>Especifíca el motivo del pago</p>
            <input type="text" name="paymentDetail" id="paymentDetail" placeholder='Pago de Nómina, Préstamo, Pollo, etc...' className='col-span-1 p-3 border border-black rounded-lg' required onInput={paymentsButtonControl} />
          </div>
          <button type='submit' id='paymentButton' disabled className='bg-button text-white p-3 rounded-lg col-span-1 mt-4'>Agregar</button>
        </form>
      </div>
    </div>
  )
}
