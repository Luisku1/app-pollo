import SectionHeader from '../SectionHeader'
import { MdCancel } from 'react-icons/md'

// eslint-disable-next-line react/prop-types
export default function OptionsModal({content, title, closeModal}) {
  return (
    <div>
      <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
          <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
            <button className="flex justify-self-end sticky top-0" onClick={() => { closeModal() }}><MdCancel className="h-7 w-7" /></button>
            < div className='bg-white mt-4 mb-4'>
              <SectionHeader label={title} />
              <div >
                {content}
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}
