/* eslint-disable react/prop-types */
import { MdCancel } from 'react-icons/md'
import SectionHeader from '../SectionHeader'

export default function Modal({content, closeModal, ref}) {
  return (
    <div>
      <div ref={ref} className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
          <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll border-black border-solid border-2'>
            <button className="" onClick={() => { closeModal() }}><MdCancel className="h-7 w-7" /></button>
            < div className='bg-white mt-4 mb-4'>
              <SectionHeader label={'Cuentas'} />
              <div >
                {content}
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}
