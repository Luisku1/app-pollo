/* eslint-disable react/prop-types */
import { useSelector } from 'react-redux'
import DeleteButton from '../Buttons/DeleteButton'
import { useRoles } from '../../context/RolesContext'
import ShowDetails from '../ShowDetails'
import { useMemo, useState } from 'react'
import { currency } from '../../helpers/Functions'
import { formatDateAndTime, formatTime } from '../../helpers/DatePickerFunctions'
import RowItem from '../RowItem'
import { CgProfile } from 'react-icons/cg'
import { GiChickenOven } from 'react-icons/gi'
import { TbMoneybag } from 'react-icons/tb'
import ConfirmationButton from '../Buttons/ConfirmationButton'
import { CiSquareInfo } from 'react-icons/ci'
import EmployeeInfo from '../EmployeeInfo'
import { BranchName } from '../Reutilizable/Labels'

export default function StockList({ stock = [], showBranch = false, onDelete = null, modifyBalance = null }) {
  const { currentUser } = useSelector((state) => state.user)
  const isEmpty = stock.length === 0
  const { roles, isManager } = useRoles()
  const [selectedStock, setSelectedStock] = useState(null)
  const deletable = onDelete
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fields = [
    { key: 'weight', label: 'Peso', format: (data) => `${data.weight.toFixed(2)} Kg` },
    { key: 'pieces', label: 'Piezas', format: (data) => data.pieces.toFixed(2) },
    { key: 'price', label: 'Precio', format: (data) => currency({ amount: data.price }) },
    { key: 'amount', label: 'Monto', format: (data) => currency({ amount: data.amount }) },
    { key: 'branch.branch', label: 'Entró a', format: (data) => data.branch.branch },
    { key: 'employee.name', label: 'Encargado', format: (data) => `${data.employee.name} ${data.employee.lastName}` },
    { key: 'createdAt', label: 'Hora', format: (data) => formatTime(data.createdAt) },
  ]

  const weight = useMemo(() => stock.reduce((acc, stock) => acc + stock.weight, 0), [stock])
  const amount = useMemo(() => stock.reduce((acc, stock) => acc + stock.amount, 0), [stock])

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-green-800 font-bold text-lg'>
          {`${weight.toFixed(3)} Kg - ${currency({ amount: amount })}`}
        </p>
      </div>
    )
  }

  const renderStockItem = ({ stock, index }) => {
    const { product, pieces, weight, amount, employee, createdAt, price } = stock
    const tempStock = { ...stock, index }
    const isAuthorized = currentUser._id === stock.employee?._id || isManager(currentUser.role)
    const shouldRender = isAuthorized || isManager(currentUser.role)
    const shouldShowDeleteButton = isAuthorized && onDelete

    return (
      shouldRender && (
        <div key={stock._id} className='grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1'>
          <div id="list-element" className="col-span-10 items-center">
            <div id='list-element' className='w-full'>
              <div className='text-red-800 mb-1'>
                <RowItem>
                  {showBranch &&
                    BranchName({ branchName: stock?.branch?.branch })
                  }
                  <p className="flex gap-1 items-center font-semibold"><GiChickenOven />{product.name}</p>
                  <div className="text-md text-black flex justify-self-end">
                    {formatDateAndTime(createdAt)}
                  </div>
                </RowItem>
              </div>
              <div className="w-full text-md font-semibold mb-1">
                <RowItem>
                  <p className="">{`${pieces} pzs`}</p>
                  <p className="">{`${weight} kg`}</p>
                  <p className="flex gap-1 items-center">{price.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                  <p className="flex gap-1 items-center"><TbMoneybag className="text-orange-800" />{amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                </RowItem>
              </div>
              <RowItem>
                <button onClick={() => setSelectedEmployee(employee)} className="font-bold text-md flex gap-1 items-center w-full"><span><CgProfile /></span>{employee?.name}</button>
              </RowItem>
            </div>
          </div>
          <div className="col-span-2 my-auto">
            <div className="flex flex-col gap-2 justify-center my-auto items-center">
              <button
                onClick={() => {
                  setSelectedStock(tempStock);
                }}
                className="border rounded-lg shadow-md w-10 h-10 flex justify-center items-center"
              >
                <CiSquareInfo className="w-full h-full text-blue-600" />
              </button>
              {shouldShowDeleteButton && (
                <div className='w-10 h-10'>
                  <DeleteButton
                    id={stock._id}
                    deleteFunction={() => onDelete(tempStock, modifyBalance)} />
                </div>
              )}
            </div>
          </div>
        </div>
      )
    )
  }

  const renderActions = () => {
    return (
      <div>
        <div className="w-full flex justify-center">
          {deletable && selectedStock && (
            <div className="w-full flex flex-col gap-2">
              <ConfirmationButton onConfirm={() => onDelete(selectedStock)} className="bg-delete-button text-white w-10/12 rounded-xl">
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

  const renderStockList = () => {
    return (
      <div>
        {renderTotal()}
        {!isEmpty && roles?.manager && stock.map((stock, index) => renderStockItem({ stock, index }))}
      </div>
    )
  }

  return (
    <div>
      {renderStockList()}
      <EmployeeInfo employee={selectedEmployee} toggleInfo={() => setSelectedEmployee(null)} />
      {selectedStock && (
        <ShowDetails
          data={selectedStock}
          actions={renderActions}
          fields={fields}
          title={"Detalles de sobrante de " + selectedStock.product.name}
          closeModal={() => setSelectedStock(null)}
        />
      )}
    </div>
  )
}
