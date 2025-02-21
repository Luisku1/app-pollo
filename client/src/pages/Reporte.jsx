/* eslint-disable react/prop-types */
import { IoReload } from "react-icons/io5";
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams, useNavigate, Link } from "react-router-dom"
import FechaDePagina from "../components/FechaDePagina"
import { formatDate } from "../helpers/DatePickerFunctions"
import TarjetaCuenta from "../components/TarjetaCuenta"
import Sobrante from "../pages/Sobrante"
import { useBranchReports } from "../hooks/BranchReports.js/useBranchReports";
import { getArrayForSelects, stringToCurrency } from "../helpers/Functions";
import PieChart from "../components/Charts/PieChart";
import RegistrarDineroReportado from "../components/RegistrarDineroReportado";
import EmployeeMultiSelect from "../components/Select/EmployeeMultiSelect";
import { useSupervisorsReportInfo } from "../hooks/Supervisors/useSupervisorsReportInfo.js";
import { useRoles } from "../context/RolesContext.jsx";
import ExtraOutgoingsList from "../components/Outgoings/ExtraOutgoingsList.jsx";
import ShowIncomesModal from "../components/Incomes/ShowIncomesModal.jsx";
import ShowListModal from "../components/Modals/ShowListModal.jsx";
import Modal from "../components/Modals/Modal";
import RegistroCuentaDiaria from "./RegistroCuentaDiaria";

