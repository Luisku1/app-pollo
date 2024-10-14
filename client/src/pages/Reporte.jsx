import { IoReload } from "react-icons/io5";
import { useEffect, useState } from "react"
import { FaCheck } from "react-icons/fa"
import { useSelector } from "react-redux"
import { useParams, useNavigate, Link } from "react-router-dom"
import FechaDePagina from "../components/FechaDePagina"
import { formatDate } from "../helpers/DatePickerFunctions"
import TarjetaCuenta from "../components/TarjetaCuenta"
import Sobrante from "../pages/Sobrante"
import { useBranchReports } from "../hooks/BranchReports.js/useBranchReports";
import { stringToCurrency } from "../helpers/Functions";

export default function Reporte() {

  const { company, currentUser } = useSelector((state) => state.user)
  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const [supervisorsInfo, setSupervisorsInfo] = useState([])
  const [error, setError] = useState(null)
  const [extraOutgoingsIsOpen, setExtraOutgoingsIsOpen] = useState(false)
  const [cashIsOpen, setCashIsOpen] = useState(false)
  const [depositsIsOpen, setDepositsIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedSupervisor, setSelectedSupervisor] = useState(null)
  const [managerRole, setManagerRole] = useState({})
  const [showTable, setShowTable] = useState(true)
  const [showCards, setShowCards] = useState(false)
  const [showStock, setShowStock] = useState(false)
  const [showOutgoings, setShowOutgoings] = useState(false)
  const [showEarnings, setShowEarnings] = useState(false)
  const [filteredIds, setFilteredIds] = useState([])
  const [all, setAll] = useState(true)
  const {

    branchReports,
    getBranchReports,
    totalIncomes,
    totalStock,
    totalOutgoings,
    totalBalance,

  } = useBranchReports({ companyId: company._id, date: stringDatePickerValue })
  const navigate = useNavigate()

  const changeDatePickerValue = (e) => {

    stringDatePickerValue = (e.target.value + 'T06:00:00.000Z')
    navigate('/reporte/' + stringDatePickerValue)

  }

  const changeDay = (date) => {

    navigate('/reporte/' + date)

  }

  const selectAllSupervisorsCheckbox = () => {

    setAll((prev) => !prev)

    filteredIds.forEach((supervisorId) => {

      const checkbox = document.getElementById(supervisorId)

      checkbox.checked = !checkbox.checked
    })
  }

  const supervisorFilter = (e) => {

    const allCheckbox = document.getElementById('all')

    if (!e.target.checked) {

      if (filteredIds.length == 1) {

        allCheckbox.checked = !allCheckbox.checked
        setAll(prev => !prev)
        setFilteredIds([])

      } else {

        const newFilteredIdsArray = filteredIds.map((supervisorId) => {

          if (supervisorId != e.target.value) {

            return supervisorId
          }
        })

        setFilteredIds(newFilteredIdsArray)

      }
    } else {

      setFilteredIds([e.target.value, ...filteredIds])
      allCheckbox.checked = false
      setAll(false)
    }
  }

  useEffect(() => {


  }, [filteredIds, supervisorsInfo])

  const handleShowCardsButton = () => {

    setShowCards(true)
    setShowTable(false)
    setShowStock(false)
    setShowOutgoings(false)
    setShowEarnings(false)

  }

  const handleShowTableButton = () => {

    setShowTable(true)
    setShowCards(false)
    setShowStock(false)
    setShowOutgoings(false)
    setShowEarnings(false)
  }

  const handleShowStockButton = () => {

    setShowStock(true)
    setShowTable(false)
    setShowCards(false)
    setShowOutgoings(false)
    setShowEarnings(false)
  }

  const handleShowOutgoingButton = () => {

    setShowOutgoings(true)
    setShowTable(false)
    setShowCards(false)
    setShowStock(false)
    setShowEarnings(false)
  }

  const handleShowEarningsButton = () => {

    setShowTable(false)
    setShowCards(false)
    setShowStock(false)
    setShowOutgoings(false)
    setShowEarnings(true)
  }

  const extraOutgoingsIsOpenFunctionControl = (arrayLength, selectedSupervisorId) => {

    if (arrayLength > 0) {

      if (cashIsOpen || depositsIsOpen) {

        setCashIsOpen(false)
        setDepositsIsOpen(false)
      }

      if (selectedSupervisorId == selectedSupervisor) {

        setExtraOutgoingsIsOpen((prev) => !prev)

      } else {

        if (!(selectedSupervisor == null)) {

          if (selectedSupervisor != selectedSupervisorId && !extraOutgoingsIsOpen) {
            setExtraOutgoingsIsOpen((prev) => !prev)
          }

        } else {

          setExtraOutgoingsIsOpen((prev) => !prev)
        }

        setSelectedSupervisor(selectedSupervisorId)
      }
    }
  }

  const cashIsOpenFunctionControl = (arrayLength, selectedSupervisorId) => {

    if (arrayLength > 0) {

      if (extraOutgoingsIsOpen || depositsIsOpen) {

        setExtraOutgoingsIsOpen(false)
        setDepositsIsOpen(false)

      }

      if (selectedSupervisorId == selectedSupervisor) {

        setCashIsOpen((prev) => !prev)

      } else {

        if (!(selectedSupervisor == null)) {

          if (selectedSupervisor != selectedSupervisorId && !cashIsOpen) {
            setCashIsOpen((prev) => !prev)
          }

        } else {

          setCashIsOpen((prev) => !prev)
        }

        setSelectedSupervisor(selectedSupervisorId)
      }
    }
  }

  const depositsIsOpenFunctionControl = (arrayLength, selectedSupervisorId) => {

    if (arrayLength > 0) {

      if (extraOutgoingsIsOpen || cashIsOpen) {

        setExtraOutgoingsIsOpen(false)
        setCashIsOpen(false)

      }

      if (selectedSupervisorId == selectedSupervisor) {

        setDepositsIsOpen((prev) => !prev)

      } else {

        if (!(selectedSupervisor == null)) {

          if (selectedSupervisor != selectedSupervisorId && !depositsIsOpen) {
            setDepositsIsOpen((prev) => !prev)

          }

        } else {

          setDepositsIsOpen((prev) => !prev)
        }

        setSelectedSupervisor(selectedSupervisorId)
      }
    }
  }

  useEffect(() => {

    setSupervisorsInfo([])
    setAll(true)
    setFilteredIds([])

    const fetchSupervisorsInfo = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setLoading(true)

      try {

        const res = await fetch('/api/report/get-supervisors-info/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        setSupervisorsInfo(data.supervisors)
        setLoading(false)
        setError(null)

      } catch (error) {

        setLoading(false)
        setError(error.message)
      }
    }

    fetchSupervisorsInfo()


  }, [company, stringDatePickerValue])

  useEffect(() => {

    const setManagerRoleFunction = (roles) => {

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
        setManagerRoleFunction(data.roles)
        setError(null)

      } catch (error) {

        setError(error.message)


      }
    }

    fetchRoles()

  }, [])

  useEffect(() => {

    if (Object.getOwnPropertyNames(managerRole).length > 0 && Object.getOwnPropertyNames(currentUser).length > 0) {

      if (managerRole._id != currentUser.role) {

        handleShowStockButton()
      }
    }

  }, [currentUser, managerRole])

  useEffect(() => {

    document.title = 'Reporte (' + new Date(stringDatePickerValue).toLocaleDateString() + ')'
  })

  return (

    <main className="p-3 max-w-lg mx-auto">

      <FechaDePagina changeDay={changeDay} stringDatePickerValue={stringDatePickerValue} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Reporte
      </h1>


      {branchReports && branchReports.length > 0 ?

        <div>
          <div>
            <div>
              <div className="grid grid-cols-5 border bg-white border-black mx-auto my-auto w-full rounded-lg font-bold">
                <button className={"h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showTable ? 'bg-slate-500 text-white' : 'bg-white')} disabled={currentUser.role != managerRole._id} onClick={() => { handleShowTableButton() }}>Tabla</button>
                <button className={"h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showStock ? 'bg-slate-500 text-white' : ' bg-white')} onClick={() => { handleShowStockButton() }}>Sobrante</button>
                <button className={"h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showEarnings ? 'bg-slate-500 text-white' : ' bg-white')} disabled={currentUser.role != managerRole._id} onClick={() => { handleShowEarningsButton() }}>Efectivos</button>
                <button className={"h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showOutgoings ? 'bg-slate-500 text-white' : ' bg-white')} disabled={currentUser.role != managerRole._id} onClick={() => { handleShowOutgoingButton() }}>Gastos</button>
                <button className={"h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showCards ? 'bg-slate-500 text-white' : ' bg-white')} disabled={currentUser.role != managerRole._id} onClick={() => { handleShowCardsButton() }}>Tarjetas</button>
              </div>
              <div className="grid grid-cols-3 mt-3 items-center">
                <p className="col-span-1 font-bold">{'Formatos: ' + branchReports.length + '/20'}</p>
                <div className="col-span-2 justify-self-end flex items-center">
                  <p className="font-semibold">Recargar formatos:</p>
                  <button className="text-black h-10 px-8" onClick={() => getBranchReports({ companyId: company._id, date: stringDatePickerValue })}><IoReload className="w-full h-full" /></button>
                </div>
              </div>
              <table className={'border mt-2 bg-white w-full ' + (!showTable ? 'hidden' : '')}>

                <thead className="border border-black">

                  <tr>
                    {/* <th></th> */}
                    <th className="text-sm">Sucursal</th>
                    <th className="text-sm">
                      <Link className="flex justify-center" to={'/gastos/' + stringDatePickerValue}>
                        Gastos
                      </Link>
                    </th>
                    <th className="text-sm">
                      <Link className="flex justify-center" to={'/sobrante/' + stringDatePickerValue}>
                        Sobrante
                      </Link>
                    </th>
                    <th className="text-sm">Efectivo</th>
                    <th className="text-sm">Balance</th>
                  </tr>
                </thead>

                {branchReports.map((branchReport, index) => (

                  <tbody key={branchReport._id} className="">


                    <tr className={'border-x ' + (index + 1 != branchReports.length ? "border-b " : '') + 'border-black border-opacity-40'}>
                      <td className="group">
                        <Link className='' to={'/formato/' + branchReport.createdAt + '/' + branchReport.branch._id}>
                          <p className=" text-sm">{branchReport.branch.branch}</p>
                          <div className="hidden group-hover:block group-hover:fixed group-hover:overflow-hidden group-hover:mt-2 ml-24 bg-slate-600 text-white shadow-2xl rounded-md p-2">
                            <p>{branchReport.employee != null ? branchReport.employee.name + ' ' + branchReport.employee.lastName : 'Sin empleado'}</p>
                            {branchReport.assistant != null ?

                              <p>{branchReport.assistant.name + ' ' + branchReport.assistant.lastName}</p>
                              : ''}
                          </div>
                        </Link>
                      </td>
                      <td className="text-center text-sm">{branchReport.outgoings.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</td>
                      <td className="text-center text-sm">{branchReport.finalStock.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</td>
                      <td className="text-center text-sm">{branchReport.incomes.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</td>
                      <td className={(branchReport.balance < 0 ? 'text-red-500' : 'text-green-500') + ' text-center text-sm'}>{branchReport.balance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} </td>
                    </tr>
                  </tbody>
                ))}


                <tfoot className="border border-black text-sm">
                  <tr className="mt-2">
                    <td className="text-center text-m font-bold">Totales:</td>
                    <td className="text-center text-m font-bold">{stringToCurrency({ amount: totalOutgoings ?? 0 })}</td>
                    <td className="text-center text-m font-bold">{totalStock.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                    <td className="text-center text-m font-bold">{totalIncomes.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                    <td className={(totalBalance < 0 ? 'text-red-500' : 'text-green-500') + ' text-center text-m font-bold'}>{totalBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                  </tr>
                </tfoot>

              </table>

              <div className={!showStock ? 'hidden' : ''}>
                <Sobrante date={stringDatePickerValue}></Sobrante>
              </div>

              <div className={!showCards ? 'hidden' : ''} >
                <TarjetaCuenta reportArray={branchReports} managerRole={managerRole} currentUser={currentUser}></TarjetaCuenta>
              </div>
            </div>
          </div>

        </div>
        : ''}

      {supervisorsInfo && showTable && supervisorsInfo.length > 0 ?
        <div className="bg-white mt-3 absolute max-w-lg">

          <div className="my-1 border border-slate-500 border-spacing-4 p-2 m-auto sticky top-0 bg-white z-5">
            <div id="filterBySupervisor" className="flex flex-wrap gap-1 justify-evenly">
              <div className="grid grid-cols-1 ">
                <p className="font-bold text-red-500">{'Todos'}</p>
                <input type="checkbox" name={'all'} id={'all'} value={'all'} defaultChecked={true} onChange={selectAllSupervisorsCheckbox} />
              </div>
              {supervisorsInfo.map((supervisorReport) => (
                <div key={supervisorReport.supervisor._id} className="grid grid-cols-1">
                  <p className="font-bold">{supervisorReport.supervisor.name}</p>
                  <input type="checkbox" name={supervisorReport.supervisor._id} id={supervisorReport.supervisor._id} value={supervisorReport.supervisor._id} onChange={supervisorFilter} />
                </div>
              ))}
            </div>
          </div>

          {filteredIds && supervisorsInfo.map((supervisorInfo) => (
            <div key={supervisorInfo.supervisor._id}>

              {filteredIds && filteredIds.includes(supervisorInfo.supervisor._id) || all ?
                <div className='border bg-white p-3 mt-4'>

                  {error ? <p>{error}</p> : ''}
                  <div className="">

                    <div className="flex gap-4">

                      <p className="text-2xl font-semibold">{supervisorInfo.supervisor.name + ' ' + supervisorInfo.supervisor.lastName}</p>

                      <div className="grid grid-rows-1">
                        <p className="text-lg">Depósitos: {stringToCurrency({ amount: supervisorInfo.supervisor.totalDeposits })}</p>
                        <p className="text-lg">Efectivo: {stringToCurrency({ amount: supervisorInfo.supervisor.totalCash })}</p>
                        <p className="text-lg">Gastos: {stringToCurrency({ amount: supervisorInfo.supervisor.totalExtraOutgoings })}</p>
                        <p className="text-lg">Efectivo neto: {(supervisorInfo.supervisor.totalCash - supervisorInfo.supervisor.totalExtraOutgoings).toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                      </div>
                    </div>

                    <div className="p-3 mt-6">

                      <div className="flex justify-between p-3 gap-4">

                        <button className="m-auto border border-black border-opacity-20 shadow-lg rounded-3xl w-10/12 p-3" onClick={() => { cashIsOpenFunctionControl(supervisorInfo.supervisor.cash.length, supervisorInfo.supervisor._id) }}>

                          <p className="text-lg">Efectivo bruto</p>
                          <p>{stringToCurrency({ amount: supervisorInfo.supervisor.totalCash })}</p>
                        </button>

                        <button className="m-auto border border-black border-opacity-20 shadow-lg rounded-3xl w-10/12 p-3" onClick={() => { depositsIsOpenFunctionControl(supervisorInfo.supervisor.deposits.length, supervisorInfo.supervisor._id) }}>

                          <p className="text-lg">Depósitos</p>
                          <p>{stringToCurrency({ amount: supervisorInfo.supervisor.totalDeposits })}</p>
                        </button>

                        <button className="m-auto border border-black border-opacity-20 shadow-lg rounded-3xl p-3 w-10/12" onClick={() => { extraOutgoingsIsOpenFunctionControl(supervisorInfo.supervisor.extraOutgoings.length, supervisorInfo.supervisor._id) }}>
                          <p className="text-lg">Gastos</p>
                          <p>{stringToCurrency({ amount: supervisorInfo.supervisor.totalExtraOutgoings })}</p>
                        </button>
                      </div>

                      {supervisorInfo.supervisor && extraOutgoingsIsOpen && supervisorInfo.supervisor._id == selectedSupervisor ?

                        <div className={extraOutgoingsIsOpen ? '' : 'hidden'}>

                          {supervisorInfo.supervisor && supervisorInfo.supervisor.extraOutgoings && supervisorInfo.supervisor.extraOutgoings.length > 0 ?
                            <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
                              <p className='p-3 rounded-lg col-span-5 text-center bg-white'>Concepto</p>
                              <p className='p-3 rounded-lg col-span-5 text-center bg-white'>Monto</p>
                            </div>
                            : ''}

                          {supervisorInfo.supervisor && supervisorInfo.supervisor.extraOutgoings && supervisorInfo.supervisor.extraOutgoings.length > 0 && supervisorInfo.supervisor.extraOutgoings.map((extraOutgoing) => (

                            <div key={extraOutgoing._id} >
                              <div className={'py-3 grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

                                <div id='list-element' className='flex col-span-10 items-center justify-around'>
                                  <p className='text-center text-sm w-5/12'>{extraOutgoing.concept}</p>
                                  <p className='text-center text-sm w-5/12'>{extraOutgoing.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                                </div>

                                <div>
                                  <button id={extraOutgoing._id} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                                    <span>
                                      <FaCheck className='text-green-700 m-auto' />
                                    </span>
                                  </button>

                                </div>

                              </div>
                            </div>

                          ))}

                        </div>

                        : ''}


                      {supervisorInfo.supervisor && (cashIsOpen || depositsIsOpen) && supervisorInfo.supervisor._id == selectedSupervisor ?

                        <div className={(cashIsOpen || depositsIsOpen) ? '' : 'hidden'} >


                          <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
                            <p className='col-span-4 text-center'>Sucursal</p>
                            <p className='col-span-4 text-center'>Tipo</p>
                            <p className='col-span-4 text-center'>Monto</p>
                          </div>

                          {supervisorInfo.supervisor && cashIsOpen && supervisorInfo.supervisor.cash.length > 0 && supervisorInfo.supervisor.cash.map((income) => (

                            <div key={income._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 mt-2 shadow-m rounded-lg'>

                              <div id='list-element' className=' flex col-span-12 items-center justify-around pt-3 pb-3'>
                                <p className='text-center text-xs w-4/12'>{income.branch.branch ? income.branch.branch : income.branch}</p>
                                <p className='text-center text-xs w-4/12'>{income.type.name ? income.type.name : income.type}</p>
                                <p className='text-center text-xs w-4/12'>{income.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                              </div>

                            </div>

                          ))}

                          {supervisorInfo.supervisor && depositsIsOpen && supervisorInfo.supervisor.deposits.length > 0 && supervisorInfo.supervisor.deposits.map((income) => (

                            <div key={income._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 mt-2 shadow-m rounded-lg'>

                              <div id='list-element' className=' flex col-span-12 items-center justify-around pt-3 pb-3'>
                                <p className='text-center text-xs w-4/12'>{income.branch.branch ? income.branch.branch : income.branch}</p>
                                <p className='text-center text-xs w-4/12'>{income.type.name ? income.type.name : income.type}</p>
                                <p className='text-center text-xs w-4/12'>{income.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                              </div>

                            </div>

                          ))}


                        </div>
                        : ''}
                    </div>

                  </div>
                </div>
                : ''}
            </div>

          ))
          }

        </div>
        : ''}
    </main >
  )
}
