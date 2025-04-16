/* eslint-disable react/prop-types */
import { IoReload } from "react-icons/io5";
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams, useNavigate, Link } from "react-router-dom"
import FechaDePagina from "../components/FechaDePagina"
import { formatDate } from "../helpers/DatePickerFunctions"
import Sobrante from "../pages/Sobrante"
import { useBranchReports } from "../hooks/BranchReports.js/useBranchReports";
import { getArrayForSelects, currency } from "../helpers/Functions";
import PieChart from "../components/Charts/PieChart";
import EmployeeMultiSelect from "../components/Select/EmployeeMultiSelect";
import { useSupervisorsReportInfo } from "../hooks/Supervisors/useSupervisorsReportInfo.js";
import { useRoles } from "../context/RolesContext.jsx";

import Modal from "../components/Modals/Modal";
import { useLoading } from "../hooks/loading.js";
import BranchReportCard from "../components/BranchReportCard.jsx";
import { BsFileBarGraph } from "react-icons/bs";
import { BsBoxes } from "react-icons/bs";
import { FaTruck } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { MdStorefront } from "react-icons/md";
import SupervisorReportCard from "../components/SupervisorReportCard.jsx";
import { useDate } from '../context/DateContext';

export default function Reporte({ untitled = false }) {

  const { company, currentUser } = useSelector((state) => state.user)
  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const { roles, loading: loadingRoles, isManager } = useRoles()
  const [showTable, setShowTable] = useState(true)
  const [showStock, setShowStock] = useState(false)
  const [showClients, setShowClients] = useState(false)
  const [showProviders, setShowProviders] = useState(false)
  const [showGraphs, setShowGrapsh] = useState(false)
  const [selectedSupervisors, setSelectedSupervisors] = useState([])
  const [employees, setEmployees] = useState([])
  const {currentDate, setCurrentDate} = useDate()  
  const {

    branchReports,
    getBranchReports,
    totalIncomes,
    replaceReport,
    loading: loadingBranchReports,
    totalStock,
    totalOutgoings,
    totalBalance,

  } = useBranchReports({ companyId: company._id, date: currentDate })
  const {
    supervisorsInfo,
    replaceSupervisorReport,
    deposits,
    extraOutgoings,
    loading: loadingSupervisors,
    grossCash,
    missingIncomes,
    netIncomes,
    verifiedIncomes,
    verifiedCash,
    verifiedDeposits,
    cashArray,
    depositsArray,
    extraOutgoingsArray,
    terminalIncomesArray,
    terminalIncomes,
  } = useSupervisorsReportInfo({ companyId: company._id, date: currentDate })
  const { isLoading } = useLoading([loadingBranchReports, loadingSupervisors])
  const navigate = useNavigate()
  const [pieChartInfo, setPieChartInfo] = useState([])
  const [selectedBranchReport, setSelectedBranchReport] = useState(null);

  useEffect(() => {

    setEmployees(supervisorsInfo)

  }, [supervisorsInfo])

  useEffect(() => {

    if (supervisorsInfo.length === 0) return

    setPieChartInfo([
      {
        label: 'Ingresos sobrantes',
        value: verifiedIncomes > netIncomes ? verifiedIncomes : 0,
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
        value: verifiedDeposits <= deposits ? 0 : deposits - verifiedDeposits,
        bgColor: '#808b96',
        borderColor: '#000',
        hoverBgColor: '#2c3e50',
        data: terminalIncomesArray
      },
      {
        label: 'Depósitos',
        value: verifiedDeposits >= deposits ? deposits : verifiedDeposits,
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
        value: -missingIncomes < 0 ? 0 : -missingIncomes,
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

  useEffect(() => {
    if (stringDatePickerValue) {
      setCurrentDate(stringDatePickerValue)
    }
  }, [stringDatePickerValue])  

  const handleShowGraphs = () => {

    setShowGrapsh(true)
    setShowTable(false)
    setShowStock(false)
    setShowClients(false)
    setShowProviders(false)
  }

  const handleShowTableButton = () => {

    setShowTable(true)
    setShowGrapsh(false)
    setShowStock(false)
    setShowClients(false)
    setShowProviders(false)
  }

  const handleShowStockButton = () => {

    setShowStock(true)
    setShowTable(false)
    setShowGrapsh(false)
    setShowClients(false)
    setShowProviders(false)
  }

  const handleShowClients = () => {

    setShowClients(true)
    setShowTable(false)
    setShowGrapsh(false)
    setShowStock(false)
    setShowProviders(false)
  }

  const handleShowProviders = () => {

    setShowTable(false)
    setShowGrapsh(false)
    setShowStock(false)
    setShowClients(false)
    setShowProviders(true)
  }

  useEffect(() => {

    if (roles && !isManager(currentUser.role) && !loadingRoles) {

      handleShowStockButton()
    }

  }, [currentUser, roles, loadingRoles, isManager])

  useEffect(() => {

    if (untitled) return

    document.title = 'Reporte (' + new Date(currentDate).toLocaleDateString() + ')'
  })

  return (

    <main className="p-3 max-w-lg mx-auto">
      {!untitled &&
        <FechaDePagina changeDay={changeDay} stringDatePickerValue={currentDate} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>
      }
      {branchReports && branchReports.length > 0 && roles && roles.manager ?
        <div className="mt-3">
          <div className="grid grid-cols-5 border bg-white border-black mx-auto my-auto w-full rounded-lg font-bold">
            <button title="Sucursales" className={"h-full items-center p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showTable ? 'bg-slate-500 text-white' : 'bg-white')} disabled={!isManager(currentUser.role)} onClick={() => { handleShowTableButton() }}><MdStorefront className={`h-5 w-5 ${showTable ? 'text-white' : ''} text-center mx-auto`} /> </button>
            <button title="Gráficos" className={"h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showGraphs ? 'bg-slate-500 text-white' : ' bg-white')} disabled={!isManager(currentUser.role)} onClick={() => { handleShowGraphs() }}><BsFileBarGraph className={`h-5 w-5 ${showGraphs ? 'text-white' : ''} text-center mx-auto`} />
            </button>
            <button title="Inventario" className={"h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showStock ? 'bg-slate-500 text-white' : ' bg-white')} onClick={() => { handleShowStockButton() }}><BsBoxes className={`h-5 w-5 ${showStock ? 'text-white' : ''} text-center mx-auto`} /></button>
            <button title="Clientes" className={"h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showClients ? 'bg-slate-500 text-white' : ' bg-white')} disabled={!isManager(currentUser.role)} onClick={() => { handleShowClients() }}>
              <p className="flex">
                <FaUser className={`h-5 w-5 ${showClients ? 'text-white' : ''} text-center mx-auto`} /> 🤑
              </p>
            </button>
            <button title="Proveedores" className={"h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white " + (showProviders ? 'bg-slate-500 text-white' : ' bg-white')} disabled={!isManager(currentUser.role)} onClick={() => { handleShowProviders() }}><FaTruck className={`h-5 w-5 ${showProviders ? 'text-white' : ''} text-center mx-auto`} /></button>
          </div>
          <div className="grid grid-cols-3 mt-3 items-center">
            <p className="col-span-1 font-bold">{'Formatos: ' + branchReports.length + '/20'}</p>
            <div className="col-span-2 justify-self-end flex items-center">
              <p className="font-semibold">Recargar formatos:</p>
              <button className="text-black h-10 px-8" onClick={() => getBranchReports({ companyId: company._id, date: currentDate })}><IoReload className="w-full h-full" /></button>
            </div>
          </div>
          <table className={'border mt-2 bg-white w-full ' + (!showTable ? 'hidden' : '')}>

            <thead className="border border-black">

              <tr>
                {/* <th></th> */}
                <th className="text-sm">Sucursal</th>
                <th className="text-sm">
                  <Link className="flex justify-center" to={'/gastos/' + currentDate}>
                    Gastos
                  </Link>
                </th>
                <th className="text-sm">
                  <Link className="flex justify-center" to={'/sobrante/' + currentDate}>
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
                      className="text-sm text-gray-700 w-full h-full"
                      onClick={() => { setSelectedBranchReport(branchReport) }}
                    >
                      {branchReport.branch.branch}
                      <div className="hidden group-hover:block group-hover:fixed group-hover:overflow-hidden group-hover:mt-2 ml-24 bg-button text-white shadow-2xl rounded-md p-2">
                        <p>{branchReport.employee != null ? branchReport.employee.name + ' ' + branchReport.employee.lastName : 'Sin empleado'}</p>
                        {branchReport.assistant != null ? (
                          <p>{branchReport.assistant.name + ' ' + branchReport.assistant.lastName}</p>
                        ) : ''}
                      </div>
                    </button>
                  </td>
                  <td className="text-center text-sm">
                    <button
                      className="text-sm text-gray-700 w-full h-full"
                      onClick={() => { setSelectedBranchReport(branchReport) }}
                    >{branchReport.outgoings.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}

                    </button>
                  </td>
                  <td className="text-center text-sm">

                    <button
                      className="text-sm text-gray-700 w-full h-full"
                      onClick={() => { setSelectedBranchReport(branchReport) }}
                    >
                      {branchReport.finalStock.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}

                    </button>
                  </td>
                  <td className="text-center text-sm">

                    <button
                      className="text-sm text-gray-700 w-full h-full"
                      onClick={() => { setSelectedBranchReport(branchReport) }}
                    >{branchReport.incomes.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}

                    </button>
                  </td>

                  <td className={(branchReport.balance < 0 ? 'text-red-500' : 'text-green-500') + ' text-center text-sm'}>

                    <button
                      className="text-sm text-gray-700 w-full h-full"
                      onClick={() => { setSelectedBranchReport(branchReport) }}
                    >
                      {branchReport.balance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                    </button>
                  </td>
                </tr>
              </tbody>
            ))}
            <tfoot className="border border-black text-sm">
              <tr className="mt-2">
                <td className="text-center text-m font-bold">Totales:</td>
                <td className="text-center text-m font-bold">{currency({ amount: totalOutgoings ?? 0 })}</td>
                <td className="text-center text-m font-bold">{totalStock.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                <td className="text-center text-m font-bold">{totalIncomes.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                <td className={(totalBalance < 0 ? 'text-red-500' : 'text-green-500') + ' text-center text-m font-bold'}>{totalBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
              </tr>
            </tfoot>
          </table>
          <div className={!showStock ? 'hidden' : ''}>
            <Sobrante date={currentDate} branchReports={branchReports}></Sobrante>
          </div>
          <div className={!showGraphs ? 'hidden' : ''} >
            <div className="items-center">
              <div className="my-2 mx-auto">
                <h3 className="text-3xl font-bold">Ingresos del día</h3>
                <div className="h-fit">
                  <div className="grid grid-cols-2">
                    <h4 className="text-2xl font-bold">Brutos: {currency({ amount: grossCash + deposits })}</h4>
                    <h4 className="text-2xl font-bold">Netos: {currency({ amount: (netIncomes) })}</h4>
                  </div>
                  <div className="flex justify-center gap-2">
                    <p className="font-bold text-center">Efectivo: <span style={{ color: '#206e09' }}>{`${currency({ amount: grossCash })}`} </span></p>
                    <p className="font-bold text-center">Depósitos: <span style={{ color: '#0c4e82' }}>{`${currency({ amount: deposits })}`}</span></p>
                  </div>
                </div>
                <PieChart chartInfo={pieChartInfo} netIncomes={netIncomes} verifiedIncomes={verifiedIncomes}></PieChart>
              </div>
            </div>
          </div>
        </div>
        : ''
      }
      {
        supervisorsInfo && showTable && supervisorsInfo.length > 0 ?

          <div className="my-1 border border-slate-500 border-spacing-4 p-2 bg-white z-5 rounded-lg mb-5">
            <div id="filterBySupervisor" className="w-full sticky top-16 bg-white z-10">
              <p className="text-lg font-semibold p-3 text-red-600">Filtro de Supervisores</p>
              <EmployeeMultiSelect employees={getArrayForSelects(employees, (employee) => `${employee.name} ${employee.lastName}`)} setSelectedEmployees={setSelectedSupervisors}></EmployeeMultiSelect>
            </div>
            {selectedSupervisors && supervisorsInfo.map((supervisorReport) => (
              <SupervisorReportCard
                key={supervisorReport._id}
                supervisorReport={supervisorReport}
                replaceReport={replaceSupervisorReport}
              />
            ))}
          </div>
          : ''
      }
      {branchReports.length === 0 && supervisorsInfo.length === 0 && !isLoading && (
        <div className="flex justify-center items-center h-96">
          <p className="text-2xl">Aún no hay información de este día</p>
        </div>
      )
      }
      {selectedBranchReport && (
        <Modal
          content={
            <BranchReportCard
              reportData={selectedBranchReport}
              replaceReport={replaceReport}
              defaultDetailsShowed={null}
            />
          }
          closeModal={() => {
            setSelectedBranchReport(null);
          }}
        />
      )}
    </main >
  )
}
