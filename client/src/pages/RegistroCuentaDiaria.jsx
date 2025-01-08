/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom';
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md';
import FechaDePagina from '../components/FechaDePagina';
import { formatDate } from '../helpers/DatePickerFunctions';
import { useEmployees } from '../hooks/Employees/useEmployees';
import EmployeesSelect from '../components/Select/EmployeesSelect';
import { useBranches } from '../hooks/Branches/useBranches';
import { useBranchReport } from '../hooks/BranchReports.js/useBranchReport';
import { useLoading } from '../hooks/loading';
import Loading from '../helpers/Loading';
import { useBranchPrices } from '../hooks/Prices/useBranchPrices';
import { useRoles } from '../context/RolesContext'
import BranchSelect from '../components/RegistrarFormato/BranchSelect';
import AddStock from '../components/Stock/AddStock';
import AddOutgoing from '../components/Outgoings/AddOutgoing';
import { useProducts } from '../hooks/Products/useProducts';
import ProviderInputsList from '../components/Proveedores/ProviderInputsList';
import BranchPrices from '../components/Prices/BranchPrices';

export default function RegistroCuentaDiaria() {

  const { currentUser, company } = useSelector((state) => state.user)
  const paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  let today = formatDate(datePickerValue) == formatDate(new Date()) ? true : false
  const [branchId, setBranchId] = useState(useParams().branchId || null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { employees } = useEmployees({ companyId: company._id })
  const { branches } = useBranches({ companyId: company._id })
  const { branchPrices } = useBranchPrices({ branchId, date: stringDatePickerValue })
  const { roles } = useRoles()
  const [inputsIsOpen, setInputsIsOpen] = useState(false)
  const [outputsIsOpen, setOutputsIsOpen] = useState(false)
  const [incomesIsOpen, setIncomesIsOpen] = useState(false)
  const { products } = useProducts({ companyId: company._id })
  const [selectedEmployee, setSelectedEmployee] = useState()
  const [selectedAssistant, setSelectedAssistant] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [autoChangeEmployee, setAutoChangeEmployee] = useState(true)
  const [selectBranch, setSelectBranch] = useState(false)
  const navigate = useNavigate()
  const reportDate = (paramsDate ? new Date(paramsDate) : new Date()).toLocaleDateString('es-mx', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })
  const {
    branchReport,
    initialStock,
    initialStockTotal,
    incomes,
    incomesTotal,
    inputs,
    inputsAmount: inputsTotal,
    inputsWeight,
    outputs,
    outputsAmount: outputsTotal,
    outputsWeight,
    providerInputs,
    providerInputsAmount: providerInputsTotal,
    providerInputsWeight,
    stock,
    totalStock,
    onAddStock,
    onDeleteStock,
    outgoings,
    outgoingsTotal,
    onAddOutgoing,
    onDeleteOutgoing
  } = useBranchReport({ branchId, date: stringDatePickerValue })

  const isLoading = useLoading()

  useEffect(() => {

    if (!branchId) {
      setSelectBranch(true)
    }

  }, [branchId])

  const handleEmployeeSelectChange = (employee) => {

    setAutoChangeEmployee(false)
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
          employee: selectedEmployee._id,
          assistant: assistant,
          branch: selectedBranch.value,
          company: company._id,
          initialStock: initialStock,
          finalStock: totalStock,
          inputs: inputsTotal,
          providerInputs: providerInputsTotal,
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

      navigate('/perfil/' + selectedEmployee._id)

    } catch (error) {

      setError(error.message)
      setLoading(false)

    }

  }

  const handleUpdate = async () => {

    setLoading(true)
    const assistant = selectedAssistant == null ? null : selectedAssistant._id

    try {

      const res = await fetch('/api/branch/report/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branchReport: branchReport,
          employee: selectedEmployee._id,
          assistant: assistant,
          initialStock: branchReport.initialStock != 0 ? initialStock : initialStock,
          finalStock: totalStock,
          inputs: inputsWeight,
          providerInputs: providerInputsTotal,
          outputs: outputsWeight,
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

      navigate('/perfil/' + selectedEmployee._id)

    } catch (error) {

      setLoading(false)
      setError(error.message)

    }
  }

  useEffect(() => {


    if (!employees.length > 0 || !branchReport) return

    if (branchReport.employee) {

      const employeeTempOption = employees.find((employee) =>

        employee._id == branchReport.employee
      )

      if (employeeTempOption) {

        setSelectedEmployee(employeeTempOption)

      }

    } else {

      if (autoChangeEmployee) {

        setSelectedEmployee(currentUser)
      }
    }

    const assistantTempOption = employees.find((assistant) => assistant._id == branchReport.assistant)


    if (assistantTempOption) {

      setSelectedAssistant(assistantTempOption)

    } else {

      setSelectedAssistant(null)
    }

  }, [branchReport, employees, currentUser, autoChangeEmployee])

  useEffect(() => {

    if (!branchId || !branches) return

    branches.forEach(branch => {

      if (branchId == branch.value) {

        setSelectedBranch(branch)
      }
    })
  }, [branchId, branches])

  useEffect(() => {

    if (selectedBranch != null && stringDatePickerValue != null) {

      document.title = selectedBranch.label + ' ' + '(' + (new Date(stringDatePickerValue).toLocaleDateString()) + ')'
    }
  }, [selectedBranch, stringDatePickerValue])

  return (
    <main className="p-3 max-w-lg mx-auto">
      {roles && (
        <div>
          {isLoading ?
            <Loading></Loading>
            : ''}
          {roles.managerRole._id == currentUser.role ?
            <FechaDePagina changeDay={changeDay} stringDatePickerValue={stringDatePickerValue} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>
            : ''}
          <h1 className='text-3xl text-center font-semibold mt-7'>
            Formato
            <br />
          </h1>
          <p className='text-center mb-7'>{reportDate}</p>
          <SectionHeader label={'Información básica'} />
          <div className="grid grid-cols-12 items-center mt-1 mb-2">
            <p className='col-span-12 justify-self-center text-lg font-semibold mb-2'>Sucursal</p>
            <div className='col-span-12'>
              <BranchSelect branches={branches} modalStatus={selectBranch} selectedBranch={selectedBranch} ableToClose={selectedBranch ? true : false} selectBranch={handleBranchSelectChange}></BranchSelect>
            </div>
          </div>
          <div className="grid grid-cols-12 items-center mt-1 ">
            <p className='col-span-4'>Encargado:</p>
            <div className='col-span-8'>
              <EmployeesSelect defaultLabel={'Encargado'} employees={employees} selectedEmployee={selectedEmployee} handleEmployeeSelectChange={handleEmployeeSelectChange}></EmployeesSelect>
            </div>
          </div>
          <div className="grid grid-cols-12 items-center mt-1 ">
            <p className='col-span-4'>Auxiliar:</p>
            <div className='col-span-8'>
              <EmployeesSelect defaultLabel={'Sin Auxiliar'} employees={employees} selectedEmployee={selectedAssistant} handleEmployeeSelectChange={handleAssistantSelectChange}></EmployeesSelect>
            </div>
          </div>

          <div>
            <BranchPrices
              prices={branchPrices}
              pricesDate={branchReport.pricesDate ?? branchReport.createdAt}
              branch={branchId}
            />
          </div>

          {branchId ?
            <div>
              <div className="flex items-center justify-between">
                <p>Sobrante inicial: </p>
                <p className=' bg-white p-3 rounded-lg'>{initialStock ? initialStock.toLocaleString("es-Mx", { style: 'currency', currency: 'MXN' }) : '$0.00'}</p>
              </div>
              <AddOutgoing
                outgoings={outgoings}
                employee={selectedEmployee}
                onAddOutgoing={onAddOutgoing}
                onDeleteOutgoing={onDeleteOutgoing}
                outgoingsTotal={outgoingsTotal}
                branch={branchId}
                date={stringDatePickerValue}
              />
              <AddStock
                stock={stock}
                products={products}
                onAddStock={onAddStock}
                onDeleteStock={onDeleteStock}
                branchPrices={branchPrices}
                branch={branchId}
                employee={selectedEmployee}
                date={stringDatePickerValue}
              />
            </div>
            : ''}

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

          <ProviderInputsList
            inputs={providerInputs}
            totalAmount={providerInputsTotal}
            totalWeight={providerInputsWeight}
          />

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
                  <p className='w-6/12 text-center font-bold'>{outputsWeight.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>

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
                      <p className='text-center text-xs w-2/12 truncate'>{income.partOfAPayment ? "Pago" : income.type.name ? income.type.name : income.type}</p>
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

          {branchId ?

            <div className='flex flex-col gap-4 mt-4'>

              {roles && branchReport ?

                <div>

                  {!branchReport.dateSent || currentUser.role == roles.managerRole._id ?

                    <button disabled={loading} className='bg-slate-600 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 w-full' onClick={() => handleUpdate()}>Enviar formato</button>

                    : ''}

                </div>

                :

                <button disabled={loading} className='bg-slate-600 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80' onClick={() => handleSubmit()}>Enviar formato</button>
              }


            </div>

            : ''}
          <p className='text-red-700 font-semibold'>{error}</p>
        </div>
      )}
    </main>
  )
}
