/* eslint-disable react/prop-types */
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { MdCancel } from 'react-icons/md'
import SectionHeader from '../../SectionHeader'
import { FaTrash } from 'react-icons/fa'
import { useDeleteInput } from '../../../hooks/Inputs/useDeleteInput'
import { formatTime } from '../../../helpers/DatePickerFunctions'

export default function ListaEntradas({ inputs, spliceInput, changeInputsIsOpenValue, inputsIsOpen, roles }) {

  const { currentUser } = useSelector((state) => state.user)
  const [selectedInput, setSelectedInput] = useState(null)
  const { deleteInput, loading } = useDeleteInput()
  const [movementDetailsIsOpen, setMovementDetailsIsOpen] = useState(false)
  const [deleteInputIdButton, setDeleteOutputIdButton] = useState(null)
  const [confirmationIsOpen, setConfirmationIsOpen] = useState(false)

  const ShowInputDetails = (props) => {

    const input = props.input

    return (

      <div>

        {movementDetailsIsOpen && inputs && inputs.length > 0 ?

          <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto'>
            <div className='bg-white p-5 rounded-lg justify-center items-center h-4/6 my-auto w-11/12'>
              <div className="mb-10 flex relative items-center">
                <p className='text-3xl font-semibold text-red-500'>Detalles de la entrada</p>
                <button className="absolute right-0" onClick={() => { setMovementDetailsIsOpen(!movementDetailsIsOpen) }}><MdCancel className="h-7 w-7" /></button>
              </div>
              <div className='h-5/6 overflow-y-scroll'>
                <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
                  <p className="font-bold text-lg">{'Hora:'}</p>
                  <p>{formatTime(input.createdAt)}</p>
                </div>
                <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
                  <p className="font-bold text-lg">{'Destino:'}</p>
                  <p>{(input.branch?.branch ?? input.branch?.label) ?? (input.customer?.label ?? input.customer?.name)}</p>
                </div>
                <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
                  <p className="font-bold text-lg">{'Encargado:'}</p>
                  <p className=''>{input.employee.name + ' ' + input.employee.lastName}</p>
                </div>
                <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
                  <p className="font-bold text-lg">{'Comentario:'}</p>
                  <p>{input.comment}</p>
                </div>
                <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
                  <p className="font-bold text-lg">{'Producto:'}</p>
                  <p>{input.product?.name ?? input.product?.label}</p>
                </div>
                <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
                  <p className="font-bold text-lg">{'Piezas:'}</p>
                  <p>{input.pieces.toFixed(2)}</p>
                </div>
                <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
                  <p className={(input.specialPrice ? 'text-red-500' : '') + " font-bold text-lg"}>{input.specialPrice ? 'Precio especial:' : 'Precio:'}</p>
                  <p>{input.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                </div>
                <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
                  <p className="font-bold text-lg">{'Peso:'}</p>
                  <p>{input.weight.toFixed(2) + ' Kg'}</p>
                </div>
                <div className={"grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center"}>
                  <p className="font-bold text-lg">{'Monto:'}</p>
                  <p>{input.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                </div>
              </div>
            </div>
          </div>
          : ''}
      </div>
    )
  }

  if (!inputsIsOpen) {

    return
  }

  return (

    <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
      <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
        <button className="" onClick={() => { changeInputsIsOpenValue(false) }}><MdCancel className="h-7 w-7" /></button>
        < div className='bg-white mt-4 mb-4'>

          <SectionHeader label={'Entradas'} />

          <div>

            {inputs && inputs.length > 0 ?
              <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
                <p className='col-span-3 text-center'>Sucursal</p>
                <p className='col-span-3 text-center'>Encargado</p>
                <p className='col-span-3 text-center'>Producto</p>
                <p className='col-span-1 text-center'>Kg</p>
              </div>
              : ''}
            {inputs && inputs.length > 0 && inputs.map((input, index) => (


              <div key={input._id} className={(currentUser._id == input.employee._id || currentUser.role == roles.managerRole._id ? '' : 'py-3 ') + (input.specialPrice ? 'border border-red-500 ' : 'border border-black ') + 'grid grid-cols-12 items-center border-opacity-70 rounded-lg shadow-sm mt-2'}>

                <button onClick={() => { setSelectedInput(input), setMovementDetailsIsOpen(!movementDetailsIsOpen) }} id='list-element' className='flex col-span-10 items-center justify-around h-full'>
                  <p className='text-center text-xs  w-3/12'>{`${input.branch?.branch || input.branch?.label || (`${input.customer?.name} ${input.customer?.lastName}`)}`}</p>
                  <p className='text-center text-xs w-3/12'>{input.employee.name + ' ' + input.employee.lastName}</p>
                  <p className='text-center text-xs w-3/12'>{input.product.name || input.product.label}</p>
                  <p className='text-center text-xs w-1/12'>{input.weight}</p>
                </button>
                {selectedInput != null && selectedInput._id == input._id && movementDetailsIsOpen ?
                  <ShowInputDetails input={input}></ShowInputDetails>
                  : ''}
                {currentUser._id == input.employee._id || currentUser.role == roles.managerRole._id ?

                  <div>
                    <button id={input._id} onClick={() => { setConfirmationIsOpen(!confirmationIsOpen), setDeleteOutputIdButton(input._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                      <span>
                        <FaTrash className='text-red-700 m-auto' />
                      </span>
                    </button>

                    {confirmationIsOpen && input._id == deleteInputIdButton ?
                      <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                        <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                          <div>
                            <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                          </div>
                          <div className='flex gap-10'>
                            <div>
                              <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteInput({ input, spliceInput, index }), setConfirmationIsOpen(!confirmationIsOpen) }}>Si</button>
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

            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
