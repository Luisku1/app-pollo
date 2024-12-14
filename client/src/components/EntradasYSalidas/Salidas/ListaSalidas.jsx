/* eslint-disable react/prop-types */
import { useState } from 'react'
import { MdCancel } from 'react-icons/md'
import SectionHeader from '../../SectionHeader'
import { useSelector } from 'react-redux'
import { FaTrash } from 'react-icons/fa'
import { useDeleteOutput } from '../../../hooks/Outputs/useDeleteOutput'
import { formatTime } from '../../../helpers/DatePickerFunctions'
import { useRoles } from '../../../context/RolesContext'

export default function ListaSalidas({ outputs, changeOutputsIsOpenValue, outputsIsOpen, spliceOutput }) {

  const { currentUser } = useSelector((state) => state.user)
  const { roles } = useRoles()
  const { deleteOutput, loading } = useDeleteOutput()
  const [selectedOutput, setSelectedOutput] = useState(null)
  const [movementDetailsIsOpen, setMovementDetailsIsOpen] = useState(false)
  const [deleteOutputIdButton, setDeleteOutputIdButton] = useState(null)
  const [confirmationIsOpen, setConfirmationIsOpen] = useState(false)

  const ShowOutputDetails = (props) => {

    const output = props.output

    return (

      <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto'>
        <div className='bg-white p-5 rounded-lg justify-center items-center h-4/6 my-auto w-11/12'>
          <div className="mb-10 flex relative items-center">
            <p className='text-3xl font-semibold text-red-500'>Detalles de la salida</p>
            <button className="absolute right-0" onClick={() => { setMovementDetailsIsOpen(!movementDetailsIsOpen) }}><MdCancel className="h-7 w-7" /></button>
          </div>
          <div className='h-5/6 overflow-y-scroll'>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Hora:'}</p>
              <p>{formatTime(output.createdAt)}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Origen:'}</p>
              <p>{output.branch?.branch ?? output.branch?.label}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Encargado:'}</p>
              <p className=''>{output.employee.name + ' ' + output.employee.lastName}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Comentario:'}</p>
              <p>{output.comment}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Producto:'}</p>
              <p>{output.product?.name ?? output.product?.label}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Piezas:'}</p>
              <p>{output.pieces.toFixed(2)}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className={(output.specialPrice ? 'text-red-500' : '') + " font-bold text-lg"}>{output.specialPrice ? 'Precio especial:' : 'Precio:'}</p>
              <p>{output.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Peso:'}</p>
              <p>{output.weight.toFixed(2) + ' Kg'}</p>
            </div>
            <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
              <p className="font-bold text-lg">{'Monto:'}</p>
              <p>{output.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>

      {outputsIsOpen && outputs && outputs.length > 0 ?

        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
          <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
            <button className="" onClick={() => { changeOutputsIsOpenValue() }}><MdCancel className="h-7 w-7" /></button>
            < div className='bg-white mt-4 mb-4'>

              <SectionHeader label={'Salidas'} />

              <div>

                {outputs && outputs.length > 0 ?
                  <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
                    <p className='col-span-3 text-center'>Sucursal</p>
                    <p className='col-span-3 text-center'>Encargado</p>
                    <p className='col-span-3 text-center'>Producto</p>
                    <p className='col-span-1 text-center'>Kg</p>
                  </div>
                  : ''}
                {outputs && outputs.length > 0 && outputs.map((output, index) => (

                  <div key={index}>
                    {(output.employee._id == currentUser._id || currentUser.role == roles.managerRole._id) && (
                      <div className={(currentUser._id == output.employee?._id || currentUser.role == roles.managerRole._id ? '' : 'py-3 ') + (output.specialPrice ? 'border border-red-500 ' : 'border border-black ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-70 shadow-sm mt-2'}>

                        <button onClick={() => { setSelectedOutput(output), setMovementDetailsIsOpen(!movementDetailsIsOpen) }} id='list-element' className='flex col-span-10 items-center justify-around h-full'>
                          <p className='text-center text-xs  w-3/12'>{`${output.branch?.branch || output.branch?.label || (`${output.customer?.name} ${output.customer?.lastName}`)}`}</p>
                          <p className='text-center text-xs w-3/12'>{output.employee.name + ' ' + output.employee.lastName}</p>
                          <p className='text-center text-xs w-3/12'>{output.product.name || output.product.label}</p>
                          <p className='text-center text-xs w-1/12'>{output.weight}</p>
                        </button>

                        {selectedOutput != null && selectedOutput._id == output._id && movementDetailsIsOpen ?
                          <ShowOutputDetails output={output}></ShowOutputDetails>
                          : ''}

                        {currentUser._id == output.employee._id || currentUser.role == roles.managerRole._id ?

                          <div>
                            <button id={output._id} onClick={() => { setConfirmationIsOpen(!confirmationIsOpen), setDeleteOutputIdButton(output._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                              <span>
                                <FaTrash className='text-red-700 m-auto' />
                              </span>
                            </button>

                            {confirmationIsOpen && output._id == deleteOutputIdButton ?
                              <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                                <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                                  <div>
                                    <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                                  </div>
                                  <div className='flex gap-10'>
                                    <div>
                                      <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteOutput({ output, spliceOutput, index }), setConfirmationIsOpen(!confirmationIsOpen) }}>Si</button>
                                    </div>
                                    <div>
                                      <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setConfirmationIsOpen(!confirmationIsOpen) }}>No</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              : ''}

                          </div>

                          : ''}

                      </div>
                    )}
                  </div>

                ))}

              </div>
            </div>
          </div>
        </div>
        : ''}
    </div>
  )
}