export default function Reporte({ untitled = false }) {

  const { company, currentUser } = useSelector((state) => state.user)
  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const { roles } = useRoles()
  const [showTable, setShowTable] = useState(true)
  const [showCards, setShowCards] = useState(false)
  const {
    supervisorsInfo,
    deposits,
    extraOutgoings,
    grossCash,
    missingIncomes,
    setMissingIncomes,
    netIncomes,
    verifiedIncomes,
    setVerifiedIncomes,
    verifiedCash,
    setVerifiedCash,
    verifiedDeposits,
    setVerifiedDeposits,
    cashArray,
    depositsArray,
    extraOutgoingsArray,
    terminalIncomesArray,
    terminalIncomes,
  } = useSupervisorsReportInfo({ companyId: company._id, date: stringDatePickerValue })
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
  const [negativeBalances, setNegativeBalances] = useState(new Set())
  const [selectedBranchReport, setSelectedBranchReport] = useState(null);

  const updateReportedCash = ({ reportedCash, prevReportedCash, prevReportedIncomes }) => {

    setVerifiedIncomes((prev) => (prev + (reportedCash - prevReportedIncomes)))
    setVerifiedCash((prev) => (prev + (reportedCash - prevReportedCash)))
    setMissingIncomes((prev) => (prev - (reportedCash - prevReportedCash)))
  }

  const updateReportedDeposits = ({ reportedDeposits, prevReportedDeposits, prevReportedIncomes }) => {

    setVerifiedIncomes((prev) => (prev + (reportedDeposits - prevReportedIncomes)))
    setVerifiedDeposits((prev) => (prev + (reportedDeposits - prevReportedDeposits)))
    setMissingIncomes((prev) => (prev - (reportedDeposits - prevReportedDeposits)))
  }

  useEffect(() => {

    setEmployees(supervisorsInfo)

  }, [supervisorsInfo])

  useEffect(() => {

    if (supervisorsInfo.length === 0) return

    setPieChartInfo([
      {
        label: 'Ingresos sobrantes',
        value: verifiedIncomes > totalIncomes ? verifiedIncomes - totalIncomes : 0,
        bgColor: '#FFF',
        borderColor: '#000',
        hoverBgColor: '#fff'
      },
      {
        label: 'Efectivos netos verificados',
        value: verifiedCash,
        bgColor: '#4CAF50',
        borderColor: '#206e09',
        hoverBgColor: '#24d111',
        data: cashArray
      },
      {
        label: 'Terminal',
        value: verifiedDeposits <= terminalIncomes ? verifiedDeposits : terminalIncomes,
        bgColor: '#808b96',
        borderColor: '#000',
        hoverBgColor: '#2c3e50',
        data: terminalIncomesArray
      },
      {
        label: 'Depósitos',
        value: verifiedDeposits <= terminalIncomes ? 0 : verifiedDeposits - terminalIncomes,
        bgColor: '#56a0db',
        borderColor: '#0c4e82',
        hoverBgColor: '#0091ff',
        data: depositsArray
      },
      {
        label: 'Gastos fuera de cuentas',
        value: extraOutgoings,
        bgColor: '#f0e795',
        borderColor: '#736809',
        hoverBgColor: '#ffe600',
        data: extraOutgoingsArray
      },
      {
        label: 'Ingresos sin verificar',
        value: missingIncomes < 0 ? 0 : missingIncomes,
        bgColor: '#a85959',
        borderColor: '#801313',
        hoverBgColor: '#ff0000',
        data: [...terminalIncomesArray, ...depositsArray, ...cashArray]
      }
    ])

  }, [supervisorsInfo, deposits, extraOutgoings, missingIncomes, netIncomes, verifiedCash, terminalIncomes, totalIncomes, verifiedDeposits, verifiedIncomes, cashArray, terminalIncomesArray, depositsArray, extraOutgoingsArray])

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

  useEffect(() => {

    if (!roles?.managerRole) return

    if (Object.getOwnPropertyNames(roles.managerRole).length > 0 && Object.getOwnPropertyNames(currentUser).length > 0) {

      if (roles.managerRole._id != currentUser.role) {

        handleShowStockButton()
      }
    }

  }, [currentUser, roles?.managerRole])

  useEffect(() => {

    if (untitled) return

    document.title = 'Reporte (' + new Date(stringDatePickerValue).toLocaleDateString() + ')'
  })

  return (

    <main className="p-3 max-w-lg mx-auto">

      <FechaDePagina changeDay={changeDay} stringDatePickerValue={stringDatePickerValue} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Reporte
      </h1>
      {branchReports && branchReports.length > 0 && roles && roles.managerRole ?
        <div>
          <div>
            <div>
              <div className="grid grid-cols-5 border bg-white border-black mx-auto my-auto w-full rounded-lg font-bold">
                <button className={"h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showTable ? 'bg-slate-500 text-white' : 'bg-white')} disabled={currentUser.role != roles.managerRole._id} onClick={() => { handleShowTableButton() }}>Tabla</button>
                <button className={"h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showStock ? 'bg-slate-500 text-white' : ' bg-white')} onClick={() => { handleShowStockButton() }}>Sobrante</button>
                <button className={"h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showEarnings ? 'bg-slate-500 text-white' : ' bg-white')} disabled={currentUser.role != roles.managerRole._id} onClick={() => { handleShowEarningsButton() }}>Efectivos</button>
                <button className={"h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showOutgoings ? 'bg-slate-500 text-white' : ' bg-white')} disabled={currentUser.role != roles.managerRole._id} onClick={() => { handleShowOutgoingButton() }}>Gastos</button>
                <button className={"h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showCards ? 'bg-slate-500 text-white' : ' bg-white')} disabled={currentUser.role != roles.managerRole._id} onClick={() => { handleShowCardsButton() }}>Tarjetas</button>
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
                  <tbody key={branchReport._id} className={branchReport.balance < 0 ? 'bg-pastel-pink' : ''}>
                    <tr className={'border-x ' + (index + 1 != branchReports.length ? "border-b " : '') + 'border-black border-opacity-40'}>
                      <td className="group">
                        <button
                          className="text-sm text-gray-700"
                          onClick={() => {
                            setSelectedBranchReport(branchReport);
                          }}
                        >
                          {branchReport.branch.branch}
                        </button>
                        <div className="hidden group-hover:block group-hover:fixed group-hover:overflow-hidden group-hover:mt-2 ml-24 bg-button text-white shadow-2xl rounded-md p-2">
                          <p>{branchReport.employee != null ? branchReport.employee.name + ' ' + branchReport.employee.lastName : 'Sin empleado'}</p>
                          {branchReport.assistant != null ? (
                            <p>{branchReport.assistant.name + ' ' + branchReport.assistant.lastName}</p>
                          ) : ''}
                        </div>
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
                <TarjetaCuenta reportArray={branchReports} currentUser={currentUser}></TarjetaCuenta>
              </div>
            </div>
          </div>
        </div>
        : ''}
      {supervisorsInfo && showTable && supervisorsInfo.length > 0 ?
        <div className="items-center">
          <div className="my-2 mx-auto">
            <h3 className="text-3xl font-bold">Ingresos del día</h3>
            <div>
              <h4 className="text-2xl font-bold">Brutos: {stringToCurrency({ amount: grossCash + deposits })}</h4>
              <div className="flex gap-3">
                <p className="font-bold">Efectivo: <span style={{ color: '#206e09' }}>{`${stringToCurrency({ amount: grossCash })}`} </span></p>
                <p className="font-bold">Depósitos: <span style={{ color: '#0c4e82' }}>{`${stringToCurrency({ amount: deposits })}`}</span></p>
              </div>
            </div>
            <h4 className="text-2xl font-bold mb-3">Netos: {stringToCurrency({ amount: (netIncomes) })}</h4>
            <PieChart chartInfo={pieChartInfo} netIncomes={netIncomes} verifiedIncomes={verifiedIncomes}></PieChart>
          </div>
          <div className="my-1 border border-slate-500 border-spacing-4 p-2 bg-white z-5 rounded-lg mb-5">
            <div id="filterBySupervisor" className="w-full sticky top-16 bg-white z-10">
              <p className="text-lg font-semibold p-3 text-red-600">Filtro de Supervisores</p>
              <EmployeeMultiSelect employees={getArrayForSelects(employees, (employee) => `${employee.name} ${employee.lastName}`)} setSelectedEmployees={setSelectedSupervisors}></EmployeeMultiSelect>
            </div>
            {selectedSupervisors && supervisorsInfo.map((supervisor) => (
              <div key={supervisor._id}>
                {(selectedSupervisors.some(selected => selected.value.toString() === supervisor._id.toString()) || selectedSupervisors.length == 0) && (
                  <div className={`border ${negativeBalances.has(supervisor._id) ? 'bg-pastel-pink' : 'bg-white'} p-3 mt-4 rounded-lg border-black`}>

                    <div className="">

                      <div className="grid grid-cols-1">

                        <button className="text-2xl font-semibold my-4 p-2 shadow-sm text-white rounded-lg w-fit bg-button flex" onClick={() => { navigate(`/perfil/${supervisor._id}`) }}>{`${supervisor.name} ${supervisor.lastName}`}</button>

                        <div className="gap-2 space-y-1">
                          <div className="flex gap-2 items-center">
                            <p className="text-lg font-bold">Depósitos:</p>
                            <ShowIncomesModal
                              title={'Depósitos'}
                              clickableComponent={
                                <p className="text-lg">{stringToCurrency({ amount: supervisor.deposits + supervisor.terminalIncomes })}
                                </p>
                              }
                              incomes={[...supervisor.terminalIncomesArray, ...supervisor.depositsArray]}
                            />
                          </div>
                          <div className="flex gap-2 items-center">
                            <p className="text-lg font-bold">Gastos:</p>
                            <ShowListModal
                              ListComponent={ExtraOutgoingsList}
                              ListComponentProps={{ extraOutgoings: supervisor.extraOutgoingsArray, totalExtraOutgoings: supervisor.extraOutgoings }}
                              title={'Gastos'}
                              clickableComponent={
                                <p className="text-lg">{stringToCurrency({ amount: supervisor.extraOutgoings })}
                                </p>
                              }
                              data={supervisor.extraOutgoingsArray}
                            />
                          </div>
                          <div className="flex gap-2 items-center">
                            <p className="text-lg font-bold">Efectivo:</p>
                            <ShowIncomesModal
                              title={'Efectivos'}
                              clickableComponent={
                                <p className="text-lg">{`${stringToCurrency({ amount: supervisor.cash })}  `}<span className="text-green-500 font-bold">{(supervisor.cash - supervisor.extraOutgoings).toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</span></p>
                              }
                              incomes={supervisor.cashArray}
                            />
                          </div>
                          <p className="text-lg"><span className="font-bold">Efectivo neto: </span>{(supervisor.cash - supervisor.extraOutgoings).toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                          <RegistrarDineroReportado setNegativeBalances={setNegativeBalances} updateReportedDeposits={updateReportedDeposits} updateReportedCash={updateReportedCash} supervisorId={supervisor._id} date={stringDatePickerValue}></RegistrarDineroReportado>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        : ''}
      {selectedBranchReport && (
        <Modal
          content={<RegistroCuentaDiaria edit={false} _branchReport={selectedBranchReport} _branch={selectedBranchReport.branch} />}
          closeModal={() => setSelectedBranchReport(null)}
        />
      )}
    </main >
  )
}
