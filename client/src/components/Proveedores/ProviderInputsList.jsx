/* eslint-disable react/prop-types */
import DeleteButton from "../Buttons/DeleteButton"

export default function ProviderInputsList({ inputs, totalWeight = 0, totalAmount = 0, onDelete }) {

  const renderTotal = () => {
    return (
      <div>
        {totalAmount || totalWeight && (
          <span>{`${totalAmount ? (`Monto: ${totalAmount}`) : (`Peso: ${totalWeight}`)}`}</span>
        )}
      </div>
    )
  }

  const renderHeader = () => {
    return (
      <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold my-4'>
        <p className='col-span-3 text-center'>Encargado</p>
        <p className='col-span-3 text-center'>Producto</p>
        <p className='col-span-2 text-center'>Piezas</p>
        <p className='col-span-2 text-center'>Kg</p>
        <p className='col-span-2 text-center'>Monto</p>
      </div>
    )
  }

  const renderInputItem = (input, index) => {
    return (
      <div key={input._id}>
        {input.weight != 0 ?
          <div className='grid grid-cols-12 items-center border border-black border-opacity-30 rounded-lg shadow-sm mb-2 py-3'>
            <div id='list-element' className='flex col-span-12 items-center'>
              <p className='text-center text-xs w-3/12'>{input.employee.name + ' ' + input.employee.lastName}</p>
              <p className='text-center text-xs w-3/12'>{input.product.name}</p>
              <p className='text-center text-xs w-2/12'>{input.pieces}</p>
              <p className='text-center text-xs w-2/12'>{input.weight}</p>
              <p className='text-center text-xs w-2/12'>{input.amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
            </div>
            <div className='col-span-12'>
              <p className='text-m text-center font-semibold'>{input.comment}</p>
            </div>
          </div>
          : ''}
        {onDelete && (<DeleteButton id={input._id} item={input} index={index} deleteFunction={onDelete} />)}
      </div>
    )
  }

  const renderInputList = () => {
    return (
      <div>
        {renderTotal()}
        {renderHeader()}
        {inputs && inputs.length > 0 && inputs.map((input, index) => (renderInputItem(input, index)))}
      </div>
    )
  }

  return (
    <div>
      {renderInputList()}
    </div>
  )
}
