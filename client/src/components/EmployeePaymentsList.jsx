/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux'
import DeleteButton from './Buttons/DeleteButton'
import { formatInformationDate, formatTime } from '../helpers/DatePickerFunctions'
import { useRoles } from '../context/RolesContext'
import { getEmployeeFullName, currency } from '../helpers/Functions'
import { useState, useMemo } from 'react'
import ShowDetails from "./ShowDetails"
import RowItem from "./RowItem"
import { CgProfile } from "react-icons/cg"
import ConfirmationButton from "./Buttons/ConfirmationButton"
import MoneyBag from './Icons/MoneyBag'

export default function EmployeePaymentsList({ payments, total = 0, onDelete = null, spliceIncome, spliceExtraOutgoing }) {

  const { currentUser } = useSelector((state) => state.user)
  const { isManager } = useRoles()
  const [selectedPayment, setSelectedPayment] = useState(null)
  const isEmpty = !payments || payments.length === 0
  const isAuthorized = (employee) => currentUser._id === employee._id || isManager(currentUser.role) || !onDelete
  const deletable = onDelete != null

  const fields = [
    { key: 'employee.name', label: 'Encargado', format: (data) => data.employee.name },
    { key: 'detail', label: 'Concepto' },
    { key: 'amount', label: 'Monto', format: (data) => currency({ amount: data.amount }) },
    {
      key: 'createdAt', label: 'Hora', format: (data) => {
        return <div>
          {formatInformationDate(data.createdAt)}
          {formatTime(data.createdAt)}
        </div>
      }
    },
    { key: 'payment.employee', label: 'Deudor', format: (data) => data.employee ? getEmployeeFullName(data.employee) : '' },
    ...(selectedPayment?.income ? [
      { key: 'income.branch.branch', label: 'Dinero de', format: (data) => data?.income?.branch?.branch ?? '' }
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
    const { employee, amount, supervisor, income } = payment
    const tempPayment = { ...payment, index }

    return (
      isAuthorized(supervisor) && (
        <div className="" key={payment._id}>
          <div className="grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1">
            <button
              onClick={() => {
                setSelectedPayment(tempPayment)
              }}
              className="col-span-10 items-center flex-col"
            >
              <div className="text-red-800 mb-2">
                <RowItem>
                  <p className="font-bold text-lg flex gap-1 items-center"><span><CgProfile className="text-xl" /></span>{supervisor.name}</p>
                  <div className="text-sm text-black flex justify-self-end">
                    {formatInformationDate(payment.createdAt)} {formatTime(payment.createdAt)}
                  </div>
                </RowItem>
              </div>
              <div className="">
                <RowItem>
                  <div className="flex gap-1 items-center">
                    <p className="mr-2 text-md font-semibold">Pago a: </p>
                    <p className="text-red-800 font-semibold">{getEmployeeFullName(employee) ?? ''}</p>
                  </div>
                  <p className={`text-md text-orange-500 font-bold flex gap-1 items-center`}><MoneyBag />{currency({ amount })}</p>
                </RowItem>
              </div>
              {income ? (
                <div className="">
                  <RowItem>
                    <div className="flex gap-1 items-center">
                      <p className="mr-2 text-md font-semibold">De: </p>
                      <p className="text-red-800 font-semibold">{income?.branch?.branch ?? ''}</p>
                    </div>
                  </RowItem>
                </div>
              ) : <RowItem />}
            </button>
            <div className="col-span-2 my-auto">
              {deletable && (
                <DeleteButton
                  deleteFunction={() => onDelete(tempPayment, spliceIncome, spliceExtraOutgoing)}
                />
              )}
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
