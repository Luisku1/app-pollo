import React, { useEffect, useState } from 'react'

export default function ProviderInputList() {

  const [providerInputs, setProviderInputs] = useState()

  function useProviderInputs () {


  }

  return (
    <div>

      <div>

        {providerInputs && providerInputs.length > 0 ?
          <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-0 sticky top-0 bg-white'>
            <p className='col-span-3 text-center'>Sucursal</p>
            <p className='col-span-3 text-center'>Encargado</p>
            <p className='col-span-3 text-center'>Piezas</p>
            <p className='col-span-1 text-center'>Kg</p>
          </div>
          : ''}

        {providerInputs && providerInputs.length > 0 && providerInputs.map((providerInput, index) => (


          <div key={providerInput._id} className={(currentUser._id == providerInput.employee || currentUser.role == managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

            <div id='list-element' className='flex col-span-10 items-center justify-around'>
              <p className='text-center text-xs  w-3/12'>{providerInput.branch.branch ? providerInput.branch.branch : providerInput.branch}</p>
              <p className='text-center text-xs w-3/12'>{providerInput.employee != null ? providerInput.employee.name + ' ' + providerInput.employee.lastName : ''}</p>
              <p className='text-center text-xs w-3/12'>{providerInput.pieces ? providerInput.pieces : '0'}</p>
              <p className='text-center text-xs w-1/12'>{providerInput.weight}</p>
            </div>

            {providerInput.employee._id == currentUser._id || managerRole._id == currentUser.role ?

              <div>
                <button id={providerInput._id} onClick={() => { setIsOpen(!isOpen), setButtonId(providerInput._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                  <span>
                    <FaTrash className='text-red-700 m-auto' />
                  </span>
                </button>

                {isOpen && providerInput._id == buttonId ?
                  <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                    <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                      <div>
                        <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                      </div>
                      <div className='flex gap-10'>
                        <div>
                          <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteProviderInput(providerInput._id, index), setIsOpen(!isOpen) }}>Si</button>
                        </div>
                        <div>
                          <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setIsOpen(!isOpen) }}>No</button>
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

      {providerInputs && providerInputs.length > 0 ?

        <div className='flex my-4 border border-opacity-30 shadow-lg border-black rounded-lg p-3'>
          <p className='w-6/12 text-center'>Total {'(Kg)'}:</p>
          <p className='w-6/12 text-center'>{providerInputsTotal}</p>

        </div>

        : ''}
    </div>
  )
}
