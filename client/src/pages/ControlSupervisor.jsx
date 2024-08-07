/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { fetchBranches, fetchEmployees, fetchProducts, deleteOutputFetch, deleteExtraOutgoingFetch, deleteInputFetch, deleteIncomeFetch, fetchIncomeTypes, deleteLoanFetch } from '../helpers/FetchFunctions';
import { FaListAlt, FaTrash } from 'react-icons/fa';
import { Link } from "react-router-dom"
import { MdCancel, MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md';
import { useParams, useNavigate } from 'react-router-dom';
import Select from "react-tailwindcss-select";
import { formatDate } from '../helpers/DatePickerFunctions';
import FechaDePagina from '../components/FechaDePagina';
import EntradaInicial from './EntradaInicial';
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ControlSupervisor() {

  let paramsDate = useParams().date
  const { currentUser, company } = useSelector((state) => state.user)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [outputFormData, setOutputFormData] = useState({})
  const [inputFormData, setInputFormData] = useState({})
  const [extraOutgoingFormData, setExtraOutgoingFormData] = useState({})
  const [incomeFormData, setIncomeFormData] = useState({})
  const [employees, setEmployees] = useState([])
  const [employeesDailyBalances, setEmployeesDailyBalance] = useState([])
  const [branches, setBranches] = useState([])
  const [outputs, setOutputs] = useState([])
  const [inputs, setInputs] = useState([])
  const [extraOutgoings, setExtraOutgoings] = useState([])
  const [outputsTotal, setOutputsTotal] = useState(0.0)
  const [inputsTotal, setInputsTotal] = useState(0.0)
  const [extraOutgoingsTotal, setExtraOutgoingsTotal] = useState(0.0)
  const [netDifference, setNetDifference] = useState({})
  const [totalNetDifference, setTotalNetDifference] = useState(0.0)
  const [incomes, setIncomes] = useState([])
  const [incomeTypes, setIncomeTypes] = useState([])
  const [incomesTotal, setIncomesTotal] = useState(0.0)
  const [loans, setLoans] = useState([])
  const [loansTotal, setLoansTotal] = useState(0.0)
  const [products, setProducts] = useState([])
  const [inputBranchName, setInputBranchName] = useState(null)
  const [outputBranchName, setOutputBranchName] = useState(null)
  const [incomeBranchName, setIncomeBranchName] = useState(null)
  const [productName, setProductName] = useState(null)
  const [incomeTypeName, setIncomeTypeName] = useState(null)
  const [buttonId, setButtonId] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [incomesIsOpen, setIncomesIsOpen] = useState(false)
  const [outgoingsIsOpen, setOutgoingsIsOpen] = useState(false)
  const [loansIsOpen, setLoansIsOpen] = useState(false)
  const [inputsIsOpen, setInputsIsOpen] = useState(false)
  const [outputsIsOpen, setOutputsIsOpen] = useState(false)
  const [selectedMovement, setSelectedMovement] = useState(null)
  const [movementDetailsIsOpen, setMovementDetailsIsOpen] = useState(false)
  const [differencesIsOpen, setDifferencesIsOpen] = useState(false)
  const [managerRole, setManagerRole] = useState({})
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const navigate = useNavigate()
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  let today = formatDate(datePickerValue) == formatDate((new Date())) ? true : false

  const notify = (message) => {

    toast.success(message, {
      position: 'top-center',
      transition: Slide,
      autoClose: 2000,
      draggable: true,
      closeOnClick: true,
      theme: 'dark',
      pauseOnHover: false
    })
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

  const SectionHeader = (props) => {

    return (

      <h2 className='flex text-2xl text-center font-semibold mb-4 text-red-800' onClick={props.onClick}>{props.label}</h2>
    )
  }

  const ShowInputDetails = (props) => {

    const input = props.input

    return (

      <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto'>
        <div className='bg-white p-5 rounded-lg justify-center items-center h-4/6 my-auto w-11/12'>
          <div className="mb-10 flex relative items-center">
            <p className='text-3xl font-semibold text-red-500'>Detalles de la entrada</p>
            <button className="absolute right-0" onClick={() => { setMovementDetailsIsOpen(!movementDetailsIsOpen) }}><MdCancel className="h-7 w-7" /></button>
          </div>
          <div className='h-5/6 overflow-y-scroll'>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Hora:'}</p>
              <p>{(new Date(input.createdAt)).toLocaleTimeString('es-Mx')}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Destino:'}</p>
              <p>{input.branch.branch ? input.branch.branch : input.branch}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Encargado:'}</p>
              <p className=''>{input.employee.name + ' ' + input.employee.lastName}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Comentario:'}</p>
              <p>{input.comment}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Producto:'}</p>
              <p>{input.product.name}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Piezas:'}</p>
              <p>{input.pieces.toFixed(2)}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className={(input.specialPrice ? 'text-red-500' : '') + " font-bold text-lg"}>{input.specialPrice ? 'Precio especial:' : 'Precio:'}</p>
              <p>{input.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Peso:'}</p>
              <p>{input.weight.toFixed(2) + ' Kg'}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Monto:'}</p>
              <p>{input.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const ShowOutputDetails = (props) => {

    const output = props.output

    return (

      <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto'>
        <div className='bg-white p-5 rounded-lg justify-center items-center h-4/6 my-auto w-11/12'>
          <div className="mb-10 flex relative items-center">
            <p className='text-3xl font-semibold text-red-500'>Detalles de la salida</p>
            <button className="absolute right-0" onClick={() => { setMovementDetailsIsOpen(!movementDetailsIsOpen) }}><MdCancel className="h-7 w-7" /></button>
          </div>
          <div className='h-5/6 overflow-y-scroll'>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Hora:'}</p>
              <p>{(new Date(output.createdAt)).toLocaleTimeString('es-Mx')}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Origen:'}</p>
              <p>{output.branch.branch ? output.branch.branch : output.branch}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Encargado:'}</p>
              <p className=''>{output.employee.name + ' ' + output.employee.lastName}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Comentario:'}</p>
              <p>{output.comment}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Producto:'}</p>
              <p>{output.product.name}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Piezas:'}</p>
              <p>{output.pieces.toFixed(2)}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className={(output.specialPrice ? 'text-red-500' : '') + " font-bold text-lg"}>{output.specialPrice ? 'Precio especial:' : 'Precio:'}</p>
              <p>{output.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Peso:'}</p>
              <p>{output.weight.toFixed(2) + ' Kg'}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Monto:'}</p>
              <p>{output.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const saveIncomeType = (e) => {

    let index = e.target.selectedIndex
    setIncomeTypeName(e.target.options[index].text)
  }

  const saveInputBranchName = (e) => {

    let index = e.target.selectedIndex
    setInputBranchName(e.target.options[index].text)
  }

  const saveOutputBranchName = (e) => {

    let index = e.target.selectedIndex
    setOutputBranchName(e.target.options[index].text)
  }

  const saveIncomeBranchName = (e) => {

    let index = e.target.selectedIndex
    setIncomeBranchName(e.target.options[index].text)
  }

  const saveProductName = (e) => {

    let index = e.target.selectedIndex
    const inputProductSelect = document.getElementById('inputProduct')
    const outputProductSelect = document.getElementById('outputProduct')

    inputProductSelect.value = e.target.value
    outputProductSelect.value = e.target.value
    setProductName(e.target.options[index].text)
  }

  const handleExtraOutgoingInputsChange = (e) => {

    setExtraOutgoingFormData({

      ...extraOutgoingFormData,
      [e.target.id]: e.target.value,

    })
  }

  const handleOutputInputsChange = (e) => {

    setOutputFormData({

      ...outputFormData,
      [e.target.id]: e.target.value,

    })
  }

  const handleInputInputsChange = (e) => {

    setInputFormData({

      ...inputFormData,
      [e.target.id]: e.target.value,

    })
  }

  const setPreBalance = () => {

  }

  const handleIncomesInputsChange = (e) => {

    setIncomeFormData({

      ...incomeFormData,
      [e.target.id]: e.target.value,

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

  const loansButtonControl = () => {

    const amountInput = document.getElementById('loanAmount')
    const button = document.getElementById('loanButton')
    const employee = selectedEmployee != null

    let filledInputs = true

    if (amountInput.value == '') {

      filledInputs = false

    }

    if (filledInputs && employee && !loading) {

      button.disabled = false

    } else {

      button.disabled = true
    }
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

    if (filledInputs && !loading) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  const outputButtonControl = () => {

    const weightInput = document.getElementById('outputWeight')
    const piecesInput = document.getElementById('outputPieces')
    const button = document.getElementById('outputButton')
    const branchSelect = document.getElementById('outputBranch')
    const productSelect = document.getElementById('outputProduct')

    let filledInputs = true

    if (piecesInput.value == '') {

      filledInputs = false

    }

    if (weightInput.value == '') {

      filledInputs = false
    }

    if (filledInputs && branchSelect.value != 'none' && productSelect.value != 'none' && !loading) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  const inputButtonControl = () => {

    const weightInput = document.getElementById('inputWeight')
    const piecesInput = document.getElementById('inputPieces')
    const button = document.getElementById('input-button')
    const branchSelect = document.getElementById('inputBranch')
    const productSelect = document.getElementById('inputProduct')

    let filledInputs = true

    if (piecesInput.value == '') {

      filledInputs = false

    }

    if (weightInput.value == '') {

      filledInputs = false
    }

    if (filledInputs && branchSelect.value != 'none' && productSelect.value != 'none' && !loading) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  const incomesButtonControl = () => {

    const amountInput = document.getElementById('incomeAmount')
    const button = document.getElementById('incomeButton')
    const branchSelect = document.getElementById('incomeBranch')
    const typeSelect = document.getElementById('incomeType')

    let filledInputs = true

    if (amountInput.value == '') {

      filledInputs = false
    }

    if (filledInputs && branchSelect.value != 'none' && typeSelect.value != 'none' && !loading) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  const addLoan = async (e) => {

    const amount = document.getElementById('loanAmount')
    const employee = selectedEmployee
    const date = today ? new Date().toISOString() : new Date(stringDatePickerValue).toISOString()

    e.preventDefault()

    setLoading(true)

    try {

      const res = await fetch('/api/outgoing/loan/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount.value,
          employee: employee.value,
          supervisor: currentUser._id,
          company: company._id,
          createdAt: date
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      notify('Nuevo préstamo registrado')
      data.loan.employee = selectedEmployee
      data.loan.supervisor = currentUser

      setError(null)
      setLoans([data.loan, ...loans])
      setLoansTotal(loansTotal + parseFloat(data.loan.amount))

      employee.value = 'none'
      amount.value = ''
      setLoading(false)

    } catch (error) {

      console.log(error)
      setError(error.message)
      setLoading(false)

    }
  }

  const deleteLoan = async (loanId, index) => {

    setLoading(true)

    const { error } = await deleteLoanFetch(loanId)

    setLoading(false)

    if (error == null) {

      setLoansTotal(loansTotal - parseFloat(loans[index].amount))
      loans.splice(index, 1)
    }
  }

  const addExtraOutgoing = async (e) => {

    const conceptInput = document.getElementById('extraOutgoingConcept')
    const amountInput = document.getElementById('extraOutgoingAmount')
    const date = today ? new Date().toISOString() : new Date(stringDatePickerValue).toISOString()

    e.preventDefault()


    setLoading(true)

    try {

      const res = await fetch('/api/outgoing/extra-outgoing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...extraOutgoingFormData,
          employee: currentUser._id,
          company: company._id,
          createdAt: date
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      notify('Nuevo gasto registrado')
      data.extraOutgoing.employee = currentUser

      setError(null)
      setExtraOutgoings([data.extraOutgoing, ...extraOutgoings])
      setExtraOutgoingsTotal(extraOutgoingsTotal + parseFloat(data.extraOutgoing.amount))

      conceptInput.value = ''
      amountInput.value = ''
      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)

    }
  }

  const setExtraOutgoingsTotalFunction = (extraOutgoings) => {

    let total = 0
    extraOutgoings.forEach((extraOutgoing) => {
      total += parseFloat(extraOutgoing.amount)
    })

    setExtraOutgoingsTotal(total)
  }

  const deleteExtraOutgoing = async (extraOutgoingId, index) => {

    setLoading(true)

    const { error } = await deleteExtraOutgoingFetch(extraOutgoingId)

    setLoading(false)

    if (error == null) {

      setExtraOutgoingsTotal(extraOutgoingsTotal - parseFloat(extraOutgoings[index].amount))
      extraOutgoings.splice(index, 1)
    }
  }

  const addOutput = async (e) => {

    const productInput = document.getElementById('outputProduct')
    const piecesInput = document.getElementById('outputPieces')
    const weightInput = document.getElementById('outputWeight')
    const branchInput = document.getElementById('outputBranch')
    const commentInput = document.getElementById('outputComment')
    const inputSpecialPrice = document.getElementById('inputSpecialPrice')
    const date = today ? new Date().toISOString() : new Date(stringDatePickerValue).toISOString()

    e.preventDefault()

    setLoading(true)

    try {

      const res = await fetch('/api/output/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...outputFormData,
          product: productInput.value,
          pieces: piecesInput.value,
          employee: currentUser._id,
          branch: branchInput.value,
          outputComment: commentInput.value,
          company: company._id,
          createdAt: date
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      notify('Salida registrada')

      data.output.branch = outputBranchName
      data.output.product = productName
      data.output.employee = currentUser

      setError(null)
      setOutputs([data.output, ...outputs])
      setOutputsTotal(outputsTotal + parseFloat(data.output.weight))

      piecesInput.value = ''
      weightInput.value = ''
      inputSpecialPrice.value = ''
      productInput.value = 'none'
      branchInput.focus()

      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)

    }
  }

  const deleteOutput = async (outputId, index) => {

    setLoading(true)

    const { error } = await deleteOutputFetch(outputId)

    setLoading(false)

    if (error == null) {

      setOutputsTotal(outputsTotal - parseFloat(outputs[index].weight))
      outputs.splice(index, 1)
    }
  }


  const addInput = async (e) => {

    const productInput = document.getElementById('inputProduct')
    const piecesInput = document.getElementById('inputPieces')
    const weightInput = document.getElementById('inputWeight')
    const branchInput = document.getElementById('inputBranch')
    const commentInput = document.getElementById('inputComment')
    const inputSpecialPrice = document.getElementById('inputSpecialPrice')
    const date = today ? new Date().toISOString() : new Date(stringDatePickerValue).toISOString()

    e.preventDefault()

    setLoading(true)

    try {

      const res = await fetch('/api/input/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...inputFormData,
          product: productInput.value,
          employee: currentUser._id,
          branch: branchInput.value,
          company: company._id,
          inputComment: commentInput.value,
          createdAt: date
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      notify('Entrada registrada')

      data.input.branch = inputBranchName
      data.input.product = productName
      data.input.employee = currentUser
      branchInput.focus()

      setError(null)
      setInputs([data.input, ...inputs])
      setInputsTotal(inputsTotal + parseFloat(data.input.weight))

      piecesInput.value = ''
      weightInput.value = ''
      productInput.value = 'none'
      inputSpecialPrice.value = ''

      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)

    }
  }

  const deleteInput = async (inputId, index) => {

    setLoading(true)

    const { error } = await deleteInputFetch(inputId)

    setLoading(false)

    if (error == null) {

      setInputsTotal(inputsTotal - parseFloat(inputs[index].weight))
      inputs.splice(index, 1)
    }
  }

  const addIncome = async (e) => {

    const amountInput = document.getElementById('incomeAmount')
    const typeInput = document.getElementById('incomeType')
    const branchInput = document.getElementById('incomeBranch')
    const date = today ? new Date().toISOString() : new Date(stringDatePickerValue).toISOString()

    console.log(date)

    e.preventDefault()

    setLoading(true)

    try {

      const res = await fetch('/api/income/create', {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...incomeFormData,
          employee: currentUser._id,
          type: typeInput.value,
          branch: branchInput.value,
          company: company._id,
          createdAt: date
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      notify('Efectivo registrado')

      data.income.employee = currentUser
      data.income.branch = incomeBranchName
      data.income.type = incomeTypeName

      setError(null)
      setIncomes([data.income, ...incomes])
      setIncomesTotal(incomesTotal + parseFloat(data.income.amount))

      amountInput.value = ''
      branchInput.value = 'none'
      typeInput.value = 'none'

      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)

    }
  }

  const deleteIncome = async (incomeId, index) => {

    setLoading(true)

    const { error } = await deleteIncomeFetch(incomeId)

    setLoading(false)

    if (error == null) {

      setIncomesTotal(incomesTotal - parseFloat(incomes[index].amount))
      incomes.splice(index, 1)
    }
  }



  const setInputsTotalFunction = (inputs) => {

    let total = 0

    inputs.forEach((input) => {

      total += parseFloat(input.weight)
    })

    setInputsTotal(total)
  }



  const setOutputsTotalFunction = (outputs) => {

    let total = 0

    outputs.forEach((output) => {

      total += parseFloat(output.weight)
    })

    setOutputsTotal(total)
  }



  const setIncomesTotalFunction = (incomes) => {

    let total = 0

    incomes.forEach((income) => {

      total += parseFloat(income.amount)
    })

    setIncomesTotal(total)
  }

  const setLoansTotalFunction = (loans) => {

    let total = 0

    loans.forEach((loan) => {

      total += parseFloat(loan.amount)
    })

    setLoansTotal(total)
  }

  useEffect(() => {

    const setManagerRoleFunction = async (roles) => {

      const managerRole = roles.find((elemento) => elemento.name == 'Gerente')
      setManagerRole(managerRole)

    }

    const fetchRoles = async () => {

      try {

        setLoading(true)

        const res = await fetch('/api/role/get')
        const data = await res.json()

        if (data.success === false) {
          setError(data.message)
          setLoading(false)
          return
        }
        await setManagerRoleFunction(data.roles)
        setError(null)
        setLoading(false)

      } catch (error) {

        setLoading(false)
        setError(error.message)

      }
    }

    const setEmployeesFunction = async () => {

      const { error, data } = await fetchEmployees(company._id)

      if (error == null) {

        const tempOptions = []

        data.map((employee) => {

          const option = {
            value: employee._id,
            label: employee.name + ' ' + employee.lastName
          }

          tempOptions.push(option)
        })

        setError(null)
        setEmployees(tempOptions)

      } else {

        setError(error)
      }
    }

    const setBranchesFunction = async () => {

      const { error, data } = await fetchBranches(company._id)

      if (error == null) {

        setError(null)
        setBranches(data)

      } else {

        setError(error)
      }
    }

    const setProductsFunction = async () => {

      const { error, data } = await fetchProducts(company._id)

      if (error == null) {

        setError(null)
        setProducts(data)

      } else {

        setError(error)
      }
    }

    const setIncomeTypesFunction = async () => {

      const { error, data } = await fetchIncomeTypes()

      if (error == null) {

        setError(null)
        setIncomeTypes(data)

      } else {

        setError(error)
      }
    }

    fetchRoles()
    setIncomeTypesFunction()
    setEmployeesFunction()
    setBranchesFunction()
    setProductsFunction()

  }, [company, currentUser._id])

  useEffect(() => {

    console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)

    const enableDisableButtons = () => {

      const outgoingButton = document.getElementById('extraOutgoingButton')
      const incomeButton = document.getElementById('incomeButton')
      const inputButton = document.getElementById('input-button')
      const outputButton = document.getElementById('outputButton')
      const loanButton = document.getElementById('loanButton')

      outgoingButton.disabled = loading
      incomeButton.disabled = loading
      inputButton.disabled = loading
      outputButton.disabled = loading
      loanButton.disabled = loading
    }

    enableDisableButtons()

  }, [loading])

  useEffect(() => {

    setEmployeesDailyBalance([])
    setLoans([])
    setLoansTotal(0.0)
    setIncomes([])
    setIncomesTotal(0.0)
    setOutputs([])
    setOutputsTotal(0.0)
    setInputs([])
    setInputsTotal(0.0)
    setExtraOutgoings([])
    setExtraOutgoingsTotal(0.0)
    setTotalNetDifference(0.0)
    setNetDifference([])
    setIncomesIsOpen(false)
    setOutgoingsIsOpen(false)
    setOutputsIsOpen(false)
    setInputsIsOpen(false)
    setLoansIsOpen(false)

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

    const fetchLoans = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setLoading(true)

      try {

        const res = await fetch('/api/outgoing/loan/get-loans/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        setLoans(data.loans)
        setLoansTotalFunction(data.loans)
        setError(null)
        setLoading(false)

      } catch (error) {

        setError(error.message)
        setLoading(false)
      }
    }

    const fetchIncomes = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setLoading(true)

      try {

        const res = await fetch('/api/income/get/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        data.incomes.sort((income, nextIncome) => {

          return income.branch.position - nextIncome.branch.position
        })

        setIncomes(data.incomes)
        setIncomesTotalFunction(data.incomes)
        setError(null)
        setLoading(false)

      } catch (error) {

        setError(error.message)
        setLoading(false)
      }
    }

    const fetchOutputs = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setLoading(true)

      try {

        const res = await fetch('/api/output/get-outputs/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        data.outputs.sort((output, nextOutput) => {

          return output.branch.position - nextOutput.branch.position

        })

        setOutputs(data.outputs)
        setOutputsTotalFunction(data.outputs)
        setError(null)
        setLoading(false)

      } catch (error) {

        setError(error.message)
        setLoading(false)

      }
    }

    const fetchInputs = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setLoading(true)

      try {

        const res = await fetch('/api/input/get-inputs/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        data.inputs.sort((input, nextInput) => {

          return input.branch.position - nextInput.branch.position
        })

        setInputs(data.inputs)
        setInputsTotalFunction(data.inputs)
        setError(null)
        setLoading(false)

      } catch (error) {

        setError(error.message)
        setLoading(false)
      }
    }

    const fetchExtraOutgoings = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setLoading(true)

      try {

        const res = await fetch('/api/outgoing/get-extra-outgoings/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        data.extraOutgoings.sort((extraOutgoing, nextExtraOutgoing) => {

          return extraOutgoing.createdAt - nextExtraOutgoing.createdAt
        })


        setExtraOutgoings(data.extraOutgoings)
        setExtraOutgoingsTotalFunction(data.extraOutgoings)
        setError(null)
        setLoading(false)

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

    fetchIncomes()
    fetchExtraOutgoings()
    fetchEmployeesDailyBalances()
    fetchInputs()
    fetchOutputs()
    fetchNetDifference()
    fetchLoans()

  }, [company._id, stringDatePickerValue])


  useEffect(() => {

    document.title = 'Supervisión (' + new Date(stringDatePickerValue).toLocaleDateString() + ')'
  })


  return (

    <main className={"p-3 max-w-lg mx-auto"} >

      <ToastContainer />

      {managerRole._id == currentUser.role ?

        <FechaDePagina changeDay={changeDay} stringDatePickerValue={stringDatePickerValue} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>

        : ''}

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Supervisión
      </h1>

      <div className='border bg-white p-3 mt-4'>

        <div className='grid grid-cols-3'>
          <SectionHeader label={'Efectivos'} />
          <div className="h-10 w-10 shadow-lg ">
            <button className="w-full h-full" onClick={() => { setIncomesIsOpen(true) }}><FaListAlt className="h-full w-full text-red-600" />
            </button>
          </div>
          {currentUser.role == managerRole._id ?
            <p className='font-bold text-lg text-red-700 text-center'>{incomesTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
            : ''}
        </div>


        <form onSubmit={addIncome} className="grid grid-cols-3 items-center justify-between">

          <select name="incomeBranch" id="incomeBranch" className='border p-3 rounded-lg text-xs overflow-y-scroll' onChange={(e) => { saveIncomeBranchName(e), incomesButtonControl(), setPreBalance() }}>

            <option value="none" disabled selected hidden >Sucursal</option>

            {branches && branches.length == 0 ? <option> No hay sucursales registradas </option> : ''}
            {branches && branches.length > 0 && branches.map((branch) => (

              <option className='overflow-y-scroll' key={branch._id} value={branch._id}>{branch.branch}</option>

            ))}

          </select>

          <select name="incomeType" id="incomeType" onChange={(e) => { incomesButtonControl(), saveIncomeType(e) }} className='border p-3 rounded-lg text-xs'>
            <option value="none" selected hidden >Tipo</option>

            {incomeTypes && incomeTypes.length != 0 && incomeTypes.map((incomeType) => (

              <option key={incomeType._id} value={incomeType._id}>{incomeType.name}</option>

            ))}

          </select>

          <input type="number" name="incomeAmount" id="incomeAmount" placeholder='$0.00' step={0.10} className='border p-3 rounded-lg' required onInput={incomesButtonControl} onChange={handleIncomesInputsChange} />

          <button type='submit' id='incomeButton' disabled className='bg-slate-500 text-white p-3 rounded-lg col-span-4 mt-8'>Agregar</button>

        </form>


      </div>

      <div className='border bg-white p-3 mt-4'>

        <div className='grid grid-cols-3'>
          <SectionHeader label={'Salidas'} />
          <div className="h-10 w-10 shadow-lg ">
            <button className="w-full h-full" onClick={() => { setOutputsIsOpen(true) }}><FaListAlt className="h-full w-full text-red-600" />
            </button>
          </div>

          <p className='font-bold text-lg text-red-700 text-center'>{outputsTotal.toFixed(2) + ' Kg'}</p>

        </div>

        <form onSubmit={addOutput} className="grid grid-cols-12 items-center justify-between">
          <select name="outputBranch" id="outputBranch" className='border p-3 rounded-lg text-xs col-span-3' onChange={(e) => { outputButtonControl(), saveOutputBranchName(e) }}>

            <option value="none" disabled selected hidden >Sucursal</option>

            {branches && branches.length == 0 ? <option> No hay sucursales registradas </option> : ''}
            {branches && branches.length > 0 && branches.map((branch) => (

              <option key={branch._id} value={branch._id}>{branch.branch}</option>

            ))}
          </select>

          <select name="outputProduct" id="outputProduct" onChange={(e) => { outputButtonControl(), saveProductName(e) }} className='col-span-3 border p-3 rounded-lg text-xs'>
            <option value="none" selected hidden >Productos</option>

            {products && products.length != 0 && products.map((product) => (

              <option key={product._id} value={product._id}>{product.name}</option>
            ))}
          </select>

          <input type="number" name="outputPieces" id="outputPieces" placeholder='Piezas' step={0.1} className='border p-3 rounded-lg col-span-3' required onInput={outputButtonControl} onChange={handleOutputInputsChange} />
          <input type="number" name="outputWeight" id="outputWeight" placeholder='0.00 kg' step={0.01} className='border p-3 rounded-lg col-span-3' required onInput={outputButtonControl} onChange={handleOutputInputsChange} />

          <input className='col-span-4 p-3 border border-black shadow-md' name='outputSpecialPrice' id='outputSpecialPrice' step={0.01} placeholder='Precio especial' type="number" onChange={handleOutputInputsChange} />
          <textarea className='col-span-8 rounded-lg p-3 shadow mt-2' name="outputComment" id="outputComment" cols="30" rows="2" defaultValue={'Todo bien'} onChange={handleOutputInputsChange}></textarea>

          <button type='submit' id='outputButton' disabled className='bg-slate-500 text-white p-3 rounded-lg col-span-12 mt-8'>Agregar</button>

        </form>

      </div>

      <div className='border bg-white p-3 mt-4'>

        <div className='grid grid-cols-3'>
          <SectionHeader label={'Entradas'} />
          <div className="h-10 w-10 shadow-lg ">
            <button className="w-full h-full" onClick={() => { setInputsIsOpen(true) }}><FaListAlt className="h-full w-full text-red-600" />
            </button>
          </div>
          <p className='font-bold text-lg text-red-700 text-center'>{inputsTotal.toFixed(2) + ' Kg'}</p>
        </div>

        <form onSubmit={addInput} className="grid grid-cols-12 items-center justify-between">
          <select name="inputBranch" id="inputBranch" onChange={(e) => { inputButtonControl(), saveInputBranchName(e) }} className='border p-3 rounded-lg text-xs col-span-3'>

            <option value="none" disabled selected hidden >Sucursal</option>

            {branches && branches.length == 0 ? <option> No hay sucursales registradas </option> : ''}
            {branches && branches.length > 0 && branches.map((branch) => (

              <option key={branch._id} value={branch._id}>{branch.branch}</option>

            ))}
          </select>

          <select name="inputProduct" id="inputProduct" className='border p-3 rounded-lg text-xs col-span-3' onChange={(e) => { inputButtonControl(), saveProductName(e) }}>
            <option value="none" selected hidden >Productos</option>

            {products && products.length != 0 && products.map((product) => (

              <option key={product._id} value={product._id}>{product.name}</option>
            ))}
          </select>

          <input type="number" name="inputPieces" id="inputPieces" placeholder='Piezas' step={0.1} className='border p-3 rounded-lg col-span-3' required onInput={inputButtonControl} onChange={handleInputInputsChange} />
          <input type="number" name="inputWeight" id="inputWeight" placeholder='0.00 kg' step={0.01} className='border p-3 rounded-lg col-span-3' required onInput={inputButtonControl} onChange={handleInputInputsChange} />

          <input className='col-span-4 p-3 border border-black shadow-md' name='inputSpecialPrice' id='inputSpecialPrice' step={0.01} placeholder='Precio especial' type="number" onChange={handleInputInputsChange} />
          <textarea className='col-span-8 rounded-lg p-3 shadow mt-2' name="inputComment" id="inputComment" cols="30" rows="2" defaultValue={'Todo bien'} onChange={handleInputInputsChange}></textarea>


          <button type='submit' id='input-button' disabled className='bg-slate-500 text-white p-3 rounded-lg col-span-12 mt-8'>Agregar</button>

        </form>
      </div>


      <EntradaInicial products={products} managerRole={managerRole} defaultProduct={products[0]}></EntradaInicial>

      <div className='border p-3 mt-4 bg-white'>

        <SectionHeader label={'Gastos'} />

        <div className='border bg-white p-3 mt-4'>

          <div className='grid grid-cols-3'>
            <SectionHeader label={'Gastos externos'} />
            <div className="h-10 w-10 shadow-lg ">
              <button className="w-full h-full" onClick={() => { setOutgoingsIsOpen(true) }}><FaListAlt className="h-full w-full text-red-600" />
              </button>
            </div>
            {currentUser.role == managerRole._id ?

              <p className='font-bold text-lg text-red-700 text-center'>{extraOutgoingsTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>

              : ''}
          </div>

          <form id='extra-outgoing-form' onSubmit={addExtraOutgoing} className="grid grid-cols-3 items-center justify-between">

            <input type="text" name="extraOutgoingConcept" id="extraOutgoingConcept" placeholder='Concepto' className='border p-3 rounded-lg' required onInput={extraOutgoingsButtonControl} onChange={handleExtraOutgoingInputsChange} />
            <input type="number" name="extraOutgoingAmount" id="extraOutgoingAmount" placeholder='$0.00' step={0.01} className='border p-3 rounded-lg' required onInput={extraOutgoingsButtonControl} onChange={handleExtraOutgoingInputsChange} />
            <button type='submit' id='extraOutgoingButton' disabled className='bg-slate-500 text-white p-3 rounded-lg'>Agregar</button>

          </form>
        </div>
        <div className='border bg-white p-3 mt-4'>
          <div className='grid grid-cols-3'>
            <SectionHeader label={'Pagos a empleados'} />
            <div className="h-10 w-10 shadow-lg">
              <button className="w-full h-full" onClick={() => { setLoansIsOpen(true) }}><FaListAlt className="h-full w-full text-red-600" />
              </button>
            </div>
            {currentUser.role == managerRole._id ?

              <p className='font-bold text-lg text-red-700 text-center'>{loansTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>


              : ''}
          </div>

          <form onSubmit={addLoan} className="grid grid-cols-2 items-center justify-between">

            <Select
              value={selectedEmployee}
              onChange={handleEmployeeSelectChange}
              options={employees}
              placeholder='¿A quién le prestas?'
              isSearchable={true}
            />

            <input type="number" name="loanAmount" id="loanAmount" placeholder='$0.00' step={0.01} className='border p-3 rounded-lg' required onInput={loansButtonControl} />

            <button type='submit' id='loanButton' disabled className='bg-slate-500 text-white p-3 rounded-lg col-span-4 mt-8'>Agregar</button>

          </form>


        </div>

      </div>



      {incomesIsOpen && incomes && incomes.length > 0 ?

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
                    <p className='text-center text-xs w-3/12'>{income.branch.branch ? income.branch.branch : income.branch}</p>
                    <p className='text-center text-xs w-3/12'>{income.employee.name + ' ' + income.employee.lastName}</p>
                    <p className='text-center text-xs w-2/12'>{income.type.name ? income.type.name : income.type}</p>
                    <p className='text-center text-xs w-3/12'>{income.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                  </div>

                  {currentUser._id == income.employee._id || currentUser.role == managerRole._id ?

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
                                <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteIncome(income._id, index), setIsOpen(!isOpen) }}>Si</button>
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


      {outgoingsIsOpen && extraOutgoings && extraOutgoings.length > 0 ?
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


                  <div key={extraOutgoing._id} className={(currentUser._id == extraOutgoing.employee || currentUser.role == managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

                    <div id='list-element' className='flex col-span-10 items-center justify-around'>
                      <p className='text-center text-sm w-3/12'>{extraOutgoing.employee.name ? extraOutgoing.employee.name : extraOutgoing.employee}</p>
                      <p className='text-center text-sm w-3/12'>{extraOutgoing.concept}</p>
                      <p className='text-center text-sm w-3/12'>{extraOutgoing.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                    </div>

                    {currentUser._id == extraOutgoing.employee._id || currentUser.role == managerRole._id ?

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
                                  <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteExtraOutgoing(extraOutgoing._id, index), setIsOpen(!isOpen) }}>Si</button>
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

      {inputsIsOpen && inputs && inputs.length > 0 ?
        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
          <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
            <button className="" onClick={() => { setInputsIsOpen(false) }}><MdCancel className="h-7 w-7" /></button>
            < div className='bg-white mt-4 mb-4'>

              <SectionHeader label={'Entradas'} />

              <div>

                {inputs && inputs.length > 0 ?
                  <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
                    <p className='col-span-3 text-center'>Sucursal</p>
                    <p className='col-span-3 text-center'>Encargado</p>
                    <p className='col-span-3 text-center'>Producto</p>
                    <p className='col-span-1 text-center'>Kg</p>
                  </div>
                  : ''}
                {inputs && inputs.length > 0 && inputs.map((input, index) => (


                  <div key={input._id} className={(currentUser._id == input.employee || currentUser.role == managerRole._id ? '' : 'py-3 ') + (input.specialPrice ? 'border border-red-500 ' : 'border border-black ') + 'grid grid-cols-12 items-center border-opacity-70 rounded-lg shadow-sm mt-2'}>

                    <button onClick={() => { setSelectedMovement(input), setMovementDetailsIsOpen(!movementDetailsIsOpen) }} id='list-element' className='flex col-span-10 items-center justify-around h-full'>
                      <p className='text-center text-xs  w-3/12'>{input.branch.branch ? input.branch.branch : input.branch}</p>
                      <p className='text-center text-xs w-3/12'>{input.employee.name + ' ' + input.employee.lastName}</p>
                      <p className='text-center text-xs w-3/12'>{input.product.name ? input.product.name : input.product}</p>
                      <p className='text-center text-xs w-1/12'>{input.weight}</p>
                    </button>
                    {selectedMovement != null && selectedMovement._id == input._id && movementDetailsIsOpen ?
                      <ShowInputDetails input={input}></ShowInputDetails>
                      : ''}
                    {currentUser._id == input.employee._id || currentUser.role == managerRole._id ?

                      <div>
                        <button id={input._id} onClick={() => { setIsOpen(!isOpen), setButtonId(input._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                          <span>
                            <FaTrash className='text-red-700 m-auto' />
                          </span>
                        </button>

                        {isOpen && input._id == buttonId ?
                          <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                            <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                              <div>
                                <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                              </div>
                              <div className='flex gap-10'>
                                <div>
                                  <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteInput(input._id, index), setIsOpen(!isOpen) }}>Si</button>
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

      {outputsIsOpen && outputs && outputs.length > 0 ?
        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
          <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
            <button className="" onClick={() => { setOutputsIsOpen(false) }}><MdCancel className="h-7 w-7" /></button>
            < div className='bg-white mt-4 mb-4'>

              <SectionHeader label={'Salidas'} />

              <div>

                {outputs && outputs.length > 0 ?
                  <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
                    <p className='col-span-3 text-center'>Sucursal</p>
                    <p className='col-span-3 text-center'>Encargado</p>
                    <p className='col-span-3 text-center'>Producto</p>
                    <p className='col-span-1 text-center'>Kg</p>
                  </div>
                  : ''}
                {outputs && outputs.length > 0 && outputs.map((output, index) => (


                  <div key={output._id} className={(currentUser._id == output.employee || currentUser.role == managerRole._id ? '' : 'py-3 ') + (output.specialPrice ? 'border border-red-500 ' : 'border border-black ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-70 shadow-sm mt-2'}>

                    <button onClick={() => { setSelectedMovement(output), setMovementDetailsIsOpen(!movementDetailsIsOpen) }} id='list-element' className='flex col-span-10 items-center justify-around h-full'>
                      <p className='text-center text-xs  w-3/12'>{output.branch.branch ? output.branch.branch : output.branch}</p>
                      <p className='text-center text-xs w-3/12'>{output.employee.name + ' ' + output.employee.lastName}</p>
                      <p className='text-center text-xs w-3/12'>{output.product.name ? output.product.name : output.product}</p>
                      <p className='text-center text-xs w-1/12'>{output.weight}</p>
                    </button>

                    {selectedMovement != null && selectedMovement._id == output._id && movementDetailsIsOpen ?
                      <ShowOutputDetails output={output}></ShowOutputDetails>
                      : ''}

                    {currentUser._id == output.employee._id || currentUser.role == managerRole._id ?

                      <div>
                        <button id={output._id} onClick={() => { setIsOpen(!isOpen), setButtonId(output._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                          <span>
                            <FaTrash className='text-red-700 m-auto' />
                          </span>
                        </button>

                        {isOpen && output._id == buttonId ?
                          <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                            <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                              <div>
                                <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                              </div>
                              <div className='flex gap-10'>
                                <div>
                                  <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteOutput(output._id, index), setIsOpen(!isOpen) }}>Si</button>
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

      {loansIsOpen && loans && loans.length > 0 ?
        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
          <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
            <button className="" onClick={() => { setLoansIsOpen(false) }}><MdCancel className="h-7 w-7" /></button>
            < div className='bg-white mt-4 mb-4'>

              <SectionHeader label={'Pagos a empleados'} />

              <div>

                {loans && loans.length > 0 ?
                  <div id='header' className='grid grid-cols-11 gap-4 items-center justify-around font-semibold mt-4'>
                    <p className='p-3 rounded-lg col-span-3 text-center'>Supervisor</p>
                    <p className='p-3 rounded-lg col-span-3 text-center'>Deudor</p>
                    <p className='p-3 rounded-lg col-span-3 text-center'>Monto</p>
                  </div>
                  : ''}
                {loans && loans.length > 0 && loans.map((loan, index) => (


                  <div key={loan._id} className={(currentUser._id == loan.supervisor || currentUser.role == managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

                    <div id='list-element' className='flex col-span-10 items-center justify-around'>
                      <p className='text-center text-sm w-3/12'>{loan.supervisor.label ? loan.supervisor.label : loan.supervisor.name}</p>
                      <p className='text-center text-sm w-3/12'>{loan.employee.label ? loan.employee.label : loan.employee.name}</p>
                      <p className='text-center text-sm w-3/12'>{loan.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                    </div>

                    {currentUser._id == loan.supervisor._id || currentUser.role == managerRole._id ?

                      <div>
                        <button id={loan._id} onClick={() => { setIsOpen(!isOpen), setButtonId(loan._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                          <span>
                            <FaTrash className='text-red-700 m-auto' />
                          </span>
                        </button>

                        {isOpen && loan._id == buttonId ?
                          <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                            <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                              <div>
                                <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                              </div>
                              <div className='flex gap-10'>
                                <div>
                                  <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteLoan(loan._id, index), setIsOpen(!isOpen) }}>Si</button>
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

                  {managerRole._id == currentUser.role || currentUser._id == employeeDifferences.employee._id ?

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

            {currentUser.role == managerRole._id ?

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