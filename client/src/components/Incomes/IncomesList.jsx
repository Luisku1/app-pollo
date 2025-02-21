/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux';
import { useRoles } from '../../context/RolesContext';
import { getEmployeeFullName, stringToCurrency } from '../../helpers/Functions';
import { useState } from 'react';
import { formatTime } from '../../helpers/DatePickerFunctions';
import ShowDetails from '../ShowDetails';
import RowItem from '../RowItem';
import ConfirmationButton from '../Buttons/ConfirmationButton';
import { CgProfile } from 'react-icons/cg';
import MoneyBag from '../Icons/MoneyBag';
import { MdPendingActions, MdStorefront } from 'react-icons/md';
import DeleteButton from '../Buttons/DeleteButton';

export default function IncomesList({ incomes, incomesTotal, onDeleteIncome }) {
  const { currentUser } = useSelector((state) => state.user);
  const { roles } = useRoles();
  const isEmpty = !incomes || incomes.length === 0;
  const [selectedIncome, setSelectedIncome] = useState(null);
  const deletable = onDeleteIncome

  const fields = [
    { key: 'amount', label: 'Monto', className: (data) => (data.partOfAPayment ? 'text-orange-700' : 'text-green-700') + ' text-center text-md font-semibold', format: (data) => stringToCurrency({ amount: data.amount }) },
    { key: null, label: 'Supervisor', format: (data) => getEmployeeFullName(data.employee) },
    { key: null, label: 'Origen', format: (data) => data.branch?.branch ?? data.customer?.name },
    { key: 'createdAt', label: 'Hora', format: (data) => formatTime(data.createdAt) },
    ...(selectedIncome?.partOfAPayment ? [
      { key: 'partOfAPayment', label: 'Parte de un pago', format: (data) => data.partOfAPayment ? 'Sí' : 'No' },
      { key: 'payment.employee', label: 'Deudor', format: (data) => data.employeePayment ? getEmployeeFullName(data.employeePayment.employee) : '' }
    ] : [])
  ];

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-green-800 font-bold text-lg'>
          {stringToCurrency({ amount: incomesTotal })}
        </p>
      </div>
    );
  };

  const renderIncomeItem = (income, index) => {
    const { branch, customer, employee, type, amount, partOfAPayment, _id, createdAt, employeePayment } = income;
    const tempIncome = { ...income, index };
    const branchInfo = branch?.branch || branch?.label;
    const customerInfo = `${customer?.name || ''} ${customer?.lastName || ''}`.trim() || customer?.label;
    const employeeName = employee ? `${employee.name}` : '';
    const typeName = partOfAPayment ? 'Pago' : type?.name ?? type?.label;
    const formattedAmount = stringToCurrency({ amount });
    const isAuthorized = currentUser._id === employee?._id || currentUser.role === roles.managerRole._id || !onDeleteIncome;

    return (
      isAuthorized && (
        <div key={_id || index} className=''>
          <div
            className={
              'grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1'
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
                      <p className="text-red-800 text-sm flex gap-1"><p className='text-black font-semibold'>Pago a: </p>{employeePayment?.employee?.name ?? ''}</p>
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
  };

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

  return (
    <div>
      {renderTotal()}
      {renderIncomesList()}
      {selectedIncome && (
        <ShowDetails
          data={selectedIncome}
          actions={renderActions}
          fields={fields}
          title={selectedIncome?.employeePayment ? `Detalles del Pago de ${getEmployeeFullName(selectedIncome.employeePayment.employee)}` : 'Detalles del Ingreso'}
          closeModal={() => setSelectedIncome(null)}
        >
        </ShowDetails>
      )}
    </div>
  );
}