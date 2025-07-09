/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import { useEmployees } from '../hooks/Employees/useEmployees';
import EmployeesSelect from '../components/Select/EmployeesSelect';
import { useBranches } from '../hooks/Branches/useBranches';
import { useBranchReport } from '../hooks/BranchReports.js/useBranchReport';
import Loading from '../helpers/Loading';
import { useRoles } from '../context/RolesContext'
import BranchSelect from '../components/RegistrarFormato/BranchSelect';
import AddStock from '../components/Stock/AddStock';
import AddOutgoing from '../components/Outgoings/AddOutgoing';
import { useProducts } from '../hooks/Products/useProducts';
import BranchPrices from '../components/Prices/BranchPrices';
import ShowListModal from '../components/Modals/ShowListModal';
import IncomesList from '../components/Incomes/IncomesList';
import { getArrayForSelects, getElementForSelect, currency, getEmployeeFullName } from '../helpers/Functions';
import ListaEntradas from '../components/EntradasYSalidas/Entradas/ListaEntradas';
import ListaSalidas from '../components/EntradasYSalidas/Salidas/ListaSalidas';
import ShowBalance from '../components/ShowBalance';
import StockList from '../components/Stock/StockList';
import OutgoingsList from '../components/Outgoings/OutgoingsList';
import Modal from '../components/Modals/Modal';
import ConfirmationButton from '../components/Buttons/ConfirmationButton';
import EmployeeInfo from '../components/EmployeeInfo';
import { CgProfile } from 'react-icons/cg';
import { useDateNavigation } from '../hooks/useDateNavigation';
import { ToastInfo } from '../helpers/toastify';
import ProvidersInputsList from '../components/Providers/ProvidersInputsList';
import { customSelectStyles } from '../helpers/Constants';
import { SelectReportEmployees } from '../components/SelectReportEmployees';
import { formatDateYYYYMMDD, today } from '../../../common/dateOps';
import { areArraysEqual } from '../../../common/arraysOps';


