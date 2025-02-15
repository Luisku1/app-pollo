/* eslint-disable react/prop-types */
import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { formatTime } from '../../../helpers/DatePickerFunctions'
import { useRoles } from '../../../context/RolesContext'
import { stringToCurrency } from '../../../helpers/Functions'
import ShowDetails from '../../ShowDetails'
import RowItem from '../../RowItem'
import { CgProfile } from 'react-icons/cg'
import { GiChickenOven } from 'react-icons/gi'
import { FaInfoCircle } from 'react-icons/fa'
import { MdStorefront } from 'react-icons/md'
import ConfirmationButton from '../../Buttons/ConfirmationButton'
import MoneyBag from '../../Icons/MoneyBag'
import DeleteButton from '../../Buttons/DeleteButton'

export default function ListaEntradas({ inputs, totalWeight = 0, totalAmount = 0, onDelete = null }) {
  const { currentUser } = useSelector((state) => state.user)
  const { roles } = useRoles()
  const [selectedInput, setSelectedInput] = useState(null)
  const isAuthorized = (employee) => currentUser._id === employee._id || currentUser.role === roles.managerRole._id || !onDelete
  const deletable = onDelete != null

  const fields = [
    { key: 'weight', label: 'Peso', format: (data) => `${data.weight.toFixed(2)} Kg` },
    { key: 'pieces', label: 'Piezas', format: (data) => data.pieces.toFixed(2) },
    { key: 'price', label: 'Precio', format: (data) => stringToCurrency({ amount: data.price }) },
    { key: 'amount', label: 'Monto', format: (data) => stringToCurrency({ amount: data.amount }) },
    { key: 'branch.branch', label: 'Entró a', format: (data) => data.branch.branch },
    { key: 'employee.name', label: 'Encargado', format: (data) => `${data.employee.name} ${data.employee.lastName}` },
    { key: 'comment', label: 'Comentario' },
    { key: 'createdAt', label: 'Hora', format: (data) => formatTime(data.createdAt) },
  ]

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-green-800 font-bold text-lg'>
          {`${totalWeight.toFixed(3)} Kg - ${stringToCurrency({ amount: totalAmount })}`}
        </p>
      </div>
    )
  }

  const renderInputItem = (input, index) => {
    const { employee, product, pieces, weight, amount, branch, comment, customer } = input
    const customerInfo = `${customer?.name || ''} ${customer?.lastName || ''}`.trim() || customer?.label
    const branchInfo = branch?.branch || ''

    return (
      isAuthorized(employee) && (
        <div className="" key={input._id}>
          {input.weight !== 0 ? (
            <div className="grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1">
              <button
                onClick={() => {
                  setSelectedInput({ ...input, index })
                }}
                id="list-element"
                className="col-span-10 items-center"
              >
                <div id="list-element" className="grid grid-cols-12">
                  <div className='col-span-12'>
                    <div className="w-full text-red-800 mb-2">
                      <RowItem>
                        <p className="text-md font-bold flex gap-1 items-center"><MdStorefront />{customerInfo || branchInfo}</p>
                        <p className="font-bold text-md flex gap-1 items-center truncate"><span><CgProfile /></span>{employee.name}</p>
                      </RowItem>
                    </div>
                    <div className="w-full text-sm font-semibold">
                      <RowItem>
                        <p className="flex gap-1 items-center font-semibold"><GiChickenOven />{product.name}</p>
                        <p className="">{`${pieces} pzs`}</p>
                        <p className="">{`${weight} kg`}</p>
                        <p className="flex gap-1 items-center"><MoneyBag />{amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                      </RowItem>
                    </div>
                    <div className="w-full">
                      <RowItem>
                        <p className="text-xs flex gap-1 items-center"><FaInfoCircle className="text-blue-800" />{comment || 'Sin observaciones.'}</p>
                      </RowItem>
                    </div>
                  </div>
                </div>
              </button>
              <div className="col-span-2 my-auto">
                {deletable && (
                  <DeleteButton
                    deleteFunction={() => onDelete({...input, index})}
                  />
                )}
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      )
    )
  }

  const renderInputsList = () => {
    return (
      <div>
        {renderTotal()}
        {inputs && inputs.length > 0 && inputs.map((input, index) => (renderInputItem(input, index)))}
      </div>
    )
  }

  const renderActions = () => {
    return (
      <div>
        <div className="w-full flex justify-center">
          {deletable && selectedInput && (
            <div className="w-full flex flex-col gap-2">
              <ConfirmationButton onConfirm={() => onDelete(selectedInput)} className="bg-delete-button  text-white w-10/12 rounded-xl">
                Eliminar
              </ConfirmationButton>
              <ConfirmationButton onConfirm={() => onDelete(selectedInput)} className="bg-update-button  text-white w-10/12 rounded-xl">
                Actualizar
              </ConfirmationButton>
            </div>
          )}
        </div>
      </div>
    )
  }

  const shouldOpenModal = useMemo(() => {
    return selectedInput !== null && selectedInput !== undefined && inputs.length > 0 && inputs.find((input) => input._id === selectedInput._id) !== undefined
  }, [selectedInput, inputs])

  return (
    <div>
      {renderInputsList()}
      {shouldOpenModal && (
        <ShowDetails
          data={selectedInput}
          actions={renderActions}
          fields={fields}
          title={"Detalles de la entrada de " + selectedInput.product.name}
          closeModal={() => { setSelectedInput(null) }}
        />
      )}
    </div>
  )
}
