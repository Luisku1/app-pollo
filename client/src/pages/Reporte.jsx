/* eslint-disable react/prop-types */
import { IoReload } from "react-icons/io5";
import { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux"
import { useParams, useNavigate, Link } from "react-router-dom"
import { FaMinus } from "react-icons/fa";
import FechaDePagina from "../components/FechaDePagina"
import { formatDate } from "../helpers/DatePickerFunctions"
import Sobrante from "../pages/Sobrante"
import { useBranchReports } from "../hooks/BranchReports.js/useBranchReports";
import { currency } from "../helpers/Functions";
import PieChart from "../components/Charts/PieChart";
import { useSupervisorsReportInfo } from "../hooks/Supervisors/useSupervisorsReportInfo.js";
import { useRoles } from "../context/RolesContext.jsx";

import Modal from "../components/Modals/Modal";
import { useLoading } from "../hooks/loading.js";
import BranchReportCard from "../components/BranchReportCard.jsx";
import SupervisorReportCard from "../components/SupervisorReportCard.jsx";
import { useDate } from '../context/DateContext';
import BranchReportTable from '../components/BranchReportTable';
import { useCustomersReports } from "../hooks/CustomerReports/useCustomerReports.js";
import SupervisorReportTable from '../components/SupervisorReportTable';
import CustomerReportTable from "../components/CustomerReportTable.jsx";
import ListaSalidas from "../components/EntradasYSalidas/Salidas/ListaSalidas.jsx";
import IncomesList from "../components/Incomes/IncomesList.jsx";
import OutgoingsList from "../components/Outgoings/OutgoingsList.jsx";
import ListaEntradas from "../components/EntradasYSalidas/Entradas/ListaEntradas.jsx";
import ProviderInputsList from "../components/Proveedores/ProviderInputsList.jsx";
import ProviderReportTable from '../components/ProviderReportTable';
import { useProvidersReports } from "../hooks/Providers/useProvidersReports.js";

export default function Reporte({ untitled = false }) {

  const { company, currentUser } = useSelector((state) => state.user)
  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const { roles, loading: loadingRoles, isManager } = useRoles()
  const [showTable, setShowTable] = useState(true)
  const { currentDate, setCurrentDate } = useDate()
  const [onlyNegativeBalances, setOnlyNegativeBalances] = useState(false);
  const {
    branchReports,
    refetchBranchReports,
    totalIncomes,
    replaceReport,
    loading: loadingBranchReports,
    outgoingsArray,
    inputsArray,
    outputsArray,
    providerInputsArray,
    incomesArray,
    totalStock,
    totalInitialStock,
    totalInputs,
    totalOutputs,
    totalProviderInputs,
    totalOutgoings,
    totalBalance,
  } = useBranchReports({ companyId: company._id, date: currentDate, onlyNegativeBalances })

  const {
    supervisorsInfo,
    replaceSupervisorReport,
    deposits,
    extraOutgoings,
    loading: loadingSupervisors,
    missingIncomes,
    netIncomes,
    verifiedIncomes,
    verifiedCash,
    grossIncomes,
    verifiedDeposits,
    cashArray,
    depositsArray,
    totalBalance: totalSupervisorBalance,
    extraOutgoingsArray,
    terminalIncomesArray,
    terminalIncomes,
    refetchSupervisorsInfo
  } = useSupervisorsReportInfo({ companyId: company._id, date: currentDate, onlyNegativeBalances })

  const {
    customerReports,
    loading,
    replaceReport: replaceCustomerReport,
    setReports: setCustomerReports,
    totalSales,
    totalReturns,
    totalPayments,
    refetchCustomerReports,
    totalBalance: totalCustomerBalance,
  } = useCustomersReports({ companyId: company._id, date: currentDate, onlyNegativeBalances })

  const { providerReports, loading: loadingProviders, refetchProvidersReports, paymentsArray, providersReports, purchasesArray, replaceReport: replaceProviderReport, returnsArray, setReports, totalBalance: totalProvidersBalance, totalPayments: totalProviderPayments, totalPreviousBalance, totalPurchases, totalReturns: totalProviderReturns } = useProvidersReports({
    companyId: company._id,
    date: currentDate,
    onlyNegativeBalances
  })

  const { isLoading } = useLoading([loadingBranchReports, loadingSupervisors])
  const navigate = useNavigate()
  const [pieChartInfo, setPieChartInfo] = useState([])
  const [selectedBranchReport, setSelectedBranchReport] = useState(null);
  const [currentView, setCurrentView] = useState({ view: "branches", props: {} });
  const [showOutputs, setShowOutputs] = useState(false)
  const [showProviderInputs, setShowProviderInputs] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [showOutgoings, setShowOutgoings] = useState(false);
  const [showIncomes, setShowIncomes] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [showInitialStock, setShowInitialStock] = useState(false);
  const supervisorTableRef = useRef(null);
  const [showTableBar, setShowTableBar] = useState(false);
  const tableBarRef = useRef(null);

  const refetchReports = () => {
    refetchCustomerReports();
    refetchProvidersReports();
    refetchBranchReports();
    refetchSupervisorsInfo();
  }

  useEffect(() => {
    if (supervisorsInfo?.length === 0) return

    setPieChartInfo([
      {
        label: 'Ingresos sobrantes',
        value: verifiedIncomes > netIncomes ? verifiedIncomes - netIncomes : 0,
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
        value: verifiedDeposits <= deposits ? 0 : verifiedDeposits - deposits,
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
        value: missingIncomes < 0 ? 0 : missingIncomes,
        bgColor: '#a85959',
        borderColor: '#801313',
        hoverBgColor: '#AF0000',
        action: () => {
          setCurrentView({ view: 'supervisors', props: {} });
          setShowTable(false);
          setOnlyNegativeBalances(true);
          setTimeout(() => {
            supervisorTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 150);
          setShowTable(true);
        }
      }
    ])
  }, [supervisorsInfo, deposits, extraOutgoings, missingIncomes, netIncomes, verifiedCash, terminalIncomes, totalIncomes, verifiedDeposits, verifiedIncomes, cashArray, terminalIncomesArray, depositsArray, extraOutgoingsArray, setCurrentView, setShowTable, setOnlyNegativeBalances])

  const [selectedSupervisorReport, setSelectedSupervisorReport] = useState(null);
  const [tablesOnTop, setTablesOnTop] = useState(false);

  const changeDatePickerValue = (e) => {
    const newDate = e.target.value + 'T06:00:00.000Z';
    setCurrentDate(newDate);
    navigate('/reporte/' + newDate)
  }

  const changeDay = (date) => {
    navigate('/reporte/' + date)
  }

  useEffect(() => {
    const handleResize = () => {
      const size = window.innerWidth
      if (size > 1024) {
        setTablesOnTop(true)
        setShowTableBar(true)
      } else {
        setTablesOnTop(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // Atajo de teclado para alternar tablas con ctrl+shift+1,2,3,4
    const handleKeyDown = (e) => {
      // e.code es más confiable para teclas numéricas
      if (e.ctrlKey && e.shiftKey && !e.altKey) {
        switch (e.code) {
          case 'Digit1':
            setCurrentView({ view: 'branches', props: {} });
            setShowTable(true);
            break;
          case 'Digit2':
            setCurrentView({ view: 'supervisors', props: {} });
            setShowTable(true);
            break;
          case 'Digit3':
            setCurrentView({ view: 'customers', props: {} });
            setShowTable(true);
            break;
          case 'Digit4':
            setCurrentView({ view: 'providers', props: {} });
            setShowTable(true);
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (stringDatePickerValue) {
      setCurrentDate(stringDatePickerValue)
    }
  }, [stringDatePickerValue, setCurrentDate])

  useEffect(() => {
    if (untitled) return
    document.title = 'Reporte (' + new Date(currentDate).toLocaleDateString() + ')'
  }, [currentDate, untitled])

  // Ayuda visual para shortcuts de tablas
  const shortcutsHelp = (
    <div className="fixed bottom-20 right-4 z-50 bg-white border border-gray-400 rounded-lg shadow-lg p-3 text-xs text-gray-700 opacity-80 select-none pointer-events-none">
      <div className="font-bold mb-1">Atajos de tablas:</div>
      <div><b>Ctrl+Shift+1</b>: Sucursales</div>
      <div><b>Ctrl+Shift+2</b>: Supervisores</div>
      <div><b>Ctrl+Shift+3</b>: Clientes</div>
      <div><b>Ctrl+Shift+4</b>: Proveedores</div>
    </div>
  );

  return (
    <main className="p-3 mx-auto mb-40">
      {shortcutsHelp}
      {selectedBranchReport && (
        <Modal
          content={
            <BranchReportCard
              reportData={selectedBranchReport}
              replaceReport={replaceReport}
              defaultDetailsShowed={null}
              selfChange={setSelectedBranchReport}
            />
          }
          fit={true}
          closeModal={() => {
            setSelectedBranchReport(null);
          }}
        />
      )}
      {selectedSupervisorReport && (
        <Modal
          content={
            <SupervisorReportCard
              supervisorReport={selectedSupervisorReport}
              replaceReport={replaceSupervisorReport}
              selfChange={setSelectedSupervisorReport}
              defaultDetailsShowed={null}
            />
          }
          fit={true}
          closeModal={() => {
            setSelectedSupervisorReport(null);
          }}
        />
      )}
      {showOutputs && (
        <Modal
          content={<ListaSalidas outputs={outputsArray} onDelete={null} />}
          closeModal={() => setShowOutputs(false)}
          title={'Salidas'}
          ableToClose={true}
          closeOnEsc={true}
          closeOnClickOutside={true}
          closeOnClickInside={false}
          width="11/12"
        />
      )}
      <Modal
        content={<Sobrante branchReports={branchReports} isInitial={showInitialStock} />}
        closeModal={() => {
          setShowStock(false)
          setShowInitialStock(false)
        }}
        ableToClose={true}
        closeOnEsc={true}
        closeOnClickOutside={true}
        isShown={showStock || showInitialStock}
        width="11/12"
      />
      {showProviderInputs && (
        <Modal
          content={<ProviderInputsList inputs={providerInputsArray} onDelete={null} />}
          closeModal={() => setShowProviderInputs(false)}
          title={'Entradas de Proveedor'}
          ableToClose={true}
          closeOnEsc={true}
          closeOnClickOutside={true}
          width="11/12"
        />
      )}
      {showInputs && (
        <Modal
          content={<ListaEntradas inputs={inputsArray} onDelete={null} />}
          closeModal={() => setShowInputs(false)}
          title={'Entradas'}
          ableToClose={true}
          closeOnEsc={true}
          closeOnClickOutside={true}
          width="11/12"
        />
      )}
      {showOutgoings && (
        <Modal
          content={<OutgoingsList outgoings={outgoingsArray} onDelete={null} />}
          closeModal={() => setShowOutgoings(false)}
          title={'Gastos'}
          ableToClose={true}
          closeOnEsc={true}
          closeOnClickOutside={true}
          width="11/12"
        />
      )}
      {showIncomes && (
        <Modal
          content={<IncomesList incomes={incomesArray} onDeleteIncome={null} />}
          closeModal={() => setShowIncomes(false)}
          title={'Ingresos'}
          ableToClose={true}
          closeOnEsc={true}
          closeOnClickOutside={true}
          width="11/12"
        />
      )}
      {!untitled &&
        <FechaDePagina changeDay={changeDay} stringDatePickerValue={currentDate} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>
      }
      {(branchReports || supervisorsInfo) && roles && roles.manager ?
        <div className="mt-3">
          <div className="">
            <div className="flex justify-evenly">
              <div className="justify-self-start font-bold text-lg">
                {showTable && currentView.view === 'branches' && (
                  <p className="">{'Sucursales: ' + branchReports.length}</p>
                )}
                {showTable && currentView.view === 'supervisors' && (
                  <p className="">{'Supervisores'}</p>
                )}
                {showTable && currentView.view === 'customers' && (
                  <p className="">{'Clientes'}</p>
                )}
                {showTable && currentView.view === 'providers' && (
                  <p className="">{'Proveedores'}</p>
                )}
              </div>
              <div className="flex justify-center items-center gap-2">
                {/* Botón para filtrar solo balances negativos */}
                <button
                  className={`transition px-4 py-2 rounded-lg border font-semibold shadow-sm ${onlyNegativeBalances ? 'bg-red-600 text-white border-red-700' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'}`}
                  title="Mostrar solo balances negativos"
                  onClick={() => setOnlyNegativeBalances(v => !v)}
                >
                  <FaMinus className="w-5 h-5" />
                </button>
                <button
                  className="transition px-4 py-2 rounded-lg border font-semibold shadow-sm bg-white text-black border-gray-300 hover:bg-gray-100 flex items-center"
                  title="Recargar información"
                  onClick={() =>
                    refetchReports()
                  }
                >
                  <IoReload className="w-5 h-5" />
                </button>
              </div>
            </div>
            {showTable &&
              <div>
                <div className="">
                  <div className="justify-center items-center">
                    {/* Menú horizontal retráctil de tablas */}
                    <div className={`fixed left-4 z-50 w-fit ${tablesOnTop ? 'top-20' : 'bottom-20'}`} ref={tableBarRef}>
                      {!showTableBar ? (
                        <button
                          className="bg-black text-white shadow-lg rounded-full border-2 border-black flex items-center justify-center p-2 font-bold text-lg transition"
                          onClick={() => setShowTableBar(true)}
                        >
                          Tablas
                        </button>
                      ) : (
                        <div className={`${tablesOnTop ? 'grid grid-cols-1 w-fit' : 'flex flex-wrap gap-1'} bg-white border-2 border-black rounded-3xl shadow-lg p-2 items-center min-w-[${tablesOnTop ? '' : '220px'}] max-w-[90vw]`}>
                          <button
                            className={`bg-black text-white rounded-full ${tablesOnTop ? 'mb-2' : ''} px-4 py-2 font-bold text-lg transition`}
                            onClick={() => setShowTableBar(false)}
                          >
                            Tablas
                          </button>
                          <button
                            className={`px-4 py-2 rounded-xl border border-black text-sm font-medium transition ${currentView.view === 'branches' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                            onClick={() => {
                              setCurrentView({ view: 'branches', props: {} });
                            }}
                          >
                            Sucursales
                          </button>
                          <button
                            className={`px-4 py-2 rounded-xl border border-black text-sm font-medium transition ${currentView.view === 'supervisors' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                            onClick={() => {
                              setCurrentView({ view: 'supervisors', props: {} });
                            }}
                          >
                            Supervisores
                          </button>
                          <button
                            className={`px-4 py-2 rounded-xl border border-black text-sm font-medium transition ${currentView.view === 'customers' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                            onClick={() => {
                              setCurrentView({ view: 'customers', props: {} });
                            }}
                          >
                            Clientes
                          </button>
                          <button
                            className={`px-4 py-2 rounded-xl border border-black text-sm font-medium transition ${currentView.view === 'providers' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                            onClick={() => {
                              setCurrentView({ view: 'providers', props: {} });
                            }}
                          >
                            Proveedores
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {currentView.view === 'branches' && (
                    <BranchReportTable
                      branchReports={branchReports}
                      onRowClick={setSelectedBranchReport}
                      totals={{
                        initialStock: {
                          value: (
                            <span className={`text-red-600 underline cursor-pointer`}>
                              {currency(totalInitialStock)}
                            </span>
                          ),
                          onClick: () => setShowInitialStock(true)
                        },
                        inputs: {
                          value: (
                            <span className={`text-red-600 underline cursor-pointer`}>
                              {currency(totalInputs)}
                            </span>
                          ),
                          onClick: () => setShowInputs(true)
                        },
                        outputs: {
                          value: (
                            <span className={`text-red-600 underline cursor-pointer`}>
                              {currency(totalOutputs)}
                            </span>
                          ),
                          onClick: () => setShowOutputs(true)
                        },
                        providerInputs: {
                          value: (
                            <span className={`text-red-600 underline cursor-pointer`}>
                              {currency(totalProviderInputs)}
                            </span>
                          ),
                          onClick: () => setShowProviderInputs(true)
                        },
                        incomes: {
                          value: (
                            <span className={`text-red-600 underline cursor-pointer`}>
                              {currency(totalIncomes)}
                            </span>
                          ),
                          onClick: () => setShowIncomes(true)
                        },
                        finalStock: {
                          value: (
                            <span className="underline cursor-pointer">
                              {currency(totalStock)}
                            </span>
                          ),
                          onClick: () => setShowStock(true)
                        },
                        outgoings: {
                          value: (
                            <span className={`text-red-600 underline cursor-pointer`}>
                              {currency(totalOutgoings)}
                            </span>
                          ),
                          onClick: () => setShowOutgoings(true)
                        },
                        balance: (
                          <span className={`${totalBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {currency(totalBalance)}
                          </span>
                        )
                      }}
                      {...currentView.props}
                    />
                  )}
                  {currentView.view === 'supervisors' && (
                    <div ref={supervisorTableRef}>
                      <SupervisorReportTable
                        supervisorReports={supervisorsInfo}
                        onRowClick={setSelectedSupervisorReport}
                        totals={{
                          grossIncomes: currency(grossIncomes),
                          verifiedIncomes: currency(verifiedIncomes),
                          deposits: currency(deposits + terminalIncomes),
                          extraOutgoings: currency(extraOutgoings),
                          toVerify: currency(missingIncomes),
                          balance: (
                            <span className={`${totalSupervisorBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {currency(totalSupervisorBalance)}
                            </span>
                          )
                        }}
                        {...currentView.props}
                      />
                    </div>
                  )}
                  {currentView.view === 'customers' && (
                    <CustomerReportTable
                      customerReports={customerReports}
                      onRowClick={() => { }}
                      totals={{
                        salesAmount: currency(totalSales),
                        returns: currency(totalReturns),
                        payments: currency(totalPayments),
                        balance: (
                          <span className={`${totalCustomerBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {currency(totalCustomerBalance)}
                          </span>
                        )
                      }}
                      {...currentView.props}
                    />
                  )}
                  {currentView.view === 'providers' && (
                    <ProviderReportTable
                      providerReports={providersReports}
                      onRowClick={() => { }}
                      totals={{}}
                      {...currentView.props}
                    />
                  )}
                </div>
                {incomesArray.length > 0 && (
                  <div>
                    <div className="flex justify-center mt-5 px-8 items-center">
                      <div className="w-fit mt-2 rounded-lg p-2 border bg-white"> {/* Alineado a la derecha */}
                        <p>
                          <span className="font-bold">Ingresos brutos: </span>
                          <span className="text-green-600">{currency(totalIncomes)}</span>
                        </p>
                        <p>
                          <span className="font-bold">Gastos fuera de cuentas: </span>
                          <span className="text-red-600">{currency(extraOutgoings)}</span>
                        </p>
                        <p>
                          <span className="font-bold">Ingresos netos: </span>
                          <span className="text-green-600">{currency(netIncomes)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-8">
                      <PieChart chartInfo={pieChartInfo} netIncomes={netIncomes} verifiedIncomes={verifiedIncomes} />
                    </div>
                  </div>
                )}
              </div>
            }
          </div>
        </div>
        : ''
      }
    </main >
  )
}
