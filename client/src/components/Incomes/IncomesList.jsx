/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';
import { TiArrowLeftOutline, TiArrowRightOutline } from "react-icons/ti";
import { useRoles } from '../../context/RolesContext';
import { getEmployeeFullName, currency, getEmployeeName } from '../../helpers/Functions';
import { useMemo, useState } from 'react';
import { formatDateAndTime, formatInformationDate, formatTime } from '../../helpers/DatePickerFunctions';
import ShowDetails from '../ShowDetails';
import RowItem from '../RowItem';
import ConfirmationButton from '../Buttons/ConfirmationButton';
import { CgProfile } from 'react-icons/cg';
import { MdPendingActions } from 'react-icons/md';
import DeleteButton from '../Buttons/DeleteButton';
import Amount from './Amount';
import { CiSquareInfo } from 'react-icons/ci';
import EmployeeInfo from '../EmployeeInfo';
import { MoneyBag } from '../Reutilizable/Labels';
import EmployeeName from '../Names/EmployeeName';
import BranchName from '../Names/BranchName';
import CustomerName from '../Names/CustomerName';


export default function IncomesList({ incomes = [], onDeleteIncome, statistics = null }) {
  const { currentUser } = useSelector((state) => state.user);
  const { isManager } = useRoles();
  const isEmpty = !incomes || incomes.length === 0;
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const deletable = onDeleteIncome

  const incomesTotal = useMemo(() => {

    return incomes.reduce((acc, income) => {
      const isAuthorized = currentUser._id === income.employee?._id || isManager(currentUser.role);

      return acc + (isAuthorized ? income.amount : 0);

    }, 0);
  }, [incomes, currentUser, isManager]);

  const fields = [
    { key: 'amount', label: 'Monto', className: (data) => (data.partOfAPayment ? 'text-orange-700' : 'text-green-700') + ' text-center text-md font-semibold', format: (data) => currency({ amount: data.amount }) },
    { key: null, label: `${selectedIncome?.owner ? 'Origen' : 'Supervisor'}`, format: (data) => getEmployeeFullName(data.employee) },
    ...(!selectedIncome?.owner && !selectedIncome?.prevOwner ? [
      { key: null, label: 'Origen', format: (data) => data.branch?.branch ?? data.customer?.name ?? data?.prevOwner?.name ?? '' },
    ] : []),
    ...(selectedIncome?.prevOwner ? [
      { key: null, label: 'Origen', format: (data) => data.branch?.branch ?? data.customer?.name ?? data?.prevOwner?.name ?? '' },
    ] : []),
    ...(selectedIncome?.owner ? [
      { key: null, label: 'Destino', format: (data) => data.branch?.branch ?? data.customer?.name ?? data?.owner?.name ?? '' },
    ] : []),
    {
      key: 'createdAt', label: 'Fecha', format: (data) => {
        return <div>
          {formatInformationDate(data.createdAt)}
          {formatTime(data.createdAt)}
        </div>
      }
    },
    ...(selectedIncome?.partOfAPayment ? [
      { key: 'partOfAPayment', label: 'Parte de un pago', format: (data) => data.partOfAPayment ? 'Sí' : 'No' },
      { key: 'payment.employee', label: 'Deudor', format: (data) => data.employeePayment ? getEmployeeFullName(data.employeePayment.employee) : '' }
    ] : [])
  ];

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-green-800 font-bold text-lg'>
          {currency({ amount: incomesTotal })}
        </p>
      </div>
    );
  };

  const renderCommonIncome = (income, index) => {
    // Preferir deletedEmployee si no existe employee
    const employee = income.employee || income.deletedEmployee;
    const branch = income.branch;
    const customer = income.customer;
    const type = income.type;
    const amount = income.amount;
    const partOfAPayment = income.partOfAPayment;
    const _id = income._id;
    const createdAt = income.createdAt;
    const employeePayment = income.employeePayment;
    const tempIncome = { ...income, index };
    const customerInfo = `${customer?.name || ''} ${customer?.lastName || ''}`.trim() || customer?.label;
    const typeName = partOfAPayment ? 'Pago' : type?.name ?? type?.label;
    const formattedAmount = currency({ amount });
    const isAuthorized = currentUser._id === (employee?._id) || isManager(currentUser.role) || !onDeleteIncome;

    return (
      isAuthorized && (
        <div key={_id || index} className=''>
          <div
            className={
              `grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1`
            }
          >
            <div id="list-element" className="col-span-10 items-center">
              <div className='col-span-12 items-center'>
                <div className='w-full text-red-800 mb-1'>
                  <RowItem>
                    <BranchName branch={branch} />
                    <CustomerName customer={customer} />
                    <EmployeeName employee={employee} />
                  </RowItem>
                </div>
                <div>
                  <RowItem>
                    <p className={(partOfAPayment ? 'text-orange-700' : 'text-green-700') + ' text-center text-md font-semibold flex gap-1 items-center'}><MoneyBag />{formattedAmount}</p>
                    <p className="text-md items-center flex gap-1 font-semibold">{(partOfAPayment && <MdPendingActions />)}{typeName}</p>
                  </RowItem>
                </div>
                <div className='mt-1'>
                  <RowItem>
                    {partOfAPayment && (
                      <span className="text-red-800 text-sm flex gap-1"><span className='text-black font-semibold'>Pago a: </span>{employeePayment?.employee?.name ?? ''}</span>
                    )}
                    <p className='text-sm flex justify-self-end'>{formatDateAndTime(createdAt)}</p>
                  </RowItem>
                </div>
              </div>
            </div>
            <div className="col-span-2 my-auto">
              <div className="flex flex-col gap-2 justify-center my-auto items-center">
                <button
                  onClick={() => {
                    setSelectedIncome(tempIncome);
                  }}
                  className="border rounded-lg shadow-md w-10 h-10 flex justify-center items-center" >
                  <CiSquareInfo className="w-full h-full text-blue-600" />
                </button>
                {deletable && !partOfAPayment && (
                  <div className='w-10 h-10'>
                    <DeleteButton
                      deleteFunction={() => onDeleteIncome(tempIncome)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    );
  }

  const renderTransferredIncome = (income, index) => {
    // Preferir deletedX si no existe X
    const prevOwner = income.prevOwner || income.deletedPrevOwner;
    const owner = income.owner || income.deletedOwner;
    const employee = income.employee || income.deletedEmployee;
    const amount = income.amount;
    const _id = income._id;
    const createdAt = income.createdAt;
    const tempIncome = { ...income, index };
    const prevOwnerName = getEmployeeName(prevOwner);
    const ownerName = getEmployeeFullName(owner);
    const employeeName = getEmployeeFullName(employee);
    const isAuthorized = currentUser._id === (employee?._id) || isManager(currentUser.role) || !onDeleteIncome;

    return (
      isAuthorized && (
        <div key={_id || index} className=''>
          <div
            className={
              `grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1 bg-gray-200`
            }
          >
            <div
              className="col-span-10 items-center"
            >
              <div className='col-span-12 items-center'>
                <div className='w-full'>
                  <RowItem>
                    {prevOwner && !owner && (
                      <div>
                        {(isManager(currentUser.role) || currentUser._id === (employee?._id)) && (
                          <div className='grid grid-cols-3 text-center'>
                            <button onClick={() => setSelectedEmployee(employee)} className="font-bold text-md flex gap-1 items-center w-full"><span><CgProfile /></span>{employeeName}</button>
                            <div className='flex-wrap justify-center gap-1 items-center text-center w-full'>
                              <TiArrowLeftOutline className='mx-auto text-3xl' />
                              <span className='text-xl'>{Amount({ amount })}</span>
                            </div>
                            <button onClick={() => setSelectedEmployee(prevOwner)} className="font-bold text-md flex gap-1 items-center w-full"><span><CgProfile /></span>{prevOwnerName}</button>
                          </div>
                        )}
                      </div>
                    )}
                    {owner && !prevOwner && (
                      <div>
                        {(currentUser._id === (employee?._id)) && (
                          <div className='grid grid-cols-3 text-center'>
                            <button onClick={() => setSelectedEmployee(employee)} className="font-bold text-md flex gap-1 items-center w-full"><span><CgProfile /></span>{employeeName}</button>
                            <div className='flex-wrap justify-center gap-1 items-center text-center w-full'>
                              <TiArrowRightOutline className='mx-auto text-3xl' />
                              <span className='text-xl'>{Amount({ amount })}</span>
                            </div>
                            <button onClick={() => setSelectedEmployee(prevOwner)} className="font-bold text-md flex gap-1 items-center w-full"><span><CgProfile /></span>{prevOwnerName}</button>
                          </div>
                        )}
                        {(isManager(currentUser.role) && currentUser._id !== (employee?._id)) && (
                          <div className='grid grid-cols-3 text-center'>
                            <button onClick={() => setSelectedEmployee(employee)} className="font-bold text-md flex gap-1 items-center w-full"><span><CgProfile /></span>{employeeName}</button>
                            <div className='flex-wrap justify-center gap-1 items-center text-center w-full'>
                              <TiArrowRightOutline className='mx-auto text-3xl' />
                              <span className='text-xl'>{Amount({ amount })}</span>
                            </div>
                            <button onClick={() => setSelectedEmployee(owner)} className="font-bold text-md flex gap-1 items-center w-full"><span><CgProfile /></span>{ownerName}</button>
                          </div>
                        )}
                      </div>
                    )}
                  </RowItem>
                </div>
                <div>
                  <RowItem>
                    <p className='text-sm flex justify-self-end'>{formatTime(createdAt)}</p>
                  </RowItem>
                </div>
              </div>
            </div>
            <div className="col-span-2 my-auto justify-self-center items-center">
              <button
                onClick={() => {
                  setSelectedIncome(tempIncome)
                }} className="border rounded-lg shadow-md w-10 h-10 flex justify-center items-center">
                <CiSquareInfo className='w-full h-full text-blue-600' />
              </button>
              <div className='w-10 h-10 justify-self-center'>
                {(deletable && (!owner && (currentUser._id == (employee?._id) || isManager(currentUser.role)))) && (
                  <DeleteButton
                    deleteFunction={() => onDeleteIncome(tempIncome)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )
    );
  }

  const renderIncomeItem = (income, index) => {

    return (
      <div key={index} className=''>
        {
          !income?.prevOwner && !income?.owner ? (
            renderCommonIncome(income, index)
          )
            : (
              renderTransferredIncome(income, index)
            )
        }
      </div>
    )
  }

  const renderActions = () => {
    return (
      <div>
        <div className="w-full flex justify-center">
          {deletable && selectedIncome && (
            <div className="w-full flex flex-col gap-2">
              <ConfirmationButton onConfirm={() => onDeleteIncome(selectedIncome)} className="bg-delete-button text-white w-10/12 rounded-xl">
                Eliminar
              </ConfirmationButton>
              <ConfirmationButton onConfirm={() => console.log('Editing')} className="bg-update-button text-white w-10/12 rounded-xl">
                Actualizar
              </ConfirmationButton>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderIncomesList = () => {
    return (
      <div>
        {!isEmpty && incomes.map(renderIncomeItem)}
      </div>
    );
  };

  const title = selectedIncome?.employeePayment ?
    `Detalles del Pago de ${getEmployeeFullName(selectedIncome.employeePayment.employee)}`
    :
    selectedIncome?.owner || selectedIncome?.prevOwner ?
      'Detalles de la Transferencia'
      :
      'Detalles del Ingreso'

  if (!incomes || incomes.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <p className='text-gray-500 text-lg'>No hay ingresos registrados</p>
      </div>
    );
  }

  return (
    <div>
      {statistics && statistics()}
      {renderTotal()}
      {renderIncomesList()}
      <EmployeeInfo employee={selectedEmployee} toggleInfo={() => setSelectedEmployee(null)} />
      {selectedIncome && (
        <ShowDetails
          data={selectedIncome}
          actions={renderActions}
          fields={fields}
          title={title}
          closeModal={() => setSelectedIncome(null)}
        >
        </ShowDetails>
      )}
    </div>
  );
}