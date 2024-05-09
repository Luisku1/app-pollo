/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { fetchBranches, fetchEmployees, fetchProducts, deleteOutputFetch, deleteExtraOutgoingFetch, deleteInputFetch, deleteIncomeFetch, fetchIncomeTypes, deleteLoanFetch } from '../helpers/FetchFunctions';
import { FaTrash } from 'react-icons/fa';
import { useParams, useNavigate, Link } from "react-router-dom"
import { MdCancel, MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md';

export default function ControlSupervisor() {

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
  const [netDifference, setNetDifference] = useState([])
  const [totalNetDifference, setTotalNetDifference] = useState(0.0)
  const [incomes, setIncomes] = useState([])
  const [incomeTypes, setIncomeTypes] = useState([])
  const [incomesTotal, setIncomesTotal] = useState(0.0)
  const [loans, setLoans] = useState([])
  const [loansTotal, setLoansTotal] = useState(0.0)
  const [products, setProducts] = useState([])
  const [branchName, setBranchName] = useState(null)
  const [productName, setProductName] = useState(null)
  const [debtorName, setDebtorName] = useState(null)
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

  const SectionHeader = (props) => {

    return (

      <h2 className='flex text-2xl text-center font-semibold mb-4 text-red-800' onClick={props.onClick}>{props.label}</h2>
    )
  }

  const ShowInputDetails = (props) => {

    const input = props.input

    return (

      <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center'>
        <div className='bg-white p-5 rounded-lg justify-center items-center h-4/6 my-auto w-11/12'>
          <div className="mb-10 flex">
            <p className='text-3xl font-semibold text-red-500'>Detalles de la entrada</p>
            <button className="m-auto" onClick={() => { setMovementDetailsIsOpen(!movementDetailsIsOpen) }}><MdCancel className="h-7 w-7" /></button>
          </div>
          <div className='h-5/6 overflow-y-scroll'>
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
              <p>{input.pieces}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className={(input.specialPrice ? 'text-red-500' : '') + " font-bold text-lg"}>{input.specialPrice ? 'Precio especial:' : 'Precio:'}</p>
              <p>{input.price}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Peso:'}</p>
              <p>{input.weight + ' Kg'}</p>
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

      <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center'>
        <div className='bg-white p-5 rounded-lg justify-center items-center h-4/6 my-auto w-11/12'>
          <div className="mb-10 flex">
            <p className='text-3xl font-semibold text-red-500'>Detalles de la salida</p>
            <button className="m-auto" onClick={() => { setMovementDetailsIsOpen(!movementDetailsIsOpen) }}><MdCancel className="h-7 w-7" /></button>
          </div>
          <div className='h-5/6 overflow-y-scroll'>
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
              <p>{output.pieces}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className={(output.specialPrice ? 'text-red-500' : '') + " font-bold text-lg"}>{output.specialPrice ? 'Precio especial:' : 'Precio:'}</p>
              <p>{output.price}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Peso:'}</p>
              <p>{output.weight + ' Kg'}</p>
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

  const saveBranchName = (e) => {

    let index = e.target.selectedIndex
    setBranchName(e.target.options[index].text)
  }

  const saveProductName = (e) => {

    let index = e.target.selectedIndex
    setProductName(e.target.options[index].text)
  }

  const saveDebtorName = (e) => {

    let index = e.target.selectedIndex
    setDebtorName(e.target.options[index].text)
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
    const branchSelect = document.getElementById('loanEmployee')

    let filledInputs = true

    if (amountInput.value == '') {

      filledInputs = false

    }

    if (filledInputs && branchSelect.value != 'none' && !loading) {

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
    const employee = document.getElementById('loanEmployee')

    e.preventDefault()

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
          company: company._id
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      data.loan.employee = debtorName
      data.loan.supervisor = currentUser

      setError(null)
      setLoans([...loans, data.loan])
      setLoansTotal(loansTotal + parseFloat(data.loan.amount))

      employee.value = 'none'
      amount.value = ''
      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)

    }
  }

  const deleteLoan = async (loanId, index) => {

    setLoading(false)

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
          company: company._id
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      data.extraOutgoing.employee = currentUser

      setError(null)
      setExtraOutgoings([...extraOutgoings, data.extraOutgoing])
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
          company: company._id
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      data.output.branch = branchName
      data.output.product = productName
      data.output.employee = currentUser

      setError(null)
      setOutputs([...outputs, data.output])
      setOutputsTotal(outputsTotal + parseFloat(data.output.weight))

      piecesInput.value = ''
      weightInput.value = ''
      inputSpecialPrice.value = ''
      productInput.value = 'none'

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
          inputComment: commentInput.value
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      data.input.branch = branchName
      data.input.product = productName
      data.input.employee = currentUser

      setError(null)
      setInputs([...inputs, data.input])
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
          company: company._id
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      data.income.employee = currentUser
      data.income.branch = branchName
      data.income.type = incomeTypeName

      setError(null)
      setIncomes([...incomes, data.income])
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

        const res = await fetch('/api/role/get')
        const data = await res.json()

        if (data.success === false) {
          setError(data.message)
          return
        }
        await setManagerRoleFunction(data.roles)
        setError(null)

      } catch (error) {

        setError(error.message)

      }
    }

    const setEmployeesFunction = async () => {

      const { error, data } = await fetchEmployees(company._id)

      if (error == null) {

        setError(null)
        setEmployees(data)

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

  }, [company])

  useEffect(() => {

    const fetchEmployeesDailyBalances = async () => {

      const date = new Date().toISOString()

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

      const date = new Date().toISOString()

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

      const date = new Date().toISOString()

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

      const date = new Date().toISOString()

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

      const date = new Date().toISOString()

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

      const date = new Date().toISOString()

      setLoading(true)

      try {

        const res = await fetch('/api/outgoing/get-extra-outgoings/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }
        console.log(data.extraOutgoings)

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

      const date = new Date().toISOString()

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
      }
    }

    fetchIncomes()
    fetchExtraOutgoings()
    fetchEmployeesDailyBalances()
    fetchInputs()
    fetchOutputs()
    fetchNetDifference()
    fetchLoans()

  }, [company._id])



  return (

    <main className="p-3 max-w-lg mx-auto">

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Supervisión
      </h1>

      <div className='border bg-white p-3 mt-4'>

        <SectionHeader label={'Efectivos'} />

        <form onSubmit={addIncome} className="grid grid-cols-3 items-center justify-between">

          <select name="incomeBranch" id="incomeBranch" className='border p-3 rounded-lg text-xs overflow-y-scroll' onChange={(e) => { saveBranchName(e), incomesButtonControl() }}>

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

      <div className='border p-3 mt-4 bg-white'>

        <SectionHeader label={'Gastos'} />

        <form id='extra-outgoing-form' onSubmit={addExtraOutgoing} className="grid grid-cols-3 items-center justify-between">

          <input type="text" name="extraOutgoingConcept" id="extraOutgoingConcept" placeholder='Concepto' className='border p-3 rounded-lg' required onInput={extraOutgoingsButtonControl} onChange={handleExtraOutgoingInputsChange} />
          <input type="number" name="extraOutgoingAmount" id="extraOutgoingAmount" placeholder='$0.00' step={0.01} className='border p-3 rounded-lg' required onInput={extraOutgoingsButtonControl} onChange={handleExtraOutgoingInputsChange} />
          <button type='submit' id='extraOutgoingButton' disabled className='bg-slate-500 text-white p-3 rounded-lg'>Agregar</button>

        </form>

      </div>

      <div className='border bg-white p-3 mt-4'>

        <SectionHeader label={'Entradas'} />

        <form onSubmit={addInput} className="grid grid-cols-12 items-center justify-between">
          <select name="inputBranch" id="inputBranch" onChange={(e) => { inputButtonControl(), saveBranchName(e) }} className='border p-3 rounded-lg text-xs col-span-3'>

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

      <div className='border bg-white p-3 mt-4'>

        <SectionHeader label={'Salidas'} />

        <form onSubmit={addOutput} className="grid grid-cols-12 items-center justify-between">
          <select name="outputBranch" id="outputBranch" className='border p-3 rounded-lg text-xs col-span-3' onChange={(e) => { outputButtonControl(), saveBranchName(e) }}>

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
        <SectionHeader label={'Préstamos'} />

        <form onSubmit={addLoan} className="grid grid-cols-2 items-center justify-between">

          <select name="loanEmployee" id="loanEmployee" className='border p-3 rounded-lg text-xs' onChange={(e) => { saveDebtorName(e), loansButtonControl() }}>

            <option value="none" selected disabled hidden>Encargado</option>

            {employees && employees.length == 0 ? <option> No hay empleados </option> : ''}
            {employees && employees.length > 0 && employees.map((employee) => (

              <option key={employee._id} value={employee._id}>{employee.name + ' ' + employee.lastName}</option>

            ))}

          </select>

          <input type="number" name="loanAmount" id="loanAmount" placeholder='$0.00' step={0.01} className='border p-3 rounded-lg' required onInput={loansButtonControl} />

          <button type='submit' id='loanButton' disabled className='bg-slate-500 text-white p-3 rounded-lg col-span-4 mt-8'>Agregar</button>

        </form>


      </div>

      {incomes && incomes.length > 0 ?

        <div className='border bg-white shadow-lg p-3 mt-4 mb-4'>

          <div className='flex gap-4 display-flex justify-between' onClick={() => setIncomesIsOpen(!incomesIsOpen)} >

            <SectionHeader label={'Efectivos'} />
            {incomesIsOpen ? <MdKeyboardArrowDown className='text-5xl' /> : <MdKeyboardArrowRight className='text-5xl' />}

          </div>

          <div className={incomesIsOpen ? '' : 'hidden'} >


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
          {currentUser.role == managerRole._id ?

            <div className='flex mt-4 border-opacity-30 shadow-lg border-black border rounded-lg p-3'>
              <p className='w-6/12 text-center'>Total:</p>
              <p className='w-6/12 text-center'>{incomesTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>

            </div>
            : ''}
        </div>
        : ''}


      {extraOutgoings && extraOutgoings.length > 0 ?
        <div className='border bg-white shadow-lg p-3 mt-4'>

          <div className='flex gap-4 display-flex justify-between' onClick={() => setOutgoingsIsOpen(!outgoingsIsOpen)} >

            <SectionHeader label={'Gastos'} />
            {outgoingsIsOpen ? <MdKeyboardArrowDown className='text-5xl' /> : <MdKeyboardArrowRight className='text-5xl' />}

          </div>

          <div className={outgoingsIsOpen ? '' : 'hidden'} >

            {extraOutgoings && extraOutgoings.length > 0 ?
              <div id='header' className='grid grid-cols-11 items-center justify-around font-semibold mt-4'>
                <p className='p-3 rounded-lg col-span-3 text-center bg-white'>Supervisor</p>
                <p className='p-3 rounded-lg col-span-3 text-center bg-white'>Concepto</p>
                <p className='p-3 rounded-lg col-span-3 text-center bg-white'>Monto</p>
              </div>
              : ''}

            {extraOutgoings && extraOutgoings.length > 0 && extraOutgoings.map((extraOutgoing, index) => (


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

          {currentUser.role == managerRole._id ?

            <div className='flex mt-4 border-black border border-opacity-30 shadow-lg rounded-lg p-3'>
              <p className='w-6/12 text-center'>Total:</p>
              <p className='w-6/12 text-center'>{extraOutgoingsTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>

            </div>

            : ''}
        </div>

        : ''}

      {inputs && inputs.length > 0 ?
        < div className='border bg-white shadow-lg p-3 mt-4'>

          <div className='flex gap-4 display-flex justify-between' onClick={() => setInputsIsOpen(!inputsIsOpen)} >

            <SectionHeader label={'Entradas'} />
            {inputsIsOpen ? <MdKeyboardArrowDown className='text-5xl' /> : <MdKeyboardArrowRight className='text-5xl' />}

          </div>

          <div className={inputsIsOpen ? '' : 'hidden'} >

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

                <button onClick={() => { setSelectedMovement(input), setMovementDetailsIsOpen(!movementDetailsIsOpen) }}  id='list-element' className='flex col-span-10 items-center justify-around'>
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

          {inputs && inputs.length > 0 ?

            <div className='flex mt-4 border border-opacity-30 shadow-lg border-black rounded-lg p-3'>
              <p className='w-6/12 text-center'>Total {'(Kg)'}:</p>
              <p className='w-6/12 text-center'>{inputsTotal}</p>

            </div>

            : ''}
        </div>
        : ''}

      {outputs && outputs.length > 0 ?
        <div className='border bg-white shadow-lg p-3 mt-4'>

          <div className='flex gap-4 display-flex justify-between' onClick={() => setOutputsIsOpen(!outputsIsOpen)} >

            <SectionHeader label={'Salidas'} />
            {outputsIsOpen ? <MdKeyboardArrowDown className='text-5xl' /> : <MdKeyboardArrowRight className='text-5xl' />}

          </div>

          <div className={outputsIsOpen ? '' : 'hidden'} >

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

          {outputs && outputs.length > 0 ?

            <div className='flex mt-4 border-black border border-opacity-30 shadow-lg rounded-lg p-3'>
              <p className='w-6/12 text-center'>Total {'(Kg)'}:</p>
              <p className='w-6/12 text-center'>{outputsTotal}</p>
            </div>

            : ''}

        </div>
        : ''}

      {Object.values(netDifference) && Object.values(netDifference).length > 0 && managerRole._id == currentUser.role ?

        <div className='border bg-white shadow-lg p-3 mt-4'>

          <div className='flex gap-4 display-flex justify-between' onClick={() => setDifferencesIsOpen(!differencesIsOpen)} >

            <SectionHeader label={'Diferencia neta'} />
            {differencesIsOpen ? <MdKeyboardArrowDown className='text-5xl' /> : <MdKeyboardArrowRight className='text-5xl' />}

          </div>

          <div className={differencesIsOpen ? '' : 'hidden'} >

            {Object.values(netDifference) && Object.values(netDifference).length > 0 && Object.values(netDifference).map((employeeDifferences) => (

              <div className='border border-black mt-5' key={employeeDifferences.employee._id}>

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
            ))}

          </div>

          {currentUser.role == managerRole._id ?

            <div className='flex mt-4 border-black border border-opacity-30 shadow-lg rounded-lg p-3'>
              <p className='w-6/12 text-center'>Total:</p>
              <p className={'w-6/12 text-center ' + (totalNetDifference < 0 ? 'text-red-500' : '')}>{Math.abs(totalNetDifference)}</p>

            </div>

            : ''}

        </div>
        : ''}

      {
        loans && loans.length > 0 ?
          <div className='border bg-white shadow-lg p-3 mt-4'>

            <div className='flex gap-4 display-flex justify-between' onClick={() => setLoansIsOpen(!loansIsOpen)} >

              <SectionHeader label={'Préstamos'} />
              {loansIsOpen ? <MdKeyboardArrowDown className='text-5xl' /> : <MdKeyboardArrowRight className='text-5xl' />}

            </div>

            <div className={loansIsOpen ? '' : 'hidden'} >

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
                    <p className='text-center text-sm w-3/12'>{loan.supervisor.name}</p>
                    <p className='text-center text-sm w-3/12'>{loan.employee.name ? loan.employee.name + ' ' + loan.employee.lastName : loan.employee}</p>
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

            {currentUser.role == managerRole._id ?

              <div className='flex mt-4 border-black border border-opacity-30 shadow-lg rounded-lg p-3'>
                <p className='w-6/12 text-center'>Total:</p>
                <p className='w-6/12 text-center'>{loansTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>

              </div>

              : ''}

          </div>
          : ''}

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