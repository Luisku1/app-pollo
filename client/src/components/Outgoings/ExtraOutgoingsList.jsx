import { useSelector } from "react-redux"
import { useRoles } from "../../context/RolesContext"
import { useState, useMemo } from "react"
import { getEmployeeFullName, currency } from "../../helpers/Functions"
import ShowDetails from "../ShowDetails"
import RowItem from "../RowItem"
import { CgProfile } from "react-icons/cg"
import ConfirmationButton from "../Buttons/ConfirmationButton"
import DeleteButton from "../Buttons/DeleteButton"
import { formatDateAndTime } from "../../helpers/DatePickerFunctions"
import EmployeeInfo from "../EmployeeInfo"
import { CiSquareInfo } from "react-icons/ci"

/* eslint-disable react/prop-types */
export default function ExtraOutgoingsList({ extraOutgoings, onDelete = null }) {
  const { currentUser } = useSelector((state) => state.user)
  const { isManager } = useRoles()
  const [selectedOutgoing, setSelectedOutgoing] = useState(null)
  const isAuthorized = (employee) => currentUser._id === employee._id || isManager(currentUser.companyData?.[0].role) || !onDelete
  const deletable = onDelete != null
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fields = [
    { key: 'employee.name', label: 'Encargado', format: (data) => data.employee.name },
    { key: 'concept', label: 'Concepto' },
    { key: 'amountt', label: 'Monto', format: (data) => currency({ amount: data.amount }) },
    { key: 'createdAt', label: 'Hora', format: (data) => formatDateAndTime(data.createdAt) },
    ...(selectedOutgoing?.linkedModel ? [
      { key: 'linkedModel', label: 'Vinculado a', format: (data) => data.linkedModel === 'EmployeePayment' ? 'Pago a empleado' : (data.linkedModel === 'IncomeCollected' ? 'Ingreso' : '') },
      { key: 'linked', label: 'Referencia', format: (data) => data.linked?._id || data.linked || '' }
    ] : [])
  ]

  const totalExtraOutgoings = useMemo(() => {
    return extraOutgoings.reduce((total, outgoing) => total + (outgoing.amount || 0), 0)
  }, [extraOutgoings])

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
    const employee = outgoing.employee || outgoing.deletedEmployee;
    const { concept, amount, linkedModel, linked, employeePayment } = outgoing
    const tempOutgoing = { ...outgoing, index }

    return (
      isAuthorized(employee) && (
        <div className="" key={outgoing._id}>
          <div className={`grid grid-cols-12 rounded-2xl shadow-sm mb-2 py-1 border ${employee?._id === currentUser._id ? 'border-sky-300' : 'border-black border-opacity-30'}`}>
            <div id="list-element" className="col-span-10 items-center">
              <div id="list-element" className="grid grid-cols-12">
                <div className='col-span-12'>
                  <div className="w-full text-red-800 mb-2">
                    <RowItem>
                      <button onClick={() => setSelectedEmployee(employee)} className="text-red-800 font-bold text-md flex gap-1 items-center w-full"><span><CgProfile /></span>{employee?.name ?? 'Ex empleado'}</button>
                      <div className="text-sm text-black flex justify-self-end">
                        {formatDateAndTime(outgoing.createdAt)}
                      </div>
                    </RowItem>
                  </div>
                  <div className="w-full text-sm font-semibol mb-2">
                    <RowItem>
                      <p className="text-md font-semibold">{concept.split('[')[0]}</p>
                      <p className={`text-md text-orange-500 font-bold`}>{currency({ amount })}</p>
                    </RowItem>
                  </div>
                  {linkedModel === 'EmployeePayment' && (
                    <div className="w-full">
                      <RowItem>
                        <div className="flex gap-1 items-center">
                          <p className="mr-2 text-md font-semibold">Pago a: </p>
                          <p className="text-red-800 font-semibold">{getEmployeeFullName((employeePayment?.employee) || (linked?.employee)) ?? ''}</p>
                        </div>
                      </RowItem>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-span-2 my-auto">
              <div className="flex flex-col gap-2 justify-center my-auto items-center">
                <button
                  onClick={() => {
                    setSelectedOutgoing(tempOutgoing);
                  }}
                  className="border rounded-lg shadow-md w-10 h-10 flex justify-center items-center" >
                  <CiSquareInfo className="w-full h-full text-blue-600" />
                </button>
                {deletable && !linkedModel && (
                  <div className="flex justify-center h-10 w-10">
                    <DeleteButton
                      deleteFunction={() => onDelete(tempOutgoing)} />
                  </div>
                )}
              </div>
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
          {deletable && selectedOutgoing && !selectedOutgoing.linkedModel && (
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


  if (!extraOutgoings || extraOutgoings.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg">No hay gastos fuera de cuentas registrados.</p>
      </div>
    )
  }

  return (
    <div>
      {renderOutgoingsList()}
      <EmployeeInfo employee={selectedEmployee} toggleInfo={() => setSelectedEmployee(null)} />
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
