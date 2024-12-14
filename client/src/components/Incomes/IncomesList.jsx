/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useIncomes } from '../../hooks/Incomes/useIncomes'
import DeleteButton from '../Buttons/DeleteButton';
import { useSelector } from 'react-redux';
import { useDeleteIncome } from '../../hooks/Incomes/useDeleteIncome';
import { useRoles } from '../../context/RolesContext';
import { stringToCurrency } from '../../helpers/Functions';

export default function IncomesList({ incomesData }) {

  const { currentUser } = useSelector((state) => state.user)
  const { deleteIncome } = useDeleteIncome()
  const { incomes, incomesTotal, spliceIncome } = useIncomes({ initialIncomes: incomesData })
  const { roles } = useRoles()
  const isEmpty = incomes.length === 0

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-green-800 font-bold text-lg'>
          {stringToCurrency({amount: incomesTotal})}
        </p>
      </div>
    )
  }

  const renderListHeader = () => {
    return (
      <div>
        {!isEmpty && (
          <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
            <p className='col-span-3 text-center'>Sucursal o Cliente</p>
            <p className='col-span-2 text-center'>Encargado</p>
            <p className='col-span-3 text-center'>Tipo</p>
            <p className='col-span-1 text-center'>Monto</p>
          </div>
        )}
      </div>
    )
  }

  // Subcomponente para elementos individuales de la lista
  const renderIncomeItem = ({ income, index }) => {
    const { branch, customer, employee, type, amount, partOfAPayment, _id } = income
    const branchInfo = branch?.branch || branch?.label
    const customerInfo = `${customer?.name || ''} ${customer?.lastName || ''}`.trim() || customer?.label
    const employeeName = `${employee.name} ${employee.lastName}`
    const typeName = partOfAPayment ? 'Pago' : type?.name || type?.label
    const formattedAmount = amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
    const isAuthorized = currentUser._id === employee._id || currentUser.role === roles.managerRole._id;

    return (
      isAuthorized && (
        <div key={_id || index}>
          <div className="grid grid-cols-12 items-center border border-gray-300 mt-2 shadow-sm rounded-lg">
            <div className="flex col-span-10 items-center justify-around pt-3 pb-3">
              <p className="text-center text-xs w-3/12">{branchInfo || customerInfo}</p>
              <p className="text-center text-xs w-3/12">{employeeName}</p>
              <p className="text-center text-xs w-2/12">{typeName}</p>
              <p className="text-center text-xs w-3/12">{formattedAmount}</p>
            </div>
            {isAuthorized && !partOfAPayment && (
              <DeleteButton
                id={_id}
                deleteFunction={deleteIncome}
                index={index}
                item={income}
                spliceFunction={spliceIncome}
              />
            )}
          </div>
        </div>
      )
    )
  }

  const renderIncomesList = () => {

    const showTotal = currentUser.role === roles.managerRole._id

    return (
      <div>
        {showTotal && renderTotal()}
        {renderListHeader()}
        {roles && roles.managerRole && !isEmpty && incomes.map((income, index) => renderIncomeItem({income, index}))}
      </div>
    )
  }

  return (
    <div>
      {renderIncomesList()}
    </div>
  )
}