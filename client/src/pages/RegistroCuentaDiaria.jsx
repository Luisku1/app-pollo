/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { deleteOutgoingFetch, deleteStockFetch, fetchBranches, fetchEmployees, fetchPrices, fetchProducts } from '../helpers/FetchFunctions';
import { FaTrash } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md';
import Select from "react-tailwindcss-select";
import FechaDePagina from '../components/FechaDePagina';
import { formatDate } from '../helpers/DatePickerFunctions';

export default function RegistroCuentaDiaria() {

  const { currentUser, company } = useSelector((state) => state.user)
  const paramsDate = useParams().date
  const [branchId, setBranchId] = useState(useParams().branchId || null)
  const [branchReport, setBranchReport] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [outgoingFormData, setOutgoingFormData] = useState({})
  const [stockFormData, setStockFormData] = useState({})
  // const [productLossFormData, setProductLossFormData] = useState({})
  // const [productLosses, setProductLosses] = useState([])
  const [employees, setEmployees] = useState([])
  const [managerRole, setManagerRole] = useState({})
  const [branches, setBranches] = useState([])
  const [outgoings, setOutgoings] = useState([])
  const [outgoingsTotal, setOutgoingsTotal] = useState(0.0)
  const [outputs, setOutputs] = useState([])
  const [outputsTotal, setOutputsTotal] = useState(0.0)
  const [inputs, setInputs] = useState([])
  const [inputsTotal, setInputsTotal] = useState(0.0)
  const [incomes, setIncomes] = useState([])
  const [incomesTotal, setIncomesTotal] = useState(0.0)
  const [initialStock, setInitialStock] = useState(0.0)
  const [stockItems, setStockItems] = useState([])
  const [stockTotal, setStockTotal] = useState(0.0)
  const [providerInputs, setProviderInputs] = useState([])
  const [providerInputsTotal, setProviderInputsTotal] = useState(0.0)
  const [inputsIsOpen, setInputsIsOpen] = useState(false)
  const [outputsIsOpen, setOutputsIsOpen] = useState(false)
  const [incomesIsOpen, setIncomesIsOpen] = useState(false)
  const [providerInputsIsOpen, setProviderInputsIsOpen] = useState(false)
  // const [productLossTotal, setProductLossTotal] = useState(0.0)
  const [products, setProducts] = useState([])
  const [branchPrices, setPrices] = useState([])
  const [productName, setProductName] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [buttonId, setButtonId] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [selectedAssistant, setSelectedAssistant] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const navigate = useNavigate()
  const reportDate = (paramsDate ? new Date(paramsDate) : new Date()).toLocaleDateString('es-mx', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  let today = formatDate(datePickerValue) == formatDate(new Date()) ? true : false

  const handleEmployeeSelectChange = (employee) => {

    setSelectedEmployee(employee)
  }

  const handleAssistantSelectChange = (assistant) => {

    setSelectedAssistant(assistant)
  }

  const handleBranchSelectChange = (branch) => {

    setSelectedBranch(branch)
    setBranchId(branch.value)
    navigate('/formato/' + stringDatePickerValue + '/' + branch.value)

  }

  const changeDatePickerValue = (e) => {

    stringDatePickerValue = (e.target.value + 'T06:00:00.000Z')

    navigate('/formato/' + stringDatePickerValue + '/' + branchId)

  }

  const changeDay = (date) => {

    navigate('/formato/' + date + '/' + branchId)

  }



  const SectionHeader = (props) => {

    return (

      <h2 className='flex text-2xl text-center font-semibold mb-4 text-red-800' onClick={props.onClick}>{props.label}</h2>
    )
  }

  const saveProductName = (e) => {

    let index = e.target.selectedIndex
    setProductName(e.target.options[index].text)
  }

  const getProductPrice = (productId) => {

    console.log(branchPrices.prices)
    const priceIndex = branchPrices.prices.findIndex((price) => (price.productId == productId))
    return branchPrices.prices[priceIndex].latestPrice
  }

  const handleOutgoingInputsChange = (e) => {

    setOutgoingFormData({

      ...outgoingFormData,
      [e.target.id]: e.target.value,

    })

  }

  const handleStockInputsChange = (e) => {

    setStockFormData({
      ...stockFormData,
      [e.target.id]: e.target.value,
    })
  }

  // const handleProductLossInputsChange = (e) => {

  //   setProductLossFormData({
  //     ...productLossFormData,
  //     [e.target.id]: e.target.value,
  //   })
  // }

  const outgoingsButtonControl = () => {

    const amountInput = document.getElementById('amount')
    const conceptInput = document.getElementById('concept')
    const button = document.getElementById('outgoing-button')
    const employeeSelect = selectedEmployee != null
    const branchSelect = selectedBranch != null

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

  const stockButtonControl = () => {

    const productSelect = document.getElementById('product')
    const weightInput = document.getElementById('weight')
    const button = document.getElementById('stock-button')
    const branchSelect = selectedBranch != null
    const employeeSelect = selectedEmployee != null

    let filledInputs = true

    if (productSelect.value == 'none') {

      filledInputs = false

    }

    if (weightInput.value == '') {

      filledInputs = false
    }

    if (filledInputs && branchSelect && employeeSelect && !loading) {

      button.disabled = false

    } else {

      button.disabled = true
    }
  }

  // const productLossButtonControl = () => {

  //   const productSelect = document.getElementById('product-loss')
  //   const weightInput = document.getElementById('productLossWeight')
  //   const button = document.getElementById('product-loss-button')
  //   const employeeSelect = selectedEmployee != null
  //   const branchSelect = selectedBranch != null

  //   let filledInputs = true

  //   if (productSelect.value == 'none') {

  //     filledInputs = false

  //   }

  //   if (weightInput.value == '') {

  //     filledInputs = false
  //   }

  //   if (filledInputs && branchSelect && employeeSelect && !loading) {

  //     button.disabled = false

  //   } else {

  //     button.disabled = true
  //   }
  // }

  const addOutgoing = async (e) => {

    const conceptInput = document.getElementById('concept')
    const amountInput = document.getElementById('amount')
    const button = document.getElementById('outgoing-button')
    const date = today ? new Date().toISOString() : new Date(stringDatePickerValue).toISOString()

    e.preventDefault()

    button.disabled = true

    try {

      const res = await fetch('/api/outgoing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...outgoingFormData,
          createdAt: date,
          employee: selectedEmployee.value,
          branch: selectedBranch.value,
          company: company._id
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        button.disabled = false
        return
      }

      setError(null)
      setOutgoings([...outgoings, data.outgoing])
      setOutgoingsTotal(outgoingsTotal + parseFloat(data.outgoing.amount))

      conceptInput.value = ''
      amountInput.value = ''
      button.disabled = false

    } catch (error) {

      setError(error.message)
      button.disabled = false
    }
  }

  const deleteOutgoing = async (outgoingId, index) => {

    setLoading(true)

    const { error } = await deleteOutgoingFetch(outgoingId)


    if (error == null) {

      setOutgoingsTotal(outgoingsTotal - parseFloat(outgoings[index].amount))
      outgoings.splice(index, 1)
    }

    setLoading(false)
  }

  const addStockItem = async (e) => {

    e.preventDefault()

    const button = document.getElementById('stock-button')

    button.disabled = true

    const productSelect = document.getElementById('product')
    const piecesInput = document.getElementById('pieces')
    const weightInput = document.getElementById('weight')
    const amount = parseFloat(getProductPrice(productSelect.value) * stockFormData.weight)
    const date = today ? new Date().toISOString() : new Date(stringDatePickerValue).toISOString()

    try {

      const res = await fetch('/api/stock/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...stockFormData,
          amount: amount,
          employee: selectedEmployee.value,
          product: productSelect.value,
          branch: selectedBranch.value,
          createdAt: date,
          company: company._id
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        button.disabled = false
        return
      }

      data.stock.product = productName

      setError(null)
      setStockItems([...stockItems, data.stock])
      setStockTotal(stockTotal + data.stock.amount)

      weightInput.value = ''
      piecesInput.value = ''

      button.disabled = false

    } catch (error) {

      setError(error.message)
      button.disabled = false
    }
  }

  // const addProductLossItem = async (e) => {

  //   e.preventDefault()
  //   setLoading(true)

  //   const branchSelect = document.getElementById('branch')
  //   const employeeSelect = document.getElementById('employee')
  //   const productSelect = document.getElementById('product-loss')
  //   const weightInput = document.getElementById('productLossWeight')
  //   const commentInput = document.getElementById('comment')
  //   const amount = parseFloat(getProductPrice(productSelect.value) * productLossFormData.productLossWeight)
  //   const date = new Date(stringDatePickerValue).toISOString()


  //   try {

  //     const res = await fetch('/api/outgoing/product-loss/create', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         ...productLossFormData,
  //         amount: amount,
  //         product: productSelect.value,
  //         employee: employeeSelect.value,
  //         branch: branchSelect.value,
  //         company: company._id
  //       })
  //     })

  //     const data = await res.json()

  //     if (data.success === false) {

  //       setError(data.message)
  //       setLoading(false)
  //       return
  //     }

  //     data.productLoss.product = productName

  //     setProductLosses([...productLosses, data.productLoss])


  //     setProductLossTotal(productLossTotal + data.productLoss.amount)
  //     setError(null)

  //     weightInput.value = ''
  //     commentInput.value = ''

  //     setLoading(false)

  //   } catch (error) {

  //     setError(error.message)
  //     setLoading(false)
  //   }
  // }

  const deleteStockItem = async (stockId, index) => {

    setLoading(true)

    const { error } = await deleteStockFetch(stockId)


    if (error == null) {

      setStockTotal(stockTotal - parseFloat(stockItems[index].amount))
      stockItems.splice(index, 1)
    }

    setLoading(false)
  }

  // const deleteProductLossItem = async (productLossItemId, index) => {

  //   setLoading(true)

  //   const { error } = await deleteProductLossItemFetch(productLossItemId)

  //   setLoading(false)

  //   if (error == null) {

  //     setProductLossTotal(productLossTotal - parseFloat(productLosses[index].amount))
  //     productLosses.splice(index, 1)
  //   }
  // }



  const setOutgoingsTotalFunction = (outgoings) => {

    let total = 0
    outgoings.forEach((outgoing) => {
      total += parseFloat(outgoing.amount)
    })

    setOutgoingsTotal(total)
  }


  const setStockTotalFunction = (stockItems) => {

    let total = 0
    stockItems.forEach((stockItem) => {
      total += parseFloat(stockItem.amount)
    })

    setStockTotal(total)
  }

  const setInputsTotalFunction = (inputs) => {

    let total = 0

    inputs.forEach((input) => {

      total += parseFloat(input.amount)
    })

    setInputsTotal(total)
  }

  const setOutputsTotalFunction = (outputs) => {

    let total = 0

    outputs.forEach((output) => {

      total += parseFloat(output.amount)
    })

    setOutputsTotal(total)
  }

  const setIncomesTotalFunction = (incomes) => {

    let total = 0

    incomes.forEach((incomes) => {

      total += parseFloat(incomes.amount)
    })

    setIncomesTotal(total)
  }

  const setProviderInputsTotalFunction = (providerInputs) => {

    let total = 0

    providerInputs.forEach((input) => {

      total += parseFloat(input.amount)
    })

    setProviderInputsTotal(total)
  }


  // const setProductLossTotalFunction = (productLosses) => {

  //   let total = 0

  //   productLosses.forEach((productLoss) => {

  //     total += parseFloat(productLoss.amount)
  //   })

  //   setProductLossTotal(total)
  // }


  const handleSubmit = async () => {

    setLoading(true)

    const date = today ? new Date().toISOString() : new Date(stringDatePickerValue).toISOString()
    const assistant = selectedAssistant == null ? null : selectedAssistant.value

    try {

      const res = await fetch('/api/branch/report/create/' + company._id, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: date,
          employee: selectedEmployee.value,
          assistant: assistant,
          branch: selectedBranch.value,
          company: company._id,
          initialStock: initialStock,
          finalStock: stockTotal,
          inputs: inputsTotal + providerInputsTotal,
          outputs: outputsTotal,
          outgoings: outgoingsTotal,
          incomes: incomesTotal,
        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError('Ya está registrado el reporte de esta pollería, mira si ya está en tu perfil.')
        setLoading(false)
        return
      }

      setError(null)
      setLoading(false)

      navigate('/perfil/' + selectedEmployee.value)

    } catch (error) {

      setError(error.message)
      setLoading(false)

    }

  }

  const handleUpdate = async () => {

    setLoading(true)
    const assistant = selectedAssistant == null ? null : selectedAssistant.value

    try {

      const res = await fetch('/api/branch/report/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branchReport: branchReport,
          employee: selectedEmployee.value,
          assistant: assistant,
          initialStock: branchReport.initialStock != 0 ? initialStock : initialStock,
          finalStock: stockTotal,
          inputs: inputsTotal + providerInputsTotal,
          outputs: outputsTotal,
          outgoings: outgoingsTotal,
          incomes: incomesTotal,

        })
      })

      const data = await res.json()

      if (data.success === false) {

        setError('Algún error ha ocurrido, intenta más tarde.')
        setLoading(false)
        return
      }

      setLoading(false)
      setError(null)

      navigate('/perfil/' + selectedEmployee.value)

    } catch (error) {

      setLoading(false)
      setError(error.message)

    }
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

    fetchRoles()

  }, [])

  useEffect(() => {

    const fetchStock = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setLoading(true)
      setStockTotal(0.0)
      setStockItems([])

      try {

        const res = await fetch('/api/stock/get-branch-stock/' + branchId + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        setStockItems(data.stock)
        setStockTotalFunction(data.stock)
        setError(null)

        setLoading(false)

      } catch (error) {

        setError(error.message)
        setLoading(false)
      }
    }

    const fetchOutgoings = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setLoading(true)
      setOutgoingsTotal(0.0)
      setOutgoings([])

      try {

        const res = await fetch('/api/outgoing/branch-outgoings/' + branchId + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        setOutgoings(data.outgoings)
        setOutgoingsTotalFunction(data.outgoings)
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
      setInputsTotal(0.0)
      setInputs([])

      try {

        const res = await fetch('/api/input/get-branch-inputs/' + branchId + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        setInputs(data.inputs)
        setInputsTotalFunction(data.inputs)
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
      setOutputsTotal(0.0)
      setOutputs([])

      try {

        const res = await fetch('/api/output/get-branch-outputs/' + branchId + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        setOutputs(data.outputs)
        setOutputsTotalFunction(data.outputs)
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
      setIncomesTotal(0.0)
      setIncomes([])

      try {

        const res = await fetch('/api/income/branch-incomes/' + branchId + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        setIncomes(data.branchIncomes)
        setIncomesTotalFunction(data.branchIncomes)
        setError(null)
        setLoading(false)

      } catch (error) {

        setError(error.message)
        setLoading(false)

      }
    }

    // const fetchProductLosses = async () => {

    // const date = new Date(stringDatePickerValue).toISOString()

    //   setLoading(true)

    //   try {

    //     const res = await fetch('/api/outgoing/product-loss/get/' + branchId + '/' + date)
    //     const data = await res.json()

    //     if (date.success === false) {

    //       setError(data.message)
    //       setLoading(false)
    //       return
    //     }

    //     // setProductLosses(data.productLosses)
    //     setProductLossTotalFunction(data.productLosses)
    //     setError(null)
    //     setLoading(false)

    //   } catch (error) {

    //     setError(error.message)
    //     setLoading(false)
    //   }
    // }

    const fetchProviderInputs = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setLoading(true)
      setProviderInputs([])

      try {

        const res = await fetch('/api/input/get-branch-provider-inputs/' + branchId + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setLoading(false)
          setError(data.message)
          return
        }

        setProviderInputs(data.providerInputs)
        setProviderInputsTotalFunction(data.providerInputs)

        setLoading(false)
        setError(null)

      } catch (error) {

        setLoading(false)
        setError(error.message)
      }
    }




    const fetchs = () => {

      fetchOutgoings()
      fetchStock()
      fetchIncomes()
      fetchInputs()
      fetchProviderInputs()
      fetchOutputs()
      // fetchProductLosses(branchId)
    }

    if (branchId != null) {

      fetchs(branchId)
    }

  }, [branchId, stringDatePickerValue])

  useEffect(() => {

    const setEmployeesFunction = async () => {

      const { error, data } = await fetchEmployees(company._id)

      if (error == null) {

        const tempOptions = []

        data.map((employee) => {

          const option = {
            value: employee._id,
            label: employee.name + ' ' + employee.lastName
          }

          if (currentUser._id == employee._id) {
            setSelectedEmployee(option)
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

        const tempOptions = []

        data.map((branch) => {

          const option = {

            value: branch._id,
            label: branch.branch
          }

          if (branchId == branch._id) {

            setSelectedBranch(option)
          }

          tempOptions.push(option)
        })

        setError(null)
        setBranches(tempOptions)

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

    setEmployeesFunction()
    setBranchesFunction()
    setProductsFunction()



  }, [company, branchId, currentUser])

  useEffect(() => {

    const fetchBranchReport = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setLoading(true)
      setBranchReport({})

      try {

        const res = await fetch('/api/branch/report/get-branch-report/' + branchId + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setLoading(false)
          setError(data.message)
          return
        }


        const employeeTempOption = employees.find((employee) =>

          employee.value == data.originalBranchReport.employee
        )
        const assistantTempOption = employees.find((assistant) => assistant.value == data.originalBranchReport.assistant)

        if (employeeTempOption) {

          setSelectedEmployee(employeeTempOption)
        }

        if (assistantTempOption) {

          setSelectedAssistant(assistantTempOption)
        }

        setBranchReport(data.originalBranchReport)

        setLoading(false)
        setError(null)

      } catch (error) {

        setError(error.message)
        setLoading(false)
      }
    }

    if (branchId && employees && stringDatePickerValue) {

      fetchBranchReport()
    }

  }, [branchId, employees, stringDatePickerValue])

  useEffect(() => {

    const setPricesFunction = async () => {

      const date = branchReport.createdAt ? branchReport.createdAt : new Date().toISOString()

      setLoading(true)

      const { error, data } = await fetchPrices(branchId, date, branchReport.createdAt ? 1 : 0)


      if (error == null) {
        setPrices(data)
        setError(null)

      } else {

        setError(error)
      }
      setLoading(false)
    }

    setPricesFunction()

  }, [branchReport])

  useEffect(() => {

    const fetchInitialStock = async () => {

      const date = new Date(stringDatePickerValue).toISOString()
      const branchReportExists = branchReport.createdAt ? 1 : 0

      setLoading(true)
      setInitialStock(0.0)

      try {

        const res = await fetch('/api/stock/initial-stock/' + branchId + '/' + date + '/' + branchReportExists + '/' + branchReport.createdAt)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        setInitialStock(data.initialStock)
        setError(null)
        setLoading(false)

      } catch (error) {

        setError(error.message)
        setLoading(false)
      }

    }


    if (branchReport && branchId && stringDatePickerValue) {

      fetchInitialStock()
    }

  }, [branchReport, branchId, stringDatePickerValue])

  return (

    <main className="p-3 max-w-lg mx-auto">

      {managerRole._id == currentUser.role ?

        <FechaDePagina changeDay={changeDay} stringDatePickerValue={stringDatePickerValue} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>

        : ''}

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Formato
        <br />
      </h1>
      <p className='text-center mb-7'>{reportDate}</p>



      <SectionHeader label={'Información básica'} />

      <div className="grid grid-cols-12 items-center mt-1 ">
        <p className='col-span-4'>Encargado:</p>
        <div className='col-span-8'>

          <Select
            value={selectedEmployee}
            onChange={handleEmployeeSelectChange}
            options={employees}
            isSearchable={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-center mt-1 ">
        <p className='col-span-4'>Auxiliar:</p>
        <div className='col-span-8'>

          <Select
            value={selectedAssistant}
            onChange={handleAssistantSelectChange}
            options={employees}
            placeholder='Sin auxiliar'
            isSearchable={true}
            isClearable={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-center mt-1 ">

        <p className='col-span-4'>Sucursal:</p>
        <div className='col-span-8'>

          <Select
            value={selectedBranch}
            onChange={handleBranchSelectChange}
            options={branches}
            placeholder='Elige una sucursal'
            isSearchable={true}
          />

        </div>
      </div>

      <div className='grid grid-cols-5'>
        {branchPrices && branchPrices.prices && branchPrices.prices.length > 0 ? <p className='col-span-2 my-auto'>Precios:</p> : ''}

        <div className='col-span-3'>

          {branchPrices && branchPrices.prices && branchPrices.prices.length > 0 && branchPrices.prices.map((price) => (

            <div key={price.priceId} className='grid grid-cols-2 bg-white gap-2 p-1 mt-1 shadow-sm'>

              <p className='truncate'>{price.product}:</p>
              <p className=''>{price.latestPrice}</p>
            </div>

          ))}
        </div>

      </div>

      <div className="flex items-center justify-between">

        <p>Sobrante inicial: </p>
        <p className=' bg-white p-3 rounded-lg'>{initialStock ? initialStock.toLocaleString("es-Mx", { style: 'currency', currency: 'MXN' }) : '$0.00'}</p>

      </div>

      <div className='border p-3 mt-4 bg-white'>
        <SectionHeader label={'Gastos'} />

        <form id='outgoingForm' onSubmit={addOutgoing} className="grid grid-cols-3 items-center justify-between">

          <input type="text" name="concept" id="concept" placeholder='Concepto' className='border p-3 rounded-lg' required onInput={outgoingsButtonControl} onChange={handleOutgoingInputsChange} />
          <input type="number" name="amount" id="amount" placeholder='$0.00' step={0.01} className='border p-3 rounded-lg' required onInput={outgoingsButtonControl} onChange={handleOutgoingInputsChange} />
          <button type='submit' id='outgoing-button' disabled className='bg-slate-500 text-white p-3 rounded-lg'>Agregar</button>

        </form>


        {outgoings && outgoings.length > 0 ?
          <div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold'>
            <p className='p-3 rounded-lg col-span-5 text-center'>Concepto</p>
            <p className='p-3 rounded-lg col-span-5 text-center'>Monto</p>
          </div>
          : ''}
        {outgoings && outgoings.length > 0 && outgoings.map((outgoing, index) => (


          <div key={outgoing._id} className={(currentUser._id == outgoing.employee || currentUser.role == managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

            <div id='list-element' className='flex col-span-10 items-center'>
              <p className='text-center text-xs w-6/12'>{outgoing.concept}</p>
              <p className='text-center text-xs w-6/12'>{outgoing.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
            </div>

            {currentUser._id == outgoing.employee || currentUser.role == managerRole._id ?

              <div>
                <button id={outgoing._id} onClick={() => { setIsOpen(isOpen ? false : true), setButtonId(outgoing._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                  <span>
                    <FaTrash className='text-red-700 m-auto' />
                  </span>
                </button>

                {isOpen && outgoing._id == buttonId ?
                  <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                    <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                      <div>
                        <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                      </div>
                      <div className='flex gap-10'>
                        <div>
                          <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteOutgoing(outgoing._id, index), setIsOpen(isOpen ? false : true) }}>Si</button>
                        </div>
                        <div>
                          <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setIsOpen(isOpen ? false : true) }}>No</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  : ''}

              </div>

              : ''}

          </div>

        ))}

        {outgoings && outgoings.length > 0 ?

          <div className='flex mt-4 border-black border rounded-lg p-3 border-opacity-30 shadow-lg'>
            <p className='w-6/12 text-center'>Total:</p>
            <p className='w-6/12 text-center font-bold'>{outgoingsTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>

          </div>

          : ''}
      </div>

      <div className='border bg-white p-3 mt-4'>
        <SectionHeader label={'Sobrante'} />

        <form onSubmit={addStockItem} className="grid grid-cols-4 items-center justify-between">

          <select name="product" id="product" onChange={(e) => { stockButtonControl(), saveProductName(e) }} className='border p-3 rounded-lg text-xs'>
            <option value="none" selected hidden >Productos</option>

            {products && products.length != 0 && products.map((product) => (

              <option key={product._id} value={product._id}>{product.name}</option>
            ))}
          </select>

          <input type="number" name="pieces" id="pieces" placeholder='Piezas' step={0.1} className='border p-3 rounded-lg' required onInput={stockButtonControl} onChange={handleStockInputsChange} />
          <input type="number" name="weight" id="weight" placeholder='0.00 kg' step={0.01} className='border p-3 rounded-lg' required onInput={stockButtonControl} onChange={handleStockInputsChange} />
          <button type='submit' id='stock-button' disabled className='bg-slate-500 text-white p-3 rounded-lg'>Agregar</button>

        </form>

        {stockItems && stockItems.length > 0 ?
          <div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold mt-4 mb-4'>
            <p className='rounded-lg col-span-3 text-center'>Producto</p>
            <p className='rounded-lg col-span-2 text-center'>Piezas</p>
            <p className='rounded-lg col-span-2 text-center'>Kg</p>
            <p className='rounded-lg col-span-3 text-center'>Monto</p>
          </div>
          : ''}
        {stockItems && stockItems.length > 0 && stockItems.map((stock, index) => (


          <div key={stock._id} className={(currentUser._id == stock.employee || currentUser.role == managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

            <div id='list-element' className='flex col-span-10 items-center '>
              <p className='text-center w-4/12'>{stock.product.name ? stock.product.name : stock.product}</p>
              <p className='text-center w-4/12'>{stock.pieces}</p>
              <p className='text-center w-4/12'>{stock.weight}</p>
              <p className='text-right w-4/12'>{stock.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
            </div>


            {currentUser._id == stock.employee || currentUser.role == managerRole._id ?

              <div>
                <button id={stock._id} onClick={() => { setIsOpen(!isOpen), setButtonId(stock._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                  <span>
                    <FaTrash className='text-red-700 m-auto' />
                  </span>
                </button>

                {isOpen && stock._id == buttonId ?
                  <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                    <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                      <div>
                        <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                      </div>
                      <div className='flex gap-10'>
                        <div>
                          <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteStockItem(stock._id, index), setIsOpen(isOpen ? false : true) }}>Si</button>
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

        {stockItems && stockItems.length > 0 ?

          <div className='flex mt-4 border-black border rounded-lg p-3 border-opacity-30 shadow-lg'>
            <p className='w-6/12 text-center'>Total:</p>
            <p className='w-6/12 text-center font-bold'>{stockTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>

          </div>

          : ''}

      </div>

      {/* <div className='border p-3 mt-4 bg-white'>
        <SectionHeader label={'Mermas'} />

        <form onSubmit={addProductLossItem} className="grid grid-cols-4 items-center justify-between">

        <select name="product-loss" id="product-loss" onChange={(e) => { productLossButtonControl(), saveProductName(e) }} className='border p-3 rounded-lg text-xs'>
        <option value="none" selected hidden >Productos</option>

            {products && products.length != 0 && products.map((product) => (

              <option key={product._id} value={product._id}>{product.name}</option>
            ))}
          </select>

          <input type="number" name="productLossWeight" id="productLossWeight" placeholder='0.00 kg' step={0.01} className='border p-3 rounded-lg' required onInput={productLossButtonControl} onChange={handleProductLossInputsChange} />
          <textarea name="comment" id="comment" cols="30" rows="0" placeholder='Comentario' onInput={productLossButtonControl} onChange={handleProductLossInputsChange}></textarea>
          <button type='submit' id='product-loss-button' disabled className='bg-slate-500 text-white p-3 rounded-lg'>Agregar</button>

          </form>

        {productLosses && productLosses.length > 0 ?
          <div id='header' className='grid grid-cols-11 gap-4 items-center justify-around font-semibold my-4'>
          <p className='col-span-3 text-center'>Producto</p>
          <p className='col-span-3 text-center'>Comentario</p>
          <p className='col-span-3 text-center'>Monto</p>
          </div>
          : ''}

          {productLosses && productLosses.length > 0 && productLosses.map((productLossItem, index) => (


            <div key={productLossItem._id} className={(document.getElementById('employee').value == productLossItem.employee ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

            <div id='list-element' className='flex col-span-10 items-center'>
            <p className='text-center text-xs w-4/12'>{productLossItem.product.name ? productLossItem.product.name : productLossItem.product}</p>
            <p className='text-center text-xs w-4/12'>{productLossItem.comment}</p>
            <p className='text-center text-xs w-4/12'>{productLossItem.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
            </div>


            {document.getElementById('employee').value == productLossItem.employee || currentUser._id == productLossItem.employee ?

            <div>
            <button id={productLossItem._id} onClick={() => { setIsOpen(isOpen ? false : true), setButtonId(productLossItem._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
            <span>
            <FaTrash className='text-red-700 m-auto' />
            </span>
            </button>

            {isOpen && productLossItem._id == buttonId ?
              <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
              <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
              <div>
              <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
              </div>
              <div className='flex gap-10'>
              <div>
              <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteProductLossItem(productLossItem._id, index), setIsOpen(isOpen ? false : true) }}>Si</button>
              </div>
              <div>
              <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setIsOpen(isOpen ? false : true) }}>No</button>
              </div>
              </div>
              </div>
              </div>
              : ''}

              </div>

              : ''}


          </div>

        ))}

        {productLosses && productLosses.length > 0 ?

          <div className='flex mt-4 border-black border rounded-lg p-3 shadow-lg border-opacity-30'>
          <p className='w-6/12 text-center'>Total:</p>
          <p className='w-6/12 text-center font-bold'>{productLossTotal.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>

          </div>

          : ''}

        </div> */}

      {inputs && inputs.length > 0 ?
        <div className='border bg-white p-3 mt-4'>

          <div className='flex gap-4 display-flex justify-between' onClick={() => setInputsIsOpen(!inputsIsOpen)} >

            <SectionHeader label={'Entradas'} />
            {inputsIsOpen ? <MdKeyboardArrowDown className='text-5xl' /> : <MdKeyboardArrowRight className='text-5xl' />}

          </div>

          <div className={inputsIsOpen ? '' : 'hidden'} >

            <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold my-4'>
              <p className='col-span-3 text-center'>Encargado</p>
              <p className='col-span-3 text-center'>Producto</p>
              <p className='col-span-2 text-center'>Piezas</p>
              <p className='col-span-2 text-center'>Kg</p>
              <p className='col-span-2 text-center'>Monto</p>
            </div>

            {inputs && inputs.length > 0 && inputs.map((input) => (

              <div key={input._id}>
                <div className={(input.specialPrice ? 'border border-red-500' : 'border border-black') + ' grid grid-cols-12 items-center border-opacity-70 rounded-lg shadow-sm mb-2 py-3'}>
                  <div id='list-element' className='flex col-span-12 items-center'>
                    <p className='text-center text-xs w-3/12'>{input.employee.name + ' ' + input.employee.lastName}</p>
                    <p className='text-center text-xs w-3/12'>{input.product.name}</p>
                    <p className='text-center text-xs w-2/12'>{input.pieces}</p>
                    <p className='text-center text-xs w-2/12'>{input.weight}</p>
                    <p className='text-center text-xs w-2/12'>{input.amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                  </div>

                  <div className='col-span-12'>
                    <p className='text-m text-center font-semibold'>{input.comment}</p>
                  </div>

                </div>
              </div>
            ))}

          </div>

          {inputs && inputs.length > 0 ?

            <div className='flex mt-4 border-black border rounded-lg p-3 shadow-lg border-opacity-30'>
              <p className='w-6/12 text-center'>Total:</p>
              <p className='w-6/12 text-center font-bold'>{inputsTotal.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>

            </div>

            : ''}
        </div>

        : ''}

      {providerInputs && providerInputs.length > 0 ?
        <div className='border bg-white p-3 mt-4'>

          <div className='flex gap-4 display-flex justify-between' onClick={() => setProviderInputsIsOpen(!providerInputsIsOpen)} >

            <SectionHeader label={'Entradas de Rastro'} />
            {providerInputsIsOpen ? <MdKeyboardArrowDown className='text-5xl' /> : <MdKeyboardArrowRight className='text-5xl' />}

          </div>

          <div className={providerInputsIsOpen ? '' : 'hidden'} >

            <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold my-4'>
              <p className='col-span-3 text-center'>Encargado</p>
              <p className='col-span-3 text-center'>Producto</p>
              <p className='col-span-2 text-center'>Piezas</p>
              <p className='col-span-2 text-center'>Kg</p>
              <p className='col-span-2 text-center'>Monto</p>
            </div>
            {providerInputs && providerInputs.length > 0 && providerInputs.map((input) => (

              <div key={input._id}>
                {input.weight != 0 ?
                  <div className='grid grid-cols-12 items-center border border-black border-opacity-30 rounded-lg shadow-sm mb-2 py-3'>
                    <div id='list-element' className='flex col-span-12 items-center'>
                      <p className='text-center text-xs w-3/12'>{input.employee.name + ' ' + input.employee.lastName}</p>
                      <p className='text-center text-xs w-3/12'>{input.product.name}</p>
                      <p className='text-center text-xs w-2/12'>{input.pieces}</p>
                      <p className='text-center text-xs w-2/12'>{input.weight}</p>
                      <p className='text-center text-xs w-2/12'>{input.amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                    </div>

                    <div className='col-span-12'>
                      <p className='text-m text-center font-semibold'>{input.comment}</p>
                    </div>

                  </div>
                  : ''}
              </div>
            ))}

          </div>

          {providerInputs && providerInputs.length > 0 ?

            <div className='flex mt-4 border-black border rounded-lg p-3 shadow-lg border-opacity-30'>
              <p className='w-6/12 text-center'>Total:</p>
              <p className='w-6/12 text-center font-bold'>{providerInputsTotal.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>

            </div>

            : ''}
        </div>

        : ''}

      {outputs && outputs.length > 0 ?
        <div className='border bg-white p-3 mt-4'>

          <div className='flex gap-4 display-flex justify-between' onClick={() => setOutputsIsOpen(!outputsIsOpen)} >

            <SectionHeader label={'Salidas'} />
            {outputsIsOpen ? <MdKeyboardArrowDown className='text-5xl' /> : <MdKeyboardArrowRight className='text-5xl' />}

          </div>

          <div className={outputsIsOpen ? '' : 'hidden'} >

            <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
              <p className='col-span-3 text-center'>Supervisor</p>
              <p className='col-span-3 text-center'>Producto</p>
              <p className='col-span-2 text-center'>Piezas</p>
              <p className='col-span-2 text-center'>Kg</p>
              <p className='col-span-2 text-center'>Monto</p>
            </div>

            {outputs && outputs.length > 0 && outputs.map((output) => (


              <div key={output._id} className={(output.specialPrice ? 'border border-red-500' : 'border border-black') + ' grid grid-cols-12 items-center border-opacity-70 rounded-lg shadow-sm mb-2 py-3'}>
                <div id='list-element' className='flex col-span-12 items-center '>
                  <p className='text-center text-xs w-3/12'>{output.employee.name + ' ' + output.employee.lastName}</p>
                  <p className='text-center text-xs w-3/12'>{output.product.name}</p>
                  <p className='text-center text-xs w-2/12'>{output.pieces}</p>
                  <p className='text-center text-xs w-2/12'>{output.weight}</p>
                  <p className='text-center text-xs w-2/12'>{output.amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                </div>
                <div className='col-span-12'>
                  <p className='text-m text-center font-semibold'>{output.comment}</p>
                </div>
              </div>

            ))}

          </div>
          {outputs && outputs.length > 0 ?

            <div className='flex mt-4 border-black border rounded-lg p-3 border-opacity-30 shadow-lg'>
              <p className='w-6/12 text-center'>Total:</p>
              <p className='w-6/12 text-center font-bold'>{outputsTotal.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>

            </div>

            : ''}
        </div>

        : ''}


      {incomes && incomes.length > 0 ?

        <div className='border bg-white p-3 mt-4'>

          <div className='flex gap-4 display-flex justify-between' onClick={() => setIncomesIsOpen(!incomesIsOpen)} >

            <SectionHeader label={'Dinero Entregado'} />
            {incomesIsOpen ? <MdKeyboardArrowDown className='text-5xl' /> : <MdKeyboardArrowRight className='text-5xl' />}

          </div>

          <div className={incomesIsOpen ? '' : 'hidden'} >

            <div id='income-header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
              <p className='col-span-4 text-center'>Sucursal</p>
              <p className='col-span-2 text-center'>Tipo</p>
              <p className='col-span-3 text-center'>Supervisor</p>
              <p className='col-span-3 text-center'>Monto</p>
            </div>

            {incomes && incomes.length > 0 && incomes.map((income) => (


              <div key={incomes._id} className='grid grid-cols-12 items-center my-2 py-3 border border-black border-opacity-30 shadow-sm rounded-lg'>

                <div id='list-element' className=' flex col-span-12 items-center'>
                  <p className='text-center text-xs w-4/12'>{income.branch.branch}</p>
                  <p className='text-center text-xs w-2/12 truncate'>{income.type.name ? income.type.name : income.type}</p>
                  <p className='text-center text-xs w-3/12 truncate'>{income.employee.name}</p>
                  <p className='text-center text-xs w-3/12'>{income.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                </div>

              </div>

            ))}

          </div>

          {incomes && incomes.length > 0 ?

            <div className='flex mt-4 border-black border rounded-lg p-3 border-opacity-30 shadow-lg'>
              <p className='w-6/12 text-center'>Total:</p>
              <p className='w-6/12 text-center font-bold'>{incomesTotal.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>

            </div>

            : ''}
        </div>
        : ''}

      <div className='flex flex-col gap-4 mt-4'>

        {branchReport && branchReport._id ?

          <div>

            {managerRole._id == currentUser.role ?

              <button disabled={loading} className='bg-slate-600 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80' onClick={() => handleUpdate()}>Actualizar formato</button>

              : ''}

          </div>
          :

          <button disabled={loading} className='bg-slate-600 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80' onClick={() => handleSubmit()}>Enviar formato</button>
        }


      </div>

      <p className='text-red-700 font-semibold'>{error}</p>
    </main>
  )
}
