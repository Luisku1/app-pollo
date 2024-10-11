/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { FaListAlt, FaTrash } from 'react-icons/fa';
import { Link } from "react-router-dom"
import { MdCancel, MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md';
import { useParams, useNavigate } from 'react-router-dom';
import Select from "react-select";
import { formatDate, today } from '../helpers/DatePickerFunctions';
import FechaDePagina from '../components/FechaDePagina';
import EntradaInicial from './EntradaInicial';
import 'react-toastify/dist/ReactToastify.css';
import EmployeesSelect from '../components/Select/EmployeesSelect';
import BranchAndCustomerSelect from '../components/Select/BranchAndCustomerSelect';
import { useProducts } from '../hooks/Products/useProducts';
import { useLoading } from '../hooks/loading';
import { useEmployees } from '../hooks/Employees/useEmployees';
import { useBranches } from '../hooks/Branches/useBranches';
import { useCustomers } from '../hooks/Customers/useCustomers';
import Loading from '../components/Loading';
import { useRoles } from '../hooks/useRoles';
import { ToastDanger } from '../helpers/toastify';
import { customSelectStyles } from '../helpers/Constants';
import { useIncomeTypes } from '../hooks/Incomes/useIncomeTypes';
import EntradasYSalidas from '../components/EntradasYSalidas/EntradasYSalidas';
import { useIncomes } from '../hooks/Incomes/useIncomes';
import { useAddIncome } from '../hooks/Incomes/useAddIncome';
import { useDeleteIncome } from '../hooks/Incomes/useDeleteIncome';
import { useAddEmployeePayment } from '../hooks/Employees/useAddEmployeePayment';
import { useEmployeesPayments } from '../hooks/Employees/useEmployeesPayments';
import { useDeleteEmployeePayment } from '../hooks/Employees/useDeleteEmployeePayment';
import { useDayExtraOutgoings } from '../hooks/ExtraOutgoings.js/useDayExtraOutgoings';
import { useDeleteExtraOutgoing } from '../hooks/ExtraOutgoings.js/useDeleteExtraOutgoing';
import { useAddExtraOutgoing } from '../hooks/ExtraOutgoings.js/useAddExtraOutgoing';
import { stringToCurrency } from '../helpers/Functions';

export default function ControlSupervisor() {

  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const { currentUser, company } = useSelector((state) => state.user)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [extraOutgoingFormData, setExtraOutgoingFormData] = useState({})
  const [incomeFormData, setIncomeFormData] = useState({})
  const { employees, loading: empLoading } = useEmployees({ companyId: company._id })
  const { branches, loading: branchLoading } = useBranches({ companyId: company._id })
  const { customers, loading: custLoading } = useCustomers({ companyId: company._id })
  const { products, loading: prodLoading } = useProducts({ companyId: company._id })
  const { roles, loading: roleLoading } = useRoles()
  const [employeesDailyBalances, setEmployeesDailyBalance] = useState([])
  const { extraOutgoings, totalExtraOutgoings, pushExtraOutgoing, spliceExtraOutgoing, spliceExtraOutgoingById, updateLastExtraOutgoingId } = useDayExtraOutgoings({ companyId: company._id, date: stringDatePickerValue })
  const { deleteExtraOutgoing } = useDeleteExtraOutgoing()
  const { addExtraOutgoing } = useAddExtraOutgoing()
  const { employeesPayments, totalEmployeesPayments, pushEmployeePayment, spliceEmployeePayment, updateLastEmployeePayment } = useEmployeesPayments({ companyId: company._id, date: stringDatePickerValue })
  const [netDifference, setNetDifference] = useState({})
  const { addEmployeePayment } = useAddEmployeePayment()
  const { deleteEmployeePayment } = useDeleteEmployeePayment()
  const [totalNetDifference, setTotalNetDifference] = useState(0.0)
  const { incomes, incomesTotal, pushIncome, spliceIncome, spliceIncomeById, updateLastIncomeId } = useIncomes({ companyId: company._id, date: stringDatePickerValue })
  const { addIncome } = useAddIncome()
  const { deleteIncome } = useDeleteIncome()
  const { incomeTypes } = useIncomeTypes()
  const [selectedIncomeType, setSelectedIncomeType] = useState(null)
  const [buttonId, setButtonId] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [incomesIsOpen, setIncomesIsOpen] = useState(false)
  const [outgoingsIsOpen, setOutgoingsIsOpen] = useState(false)
  const [employeePaymentsIsOpen, setEmployeePaymentsIsOpen] = useState(false)
  const [differencesIsOpen, setDifferencesIsOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedCustomerBranchIncomesOption, setSelectedCustomerBranchIncomesOption] = useState(null)
  const [selectedIncomeGroup, setSelectedIncomeGroup] = useState('')
  const navigate = useNavigate()
  const [branchAndCustomerSelectOptions, setBranchAndCustomerSelectOptions] = useState([])
  const ref = useRef(null)

  useEffect(() => {

    setBranchAndCustomerSelectOptions([
      {
        label: 'Sucursales',
        options: branches
      },
      {
        label: 'Clientes',
        options: customers
      }])

  }, [branches, customers])

  const isLoading = useLoading(roleLoading, empLoading, branchLoading, custLoading, prodLoading)

  const handleBranchSelectChange = (branch) => {

    setSelectedBranch(branch)
  }

  const changeDatePickerValue = (e) => {

    stringDatePickerValue = (e.target.value + 'T06:00:00.000Z')

    navigate('/supervision-diaria/' + stringDatePickerValue)

  }

  const changeDay = (date) => {

    navigate('/supervision-diaria/' + date)

  }

  const handleEmployeeSelectChange = (employee) => {

    setSelectedEmployee(employee)
  }

  const handleCustomerBranchIncomesSelectChange = (option) => {

    const group = branchAndCustomerSelectOptions.find(g => g.options.some(opt => opt.value === option.value));
    setSelectedIncomeGroup(group ? group.label : '');
    setSelectedCustomerBranchIncomesOption(option)
    incomesButtonControl()

  }

  const SectionHeader = (props) => {

    return (

      <h2 className='flex text-2xl text-center font-semibold mb-4 text-red-800' onClick={props.onClick}>{props.label}</h2>
    )
  }


  const handleTypesSelectChange = (option) => {

    setSelectedIncomeType(option)
    incomesButtonControl()
  }

  const handleExtraOutgoingInputsChange = (e) => {

    setExtraOutgoingFormData({

      ...extraOutgoingFormData,
      [e.target.name]: e.target.value,

    })
  }

  const handleIncomesInputsChange = (e) => {

    setIncomeFormData({

      ...incomeFormData,
      [e.target.name]: e.target.value,

    })
  }

  const handleDailyBalanceInputs = async (e, dailyBalanceId) => {

    setLoading(true)

    try {

      const res = await fetch('/api/employee/update-daily-balance/' + dailyBalanceId, {

        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({

          [e.target.id]: e.target.checked
        })
      })

      const data = await res.json()

      if (data.success === false) {

        e.target.checked = !e.target.checked
        setError(data.message)
        setLoading(false)
        return
      }

      setError(null)
      setLoading(false)

    } catch (error) {

      e.target.checked = !e.target.checked
      setError(error.message)
      setLoading(false)
    }
  }

  const paymentsButtonControl = () => {

    const amountInput = document.getElementById('paymentAmount')
    const button = document.getElementById('paymentButton')

    let filledInputs = true

    if (amountInput.value == '') {

      filledInputs = false

    }

    if (filledInputs && !loading && selectedEmployee != null) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  useEffect(paymentsButtonControl, [selectedEmployee, selectedBranch, loading])

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

    if (filledInputs && !loading) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  const incomesButtonControl = () => {

    const amountInput = document.getElementById('income-amount')
    const button = document.getElementById('incomeButton')

    let filledInputs = true

    if (amountInput.value == '') {

      filledInputs = false
    }

    if (filledInputs && selectedCustomerBranchIncomesOption != null && selectedIncomeType != null && !loading) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  const addEmployeePaymentSubmit = async (e) => {

    const amount = document.getElementById('paymentAmount')
    const detail = document.getElementById('paymentDetail')
    const date = today(stringDatePickerValue) ? new Date().toISOString() : new Date(stringDatePickerValue).toISOString()


    e.preventDefault()

    setLoading(true)

    try {

      const employeePayment = {
        amount: parseFloat(amount.value),
        detail: detail.value,
        company: company._id,
        branch: selectedBranch,
        employee: selectedEmployee,
        supervisor: currentUser,
        createdAt: date
      }

      addEmployeePayment({ employeePayment, pushEmployeePayment, pushIncome, pushExtraOutgoing, spliceEmployeePayment, updateLastEmployeePayment })

      setSelectedEmployee(null)
      setSelectedBranch(null)
      amount.value = ''
      detail.value = ''
      setError(null)
      setLoading(false)

    } catch (error) {

      console.log(error)
      ToastDanger(error.message)
      setLoading(false)

    }
  }

  const addExtraOutgoingSubmit = async (e) => {

    const conceptInput = document.getElementById('extraOutgoingConcept')
    const amountInput = document.getElementById('extraOutgoingAmount')
    const date = today(stringDatePickerValue) ? new Date().toISOString() : new Date(stringDatePickerValue).toISOString()

    e.preventDefault()

    setLoading(true)

    try {

      const { amount, concept } = extraOutgoingFormData

      const extraOutgoing = {
        amount: parseFloat(amount),
        concept,
        employee: currentUser,
        company: company._id,
        createdAt: date
      }

      addExtraOutgoing({ extraOutgoing, pushExtraOutgoing, updateLastExtraOutgoingId })

      setError(null)
      conceptInput.value = ''
      amountInput.value = ''
      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)

    }
  }

  const focusIncomeBranchSelect = () => {

    if (ref.current) {
      ref.current.focus();
    }
  }

  const addIncomeSubmit = async (e) => {

    const amountInput = document.getElementById('income-amount')
    const date = today(stringDatePickerValue) ? new Date().toISOString() : new Date(stringDatePickerValue).toISOString()

    e.preventDefault()

    setLoading(true)

    try {

      const { amount } = incomeFormData

      const group = selectedIncomeGroup == 'Sucursales' ? 'branch' : 'customer'

      let income = {}

      if (group == 'branch') {

        income = {
          amount: parseFloat(amount),
          company: company._id,
          branch: selectedCustomerBranchIncomesOption,
          customer: null,
          employee: currentUser,
          partOfAPayment: false,
          type: selectedIncomeType,
          createdAt: date
        }

      } else {

        income = {
          amount: parseFloat(amount),
          company: company._id,
          customer: selectedCustomerBranchIncomesOption,
          branch: null,
          employee: currentUser,
          partOfAPayment: false,
          type: selectedIncomeType,
          createdAt: date
        }
      }


      addIncome({ income, group, pushIncome, spliceIncome, updateLastIncomeId })

      setError(null)

      amountInput.value = ''
      setSelectedBranch(null)
      setSelectedIncomeType(null)
      focusIncomeBranchSelect()

      setLoading(false)

    } catch (error) {

      console.log(error)
      setLoading(false)

    }
  }

  useEffect(() => {

    setEmployeesDailyBalance([])
    setTotalNetDifference(0.0)
    setNetDifference([])
    setIncomesIsOpen(false)
    setOutgoingsIsOpen(false)
    setEmployeePaymentsIsOpen(false)

    const fetchEmployeesDailyBalances = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setLoading(true)

      try {

        const res = await fetch('/api/employee/get-employees-daily-balances/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        setEmployeesDailyBalance(data)
        setLoading(false)
        setError(null)

      } catch (error) {

        setError(error.message)
        setLoading(false)
      }

    }

    const fetchNetDifference = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setTotalNetDifference(0.0)
      setLoading(true)

      try {

        const res = await fetch('/api/input/get-net-difference/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        Object.values(data.netDifference).map(productDifference => {

          setTotalNetDifference((prev) => prev + productDifference.totalDifference)
        })

        setNetDifference(data.netDifference)

        setError(null)
        setLoading(false)

      } catch (error) {

        console.log(error)
        setLoading(false)
      }
    }

    fetchEmployeesDailyBalances()
    fetchNetDifference()

  }, [company._id, stringDatePickerValue])


  useEffect(() => {

    document.title = 'Supervisión (' + new Date(stringDatePickerValue).toLocaleDateString() + ')'
  }, [stringDatePickerValue])

  if (isLoading) {

    return <Loading></Loading>

  } else {

    return (

      <main id='supervisor-main' className={"p-3 max-w-lg mx-auto"} >

        {roles && roles.managerRole && roles.managerRole._id == currentUser.role ?

          <FechaDePagina changeDay={changeDay} stringDatePickerValue={stringDatePickerValue} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>

          : ''}

        <h1 className='text-3xl text-center font-semibold mt-7'>
          Supervisión
        </h1>

        <div className='border bg-white p-3 mt-4'>

          <div className='grid grid-cols-3'>
            <SectionHeader label={'Efectivos'} />
            <div className="h-10 w-10 shadow-lg justify-self-end">
              <button className="w-full h-full" onClick={() => { setIncomesIsOpen(true) }}><FaListAlt className="h-full w-full text-red-600" />
              </button>
            </div>
            {roles.managerRole && currentUser.role == roles.managerRole._id ?
              <p className='font-bold text-lg text-red-700 text-center'>{incomesTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
              : ''}
          </div>


          <form onSubmit={addIncomeSubmit} className="grid grid-cols-3 gap-2 mt-2">

            <BranchAndCustomerSelect selectRef={ref} defaultLabel={'Sucursal o Cliente'} options={branchAndCustomerSelectOptions} selectedOption={selectedCustomerBranchIncomesOption} handleSelectChange={handleCustomerBranchIncomesSelectChange}></BranchAndCustomerSelect>

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

        <EntradasYSalidas products={products} branchAndCustomerSelectOptions={branchAndCustomerSelectOptions} date={stringDatePickerValue} roles={roles}></EntradasYSalidas>

        <EntradaInicial date={stringDatePickerValue} branchAndCustomerSelectOptions={branchAndCustomerSelectOptions} products={products ? products : []} roles={roles}></EntradaInicial>

        <div className='border p-3 mt-4 bg-white'>

          <SectionHeader label={'Gastos'} />

          <div className='border bg-white p-3 mt-4'>

            <div className='grid grid-cols-3'>
              <SectionHeader label={'Gastos externos'} />
              <div className="h-10 w-10 shadow-lg justify-self-end">
                <button className="w-full h-full" onClick={() => { setOutgoingsIsOpen(true) }}><FaListAlt className="h-full w-full text-red-600" />
                </button>
              </div>
              {roles && roles.managerRole && currentUser.role == roles.managerRole._id ?

                <p className='font-bold text-lg text-red-700 text-center'>{stringToCurrency({ amount: totalExtraOutgoings })}</p>

                : ''}
            </div>

            <form id='extra-outgoing-form' onSubmit={addExtraOutgoingSubmit} className="grid grid-cols-3 items-center gap-2">

              <input type="text" name="concept" id="extraOutgoingConcept" placeholder='Concepto' className='border border-black p-3 rounded-lg' required onInput={extraOutgoingsButtonControl} onChange={handleExtraOutgoingInputsChange} />
              <input type="number" name="amount" id="extraOutgoingAmount" placeholder='$0.00' step={0.01} className='border border-black p-3 rounded-lg' required onInput={extraOutgoingsButtonControl} onChange={handleExtraOutgoingInputsChange} />
              <button type='submit' id='extraOutgoingButton' disabled className='bg-slate-500 text-white font-semibold p-3 rounded-lg'>Agregar</button>

            </form>
          </div>
          <div className='border bg-white p-3 mt-4'>
            <div className='grid grid-cols-3 items-center'>
              <SectionHeader label={'Pago a Empleados'} />
              <div className="h-10 w-10 shadow-lg justify-self-end">
                <button className="w-full h-full" onClick={() => { setEmployeePaymentsIsOpen(true) }}><FaListAlt className="h-full w-full text-red-600" />
                </button>
              </div>
              {roles && roles.managerRole && currentUser.role == roles.managerRole._id ?

                <p className='font-bold text-lg text-red-700 text-center'>{totalEmployeesPayments.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>


                : ''}
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

        </div>

        {
          incomesIsOpen && incomes && incomes.length > 0 ?

            <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
              <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
                <button className="" onClick={() => { setIncomesIsOpen(false) }}><MdCancel className="h-7 w-7" /></button>
                < div className='bg-white mt-4 mb-4'>

                  <SectionHeader label={'Efectivos'} />

                  <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
                    <p className='col-span-3 text-center'>Sucursal</p>
                    <p className='col-span-2 text-center'>Encargado</p>
                    <p className='col-span-3 text-center'>Tipo</p>
                    <p className='col-span-1 text-center'>Monto</p>
                  </div>

                  {incomes.map((income, index) => (

                    <div key={income._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 mt-2 shadow-m rounded-lg'>

                      <div id='list-element' className=' flex col-span-10 items-center justify-around pt-3 pb-3'>
                        <p className='text-center text-xs w-3/12'>{`${income.branch?.branch || income.branch?.label || income.customer?.name || income.customer?.lastName}`}</p>
                        <p className='text-center text-xs w-3/12'>{income.employee.name + ' ' + income.employee.lastName}</p>
                        <p className='text-center text-xs w-2/12'>{income.type.name || income.type.label}</p>
                        <p className='text-center text-xs w-3/12'>{income.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                      </div>

                      {((currentUser._id == income.employee._id || currentUser.role == roles.managerRole._id) && !income.partOfAPayment) ?

                        <div>
                          <button id={income._id} onClick={() => { setIsOpen(!isOpen), setButtonId(income._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                            <span>
                              <FaTrash className='text-red-700 m-auto' />
                            </span>
                          </button>

                          {isOpen && income._id == buttonId ?
                            <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                              <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                                <div>
                                  <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                                </div>
                                <div className='flex gap-10'>
                                  <div>
                                    <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteIncome({ income, spliceIncome, index }), setIsOpen(!isOpen) }}>Si</button>
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

                  ))}

                </div>
              </div>
            </div>
            : ''
        }


        {
          outgoingsIsOpen && extraOutgoings && extraOutgoings.length > 0 ?
            <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
              <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
                <button className="" onClick={() => { setOutgoingsIsOpen(false) }}><MdCancel className="h-7 w-7" /></button>
                < div className='bg-white mt-4 mb-4'>
                  <SectionHeader label={'Gastos'} />

                  <div >

                    {extraOutgoings.length > 0 ?
                      <div id='header' className='grid grid-cols-11 items-center justify-around font-semibold mt-4'>
                        <p className='p-3 rounded-lg col-span-3 text-center bg-white'>Supervisor</p>
                        <p className='p-3 rounded-lg col-span-3 text-center bg-white'>Concepto</p>
                        <p className='p-3 rounded-lg col-span-3 text-center bg-white'>Monto</p>
                      </div>
                      : ''}

                    {extraOutgoings.length > 0 && extraOutgoings.map((extraOutgoing, index) => (


                      <div key={extraOutgoing._id} className={(currentUser._id == extraOutgoing.employee._id || currentUser.role == roles.managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

                        <div id='list-element' className='flex col-span-10 items-center justify-around'>
                          <p className='text-center text-sm w-3/12'>{extraOutgoing.employee.name ? extraOutgoing.employee.name : extraOutgoing.employee}</p>
                          <p className='text-center text-sm w-3/12'>{extraOutgoing.concept}</p>
                          <p className='text-center text-sm w-3/12'>{extraOutgoing.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                        </div>

                        {((currentUser._id == extraOutgoing.employee._id || currentUser.role == roles.managerRole._id) && !extraOutgoing.partOfAPayment) ?

                          <div>
                            <button id={extraOutgoing._id} onClick={() => { setIsOpen(!isOpen), setButtonId(extraOutgoing._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                              <span>
                                <FaTrash className='text-red-700 m-auto' />
                              </span>
                            </button>

                            {isOpen && extraOutgoing._id == buttonId ?
                              <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                                <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                                  <div>
                                    <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                                  </div>
                                  <div className='flex gap-10'>
                                    <div>
                                      <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteExtraOutgoing({extraOutgoing, spliceExtraOutgoing, index}), setIsOpen(!isOpen) }}>Si</button>
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

                    ))}

                  </div>
                </div>
              </div>
            </div>
            : ''
        }



        {
          employeePaymentsIsOpen && employeesPayments && employeesPayments.length > 0 ?
            <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
              <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
                <button className="" onClick={() => { setEmployeePaymentsIsOpen(false) }}><MdCancel className="h-7 w-7" /></button>
                < div className='bg-white mt-4 mb-4'>

                  <SectionHeader label={'Pagos a empleados'} />

                  <div>

                    {employeesPayments && employeesPayments.length > 0 ?
                      <div id='header' className='grid grid-cols-11 gap-4 items-center justify-around font-semibold mt-4'>
                        <p className='p-3 rounded-lg col-span-3 text-center'>Supervisor</p>
                        <p className='p-3 rounded-lg col-span-3 text-center'>Trabajador</p>
                        <p className='p-3 rounded-lg col-span-3 text-center'>Monto</p>
                      </div>
                      : ''}
                    {employeesPayments && employeesPayments.length > 0 && employeesPayments.map((employeePayment, index) => (


                      <div key={employeePayment._id} className={(currentUser._id == employeePayment.supervisor._id || currentUser.role == roles.managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

                        <div id='list-element' className='flex col-span-10 items-center justify-around'>
                          <p className='text-center text-sm w-3/12'>{`${(employeePayment.supervisor?.name + employeePayment.supervisor?.lastName)}`}</p>
                          <p className='text-center text-sm w-3/12'>{employeePayment.employee.label ?? employeePayment.employee.name}</p>
                          <p className='text-center text-sm w-3/12'>{stringToCurrency({amount: employeePayment.amount})}</p>
                        </div>

                        {currentUser._id == employeePayment.supervisor._id || currentUser.role == roles.managerRole._id ?

                          <div>
                            <button id={employeePayment._id} onClick={() => { setIsOpen(!isOpen), setButtonId(employeePayment._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
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

                    ))}

                  </div>
                </div>
              </div>
            </div>
            : ''
        }

        {
          Object.values(netDifference) && Object.values(netDifference).length > 0 ?

            <div className='border bg-white shadow-lg p-3 mt-4'>

              <div className='flex gap-4 display-flex justify-between' onClick={() => setDifferencesIsOpen(!differencesIsOpen)} >

                <SectionHeader label={'Diferencia neta'} />
                {differencesIsOpen ? <MdKeyboardArrowDown className='text-5xl' /> : <MdKeyboardArrowRight className='text-5xl' />}

              </div>

              <div className={differencesIsOpen ? '' : 'hidden'} >

                {Object.values(netDifference) && Object.values(netDifference).length > 0 && Object.values(netDifference).map((employeeDifferences) => (

                  <div key={employeeDifferences.employee._id}>

                    {roles && roles.managerRole && (roles.managerRole._id == currentUser.role || currentUser._id == employeeDifferences.employee._id) ?

                      < div className='border border-black mt-5'>

                        <div>
                          <p className='font-bold text-xl p-3'>{employeeDifferences.employee.name + ' ' + employeeDifferences.employee.lastName}</p>
                        </div>


                        {Object.values(employeeDifferences.netDifference) && Object.values(employeeDifferences.netDifference).length > 0 ?
                          < div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold mt-4'>
                            <p className='p-3 rounded-lg col-span-6 text-center'>Producto</p>
                            <p className='p-3 rounded-lg col-span-6 text-center'>Diferencia</p>
                          </div>
                          : ''}
                        {Object.values(employeeDifferences.netDifference) && Object.values(employeeDifferences.netDifference).length > 0 && Object.values(employeeDifferences.netDifference).map((productDifference) => (


                          <div key={productDifference.name} className={'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2 p-3'}>

                            <div id='list-element' className='flex col-span-12 items-center justify-around p-1'>
                              <p className='text-center text-sm w-6/12'>{productDifference.name}</p>
                              <p className={'text-center text-sm w-6/12 ' + (productDifference.difference < 0 ? 'text-red-500' : '')}>{Math.abs(productDifference.difference).toFixed(2)}</p>
                            </div>
                          </div>

                        ))}

                        <div className='p-3'>

                          <div className='flex mt-4 border-black border border-opacity-30 shadow-lg rounded-lg p-3'>
                            <p className='w-6/12 text-center'>Total:</p>
                            <p className={'w-6/12 text-center ' + (employeeDifferences.totalDifference < 0 ? 'text-red-500' : '')}>{Math.abs(employeeDifferences.totalDifference)}</p>
                          </div>
                        </div>
                      </div>
                      : ''}
                  </div>
                ))}

              </div>

              {roles && currentUser.role == roles.managerRole._id ?

                <div className='flex mt-4 border-black border border-opacity-30 shadow-lg rounded-lg p-3'>
                  <p className='w-6/12 text-center'>Total:</p>
                  <p className={'w-6/12 text-center ' + (totalNetDifference < 0 ? 'text-red-500' : '')}>{Math.abs(totalNetDifference)}</p>

                </div>

                : ''}

            </div>
            : ''
        }



        {
          employeesDailyBalances && employeesDailyBalances.length > 0 ?
            <div className='border bg-white shadow-lg p-3 mt-4'>

              <SectionHeader label={'Empleados'} />

              {employeesDailyBalances && employeesDailyBalances.length > 0 ?
                <div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold mt-4'>
                  <p className='p-3 rounded-lg col-span-3 text-sm text-center'>Empleado</p>
                  <p className='p-3 rounded-lg col-span-3 text-sm text-center'>Retardo</p>
                  <p className='p-3 rounded-lg col-span-3 text-sm text-center'>Descanso</p>
                  <p className='p-3 rounded-lg col-span-3 text-sm text-center'>Falta</p>
                </div>
                : ''}
              {employeesDailyBalances && employeesDailyBalances.length > 0 && employeesDailyBalances.map((dailyBalance) => (


                <div key={dailyBalance._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 rounded-lg shadow-sm mt-2'>

                  <div id='list-element' className='flex col-span-12 items-center justify-around'>
                    <Link className='w-3/12' to={dailyBalance.employee != null ? '/perfil/' + dailyBalance.employee._id : ''}>
                      <p className='text-center text-sm'>{dailyBalance.employee != null ? dailyBalance.employee.name + ' ' + dailyBalance.employee.lastName : 'Trabajador despedido'}</p>
                    </Link>
                    <div className='w-3/12'>

                      <input className='w-full' type="checkbox" name="foodDiscount" id="foodDiscount" defaultChecked={dailyBalance.foodDiscount} onChange={(e) => { handleDailyBalanceInputs(e, dailyBalance._id) }} />

                    </div>
                    <input className='w-3/12' type="checkbox" name="restDay" id="restDay" defaultChecked={dailyBalance.restDay} onChange={(e) => handleDailyBalanceInputs(e, dailyBalance._id)} />
                    <input className='w-3/12' type="checkbox" name="dayDiscount" id="dayDiscount" defaultChecked={dailyBalance.dayDiscount} onChange={(e) => handleDailyBalanceInputs(e, dailyBalance._id)} />
                  </div>

                </div>

              ))}

            </div>
            : ''
        }

        {error && <p className='text-red-500 mt-05'>{error}</p>}
      </main >
    )
  }
}