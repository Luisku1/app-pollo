/* eslint-disable react/prop-types */
import { useState } from 'react'
import { FaListAlt } from 'react-icons/fa'
import { MdCancel } from 'react-icons/md'
import SectionHeader from '../SectionHeader'

export default function ShowListButton({ ListComponent }) {

  const [listIsOpen, setListIsOpen] = useState(false)

  return (
    <div>

      <div className="h-10 w-10 shadow-lg justify-self-end">
        <button className="w-full h-full" onClick={() => { setListIsOpen(true) }}><FaListAlt className="h-full w-full text-red-600" />
        </button>
      </div>

      {listIsOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
          <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
            <button className="" onClick={() => { setListIsOpen(false) }}><MdCancel className="h-7 w-7" /></button>
            < div className='bg-white mt-4 mb-4'>
              <SectionHeader label={'Cuentas'} />
              <div >
                {ListComponent}
              </div>
            </div>
          </div>
        </div>

        )}

    </div>
  )
}