export default function RegistroCuentaDiaria({ edit = true }) {

  const { currentUser, company } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const params = useParams()
  const [branchId, setBranchId] = useState(params.branchId || null)
  const { currentDate, dateFromYYYYMMDD } = useDateNavigation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { activeEmployees: employees } = useEmployees({ companyId: company._id })
  const { branches } = useBranches({ companyId: company._id })
  const { roles, isManager, isJustSeller, isSupervisor, isController } = useRoles()
  const { products } = useProducts({ companyId: company._id })
  const [selectedBranch, setSelectedBranch] = useState()
  const [selectBranch, setSelectBranch] = useState(false)
  const [showSelectReportEmployees, setShowSelectReportEmployees] = useState(false)
  const [employeeInfo, setEmployeeInfo] = useState(null)
  const isAuthorized = roles && isManager(currentUser.role)
  const [ableToEdit, setAbleToEdit] = useState(false)

  const reportDate = dateFromYYYYMMDD.toLocaleDateString('es-mx', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })
  const {
    branchReport,
    employee,
    assistants,
    onUpdateBranchReport,
    modifyBalance,
    prices,
    onChangePrices,
    initialStockWeight,
    initialStockAmount,
    initialStock,
    midDayStock,
    midDayStockAmount,
    midDayStockWeight,
    onAddMidStock,
    onDeleteMidStock,
    stock,
    stockAmount,
    stockWeight,
    payments,
    noPayments,
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
    onAddStock,
    onDeleteStock,
    outgoings,
    outgoingsTotal,
    onAddOutgoing,
    updateReportEmployees,
    onDeleteOutgoing
  } = useBranchReport({ branchId, date: currentDate })

  useEffect(() => {
    const currentTime = new Date();
    const currentUTCHours = currentTime.getUTCHours();
    const currentUTCMinutes = currentTime.getUTCMinutes();

    setAbleToEdit(true)

    if (isJustSeller(currentUser.role) && !today(reportDate)) {
      ToastInfo('No puedes editar el formato de otro día')
      setAbleToEdit(false)
      return
    }

    if (isJustSeller(currentUser.role) && today(reportDate)) {
      if ((today(reportDate) && currentUTCHours > 2 && currentUTCHours < 6) || (today(reportDate) && currentUTCHours > 2 && currentUTCMinutes > 30 && currentUTCHours < 6)) {
        ToastInfo('No puedes editar el formato después de las 8 pm')
        setAbleToEdit(false)
        return
      }
    }

  }, [currentUser, currentDate, reportDate]);

  useEffect(() => {
    if ((!branchId && !selectedBranch)) {
      setSelectBranch(true)
    }

  }, [branchId, selectedBranch])

  const handleBranchSelectChange = (branch) => {

    setSelectedBranch(branch)
    setBranchId(branch._id)
    if (!employee && branch) {

      setShowSelectReportEmployees(true)
    }
    navigate('/formato/' + branch._id + '/' + currentDate)
  }

  const SectionHeader = (props) => {
    return (
      <h2 className='flex text-2xl text-center font-semibold mb-4 text-red-800' onClick={props.onClick}>{props.label}</h2>
    )
  }

  const onRegisterEmployees = async (selectedEmployee, selectedAssistants) => {
    let finalAssistants = [...selectedAssistants] || [];
    let finalEmployee = selectedEmployee || null
    if (((selectedEmployee && currentUser._id !== selectedEmployee._id) || !selectedEmployee) && !isController(currentUser.role)) {
      if (!selectedAssistants.some(assistant => assistant._id === currentUser._id)) {
        finalAssistants.push({
          value: currentUser._id,
          label: getEmployeeFullName(currentUser),
          ...currentUser
        });
      }
    }

    setShowSelectReportEmployees(false);

    if (((assistants.length === 0 && finalAssistants.length === 0) || (areArraysEqual(finalAssistants, assistants))) && selectedEmployee?._id === branchReport?.employee?._id) {
      ToastInfo('No se han realizado cambios en los empleados del reporte');
      return;
    }

    await updateReportEmployees({ employee: finalEmployee, assistants: finalAssistants });
  }

  useEffect(() => {

    if (!branchId || !branches) return

    branches.forEach(branch => {

      if (branchId == branch._id) {
        if (!employee && branch) {
          setShowSelectReportEmployees(true)
        }
        setSelectedBranch(branch)
      }
    })

  }, [branchId, branches])

  useEffect(() => {

    if (selectedBranch != null && dateFromYYYYMMDD != null && edit) {

      document.title = (selectedBranch?.branch ?? 'Formato') + ' ' + '(' + (dateFromYYYYMMDD.toLocaleDateString()) + ')'
    }

  }, [selectedBranch, dateFromYYYYMMDD, edit])

  const handleShowEmployeeInfo = () => {
    if (!branchReport?.employee) {
      ToastInfo('No hay un encargado asignado')
      setEmployeeInfo(null)
    } else {
      setEmployeeInfo(branchReport.employee)
    }
  }

  useEffect(() => {
    const handleResize = () => {
      const h2Element = document.querySelector('h2');
      if (h2Element) {
        const windowWidth = window.innerWidth;
        if (windowWidth > 768) { // Adjust this value as needed for your layout
          h2Element.style.position = 'fixed';
          h2Element.style.top = '25%'; // A quarter of the screen height
          h2Element.style.left = '10px'; // Adjust left position as needed
        } else {
          h2Element.style.position = 'static';
          h2Element.style.top = 'auto';
          h2Element.style.left = 'auto';
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call it initially to set the correct position

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!ableToEdit) {
    return (
      <div className='flex flex-col gap-4 mt-4 sticky bottom-4'>
        <p className='bg-red-800 text-white border border-black p-3 rounded-lg w-full'>
          {today(reportDate) ? 'No puedes editar el formato después de las 8 pm' : 'No puedes editar el formato de otro día'}
        </p>
      </div>
    )
  }

  return (
    <main id="registro-cuenta-diaria-main" className="p-3 max-w-lg mx-auto">
      {roles && (
        <div>
          {loading ?
            <Loading></Loading>
            : ''}
          <div className={'sticky  z-30 top-16'}>
            {branchReport && (
              <div className='sticky top-20'>
                <ShowBalance balance={branchReport.balance}></ShowBalance>
              </div>
            )}
          </div>
          {(selectedBranch && showSelectReportEmployees) && (
            <Modal
              content={<SelectReportEmployees currentReportEmployee={employee} currentAssistants={assistants} branch={selectedBranch} employees={employees} onRegisterEmployees={onRegisterEmployees} inReport={true} />}
              closeModal={() => { setShowSelectReportEmployees(false) }}
              ableToClose={false}
              closeOnClickOutside={false}
              isShown={showSelectReportEmployees}
            />
          )}
          <EmployeeInfo employee={employeeInfo} toggleInfo={() => { setEmployeeInfo(false) }} />
          <SectionHeader label={'Reporte'} />
          <div className="grid grid-cols-12 items-center mt-1 mb-2">
            <h1 className='col-span-12 text-3xl text-center font-semibold mt-7'>
              <div className='col-span-12'>
                {branches && (
                  <BranchSelect
                    branches={getArrayForSelects(branches, (branch) => branch.branch)}
                    modalStatus={selectBranch}
                    selectedBranch={!selectedBranch ? null : getElementForSelect({ label: ((selectedBranch?.branch || '') + ' (' + reportDate + ')'), ...selectedBranch }, (selectedBranch) => selectedBranch.label)}
                    ableToClose={selectedBranch ? true : false}
                    selectBranch={handleBranchSelectChange}
                    isEditing={edit}
                  />
                )}
              </div>
            </h1>
          </div>
          {branchReport && branchId !== null && employee !== null && ((employee._id !== currentUser._id && isSupervisor(currentUser.role)) || employee._id === currentUser._id) && (
            <div>
              <h2 className='w-full px-2 rounded-lg border-black mx-2 mt-2 bg-white'>
                <div className='flex gap-2 py-2 items-center'>
                  {branchReport?.employee &&
                    <p className='flex-shrink-0'>Encargado:</p>
                  }
                  <button onClick={() => handleShowEmployeeInfo()} className='font-bold text-md flex gap-1 truncate items-center w-full justify-center'>
                    <span>{branchReport.employee && <CgProfile />}</span> {!branchReport?.employee ? 'Termina el llenado para asignar un encargado' : getEmployeeFullName(branchReport?.employee)}
                  </button>
                </div>
                {branchReport?.assistant && (
                  <div className='flex gap-2 py-2 items-center'>
                    <p className='flex-shrink-0'>Auxiliares:</p>
                    <div className='flex flex-wrap gap-2'>
                      {branchReport.assistant.map((assistant) => (
                        <button
                          key={assistant._id}
                          onClick={() => setEmployeeInfo(assistant)}
                          className='font-bold text-md flex gap-1 truncate items-center bg-gray-200 px-2 py-1 rounded-lg hover:bg-gray-300 transition-colors'
                        >
                          <span><CgProfile /></span> {getEmployeeFullName(assistant)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </h2>
              <div className='my-2'>
                <BranchPrices
                  onUpdateBranchReport={onUpdateBranchReport}
                  prices={prices}
                  pricesDate={branchReport.pricesDate}
                  branch={branchId || selectedBranch?._id || null}
                  onChange={onChangePrices}
                />
              </div>
              {branchReport ?
                <div>
                  <div className="flex items-center justify-around">
                    <div className='w-full items-center gap-4 justify-self-end'>
                      <ShowListModal
                        title={'Sobrante Inicial'}
                        ListComponent={StockList}
                        ListComponentProps={{ stock: initialStock, amount: initialStockAmount, weight: initialStockWeight }}
                        className={'w-full'}
                        clickableComponent={
                          <p className=' font-bold text-lg text-center p-1 bg-red-200 border rounded-lg border-header'>SOBRANTE INICIAL {currency({ amount: initialStockAmount })}</p>
                        }
                      />
                    </div>
                  </div>
                  <ShowListModal
                    title={'Entradas de Proveedores'}
                    ListComponent={ProvidersInputsList}
                    ListComponentProps={{ inputs: providerInputs, totalAmount: providerInputsTotal, totalWeight: providerInputsWeight }}
                    className={'w-full'}
                    clickableComponent={
                      <p className='font-bold text-lg text-center bg-red-200 border rounded-lg p-1 border-header mt-2'>PROVEEDORES {currency({ amount: providerInputsTotal ?? 0 })}</p>
                    }
                  />
                  <ShowListModal
                    title={'Entradas'}
                    ListComponent={ListaEntradas}
                    ListComponentProps={{ inputs, totalWeight: inputsWeight, totalAmount: inputsTotal }}
                    className={'w-full'}
                    clickableComponent={
                      <p className='font-bold text-lg text-center bg-red-200 border rounded-lg p-1 border-header mt-2'>ENTRADAS {currency({ amount: inputsTotal ?? 0 })}</p>
                    }
                  />
                  <AddOutgoing
                    modifyBalance={modifyBalance}
                    outgoings={outgoings}
                    outgoingsTotal={outgoingsTotal}
                    employee={employee}
                    onAddOutgoing={onAddOutgoing}
                    onDeleteOutgoing={onDeleteOutgoing}
                    isReport={true}
                    branch={selectedBranch}
                    listButton={<p className='font-bold text-lg text-center bg-green-100 rounded-lg p-1 border border-header'>{currency({ amount: outgoingsTotal ?? 0 })}</p>}
                  />
                  <AddStock
                    title={'Sobrante'}
                    stock={stock}
                    modifyBalance={modifyBalance}
                    amount={stockAmount}
                    weight={stockWeight}
                    products={products}
                    onAddStock={onAddStock}
                    onDeleteStock={onDeleteStock}
                    branchPrices={prices}
                    branch={selectedBranch}
                    employee={employee}
                    isReport={true}
                    date={currentDate}
                    listButton={<p className='font-bold text-lg text-center bg-green-100 rounded-lg border p-1 border-header'>{currency({ amount: stockAmount ?? 0 })}</p>}
                  />
                </div>
                : ''}
              <ShowListModal
                title={'Salidas'}
                ListComponent={ListaSalidas}
                ListComponentProps={{ outputs, totalWeight: outputsWeight, totalAmount: outputsTotal }}
                className={'w-full'}
                clickableComponent={
                  <p className='font-bold text-lg text-center bg-green-100 border rounded-lg p-1 border-header mt-2'>SALIDAS {currency({ amount: outputsTotal ?? 0 })}</p>
                }
              />
              <ShowListModal
                title={'Pagos'}
                ListComponent={IncomesList}
                ListComponentProps={{ incomes: payments, incomesTotal: payments.reduce((acc, payment) => acc += payment.amount, 0) }}
                className={'w-full'}
                clickableComponent={
                  <p className='font-bold text-lg text-center bg-green-100 border rounded-lg p-1 border-header mt-2'>PAGOS {currency({ amount: payments.reduce((acc, payment) => acc += payment.amount, 0) ?? 0 })}</p>
                }
              //Comparar con el monto para cubrir la nota de hoy.
              />
              <ShowListModal
                title={'Ingresos'}
                ListComponent={IncomesList}
                ListComponentProps={{ incomes: noPayments, incomesTotal: noPayments.reduce((acc, payment) => acc += payment.amount, 0) }}
                className={'w-full'}
                clickableComponent={
                  <p className='font-bold text-lg text-center bg-green-100 border rounded-lg p-1 border-header mt-2'>EFECTIVOS {currency({ amount: noPayments.reduce((acc, payment) => acc += payment.amount, 0) ?? 0 })}</p>
                }
              //Comparar con el monto para cubrir la nota de hoy.
              />
              <AddStock
                title={'Sobrante de Medio Día'}
                stock={midDayStock}
                midDay={true}
                amount={midDayStockAmount}
                weight={midDayStockWeight}
                products={products}
                onAddStock={onAddMidStock}
                onDeleteStock={onDeleteMidStock}
                branchPrices={prices}
                branch={selectedBranch}
                employee={employee}
                date={currentDate}
                listButton={<p className='font-bold text-lg text-center bg-yellow-200 rounded-lg border p-1 border-header'>{currency({ amount: midDayStockAmount ?? 0 })}</p>}
              />
              {(isAuthorized || branchReport?.balance < 0) &&
                <p className={`${branchReport?.balance < 0 ? 'bg-red-200' : 'bg-green-100'} font-bold text-lg text-center border rounded-lg p-1 border-header mt-2`}>BALANCE: {currency({ amount: branchReport?.balance ?? 0 })}</p>
              }
              <p className='text-red-700 font-semibold'>{error}</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
