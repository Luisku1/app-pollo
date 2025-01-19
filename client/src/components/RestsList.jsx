/* eslint-disable react/prop-types */
import { formatInformationDate } from '../helpers/DatePickerFunctions'
import DeleteButton from './Buttons/DeleteButton'

export default function RestsList({ rests, onDelete }) {
  return (
    <div>
      <div className='grid grid-cols-12'>
        <p className='text-md font-semibold col-span-3'>Empleado</p>
        <p className='text-md font-semibold col-span-3'>Remplazo</p>
        <p className='text-md font-semibold col-span-3'>Fecha</p>
      </div>
      {rests && rests.length != 0 && rests.map((rest, index) => (
        <div key={rest._id} className='grid grid-cols-12 mt-4 border border-black rounded-lg shadow-lg p-3 gap-2'>
          <p className='col-span-3'>{rest.employee?.name ? `${rest.employee.name} ${rest.employee.lastName}` : rest.employee.label}</p>
          <p className='col-span-3'>{(rest.replacement?.name ? `${rest.replacement.name} ${rest.replacement.lastName}` : rest.replacement?.label) || 'Sin remplazo'}</p>
          <p className='col-span-3'>{`${formatInformationDate(rest.date)}`}</p>
          <div>
            <DeleteButton
              id={rest._id}
              deleteFunction={() => onDelete(rest, index)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
