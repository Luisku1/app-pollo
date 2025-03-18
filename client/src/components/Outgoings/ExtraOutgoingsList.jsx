import { useSelector } from "react-redux"
import { useRoles } from "../../context/RolesContext"
import { useState, useMemo } from "react"
import { getEmployeeFullName, currency } from "../../helpers/Functions"
import ShowDetails from "../ShowDetails"
import RowItem from "../RowItem"
import { CgProfile } from "react-icons/cg"
import ConfirmationButton from "../Buttons/ConfirmationButton"
import DeleteButton from "../Buttons/DeleteButton"
import { formatTime } from "../../helpers/DatePickerFunctions"

/* eslint-disable react/prop-types */
export default function ExtraOutgoingsList({ extraOutgoings, totalExtraOutgoings = 0, onDelete = null }) {
  const { currentUser } = useSelector((state) => state.user)
  const { isManager } = useRoles()
  const [selectedOutgoing, setSelectedOutgoing] = useState(null)
  const isAuthorized = (employee) => currentUser._id === employee._id || isManager(currentUser.role) || !onDelete
  const deletable = onDelete != null

  const fields = [
    { key: 'employee.name', label: 'Encargado', format: (data) => data.employee.name },
    { key: 'concept', label: 'Concepto' },
    { key: 'amountt', label: 'Monto', format: (data) => currency({ amount: data.amount }) },
    { key: 'createdAt', label: 'Hora', format: (data) => formatTime(data.createdAt) },
    ...(selectedOutgoing?.partOfAPayment && selectedOutgoing ? [
      { key: 'partOfAPayment', label: 'Parte de un pago', format: (data) => data.partOfAPayment ? 'Sí' : 'No' },
      { key: 'payment.employee', label: 'Deudor', format: (data) => data.employeePayment ? getEmployeeFullName(data.employeePayment.employee) : '' }
    ] : [])
  ]

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-orange-500 font-bold text-lg'>
          {currency({ amount: totalExtraOutgoings })}
        </p>
      </div>
    )
  }

  const renderOutgoingItem = (outgoing, index) => {
    const { employee, concept, amount, partOfAPayment, employeePayment } = outgoing
    const tempOutgoing = { ...outgoing, index }

    return (
      isAuthorized(employee) && (
        <div className="" key={outgoing._id}>
          <div className="grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1">
            <button
              onClick={() => {
                setSelectedOutgoing(tempOutgoing)
              }}
              id="list-element"
              className="col-span-10 items-center"
            >
              <div id="list-element" className="grid grid-cols-12">
                <div className='col-span-12'>
                  <div className="w-full text-red-800 mb-2">
                    <RowItem>
                      <p className="font-bold text-md flex gap-1 items-center"><span><CgProfile className="text-xl" /></span>{employee.name}</p>
                      <div className="text-sm text-black flex justify-self-end">
                        {formatTime(outgoing.createdAt)}
                      </div>
                    </RowItem>
                  </div>
                  <div className="w-full text-sm font-semibol mb-2">
                    <RowItem>
                      <p className="text-md font-semibold">{concept.split('[')[0]}</p>
                      <p className={`text-md text-orange-500 font-bold`}>{currency({ amount })}</p>
                    </RowItem>
                  </div>
                  {partOfAPayment && employeePayment && (
                    <div className="w-full">
                      <RowItem>
                        <div className="flex gap-1 items-center">
                          <p className="mr-2 text-md font-semibold">Pago a: </p>
                          <p className="text-red-800 font-semibold">{getEmployeeFullName(employeePayment?.employee) ?? ''}</p>
                        </div>
                      </RowItem>
                    </div>
                  )}
                </div>
              </div>
            </button>
            <div className="col-span-2 my-auto">
              {deletable && !partOfAPayment && (
                <DeleteButton
                  deleteFunction={() => onDelete(tempOutgoing)}
                />
              )}
            </div>
          </div>
        </div>
      )
    )
  }

  const renderOutgoingsList = () => {
    return (
      <div>
        {renderTotal()}
        {extraOutgoings && extraOutgoings.length > 0 && extraOutgoings.map((outgoing, index) => (renderOutgoingItem(outgoing, index)))}
      </div>
    )
  }

  const renderActions = () => {
    return (
      <div>
        <div className="w-full flex justify-center">
          {deletable && selectedOutgoing && !selectedOutgoing.partOfAPayment && (
            <div className="w-full flex flex-col gap-2">
              <ConfirmationButton onConfirm={() => onDelete(selectedOutgoing)} className="bg-delete-button text-white w-10/12 rounded-xl">
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
    return selectedOutgoing !== null && selectedOutgoing !== undefined && extraOutgoings.length > 0 && extraOutgoings.find((outgoing) => outgoing._id === selectedOutgoing._id) !== undefined
  }, [selectedOutgoing, extraOutgoings])

  return (
    <div>
      {renderOutgoingsList()}
      {shouldOpenModal && (
        <ShowDetails
          data={selectedOutgoing}
          actions={renderActions}
          fields={fields}
          title={"Detalles del egreso de " + selectedOutgoing.concept}
          closeModal={() => { setSelectedOutgoing(null) }}
        />
      )}
    </div>
  )
}
