/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';
import { TiArrowLeftOutline, TiArrowRightOutline } from "react-icons/ti";
import { useRoles } from '../../context/RolesContext';
import { getEmployeeFullName, currency, getEmployeeName } from '../../helpers/Functions';
import { useMemo, useState } from 'react';
import { formatInformationDate, formatTime } from '../../helpers/DatePickerFunctions';
import ShowDetails from '../ShowDetails';
import RowItem from '../RowItem';
import ConfirmationButton from '../Buttons/ConfirmationButton';
import { CgProfile } from 'react-icons/cg';
import MoneyBag from '../Icons/MoneyBag';
import { MdPendingActions, MdStorefront } from 'react-icons/md';
import DeleteButton from '../Buttons/DeleteButton';
import Amount from './Amount';

export default function IncomesList({ incomes = [], onDeleteIncome }) {
  const { currentUser } = useSelector((state) => state.user);
  const { isManager } = useRoles();
  const isEmpty = !incomes || incomes.length === 0;
  const [selectedIncome, setSelectedIncome] = useState(null);
  const deletable = onDeleteIncome

  const incomesTotal = useMemo(() => {

    return incomes.reduce((acc, income) => {
      const isAuthorized = currentUser._id === income.employee?._id || isManager(currentUser.role);

      if (isAuthorized) {
        return acc + income.amount;
      }

    }, 0);
  }, [incomes, currentUser, isManager]);

  const fields = [
    { key: 'amount', label: 'Monto', className: (data) => (data.partOfAPayment ? 'text-orange-700' : 'text-green-700') + ' text-center text-md font-semibold', format: (data) => currency({ amount: data.amount }) },
    { key: null, label: 'Supervisor', format: (data) => getEmployeeFullName(data.employee) },
    ...(!selectedIncome?.owner ? [
      { key: null, label: 'Origen', format: (data) => data.branch?.branch ?? data.customer?.name ?? data?.prevOwner?.name ?? '' },
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

    const { branch, customer, employee, type, amount, partOfAPayment, _id, createdAt, employeePayment } = income;
    const tempIncome = { ...income, index };
    const branchInfo = branch?.branch || branch?.label;
    const customerInfo = `${customer?.name || ''} ${customer?.lastName || ''}`.trim() || customer?.label;
    const employeeName = employee ? `${employee.name}` : '';
    const typeName = partOfAPayment ? 'Pago' : type?.name ?? type?.label;
    const formattedAmount = currency({ amount });
    const isAuthorized = currentUser._id === employee?._id || isManager(currentUser.role) || !onDeleteIncome;

    return (
      isAuthorized && (
        <div key={_id || index} className=''>
          <div
            className={
              `grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1`
            }
          >
            {/* Botón principal que ocupa 10/12 columnas */}
            <button
              onClick={() => { setSelectedIncome(tempIncome) }}
              className="col-span-10 items-center"
            >
              <div className='col-span-12 items-center'>
                <div className='w-full text-red-800'>
                  <RowItem>
                    <p className="text-md font-bold flex gap-1 items-center"><MdStorefront />{branchInfo || customerInfo}</p>
                    <p className="text-md font-bold flex gap-1 items-center truncate"><CgProfile />{employeeName}</p>
                  </RowItem>
                </div>
                <div>
                  <RowItem>
                    <p className={(partOfAPayment ? 'text-orange-700' : 'text-green-700') + ' text-center text-md font-semibold flex gap-1 items-center'}><MoneyBag />{formattedAmount}</p>
                    <p className="text-md items-center flex gap-1 font-semibold">{(partOfAPayment && <MdPendingActions />)}{typeName}</p>
                  </RowItem>
                </div>
                <div>
                  <RowItem>
                    {partOfAPayment && (
                      <span className="text-red-800 text-sm flex gap-1"><span className='text-black font-semibold'>Pago a: </span>{employeePayment?.employee?.name ?? ''}</span>
                    )}
                    <p className='text-sm flex justify-self-end'>{formatTime(createdAt)}</p>
                  </RowItem>
                </div>
              </div>
            </button>
            <div className="col-span-2 my-auto">
              {deletable && (
                <DeleteButton
                  deleteFunction={() => onDeleteIncome(tempIncome)}
                />
              )}
            </div>
          </div>
        </div>
      )
    );
  }

  const renderTransferredIncome = (income, index) => {

    const { prevOwner, owner, employee, amount, _id, createdAt } = income;
    const prevOwnerName = getEmployeeName(prevOwner);
    const ownerName = getEmployeeName(owner);
    const employeeName = getEmployeeName(employee);
    const tempIncome = { ...income, index };
    const isAuthorized = currentUser._id === employee?._id || isManager(currentUser.role) || !onDeleteIncome;

    return (
      isAuthorized && (
        <div key={_id || index} className=''>
          <div
            className={
              `grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1 bg-gray-200`
            }
          >
            {/* Botón principal que ocupa 10/12 columnas */}
            <button
              onClick={() => { setSelectedIncome(tempIncome) }}
              className="col-span-10 items-center"
            >
              <div className='col-span-12 items-center'>
                <div className='w-full text-red-800'>
                  <RowItem>
                    {prevOwner && !owner && (
                      <div>
                        {(isManager(currentUser.role) || currentUser._id === employee._id) && (
                          <div className='grid grid-cols-3 text-center'>
                            <p className="text-md font-bold flex justify-center gap-1 items-center "><CgProfile className='' />{employeeName}</p>
                            <div className='flex-wrap justify-center gap-1 items-center text-center'>
                              <TiArrowLeftOutline className='mx-auto text-3xl' />
                              <span className='text-xl'>{Amount({ amount })}</span>
                            </div>
                            <p className="font-bold flex justify-center gap-1 items-center">{prevOwnerName}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {owner && !prevOwner && (
                      <div>
                        {(currentUser._id === employee._id) && (
                          <div className='grid grid-cols-3 text-center'>
                            <p className="text-md font-bold flex justify-center gap-1 items-center "><CgProfile className='' />{employeeName}</p>
                            <div className='flex-wrap justify-center gap-1 items-center text-center'>
                              <TiArrowRightOutline className='mx-auto text-3xl' />
                              <span className='text-xl'>{Amount({ amount })}</span>
                            </div>
                            <p className="font-bold flex justify-center gap-1 items-center">{ownerName}</p>
                          </div>
                        )}
                        {(isManager(currentUser.role) && currentUser._id !== employee._id) && (
                          <div className='grid grid-cols-3 text-center'>
                            <p className="text-md font-bold flex justify-center gap-1 items-center "><CgProfile className='' />{employeeName}</p>
                            <div className='flex-wrap justify-center gap-1 items-center text-center'>
                              <TiArrowRightOutline className='mx-auto text-3xl' />
                              <span className='text-xl'>{Amount({ amount })}</span>
                            </div>
                            <p className="font-bold flex justify-center gap-1 items-center">{ownerName}</p>
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
            </button>
            <div className="col-span-2 my-auto">
              {deletable && !owner && (
                <DeleteButton
                  deleteFunction={() => onDeleteIncome(tempIncome)}
                />
              )}
            </div>
          </div>
        </div>
      )
    );
  }

  const renderIncomeItem = (income, index) => {

    // console.log(income)

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

  return (
    <div>
      {renderTotal()}
      {renderIncomesList()}
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