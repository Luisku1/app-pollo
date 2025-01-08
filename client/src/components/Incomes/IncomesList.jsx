/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import DeleteButton from '../Buttons/DeleteButton';
import { useSelector } from 'react-redux';
import { useRoles } from '../../context/RolesContext';
import { getEmployeeFullName, stringToCurrency } from '../../helpers/Functions';
import { useState } from 'react';
import { formatTime } from '../../helpers/DatePickerFunctions';
import ShowDetails from '../ShowDetails';

export default function IncomesList({ incomes, incomesTotal, onDeleteIncome }) {
  const { currentUser } = useSelector((state) => state.user);
  const { roles } = useRoles();
  const [isEmpty] = useState(incomes.length === 0);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [incomeDetailsIsOpen, setIncomeDetailsIsOpen] = useState(false);

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

  const renderListHeader = () => {
    return (
      <div>
        {!isEmpty && (
          <div
            id="header"
            className="grid grid-cols-12 items-center justify-around font-semibold mt-4 border-b border-gray-300"
          >
            <p className="col-span-2 text-center">Monto</p>
            <p className="col-span-2 text-center">Tipo</p>
            <p className="col-span-3 text-center">Sucursal o Cliente</p>
            <p className="col-span-3 text-center">Encargado</p>
            <p className="col-span-2 text-center">Acciones</p>
          </div>
        )}
      </div>
    );
  };

  const renderIncomeItem = ({ income, index }) => {
    const { branch, customer, employee, type, amount, partOfAPayment, _id } = income;
    const branchInfo = branch?.branch || branch?.label;
    const customerInfo = `${customer?.name || ''} ${customer?.lastName || ''}`.trim() || customer?.label;
    const employeeName = employee ? `${employee.name} ${employee.lastName}` : '';
    const typeName = partOfAPayment ? 'Pago' : type.name ?? type.label;
    const formattedAmount = stringToCurrency({ amount });
    const isAuthorized = currentUser._id === employee?._id || currentUser.role === roles.managerRole._id;
    const deletable = (currentUser.role === roles.managerRole._id || currentUser._id === employee?._id) && !partOfAPayment;

    return (
      isAuthorized && (
        <div key={_id || index}>
          <div
            className={
              'grid grid-cols-12 items-center rounded-lg border border-gray-300 shadow-sm mt-2'
            }
          >
            {/* Botón principal que ocupa 10/12 columnas */}
            <button
              onClick={() => { setSelectedIncome(income); setIncomeDetailsIsOpen(!incomeDetailsIsOpen); }}
              className="grid grid-cols-10 items-center justify-around col-span-10 h-full w-full"
            >
              <p className={(partOfAPayment ? 'text-orange-700' : 'text-green-700') + ' text-center text-md font-semibold col-span-2'}>{formattedAmount}</p>
              <p className="text-center text-xs col-span-2">{typeName}</p>
              <p className="text-center text-xs col-span-3 whitespace-normal break-words">{branchInfo || customerInfo}</p>
              <p className="text-center text-xs col-span-3 whitespace-normal break-words">{employeeName}</p>
            </button>

            {/* Botón de eliminar que ocupa 2/12 columnas */}
            {deletable && (
              <div className="col-span-2 flex justify-center">
                <DeleteButton
                  id={_id}
                  item={income}
                  index={index}
                  deleteFunction={onDeleteIncome}
                />
              </div>
            )}
          </div>
        </div>
      )
    );
  };

  const renderIncomesList = () => {
    return (
      <div>
        {renderListHeader()}
        {incomes && incomes.length > 0 && incomes.map((income, index) => renderIncomeItem({ income, index }))}
      </div>
    );
  };

  return (
    <div>
      {renderTotal()}
      {renderIncomesList()}
      {selectedIncome && incomeDetailsIsOpen && (
        <ShowDetails
          data={selectedIncome}
          fields={fields}
          title={selectedIncome?.employeePayment ? `Detalles del Pago de ${getEmployeeFullName(selectedIncome.employeePayment.employee)}` : 'Detalles del Ingreso'}
          closeModal={() => setIncomeDetailsIsOpen(false)}
        >
        </ShowDetails>
      )}
    </div>
  );
}