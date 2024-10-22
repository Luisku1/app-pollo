/* eslint-disable react/prop-types */
import { useState } from 'react'
import { FaListAlt } from 'react-icons/fa'
import Modal from '../Modals/Modal'

export default function ShowListButton({ ListComponent, listTitle }) {

  const [listIsOpen, setListIsOpen] = useState(false)

  const changeListIsOpen = () => {

    setListIsOpen(prev => !prev)
  }

  return (
    <div>

      <div className="h-10 w-10 shadow-lg">
        <button className="w-full h-full" onClick={() => { changeListIsOpen() }}><FaListAlt className="h-full w-full text-red-600" />
        </button>
      </div>

      {listIsOpen && (
        <Modal title={listTitle} content={ListComponent} closeModal={changeListIsOpen}></Modal>
      )}

    </div>
  )
}
