/* eslint-disable react/prop-types */
import { IoReload } from "react-icons/io5";
import React, { useRef, useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useSelector } from "react-redux"
import { FaMinus } from "react-icons/fa";
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
import BranchReportTable from '../components/BranchReportTable';
import { useCustomersReports } from "../hooks/CustomerReports/useCustomerReports.js";
import SupervisorReportTable from '../components/SupervisorReportTable';
import CustomerReportTable from "../components/CustomerReportTable.jsx";
import ListaSalidas from "../components/Movimientos/Salidas/ListaSalidas.jsx";
import IncomesList from "../components/Incomes/IncomesList.jsx";
import ListaEntradas from "../components/Movimientos/Entradas/ListaEntradas.jsx";
import ProviderReportTable from '../components/ProviderReportTable';
import { useProvidersReports } from "../hooks/Providers/useProvidersReports.js";
import ProvidersInputsList from "../components/Providers/ProvidersInputsList.jsx";
import ProfitCard from '../components/statistics/ProfitCard';
import SalesVsReturnsCard from '../components/statistics/SalesVsReturnsCard';
import OutgoingsCard from '../components/statistics/OutgoingsCard';
import BranchBalanceCard from '../components/statistics/BranchBalanceCard';
import NetDifferenceCard from "../components/statistics/NetDifferenceCard.jsx";
import ExtraOutgoingsList from "../components/Outgoings/ExtraOutgoingsList.jsx";
import { useDateNavigation } from "../hooks/useDateNavigation.js";
import ProductPriceComparisonCard from "../components/statistics/ProductPriceComparisonCard.jsx";
import ProviderMovementsCard from "../components/statistics/ProviderMovementsCard.jsx";
import { dateFromYYYYMMDD } from "../../../common/dateOps.js";
import ShowListModal from "../components/Modals/ShowListModal.jsx";
import OutgoingsList from "../components/Outgoings/OutgoingsList.jsx";



// --- Componente TableTabsMenu ---

