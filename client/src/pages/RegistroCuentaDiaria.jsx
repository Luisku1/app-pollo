/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom';
import FechaDePagina from '../components/FechaDePagina';
import { formatDate, isToday } from '../helpers/DatePickerFunctions';
import { useEmployees } from '../hooks/Employees/useEmployees';
import EmployeesSelect from '../components/Select/EmployeesSelect';
import { useBranches } from '../hooks/Branches/useBranches';
import { useBranchReport } from '../hooks/BranchReports.js/useBranchReport';
import { useLoading } from '../hooks/loading';
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

export default function RegistroCuentaDiaria({ edit = true, _branch = null }) {

  const { currentUser, company } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const [branchId, setBranchId] = useState(null)
  const { currentDate, setDate, isDateAware } = useDateNavigation({ branchId });
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { activeEmployees: employees, activeEmployees } = useEmployees({ companyId: company._id })
  const { branches } = useBranches({ companyId: company._id })
  const { roles, isManager, isJustSeller, isSupervisor } = useRoles()
  const { products } = useProducts({ companyId: company._id })
  const [selectedEmployee, setSelectedEmployee] = useState()
  const [selectedAssistant, setSelectedAssistant] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState(_branch)
  const [selectBranch, setSelectBranch] = useState(false)
  const [showPrices, setShowPrices] = useState(false)
  const [showSelectBranchEmployees, setShowSelectBranchEmployees] = useState(false)
  const [employeeInfo, setEmployeeInfo] = useState(null)
  const isAuthorized = roles && isManager(currentUser.role)
  const [ableToEdit, setAbleToEdit] = useState(false)

  const reportDate = (currentDate ? new Date(currentDate) : new Date()).toLocaleDateString('es-mx', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })
  const {
    branchReport,
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
    onDeleteOutgoing
  } = useBranchReport({ branchId, date: currentDate })

  useEffect(() => {
    const currentTime = new Date();
    const currentUTCHours = currentTime.getUTCHours();
    const currentUTCMinutes = currentTime.getUTCMinutes();

    setAbleToEdit(true)

    if (isJustSeller(currentUser.role) && !isToday(reportDate)) {
      ToastInfo('No puedes editar el formato de otro día')
      setAbleToEdit(false)
      return
    }

    if (isJustSeller(currentUser.role) && isToday(reportDate)) {
      if ((isToday(reportDate) && currentUTCHours > 2 && currentUTCHours < 6) || (isToday(reportDate) && currentUTCHours > 2 && currentUTCMinutes > 30 && currentUTCHours < 6)) {
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

  const handleEmployeeSelectChange = (employee) => {

    setSelectedEmployee(employee)
  }

  const handleAssistantSelectChange = (assistant) => {

    setSelectedAssistant(assistant)
  }

  const handleBranchSelectChange = (branch) => {

    setSelectedBranch(branch)
    setBranchId(branch.value)
    navigate('/formato/' + currentDate)
  }

  const SectionHeader = (props) => {
    return (
      <h2 className='flex text-2xl text-center font-semibold mb-4 text-red-800' onClick={props.onClick}>{props.label}</h2>
    )
  }

  const updateReport = async () => {

    setLoading(true)
    const assistant = selectedAssistant?._id ?? null

    try {

      const res = await fetch('/api/branch/report/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branchReport: branchReport,
          employee: selectedEmployee,
          assistant: assistant,
          initialStock: initialStockAmount,
          finalStock: stockAmount,
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

    setSelectedEmployee(branchReport.employee ? branchReport.employee : !edit ? null : currentUser)

  }, [branchReport, employees, currentUser, edit])

  useEffect(() => {

    if (!branchId || !branches) return

    branches.forEach(branch => {

      if (branchId == branch._id) {

        setSelectedBranch(branch)
      }
    })

  }, [branchId, branches])

  useEffect(() => {

    if (selectedBranch != null && currentDate != null && edit) {

      document.title = (selectedBranch?.branch ?? 'Formato') + ' ' + '(' + (new Date(currentDate).toLocaleDateString()) + ')'
    }

  }, [selectedBranch, currentDate, edit])

  const selectEmployees = () => {
    return (
      <div className='w-full mt-10'>
        <div>
          <h2 className='text-xl text-center font-semibold mb-4 text-black'>{`Selecciona a los responsables de `}<span className='text-red-800 font-bold'>{selectedBranch.branch}🍗</span></h2>
        </div>
        <div className="mt-1 ">
          <div className='w-full'>
            <p className='w-full'>Encargado</p>
            <div className='p-3'>
              <EmployeesSelect defaultLabel={'Sin Encargado'} isEditing={isSupervisor(currentUser.role)} employees={employees} selectedEmployee={selectedEmployee} handleEmployeeSelectChange={handleEmployeeSelectChange}></EmployeesSelect>
            </div>
          </div>
        </div>
        <div className="mt-1 p-3">
          <div className='w-full border border-red-700 rounded-lg'>
            <EmployeesSelect defaultLabel={'Sin Auxiliar'} employees={employees} selectedEmployee={selectedAssistant} handleAssistantSelectChange={handleAssistantSelectChange}></EmployeesSelect>
          </div>
        </div>
        {selectedEmployee && selectedAssistant &&
          <button onClick={updateReport} className='mt-2 rounded-lg text-white text-md p-3 w-full bg-button'>Enviar</button>
        }
        {selectedEmployee && !selectedAssistant &&
          <ConfirmationButton
            onConfirm={updateReport}
            confirmationMessage={'No has seleccionado a ningún auxiliar'}
            negativeOption={'Volver'}
            positiveOption={'Continuar sin auxiliar'}
            className="mt-2 rounded-lg text-white text-md p-3 w-full bg-button"
            messageClassName={'text-center text-red-800 font-semibold'}
          >
            Enviar
          </ConfirmationButton>
        }
      </div>
    )
  }

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
          {isToday(reportDate) ? 'No puedes editar el formato después de las 8 pm' : 'No puedes editar el formato de otro día'}
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
            {branchReport && branchId !== null && (
              <h2 className='col-span-12 px-2 rounded-lg border-black mx-2 mt-2 bg-white'>
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
                    <p className='flex-shrink-0'>Auxiliar:</p>
                    <button onClick={() => setEmployeeInfo(branchReport.assistant)} className='font-bold text-md flex gap-1 truncate items-center w-full'>
                      <span><CgProfile /></span> {getEmployeeFullName(branchReport.assistant)}
                    </button>
                  </div>
                )}
              </h2>
            )}
          </div>
          {branchReport && branchId !== null && (
            <div>
              {false ?
                <div>
                  <button className='font-bold border border-black p-3 rounded-lg text-black flex justify-self-end' onClick={() => setShowPrices(true)}>$ Precios</button>
                  {showPrices &&
                    <Modal
                      closeModal={() => setShowPrices(false)}
                      content={
                        <BranchPrices
                          onUpdateBranchReport={onUpdateBranchReport}
                          prices={prices}
                          pricesDate={branchReport.pricesDate}
                          branch={branchId || selectedBranch?._id || null}
                          onChange={onChangePrices}
                          date={currentDate}
                        />
                      }
                    />
                  }
                </div>
                :
                <div className='my-2'>
                  <BranchPrices
                    onUpdateBranchReport={onUpdateBranchReport}
                    prices={prices}
                    pricesDate={branchReport.pricesDate}
                    branch={branchId || selectedBranch?._id || null}
                    onChange={onChangePrices}
                    date={currentDate}
                  />
                </div>
              }
              {branchReport ?
                <div>
                  <div className="flex items-center justify-around">
                    <div className='w-full items-center gap-4 justify-self-end'>
                      <ShowListModal
                        title={'Sobrante'}
                        ListComponent={StockList}
                        ListComponentProps={{ stock: initialStock, amount: initialStockAmount, weight: initialStockWeight }}
                        className={'w-full'}
                        clickableComponent={
                          <p className=' font-bold text-lg text-center p-1 bg-red-200 border rounded-lg border-header'>SOBRANTE INICIAL {currency({ amount: initialStockAmount })}</p>
                        }
                      />
                    </div>
                  </div>
                  {false ?
                    <div className='w-full mt-2'>
                      <ShowListModal
                        title={'Gastos'}
                        ListComponent={OutgoingsList}
                        ListComponentProps={{ outgoings, amount: outgoingsTotal, onDelete: onDeleteOutgoing, modifyBalance }}
                        className={'w-full'}
                        clickableComponent={
                          <p className='font-bold text-lg text-center bg-green-100 rounded-lg p-1 border border-header'>GASTOS {currency({ amount: outgoingsTotal ?? 0 })}</p>
                        }
                      />
                    </div>
                    :
                    <AddOutgoing
                      modifyBalance={modifyBalance}
                      outgoings={outgoings}
                      outgoingsTotal={outgoingsTotal}
                      employee={selectedEmployee}
                      onAddOutgoing={onAddOutgoing}
                      onDeleteOutgoing={onDeleteOutgoing}
                      isReport={true}
                      branch={selectedBranch}
                      listButton={<p className='font-bold text-lg text-center bg-green-100 rounded-lg p-1 border border-header'>{currency({ amount: outgoingsTotal ?? 0 })}</p>}
                    />
                  }
                  {true ?
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
                      employee={selectedEmployee}
                      isReport={true}
                      date={currentDate}
                      listButton={<p className='font-bold text-lg text-center bg-green-100 rounded-lg border p-1 border-header'>{currency({ amount: stockAmount ?? 0 })}</p>}
                    />
                    :
                    <div className='w-full mt-2'>
                      <ShowListModal
                        title={'Sobrante'}
                        ListComponent={StockList}
                        ListComponentProps={{ stock, weight: stockWeight, amount: stockAmount, onDelete: onDeleteStock, modifyBalance }}
                        className={'w-full'}
                        clickableComponent={<p className='font-bold text-lg text-center bg-green-100 rounded-lg border p-1 border-header'>SOBRANTE {currency({ amount: stockAmount ?? 0 })}</p>
                        }
                      />
                    </div>
                  }
                  {true ?
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
                      employee={selectedEmployee}
                      date={currentDate}
                      listButton={<p className='font-bold text-lg text-center bg-yellow-200 rounded-lg border p-1 border-header'>{currency({ amount: midDayStockAmount ?? 0 })}</p>}
                    />
                    :
                    <div className='w-full mt-2'>
                      <ShowListModal
                        title={'Sobrante de Medio Día'}
                        ListComponent={StockList}
                        ListComponentProps={{ midDayStock, weight: midDayStockWeight, amount: midDayStockAmount, onDelete: onDeleteMidStock }}
                        className={'w-full'}
                        clickableComponent={<p className='font-bold text-lg text-center bg-yellow-200 rounded-lg border p-1 border-header'>SOBRANTE {currency({ amount: midDayStockAmount ?? 0 })}</p>
                        }
                      />
                    </div>
                  }
                </div>
                : ''}
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
              {(isAuthorized || branchReport?.balance < 0) &&
                <p className={`${branchReport?.balance < 0 ? 'bg-red-200' : 'bg-green-100'} font-bold text-lg text-center border rounded-lg p-1 border-header mt-2`}>BALANCE: {currency({ amount: branchReport?.balance ?? 0 })}</p>
              }
              <p className='text-red-700 font-semibold'>{error}</p>
            </div>
          )}
          {branchId &&
            <div className='flex flex-col gap-4 mt-4 sticky bottom-4'>
              {(!branchReport?.dateSent || isAuthorized) &&
                <button disabled={loading} className='bg-red-800 text-white border border-black p-3 rounded-lg w-full' onClick={() => setShowSelectBranchEmployees(true)}>Terminar llenado</button>
              }
            </div>
          }
        </div>
      )}
    </main>
  )
}
