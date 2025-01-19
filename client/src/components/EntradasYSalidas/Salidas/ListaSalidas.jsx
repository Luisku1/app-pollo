/* eslint-disable react/prop-types */
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { formatTime } from '../../../helpers/DatePickerFunctions'
import { useRoles } from '../../../context/RolesContext'

import ShowDetails from '../../ShowDetails';
import DeleteButton from '../../Buttons/DeleteButton'
import { getEmployeeFullName, stringToCurrency } from '../../../helpers/Functions'

export default function ListaSalidas({ outputs, totalWeight, totalAmount, onDeleteOutput }) {

  const { currentUser } = useSelector((state) => state.user);
  const { roles } = useRoles();
  const [selectedOutput, setSelectedOutput] = useState(null);
  const [movementDetailsIsOpen, setMovementDetailsIsOpen] = useState(false);

  const fields = [
    // { key: 'product.name', label: 'Producto', format: (data) => data.product.name },
    { key: 'weight', label: 'Peso', format: (data) => `${data.weight.toFixed(2)} Kg` },
    { key: 'pieces', label: 'Piezas', format: (data) => data.pieces.toFixed(2) },
    { key: 'price', label: 'Precio', format: (data) => stringToCurrency({ amount: data.price }) },
    { key: 'amount', label: 'Monto', format: (data) => stringToCurrency({ amount: data.amount }) },
    { key: 'branch.branch', label: 'Origen', format: (data) => data.branch.branch },
    { key: 'employee.name', label: 'Encargado', format: (data) => getEmployeeFullName(data.employee) },
    { key: 'comment', label: 'Comentario' },
    { key: 'createdAt', label: 'Hora', format: (data) => formatTime(data.createdAt) },
  ];

  const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-green-800 font-bold text-lg'>
          {`${totalWeight.toFixed(3)} Kg - ${stringToCurrency({ amount: totalAmount })}`}
        </p>
      </div>
    );
  };

  const renderListHeader = () => {
    return (
      <div>
        {outputs && outputs.length > 0 && (
          <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4 border-b border-gray-300'>
            <p className='col-span-3 text-center'>Sucursal</p>
            <p className='col-span-3 text-center'>Encargado</p>
            <p className='col-span-3 text-center'>Producto</p>
            <p className='col-span-1 text-center'>Kg</p>
          </div>
        )}
      </div>
    );
  };

  const renderOutputItem = ({ output, index }) => {

    const { branch, employee, product, weight, _id } = output;
    const branchInfo = branch?.branch || branch?.label;
    const employeeName = `${employee.name} ${employee.lastName}`;
    const productName = product.name || product.label;
    const isAuthorized = currentUser._id === employee._id || currentUser.role === roles.managerRole._id;
    const deletable = isAuthorized && onDeleteOutput

    return (
      isAuthorized && (
        <div key={_id || index}>
          <div className={(currentUser._id === employee._id || currentUser.role === roles.managerRole._id ? '' : 'py-3 ') + (output.specialPrice ? 'border border-red-500 ' : 'border border-black ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-70 shadow-sm mt-2'}>
            <button onClick={() => { setSelectedOutput(output); setMovementDetailsIsOpen(!movementDetailsIsOpen); }} id='list-element' className='flex col-span-10 items-center justify-around h-full'>
              <p className='text-center text-xs w-3/12'>{branchInfo}</p>
              <p className='text-center text-xs w-3/12'>{employeeName}</p>
              <p className='text-center text-xs w-3/12'>{productName}</p>
              <p className='text-center text-xs w-1/12'>{weight}</p>
            </button>
            {deletable && (
              <DeleteButton
                id={_id}
                deleteFunction={() => onDeleteOutput(output, index)}
              />
            )}
          </div>
        </div>
      )
    );
  };

  const renderOutputsList = () => {
    return (
      <div>
        {renderTotal()}
        {renderListHeader()}
        {outputs && outputs.length > 0 && outputs.map((output, index) => renderOutputItem({ output, index }))}
      </div>
    )
  }

  return (
    <div>
      {renderOutputsList()}
      {selectedOutput && movementDetailsIsOpen && (
        <ShowDetails
          data={selectedOutput}
          fields={fields}
          title={"Detalles de la salida de " + selectedOutput.product.name}
          closeModal={() => setMovementDetailsIsOpen(false)}
        />
      )}
    </div>
  )
}
