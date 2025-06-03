/* eslint-disable react/prop-types */
import { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { formatReviewDate, formatTime } from '../../helpers/DatePickerFunctions'
import { useRoles } from '../../context/RolesContext'
import { getEmployeeFullName, currency } from '../../helpers/Functions'
import ShowDetails from '../ShowDetails'
import RowItem from '../RowItem'
import { CgProfile } from 'react-icons/cg'
import { GiChickenOven } from 'react-icons/gi'
import { FaInfoCircle, FaCheckSquare } from 'react-icons/fa'
import { MdDomain } from "react-icons/md";
import ConfirmationButton from '../Buttons/ConfirmationButton'
import DeleteButton from '../Buttons/DeleteButton'
import { CiSquareInfo } from "react-icons/ci";
import EmployeeInfo from '../EmployeeInfo'
import { MoneyBag } from '../Reutilizable/Labels'

export default function HistoryMovementsProvideres({ movements, onDelete = null }) {
  const { currentUser } = useSelector((state) => state.user)
  const { isManager } = useRoles()
  const [selectedMovement, setSelectedMovement] = useState(null)
  const [shouldOpenModal, setShouldOpenModal] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const isAuthorized = (employee) => currentUser._id === employee._id || isManager(currentUser.role) || !onDelete
  const deletable = onDelete != null

  const totalWeight = useMemo(() => movements.reduce((acc, movement) => acc + movement.weight, 0), [movements])
  const totalAmount = useMemo(() => movements.reduce((acc, movement) => acc + movement.amount, 0), [movements])

  const fields = [
    { key: 'weight', label: 'Peso', format: (data) => `${data.weight.toFixed(2)} Kg` },
    { key: 'price', label: 'Precio', format: (data) => currency({ amount: data.price }) },
    { key: 'amount', label: 'Monto', format: (data) => currency({ amount: data.amount }) },
    { key: 'provider.name', label: 'Origen', format: (data) => data.provider.name },
    { key: 'employee.name', label: 'Encargado', format: (data) => getEmployeeFullName(data.employee) },
    { key: 'comment', label: 'Comentario' },
    { key: 'createdAt', label: 'Hora', format: (data) => formatTime(data.createdAt) },
  ]

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-green-800 font-bold text-lg'>
          {`${totalWeight.toFixed(3)} Kg (${currency({ amount: totalAmount })})`}
        </p>
      </div>
    )
  }

  const renderMovementItem = (movement, movementId) => {
    const { employee, product, weight, price, amount, provider, comment, createdAt, specialPrice } = movement


    return (
      isAuthorized(employee) && (
        <div className="" key={movement._id}>
          {movement.weight !== 0 ? (
            <div className="grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1">
              <div
                id="list-element"
                className="col-span-10 items-center"
              >
                <div id="list-element" className="grid grid-cols-12">
                  <div className='col-span-12'>
                    <div className="w-full text-red-800 mb-1">
                      <RowItem>
                        <p className="text-md font-bold flex gap-1 items-center"><MdDomain />{provider.name}</p>
                        <button onClick={() => setSelectedEmployee(employee)} className="font-bold text-md flex gap-1 truncate items-center"><span><CgProfile /></span>{employee.name}  {employee.lastName}</button>
                      </RowItem>
                    </div>
                    <div className="w-full text-sm font-semibold">
                      <RowItem>
                        <p className="flex gap-1 items-center font-semibold"><GiChickenOven />{product.name}</p>
                        <p className="">{`${weight} kg`}</p>
                        <p className="flex gap-1 items-center">{`${price<0? "-$" + price:"$" + price}`}{specialPrice? <FaCheckSquare />:""}</p>
                        <p className="flex gap-1 items-center"><MoneyBag />{amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                      </RowItem>
                    </div>
                    <div className="w-full mt-1">
                      <RowItem>
                        <p className="text-xs flex gap-1 items-center"><FaInfoCircle className="text-blue-800" />{comment || 'Sin observaciones.'}</p>
                        <div className="text-sm text-black flex justify-self-end">
                          {formatReviewDate(createdAt)}
                        </div>
                      </RowItem>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 my-auto items-center">
                <div className='flex flex-col gap-2 justify-center my-auto items-center'>
                  <button
                    onClick={() => {
                      setSelectedMovement(movementId)
                    }} className="border rounded-lg shadow-md w-10 h-10 flex justify-center items-center">
                    <CiSquareInfo className='w-full h-full text-blue-600' />
                  </button>
                  {deletable && (
                    <div className='w-10 h-10'>
                      <DeleteButton
                        deleteFunction={() => onDelete(movementId)}
                        className="w-full h-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      )
    )
  }

  const renderMovementsList = () => {
    return (
      <div>
        {renderTotal()}
        {movements && movements.length > 0 && movements.map((movement) => (renderMovementItem(movement, movement._id)))}
      </div>
    )
  }

  const renderActions = () => {
    return (
      <div>
        <div className="w-full flex justify-center">
          {deletable && selectedMovement && (
            <div className="w-full flex flex-col gap-2">
              <ConfirmationButton onConfirm={() => onDelete(selectedMovement)} className="bg-delete-button  text-white w-10/12 rounded-xl">
                Eliminar
              </ConfirmationButton>
              <ConfirmationButton onConfirm={() => console.log('Editing')} className="bg-update-button  text-white w-10/12 rounded-xl">
                Actualizar
              </ConfirmationButton>
            </div>
          )}
        </div>
      </div>
    )
  }

  useEffect(() => {
    setShouldOpenModal(movements.find((movement) => movement._id === selectedMovement))
  }, [selectedMovement, movements])

  return (
    <div>
      <EmployeeInfo employee={selectedEmployee} toggleInfo={() => setSelectedEmployee(null)} />
      {renderMovementsList()}
      {shouldOpenModal && (
        <ShowDetails
          data={shouldOpenModal}
          actions={renderActions}
          fields={fields}
          title={`Detalles de la ${shouldOpenModal.isReturn? "Devolución": "Compra"}`}
          closeModal={() => { setSelectedMovement(null) }}
        />
      )}
    </div>
  )
}