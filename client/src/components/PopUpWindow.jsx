import { useState } from "react"
import { MdCancel } from "react-icons/md"

export default function PopUpWindow({ showWindow }) {

  const [showPopUpWindow, setShowPopUpWindow] = useState(showWindow)

  const closePopUpWindow = () => {

    setShowPopUpWindow(false)
  }

  return (
    <div>
      {showPopUpWindow ?
        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg max my-auto mx-auto z-10'>
          < div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto w-5/6' >
            <button className="" onClick={closePopUpWindow}><MdCancel className="h-7 w-7" /></button>
            < div className='border bg-white shadow-lg  mt-4 mb-4 h-full overflow-y-scroll'>

            </div>
          </div >
        </div >
        : ''
      }
    </div>
  )
}
