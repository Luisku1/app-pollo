/* eslint-disable react/prop-types */
import { FaListAlt } from 'react-icons/fa'
import SectionHeader from '../SectionHeader'
import EmployeesSelect from '../Select/EmployeesSelect'
import Select from 'react-select'
import { stringToCurrency } from '../../helpers/Functions'
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
  const { roles } = useRoles()
  const [extraOutgoingFormData, setExtraOutgoingFormData] = useState({})
  const { extraOutgoings, spliceExtraOutgoingById, totalExtraOutgoings, onAddExtraOutgoing, onDeleteExtraOutgoing, pushExtraOutgoing } = useDayExtraOutgoings({ companyId: company._id, date })
  const { payments, total: totalEmployeesPayments, onAddEmployeePayment, onDeleteEmployeePayment } = useEmployeesPayments({ companyId: company._id, date })
  // const [buttonId, setButtonId] = useState(null)
  // const [isOpen, setIsOpen] = useState(false)
  // const [employeePaymentsIsOpen, setEmployeePaymentsIsOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

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
    <div className='border p-3 mt-4 bg-white'>

      <SectionHeader label={'Gastos'} />
      <div className='border bg-white p-3 mt-4'>
        <div className='grid grid-cols-2'>
          <SectionHeader label={'Gastos externos'} />
          <div className='flex items-center gap-4 justify-self-end mr-12'>
            <ShowListModal
              title={'Gastos'}
              ListComponent={ExtraOutgoingsList}
              ListComponentProps={{ extraOutgoings, totalExtraOutgoings, onDeleteExtraOutgoing }}
              clickableComponent={
                roles && roles.managerRole && currentUser.role == roles.managerRole._id ?
                  <p className='font-bold text-lg text-center'>{stringToCurrency({ amount: totalExtraOutgoings })}</p>
                  :
                  <FaListAlt className="h-10 w-10 text-red-600" />}
            />
          </div>
        </div>

        <form id='extra-outgoing-form' onSubmit={addExtraOutgoingSubmit} className="grid grid-cols-3 items-center gap-2">

          <input type="text" name="concept" id="extraOutgoingConcept" placeholder='Concepto' className='border border-black p-3 rounded-lg' required onInput={extraOutgoingsButtonControl} onChange={handleExtraOutgoingInputsChange} />
          <input type="number" name="amount" id="extraOutgoingAmount" placeholder='$0.00' step={0.01} className='border border-black p-3 rounded-lg' required onInput={extraOutgoingsButtonControl} onChange={handleExtraOutgoingInputsChange} />
          <button type='submit' id='extraOutgoingButton' disabled className='bg-slate-500 text-white font-semibold p-3 rounded-lg'>Agregar</button>

        </form>
      </div>
      <div className='border bg-white p-3 mt-4'>
        <div className='grid grid-cols-2 items-center'>
          <SectionHeader label={'Pago a Empleados y Rentas'} />
          <div className='flex items-center gap-4 justify-self-end mr-12'>
            <ShowListModal
              title={'Pagos a empleados'}
              ListComponent={EmployeePaymentsList}
              ListComponentProps={{ payments, total: totalEmployeesPayments, onDeletePayment: onDeleteEmployeePayment, spliceIncome: spliceIncomeById, spliceExtraOutgoingById }}
              clickableComponent={<p className='font-bold text-lg text-center'>{stringToCurrency({ amount: totalEmployeesPayments })}</p>}
            />
          </div>
        </div>

        <form onSubmit={addEmployeePaymentSubmit} className="grid grid-cols-1 items-center justify-between gap-3">

          <div className=''>

            <EmployeesSelect defaultLabel={'¿A quién le pagas?'} employees={employees} handleEmployeeSelectChange={handleEmployeeSelectChange} selectedEmployee={selectedEmployee}></EmployeesSelect>

          </div>

          <div>
            <p className='text-xs text-red-700'>Si ya tenías el dinero deja vacío el campo de sucursal</p>
            <Select
              id='branchSelect'
              styles={customSelectStyles}
              value={selectedBranch}
              onChange={handleBranchSelectChange}
              options={branches}
              isClearable={true}
              placeholder='¿De qué sucursal salió el dinero?'
              isSearchable={true}
            />
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

          <button type='submit' id='paymentButton' disabled className='bg-slate-500 text-white p-3 rounded-lg col-span-1 mt-4'>Agregar</button>

        </form>


      </div>

      {/* {employeePaymentsIsOpen && payments && payments.length > 0 ?
        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
          <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
            <button className="" onClick={() => { setEmployeePaymentsIsOpen(false) }}><MdCancel className="h-7 w-7" /></button>
            < div className='bg-white mt-4 mb-4'>

              <SectionHeader label={'Pagos a empleados'} />

              <div>

                {payments && payments.length > 0 ?
                  <div id='header' className='grid grid-cols-11 gap-4 items-center justify-around font-semibold mt-4'>
                    <p className='p-3 rounded-lg col-span-3 text-center'>Supervisor</p>
                    <p className='p-3 rounded-lg col-span-3 text-center'>Trabajador</p>
                    <p className='p-3 rounded-lg col-span-3 text-center'>Monto</p>
                  </div>
                  : ''}
                {payments && payments.length > 0 && payments.map((employeePayment, index) => (
                  <div key={employeePayment._id}>
                    {(roles.managerRole._id == currentUser.role || employeePayment.employee._id == currentUser._id) && (
                      <div className={(currentUser._id == employeePayment.supervisor._id || currentUser.role == roles.managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

                        <div id='list-element' className='flex col-span-10 items-center justify-around'>
                          <p className='text-center text-sm w-3/12'>{`${(employeePayment.supervisor?.name + employeePayment.supervisor?.lastName)}`}</p>
                          <p className='text-center text-sm w-3/12'>{employeePayment.employee.label ?? employeePayment.employee.name}</p>
                          <p className='text-center text-sm w-3/12'>{stringToCurrency({ amount: employeePayment.amount })}</p>
                        </div>

                        {currentUser._id == employeePayment.supervisor._id || currentUser.role == roles.managerRole._id ?

                          <div>
                            <button id={employeePayment._id} onClick={() => { setIsOpen(!isOpen), setButtonId(employeePayment._id) }} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                              <span>
                                <FaTrash className='text-red-700 m-auto' />
                              </span>
                            </button>

                            {isOpen && employeePayment._id == buttonId ?
                              <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                                <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                                  <div>
                                    <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                                  </div>
                                  <div className='flex gap-10'>
                                    <div>
                                      <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteEmployeePayment({ employeePayment, spliceEmployeePayment, spliceIncomeById, spliceExtraOutgoingById, index }), setIsOpen(!isOpen) }}>Si</button>
                                    </div>
                                    <div>
                                      <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setIsOpen(!isOpen) }}>No</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              : ''}
                          </div>
                          : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        : ''
      } */}
    </div>


  )
}
