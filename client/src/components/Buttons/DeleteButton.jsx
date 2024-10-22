/* eslint-disable react/prop-types */
import { useState } from "react"
import { FaTrash } from "react-icons/fa"

export default function DeleteButton({ id, item, index, deleteFunction, spliceFunction }) {

  const [buttonId, setButtonId] = useState(id)
  const [confirmationIsOpen, setConfirmationIsOpen] = useState(false)

  const toggleConfirmation = () => {

    setConfirmationIsOpen((prev) => !prev)
  }

  return (
    <div>
      <button id={id} onClick={() => { setConfirmationIsOpen(!confirmationIsOpen), setButtonId(id) }} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
        <span>
          <FaTrash className='text-red-700 m-auto' />
        </span>
      </button>

      {confirmationIsOpen && id == buttonId && (

        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
          <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
            <div>
              <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
            </div>
            <div className='flex gap-10'>
              <div>
                <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { toggleConfirmation(); deleteFunction(item, index, spliceFunction) }}>Si</button>
              </div>
              <div>
                <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setConfirmationIsOpen(!confirmationIsOpen) }}>No</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
