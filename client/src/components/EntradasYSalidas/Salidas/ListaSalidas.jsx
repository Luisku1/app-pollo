/* eslint-disable react/prop-types */
import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { formatTime } from '../../../helpers/DatePickerFunctions'
import { useRoles } from '../../../context/RolesContext'
import { getEmployeeFullName, currency } from '../../../helpers/Functions'
import ShowDetails from '../../ShowDetails'
import RowItem from '../../RowItem'
import { CgProfile } from 'react-icons/cg'
import { GiChickenOven } from 'react-icons/gi'
import { FaInfoCircle } from 'react-icons/fa'
import { MdStorefront } from 'react-icons/md'
import ConfirmationButton from '../../Buttons/ConfirmationButton'
import DeleteButton from '../../Buttons/DeleteButton'
import MoneyBag from '../../Icons/MoneyBag'

export default function ListaSalidas({ outputs, totalWeight = 0, totalAmount = 0, onDelete = null }) {
  const { currentUser } = useSelector((state) => state.user)
  const { isManager } = useRoles()
  const [selectedOutput, setSelectedOutput] = useState(null)
  const isAuthorized = (employee) => currentUser._id === employee._id || isManager(currentUser.role) || !onDelete
  const deletable = onDelete != null

  const fields = [
    { key: 'weight', label: 'Peso', format: (data) => `${data.weight.toFixed(2)} Kg` },
    { key: 'pieces', label: 'Piezas', format: (data) => data.pieces.toFixed(2) },
    { key: 'price', label: 'Precio', format: (data) => currency({ amount: data.price }) },
    { key: 'amount', label: 'Monto', format: (data) => currency({ amount: data.amount }) },
    { key: 'branch.branch', label: 'Origen', format: (data) => data.branch.branch },
    { key: 'employee.name', label: 'Encargado', format: (data) => getEmployeeFullName(data.employee) },
    { key: 'comment', label: 'Comentario' },
    { key: 'createdAt', label: 'Hora', format: (data) => formatTime(data.createdAt) },
  ]

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-green-800 font-bold text-lg'>
          {`${totalWeight.toFixed(3)} Kg - ${currency({ amount: totalAmount })}`}
        </p>
      </div>
    )
  }

  const renderOutputItem = (output, index) => {
    const { employee, product, pieces, weight, amount, branch, comment, createdAt } = output
    const tempOutput = { ...output, index }

    return (
      isAuthorized(employee) && (
        <div className="" key={output._id}>
          {output.weight !== 0 ? (
            <div className="grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1">
              <button
                onClick={() => {
                  setSelectedOutput(tempOutput)
                }}
                id="list-element"
                className="col-span-10 items-center"
              >
                <div id="list-element" className="grid grid-cols-12">
                  <div className='col-span-12'>
                    <div className="w-full text-red-800 mb-2">
                      <RowItem>
                        <p className="text-md font-bold flex gap-1 items-center"><MdStorefront />{branch.branch}</p>
                        <p className="font-bold text-md flex gap-1 truncate items-center"><span><CgProfile /></span>{employee.name}</p>
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
                        <div className="text-sm text-black flex justify-self-end">
                          {formatTime(createdAt)}
                        </div>
                      </RowItem>
                    </div>
                  </div>
                </div>
              </button>
              <div className="col-span-2 my-auto">
                {deletable && (
                  <DeleteButton
                    deleteFunction={() => onDelete(tempOutput)}
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

  const renderOutputsList = () => {
    return (
      <div>
        {renderTotal()}
        {outputs && outputs.length > 0 && outputs.map((output, index) => (renderOutputItem(output, index)))}
      </div>
    )
  }

  const renderActions = () => {
    return (
      <div>
        <div className="w-full flex justify-center">
          {deletable && selectedOutput && (
            <div className="w-full flex flex-col gap-2">
              <ConfirmationButton onConfirm={() => onDelete(selectedOutput)} className="bg-delete-button  text-white w-10/12 rounded-xl">
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

  const shouldOpenModal = useMemo(() => {
    return selectedOutput !== null && selectedOutput !== undefined && outputs.length > 0 && outputs.find((output) => output._id === selectedOutput._id) !== undefined
  }, [selectedOutput, outputs])

  return (
    <div>
      {renderOutputsList()}
      {shouldOpenModal && (
        <ShowDetails
          data={selectedOutput}
          actions={renderActions}
          fields={fields}
          title={"Detalles de la salida de " + selectedOutput.product.name}
          closeModal={() => { setSelectedOutput(null) }}
        />
      )}
    </div>
  )
}