function TableTabsMenu({
  currentView,
  setCurrentView,
  branchReports,
  supervisorsInfo,
  customerReports,
  providerReports
}) {
  const tabs = [
    { key: 'branches', label: `Sucursales: ${branchReports?.length ?? 0}` },
    { key: 'supervisors', label: `Supervisores: ${supervisorsInfo?.length ?? 0}` },
    { key: 'customers', label: `Clientes: ${customerReports?.length ?? 0}` },
    { key: 'providers', label: `Proveedores: ${providerReports?.length ?? 0}` }
  ];

  const scrollRef = React.useRef();
  const btnRefs = React.useRef([]);
  const [showTabShortcuts, setShowTabShortcuts] = React.useState(false);

  // // Mostrar overlays de shortcuts al presionar Alt
  // React.useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (e.key === 'Alt' && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
  //       e.preventDefault();
  //       e.stopPropagation();
  //       setShowTabShortcuts(true);
  //     } else if (e.altKey) {
  //       setShowTabShortcuts(true);
  //     }
  //   };
  //   const handleKeyUp = (e) => {
  //     if (!e.altKey) setShowTabShortcuts(false);
  //   };
  //   window.addEventListener('keydown', handleKeyDown, true);
  //   window.addEventListener('keyup', handleKeyUp, true);
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown, true);
  //     window.removeEventListener('keyup', handleKeyUp, true);
  //   };
  // }, []);

  // Scroll con flechas (solo escritorio)
  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -120, behavior: 'smooth' });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 120, behavior: 'smooth' });
  };

  const handleTabClick = (idx, tab) => {
    setCurrentView({ view: tab.key, props: {} });
    btnRefs.current[idx]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  };

  const tabClass = (active) =>
    `px-4 py-2 rounded-lg font-semibold shadow-sm border transition whitespace-nowrap ${active
      ? 'bg-blue-600 text-white border-blue-700'
      : 'bg-white text-gray-800 border-gray-300 hover:bg-blue-100'
    }`;

  return (
    <div className="flex items-center gap-1">
      {/* Flecha izquierda SOLO en escritorio */}
      <button
        onClick={scrollLeft}
        className="hidden sm:flex p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-100 disabled:opacity-40"
        title="Anterior"
        tabIndex={-1}
      >
        <FaChevronLeft className="w-4 h-4" />
      </button>

      {/* Contenedor scroll (en móvil: solo scroll, sin flechas) */}
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto no-scrollbar w-full"
        style={{ scrollBehavior: 'smooth' }}
      >
        {tabs.map((tab, idx) => (
          <div key={tab.key} className="relative inline-block">
            <button
              ref={(el) => (btnRefs.current[idx] = el)}
              className={tabClass(currentView.view === tab.key)}
              onClick={() => handleTabClick(idx, tab)}
            >
              {tab.label}
            </button>
            {showTabShortcuts && (
              <span
                className="absolute top-1 left-1 z-10 bg-white/95 text-blue-600 font-bold rounded-md text-sm px-1 shadow-sm"
                style={{ fontSize: '0.85rem', padding: '0 6px' }}
              >
                {idx + 1}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Flecha derecha SOLO en escritorio */}
      <button
        onClick={scrollRight}
        className="hidden sm:flex p-2 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-100 disabled:opacity-40"
        title="Siguiente"
        tabIndex={-1}
      >
        <FaChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Reporte() {

  const { company } = useSelector((state) => state.user)
  const { currentDate, dateFromYYYYMMDD: date } = useDateNavigation();
  const { roles } = useRoles()
  const [showTable, setShowTable] = useState(true)
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
    totalProviderInputsWeight
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
    loading: loadingCustomers,
    replaceReport: replaceCustomerReport,
    setReports: setCustomerReports,
    totalSales,
    totalReturns,
    totalPayments,
    refetchCustomerReports,
    totalBalance: totalCustomerBalance,
  } = useCustomersReports({ companyId: company._id, date: currentDate, onlyNegativeBalances })

  const { loading: loadingProviders, refetchProvidersReports, paymentsArray, providersReports, replaceReport: replaceProviderReport, returnsArray, setReports, totalBalance: totalProvidersBalance, totalPayments: totalProviderPayments, totalPreviousBalance, totalMovements, totalReturns: totalProviderReturns, purchasesArray } = useProvidersReports({
    companyId: company._id,
    date: currentDate,
    onlyNegativeBalances
  })

  // Un solo estado de loading global
  const isAnyLoading = useLoading([
    loadingBranchReports,
    loadingSupervisors,
    loadingCustomers,
    loadingProviders
  ])

  const [pieChartInfo, setPieChartInfo] = useState([])
  const [selectedBranchReport, setSelectedBranchReport] = useState(null);
  const [currentView, setCurrentView] = useState({ view: "branches", props: {} });
  const [showOutputs, setShowOutputs] = useState(false)
  const [showProviderInputs, setShowProviderInputs] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [showOutgoings, setShowOutgoings] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [showExtraOutgoings, setShowExtraOutgoings] = useState(false);
  const [showIncomes, setShowIncomes] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [showInitialStock, setShowInitialStock] = useState(false);
  const supervisorTableRef = useRef(null);
  const [showTableBar, setShowTableBar] = useState(false);
  const tableBarRef = useRef(null);
  const [showPieChartModal, setShowPieChartModal] = useState(false);

  const refetchReports = () => {
    refetchCustomerReports();
    refetchProvidersReports();
    refetchBranchReports();
    refetchSupervisorsInfo();
  }

  console.log(currentDate, date)
  const showSupervisorsMissingIncomes = (e) => {
    e?.preventDefault?.();
    if (missingIncomes === 0) return

    setCurrentView({ view: 'supervisors', props: {} });
    setShowTable(false);
    setOnlyNegativeBalances(true);
    setTimeout(() => {
      supervisorTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    setShowTable(true);
    setShowPieChartModal(false);
  }

  useEffect(() => {
    if (supervisorsInfo?.length === 0) return

    setPieChartInfo([
      {
        label: 'Efectivos netos verificados',
        value: verifiedCash,
        bgColor: '#4CAF50',
        borderColor: '#206e09',
        hoverBgColor: '#24d111',
        data: cashArray,
        actionOnReport: () => {
          setShowIncomes(cashArray)
          setListTitle('Efectivos recogidos')
          setShowPieChartModal(null);
        }
      },
      {
        label: 'Terminal',
        value: verifiedDeposits <= deposits ? 0 : verifiedDeposits - deposits,
        bgColor: '#808b96',
        borderColor: '#000',
        hoverBgColor: '#2c3e50',
        data: terminalIncomesArray,
        actionOnReport: () => {
          setShowIncomes(terminalIncomesArray)
          setListTitle('Ingresos con Terminal')
        }
      },
      {
        label: 'Depósitos',
        value: verifiedDeposits >= deposits ? deposits : verifiedDeposits,
        bgColor: '#56a0db',
        borderColor: '#0c4e82',
        hoverBgColor: '#0091ff',
        data: depositsArray,
        actionOnReport: () => {
          setShowIncomes(depositsArray)
          setListTitle('Depósitos')
        }
      },
      {
        label: 'Gastos fuera de cuentas',
        value: extraOutgoings,
        bgColor: '#f0e795',
        borderColor: '#736809',
        hoverBgColor: '#ffe600',
        data: extraOutgoingsArray,
        actionOnReport: () => {
          setShowExtraOutgoings(true)
        }
      },
      {
        label: 'Ingresos sin verificar',
        value: missingIncomes < 0 ? 0 : missingIncomes,
        bgColor: '#a85959',
        borderColor: '#801313',
        hoverBgColor: '#AF0000',
        action: () => {
          showSupervisorsMissingIncomes();
        }
      },
      {
        label: 'Ingresos sobrantes',
        value: verifiedIncomes > netIncomes ? verifiedIncomes - netIncomes : 0,
        bgColor: '#FFF',
        borderColor: '#000',
        hoverBgColor: '#fff'
      }
    ])
  }, [supervisorsInfo, deposits, extraOutgoings, missingIncomes, netIncomes, verifiedCash, terminalIncomes, totalIncomes, verifiedDeposits, verifiedIncomes, cashArray, terminalIncomesArray, depositsArray, extraOutgoingsArray, setCurrentView, setShowTable, setOnlyNegativeBalances])

  const [selectedSupervisorReport, setSelectedSupervisorReport] = useState(null);

  useEffect(() => {
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
    document.title = 'Reporte (' + dateFromYYYYMMDD(currentDate).toLocaleDateString() + ')'
  }, [currentDate])

  // Mostrar ayuda de atajos solo en pantallas grandes (desktop)
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  useEffect(() => {
    const checkShowShortcuts = () => {
      // Considera desktop si el ancho es mayor a 1024px
      setShowShortcutsHelp(window.innerWidth > 1024);
    };
    checkShowShortcuts();
    window.addEventListener('resize', checkShowShortcuts);
    return () => window.removeEventListener('resize', checkShowShortcuts);
  }, []);

  useEffect(() => {

    const negativesKey = (e) => {

      if (e.key === '-' && e.ctrlKey) {
        e.preventDefault();
        setOnlyNegativeBalances(v => !v);
      }
    }

    window.addEventListener('keydown', negativesKey);

    return () => {
      window.removeEventListener('keydown', negativesKey);
    }

  }, [])

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

  if (isAnyLoading) {
    return (
      <div className="fixed left-0 right-0 top-16 bottom-0 z-30 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm transition-all animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 border-8 border-gray-200 border-t-gray-500 rounded-full animate-spin shadow-lg"></div>
          <span className="text-xl font-bold text-gray-700 animate-pulse">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <main className="p-3 mx-auto mb-40 relative overflow-x-hidden">
      {/* <div className="flex items-center mb-6">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold rounded-lg shadow transition"
          onClick={() => navigate(-1)}
        >
          <IoArrowBack className="w-5 h-5" />
          {getBackText()}
        </button>
      </div> */}

      {/* Shortcuts help always above overlay */}
      {showShortcutsHelp && shortcutsHelp}
      {selectedBranchReport && (
        <Modal
          content={
            <BranchReportCard
              reportData={selectedBranchReport}
              updateBranchReportSingle={replaceReport}
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
              updateSupervisorReportSingle={replaceSupervisorReport}
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
          content={<ProvidersInputsList inputs={providerInputsArray} totalAmount={totalProviderInputs} totalWeight={totalProviderInputsWeight} onDelete={null} />}
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
      {showExtraOutgoings && (
        <Modal
          content={<ExtraOutgoingsList extraOutgoings={extraOutgoingsArray} totalExtraOutgoings={extraOutgoings} />}
          closeModal={() => setShowExtraOutgoings(false)}
          title={'Gastos'}
          ableToClose={true}
          closeOnEsc={true}
          closeOnClickOutside={true}
          width="11/12"
        />
      )}
      {showOutgoings && (
        <Modal
          content={<OutgoingsList outgoings={outgoingsArray} totalOutgoings={totalOutgoings} />}
          closeModal={() => setShowOutgoings(false)}
          title={'Gastos'}
          ableToClose={true}
          closeOnEsc={true}
          closeOnClickOutside={true}
        />
      )}
      {showIncomes && showIncomes.length > 0 && (
        <ShowListModal
          title={listTitle}
          modalIsOpen={showIncomes && showIncomes.length > 0}
          ListComponentProps={{ incomes: showIncomes, incomesTotal: showIncomes.reduce((acc, curr) => acc + curr.amount, 0) }}
          ListComponent={IncomesList}
          extraInformation={() => (
            <div className="w-full">
              {(verifiedIncomes || verifiedIncomes === 0) && (netIncomes || netIncomes === 0) && (
                <div>
                  <p className='text-lg'>Ingresos totales confirmados</p>
                  <div className='flex gap-2'>
                    <p className='text-lg'>
                      <span className={`${verifiedIncomes < netIncomes ? 'text-red-600' : 'text-green-600'}`}>
                        {currency({ amount: verifiedIncomes })}
                      </span>
                      /
                      <span className='text-green-600'>{currency({ amount: netIncomes })}</span>
                    </p>
                    {verifiedIncomes < netIncomes && (
                      <p className='text-red-500'>{`(${currency({ amount: verifiedIncomes - netIncomes })})`}</p>
                    )}
                  </div>
                </div>
              )}
            </div>)}
          toggleComponent={() => {
            setShowIncomes(null)
            setListTitle('')
            setShowPieChartModal(prev => prev === null ? true : false)
          }}
        />
      )}
      {(branchReports || supervisorsInfo) && roles && roles.manager ?
        <div className="mt-3">
          <div className="">
            {/* En móvil: botones arriba; en escritorio: a la derecha */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <div className="order-1 sm:order-2 flex justify-end items-center gap-2">
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
              {/* Menú de tablas elegante con scroll y flechas */}
              <div className="order-2 sm:order-1 sm:flex-1">
                <TableTabsMenu
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  branchReports={branchReports}
                  supervisorsInfo={supervisorsInfo}
                  customerReports={customerReports}
                  providerReports={providersReports}
                />
              </div>
            </div>
            {showTable &&
              <div>
                <div className="">
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
                          onClick: () => {
                            setShowIncomes(incomesArray)
                            setListTitle('Ingresos en sucursales')
                          }
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
                  <>
                    <div className="flex justify-center mt-5 px-8 items-center">
                      <div className="flex flex-col md:flex-row gap-2 md:gap-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 w-fit">
                        {/* Ingresos brutos */}
                        <button
                          type="button"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-200 shadow-sm min-w-[160px] focus:outline-none focus:ring-2 focus:ring-green-300 transition hover:bg-green-100"
                          onClick={() => {
                            setListTitle('Todos los ingresos')
                            setShowIncomes(incomesArray)
                          }}
                          title="Ver lista de ingresos brutos"
                        >
                          <span className="text-2xl">💰</span>
                          <div className="flex flex-col items-start">
                            <span className="text-xs text-gray-500 font-semibold">Ingresos brutos</span>
                            <span className="text-lg font-bold text-green-600">{currency(totalIncomes)}</span>
                          </div>
                        </button>
                        {/* Gastos fuera de cuentas */}
                        <button
                          type="button"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 shadow-sm min-w-[160px] focus:outline-none focus:ring-2 focus:ring-red-300 transition hover:bg-red-100"
                          onClick={() => setShowExtraOutgoings(true)}
                          title="Ver lista de gastos fuera de cuentas"
                        >
                          <span className="text-2xl">💸</span>
                          <div className="flex flex-col items-start">
                            <span className="text-xs text-gray-500 font-semibold">Gastos fuera de cuentas</span>
                            <span className="text-lg font-bold text-red-600">{currency(extraOutgoings)}</span>
                          </div>
                        </button>
                        {/* Ingresos netos (a verificar) */}
                        <button
                          type="button"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 shadow-sm min-w-[160px] focus:outline-none focus:ring-2 focus:ring-blue-300 transition hover:bg-blue-100"
                          onClick={() => {
                            setShowIncomes(incomesArray)
                            setListTitle('Todos los ingresos')
                          }}
                          title="Ver lista de ingresos a verificar"
                        >
                          <span className="text-2xl">📈</span>
                          <div className="flex flex-col items-start">
                            <span className="text-xs text-gray-500 font-semibold">Ingresos a verificar</span>
                            <span className="text-lg font-bold text-blue-600">{currency(netIncomes)}</span>
                          </div>
                        </button>
                        {/* Ingresos verificados */}
                        <button
                          type="button"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 shadow-sm min-w-[160px] focus:outline-none focus:ring-2 focus:ring-purple-300 transition hover:bg-purple-100"
                          onClick={() => {
                            setShowIncomes(incomesArray)
                            setListTitle('Todos los ingresos')
                          }}
                          title="Ver lista de ingresos verificados"
                        >
                          <span className="text-2xl">✅</span>
                          <div className="flex flex-col items-start">
                            <span className="text-xs text-gray-500 font-semibold">Ingresos verificados</span>
                            <span className="text-lg font-bold text-purple-700">{currency(verifiedIncomes)}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                    {/* Modern verified money percentage indicator y statistics */}
                    <div className="flex flex-wrap gap-6 justify-center mt-8">
                      <div>
                        <div className="relative w-64 h-64 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center border border-gray-200 cursor-pointer group"
                          onClick={() => setShowPieChartModal(true)}
                          title="Ver detalles del gráfico de ingresos"
                        >
                          {/* Animated circular progress */}
                          {(() => {
                            const percent = netIncomes > 0 ? Math.min(100, Math.round((verifiedIncomes / netIncomes) * 100)) : 0;
                            const radius = 90;
                            const stroke = 12;
                            const normalizedRadius = radius - stroke / 2;
                            const circumference = 2 * Math.PI * normalizedRadius;
                            const progress = circumference * (1 - percent / 100);
                            let color = '#4CAF50';
                            if (percent < 60) color = '#e53e3e';
                            else if (percent < 90) color = '#f6ad55';
                            return (
                              <>
                                <svg width={radius * 2} height={radius * 2} className="block mx-auto" style={{ transform: 'rotate(-90deg)' }}>
                                  <circle
                                    cx={radius}
                                    cy={radius}
                                    r={normalizedRadius}
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth={stroke}
                                  />
                                  <circle
                                    cx={radius}
                                    cy={radius}
                                    r={normalizedRadius}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={stroke}
                                    strokeDasharray={circumference}
                                    strokeDashoffset={progress}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,2,.6,1)' }}
                                  />
                                </svg>
                                {/* Percentage badge */}
                                <div className="absolute top-1/2 left-1/2 flex flex-col items-center justify-center" style={{ transform: 'translate(-50%, -50%)' }}>
                                  <span className={`text-5xl font-extrabold ${percent >= 90 ? 'text-green-600' : percent >= 60 ? 'text-yellow-500' : 'text-red-600'}`}>{percent}%</span>
                                  <span className="text-base font-semibold text-gray-500 mt-1">Dinero verificado</span>
                                </div>
                                {/* Overlay for hover effect */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition rounded-2xl" />
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      <ProductPriceComparisonCard purchasesArray={purchasesArray} providerInputsArray={providerInputsArray} />
                      <ProviderMovementsCard purchasesArray={purchasesArray} returnsArray={returnsArray} />
                      <ProfitCard branchReports={branchReports} customerReports={customerReports} />
                      <SalesVsReturnsCard customerReports={customerReports} />
                      <OutgoingsCard branchReports={branchReports} />
                      <BranchBalanceCard branchReports={branchReports} updateBranchReportSingle={replaceReport} />
                      <NetDifferenceCard />
                    </div>
                    {showPieChartModal && (
                      <Modal
                        content={
                          <div className="flex flex-col items-center justify-center gap-4 p-2 md:p-6 min-w-[320px] max-w-[98vw]">
                            {/* PieChart grande arriba */}
                            <div className="flex-shrink-0 flex items-center justify-center w-full max-w-[420px] h-[320px] md:h-[420px] bg-white rounded-2xl shadow-lg border border-gray-200 mx-auto">
                              <PieChart chartInfo={pieChartInfo} netIncomes={netIncomes} verifiedIncomes={verifiedIncomes} large hideLegend />
                            </div>
                            {/* Lista de datos debajo */}
                            <div className="flex flex-col gap-3 overflow-y-auto max-h-[320px] w-full max-w-[420px] mx-auto">
                              <h3 className="text-xl font-bold mb-2 text-gray-700 text-center">Detalle de ingresos</h3>
                              {pieChartInfo.map((item, idx) => (
                                <div key={item.label} className={`flex items-center gap-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200 px-4 py-3 ${item.actionOnReport ? 'cursor-pointer' : ''}`}
                                  onClick={item?.actionOnReport}
                                >
                                  <span className="inline-block w-4 h-4 rounded-full" style={{ background: item.bgColor, border: `2px solid ${item.borderColor}` }} />
                                  <span className="font-semibold text-gray-700 flex-1">{item.label}</span>
                                  <span className="font-mono text-lg font-bold text-gray-900">{currency(item.value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        }
                        closeModal={() => setShowPieChartModal(false)}
                        ableToClose={true}
                        closeOnEsc={true}
                        closeOnClickOutside={true}
                        width="auto"
                        fit={true}
                        shape="rounded-2xl"
                      />
                    )}
                  </>
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
