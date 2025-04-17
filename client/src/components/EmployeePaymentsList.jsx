/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux'
import DeleteButton from './Buttons/DeleteButton'
import { formatDateAndTime, formatInformationDate, formatTime } from '../helpers/DatePickerFunctions'
import { useRoles } from '../context/RolesContext'
import { getEmployeeFullName, currency } from '../helpers/Functions'
import { useState, useMemo } from 'react'
import ShowDetails from "./ShowDetails"
import RowItem from "./RowItem"
import { CgProfile } from "react-icons/cg"
import ConfirmationButton from "./Buttons/ConfirmationButton"
import MoneyBag from './Icons/MoneyBag'
import Amount from './Incomes/Amount'
import BranchName from './BranchName'
import EmployeeInfo from './EmployeeInfo'
import { CiSquareInfo } from 'react-icons/ci'

export default function EmployeePaymentsList({ payments, onDelete = null, spliceIncome, spliceExtraOutgoing }) {

  const { currentUser } = useSelector((state) => state.user)
  const { isManager } = useRoles()
  const [selectedPayment, setSelectedPayment] = useState(null)
  const isEmpty = !payments || payments.length === 0
  const isAuthorized = (employee) => currentUser._id === employee._id || isManager(currentUser.role) || !onDelete
  const deletable = onDelete != null
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const total = useMemo(() => payments.reduce((acc, payment) => acc + payment.amount, 0), [payments])

  const fields = [
    { key: 'employee.name', label: 'Encargado', format: (data) => data.employee.name },
    { key: 'detail', label: 'Concepto' },
    { key: 'amount', label: 'Monto', format: (data) => Amount({ amount: data.amount }) },
    {
      key: 'createdAt', label: 'Fecha', format: (data) => {
        return formatDateAndTime(data.createdAt)
      }
    },
    { key: 'payment.employee', label: 'Entregado a', format: (data) => data.employee ? getEmployeeFullName(data.employee) : '' },
    ...(selectedPayment?.income ? [
      { key: 'income.branch.branch', label: 'Dinero de', format: (data) => BranchName({ branchName: data?.income?.branch?.branch }) ?? '' }
    ] : [])
  ]

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-green-800 font-bold text-lg'>
          {currency({ amount: total })}
        </p>
      </div>
    )
  }

  const renderEmployeePayment = (payment, index) => {
    const { employee, amount, supervisor, income, createdAt } = payment
    const tempPayment = { ...payment, index }

    return (
      isAuthorized(supervisor) && (
        <div className="" key={payment._id}>
          <div className="grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1">
            <div id="list-element" className="col-span-10 items-center">
              <div className="text-red-800 mb-1">
                <RowItem>
                  <button onClick={() => setSelectedEmployee(supervisor)} className="font-bold text-md flex gap-1 items-center w-full"><span><CgProfile /></span>{supervisor.name}</button>
                  <div className="text-sm text-black flex justify-self-end">
                    {formatDateAndTime(createdAt)}
                  </div>
                </RowItem>
              </div>
              <div className="">
                <RowItem>
                  <div className="flex gap-1 items-center">
                    <p className="mr-2 text-md font-semibold">Pago a: </p>
                    <button onClick={() => setSelectedEmployee(employee)} className="text-red-800 font-bold text-md flex gap-1 items-center w-full"><span><CgProfile /></span>{employee.name}</button>
                  </div>
                  <p className={`text-md text-orange-500 font-bold flex gap-1 items-center`}><MoneyBag />{currency({ amount })}</p>
                </RowItem>
              </div>
              {income ? (
                <div className="mt-1">
                  <RowItem>
                    <div className="flex gap-1 items-center">
                      <p className="mr-2 text-md font-semibold">De: </p>
                      <p className="text-red-800 font-semibold">{income?.branch?.branch ?? ''}</p>
                    </div>
                  </RowItem>
                </div>
              ) : <RowItem />}
            </div>
            <div className="col-span-2 my-auto">
              <div className="flex flex-col gap-2 justify-center my-auto items-center">
                <button
                  onClick={() => {
                    setSelectedPayment(tempPayment);
                  }}
                  className="border rounded-lg shadow-md w-10 h-10 flex justify-center items-center">
                  <CiSquareInfo className="w-full h-full text-blue-600" />
                </button>
                {deletable && (
                  <div className='w-10 h-10'>
                    <DeleteButton
                      deleteFunction={() => onDelete(tempPayment, spliceIncome, spliceExtraOutgoing)} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    )
  }

  const renderEmployeesPayments = () => {
    return (
      <div>
        {renderTotal()}
        {!isEmpty && payments.map((payment, index) => (renderEmployeePayment(payment, index)))}
      </div>
    )
  }

  const renderActions = () => {
    return (
      <div>
        <div className="w-full flex justify-center">
          {deletable && selectedPayment && (
            <div className="w-full flex flex-col gap-2">
              <ConfirmationButton onConfirm={() => onDelete(selectedPayment, spliceIncome, spliceExtraOutgoing)} className="bg-delete-button text-white w-10/12 rounded-xl">
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

  const shouldOpenModal = useMemo(() => {
    return selectedPayment !== null && selectedPayment !== undefined && payments.length > 0 && payments.find((payment) => payment._id === selectedPayment._id) !== undefined
  }, [selectedPayment, payments])

  return (
    <div>
      {renderEmployeesPayments()}
      <EmployeeInfo employee={selectedEmployee} toggleInfo={() => setSelectedEmployee(null)} />
      {shouldOpenModal && (
        <ShowDetails
          data={selectedPayment}
          actions={renderActions}
          fields={fields}
          title={"Detalles del pago de " + selectedPayment.employee.name}
          closeModal={() => { setSelectedPayment(null) }}
        />
      )}
    </div>
  )
}
