/* eslint-disable react/prop-types */
import { useState } from 'react'
import Modal from '../Modals/Modal'
import ListaEntradas from './Entradas/ListaEntradas'

export default function ShowInputs({inputs, extraInformation = null, title, modalIsOpen = null, clickableComponent = null, toggleComponent = null}) {
  const [listIsOpen, setListIsOpen] = useState(false)

  const changeListIsOpen = () => {
    if (toggleComponent) {
      toggleComponent()
    } else {
      setListIsOpen(prev => !prev)
    }
  }

  return (
    <div>
      {clickableComponent && (
        <button className="w-full h-full border rounded-lg border-black shadow-md" onClick={() => { changeListIsOpen() }}>
          {clickableComponent}
        </button>
      )}

      {(modalIsOpen || listIsOpen) && (
        <Modal
          title={title}
          extraInformation={extraInformation}
          content={
            <ListaEntradas
              initialInputs={inputs}
            />
          }
          closeModal={changeListIsOpen} />
      )}
    </div>
  )
}
