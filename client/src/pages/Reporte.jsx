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
import PieChart from "../components/Charts/PieChart";
import RegistrarDineroReportado from "../components/RegistrarDineroReportado";
import EmployeeMultiSelect from "../components/Select/EmployeeMultiSelect";

export default function Reporte() {

  const { company, currentUser } = useSelector((state) => state.user)
  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const [supervisorsInfo, setSupervisorsInfo] = useState([])
  const [generalInfo, setGeneralInfo] = useState(null)
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
  const [selectedSupervisors, setSelectedSupervisors] = useState([])
  const [employees, setEmployees] = useState([])
  const {

    branchReports,
    getBranchReports,
    totalIncomes,
    totalStock,
    totalOutgoings,
    totalBalance,

  } = useBranchReports({ companyId: company._id, date: stringDatePickerValue })
  const navigate = useNavigate()
  const [pieChartInfo, setPieChartInfo] = useState([])

  const updateReportedIncomes = ({ reportedIncome, prevReportedIncome }) => {

    setGeneralInfo((prev) => {

      const newReportedIncomes = prev.reportedIncomes + (reportedIncome - prevReportedIncome)

      return {
        reportedIncomes: newReportedIncomes,
        missingIncomes: prev.missingIncomes - (reportedIncome - prevReportedIncome),
        deposits: prev.deposits,
        extraOutgoings: prev.extraOutgoings,
        grossCashIncomes: prev.grossCashIncomes,
        netIncomes: prev.netIncomes
      }
    })
  }

  useEffect(() => {

    if (!supervisorsInfo.length > 0 || !generalInfo) return

    const cashInfo = {
      label: 'Ingresos netos reportados',
      value: generalInfo.reportedIncomes <= generalInfo.deposits ? 0 : generalInfo.reportedIncomes <= generalInfo.netIncomes ? generalInfo.reportedIncomes - generalInfo.deposits : generalInfo.netIncomes - generalInfo.deposits,
      bgColor: '#4CAF50',
      borderColor: '#206e09',
      hoverBgColor: '#24d111'
    }

    const extraCash = {

      label: 'Ingresos sobrantes',
      value: generalInfo.reportedIncomes > generalInfo.netIncomes ? generalInfo.reportedIncomes - generalInfo.netIncomes : 0,
      bgColor: '#FFF',
      borderColor: '#000',
      hoverBgColor: '#fff'
    }

    const depositsInfo = {
      label: 'Depósitos',
      value: generalInfo.reportedIncomes <= generalInfo.deposits ? generalInfo.reportedIncomes : generalInfo.deposits,
      bgColor: '#56a0db',
      borderColor: '#0c4e82',
      hoverBgColor: '#0091ff'
    }

    const extraOutgoingsInfo = {
      label: 'Gastos fuera de cuentas',
      value: generalInfo.extraOutgoings,
      bgColor: '#f0e795',
      borderColor: '#736809',
      hoverBgColor: '#ffe600'
    }

    const missingAmount = {
      label: 'Ingresos sin reportar',
      value: generalInfo.missingIncomes < 0 ? 0 : generalInfo.missingIncomes,
      bgColor: '#a85959',
      borderColor: '#801313',
      hoverBgColor: '#ff0000'
    }

    setPieChartInfo([cashInfo, extraCash, depositsInfo, extraOutgoingsInfo, missingAmount])

  }, [supervisorsInfo, generalInfo])

  useEffect(() => {

    if (!supervisorsInfo || !supervisorsInfo.length > 0) return

    setEmployees(supervisorsInfo.map((supervisorInfo) => ({
      value: supervisorInfo.supervisor._id,
      label: `${supervisorInfo.supervisor.name} ${supervisorInfo.supervisor.lastName}`
    })))

  }, [supervisorsInfo])

  const changeDatePickerValue = (e) => {

    stringDatePickerValue = (e.target.value + 'T06:00:00.000Z')
    navigate('/reporte/' + stringDatePickerValue)

  }

  const changeDay = (date) => {

    navigate('/reporte/' + date)

  }

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
    setSelectedSupervisors([])

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
        setGeneralInfo(data.generalInfo)
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
                          <p className={`${branchReport.employee ? 'text-gray-700' : 'text-red-600'} text-sm`}>{branchReport.branch.branch}</p>
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
        <div className="items-center">

          <div className="my-2 mx-auto">

            <h3 className="text-3xl font-bold">Ingresos obtenidos por pollerías</h3>
            <div>
              <h4 className="text-2xl font-bold">Brutos: {stringToCurrency({ amount: generalInfo.grossCashIncomes + generalInfo.deposits })}</h4>
              <div className="flex gap-3">
                <p className="font-bold">Efectivo: <span style={{ color: '#206e09' }}>{`${stringToCurrency({ amount: generalInfo.grossCashIncomes })}`} </span></p>
                <p className="font-bold">Depósitos: <span style={{ color: '#0c4e82' }}>{`${stringToCurrency({ amount: generalInfo.deposits })}`}</span></p>
              </div>
            </div>
            <h4 className="text-2xl font-bold mb-3">Netos: {stringToCurrency({ amount: (generalInfo.netIncomes) })}</h4>

            <PieChart chartInfo={pieChartInfo}></PieChart>
          </div>


          <div className="my-1 border border-slate-500 border-spacing-4 p-2 mt-0 sticky top-0 bg-white z-5 rounded-lg mb-5">
            <div id="filterBySupervisor" className="w-full">
              <p className="text-lg font-semibold p-3 text-red-600">Filtro de Supervisores</p>
              <EmployeeMultiSelect employees={employees} setSelectedEmployees={setSelectedSupervisors}></EmployeeMultiSelect>

            </div>

            {selectedSupervisors && supervisorsInfo.map((supervisorInfo) => (
              <div key={supervisorInfo.supervisor._id}>

                {selectedSupervisors.some(supervisor => supervisor.value === supervisorInfo.supervisor._id) || selectedSupervisors.length == 0 ?
                  <div className='border bg-white p-3 mt-4 rounded-lg border-black'>

                    {error ? <p>{error}</p> : ''}
                    <div className="">

                      <div className="grid grid-cols-1">

                        <p className="text-2xl font-semibold my-4 col-span-1">{supervisorInfo.supervisor.name + ' ' + supervisorInfo.supervisor.lastName}</p>

                        <div className="">
                          <p className="text-lg"><span className="font-bold">Depósitos: </span>{stringToCurrency({ amount: supervisorInfo.supervisor.deposits })}</p>
                          <p className="text-lg"><span className="font-bold">Efectivo: </span>{stringToCurrency({ amount: supervisorInfo.supervisor.cash })}</p>
                          <p className="text-lg"><span className="font-bold">Gastos: </span>{stringToCurrency({ amount: supervisorInfo.supervisor.extraOutgoings })}</p>
                          <p className="text-lg"><span className="font-bold">Efectivo neto: </span>{(supervisorInfo.supervisor.cash - supervisorInfo.supervisor.extraOutgoings).toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                          <RegistrarDineroReportado updateReportedIncomes={updateReportedIncomes} supervisorId={supervisorInfo.supervisor._id} date={stringDatePickerValue}></RegistrarDineroReportado>
                        </div>
                      </div>

                      <div className="p-3 mt-6">

                        <div className="flex justify-between p-3 gap-4">

                          <button className="m-auto border border-black border-opacity-20 shadow-lg rounded-3xl w-10/12 p-3" onClick={() => { cashIsOpenFunctionControl(supervisorInfo.supervisor.cashArray.length, supervisorInfo.supervisor._id) }}>

                            <p className="text-lg">Efectivo bruto</p>
                            <p>{stringToCurrency({ amount: supervisorInfo.supervisor.cash })}</p>
                          </button>

                          <button className="m-auto border border-black border-opacity-20 shadow-lg rounded-3xl w-10/12 p-3" onClick={() => { depositsIsOpenFunctionControl(supervisorInfo.supervisor.depositsArray.length, supervisorInfo.supervisor._id) }}>

                            <p className="text-lg">Depósitos</p>
                            <p>{stringToCurrency({ amount: supervisorInfo.supervisor.deposits })}</p>
                          </button>

                          <button className="m-auto border border-black border-opacity-20 shadow-lg rounded-3xl p-3 w-10/12" onClick={() => { extraOutgoingsIsOpenFunctionControl(supervisorInfo.supervisor.extraOutgoingsArray.length, supervisorInfo.supervisor._id) }}>
                            <p className="text-lg">Gastos</p>
                            <p>{stringToCurrency({ amount: supervisorInfo.supervisor.extraOutgoings })}</p>
                          </button>
                        </div>

                        {supervisorInfo.supervisor && extraOutgoingsIsOpen && supervisorInfo.supervisor._id == selectedSupervisor ?

                          <div className={extraOutgoingsIsOpen ? '' : 'hidden'}>

                            {supervisorInfo.supervisor && supervisorInfo.supervisor.extraOutgoingsArray && supervisorInfo.supervisor.extraOutgoingsArray.length > 0 ?
                              <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
                                <p className='p-3 rounded-lg col-span-5 text-center bg-white'>Concepto</p>
                                <p className='p-3 rounded-lg col-span-5 text-center bg-white'>Monto</p>
                              </div>
                              : ''}

                            {supervisorInfo.supervisor && supervisorInfo.supervisor.extraOutgoingsArray && supervisorInfo.supervisor.extraOutgoingsArray.length > 0 && supervisorInfo.supervisor.extraOutgoingsArray.map((extraOutgoing) => (

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

                            {supervisorInfo.supervisor && cashIsOpen && supervisorInfo.supervisor.cashArray.length > 0 && supervisorInfo.supervisor.cashArray.map((income) => (
                              <div key={income._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 mt-2 shadow-m rounded-lg'>
                                <div id='list-element' className=' flex col-span-12 items-center justify-around pt-3 pb-3'>
                                  <p className='text-center text-xs w-4/12'>{income.branch.branch ? income.branch.branch : income.branch}</p>
                                  <p className='text-center text-xs w-4/12'>{income.type.name ? income.type.name : income.type}</p>
                                  <p className='text-center text-xs w-4/12'>{income.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                                </div>
                              </div>
                            ))}
                            {supervisorInfo.supervisor && depositsIsOpen && supervisorInfo.supervisor.depositsArray.length > 0 && supervisorInfo.supervisor.depositsArray.map((income) => (
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
        </div>

        : ''}
    </main >
  )
}
