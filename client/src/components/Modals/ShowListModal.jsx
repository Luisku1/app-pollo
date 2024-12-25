/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react'
import Modal from './Modal'

const ShowListModal = ({
  title,
  clickableComponent = null,
  toggleComponent = null,
  modalIsOpen = null,
  extraInformation = null,
  ListComponent = null,
  ListComponentProps = {}
}) => {

  const [listIsOpen, setListIsOpen] = useState(false);

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
        <button className="w-full h-full border rounded-lg border-black shadow-md" onClick={changeListIsOpen}>
          {clickableComponent}
        </button>
      )}

      {(modalIsOpen || listIsOpen) && (
        <Modal
          title={title}
          extraInformation={extraInformation}
          content={
            // Usamos un componente de lista genérico que recibirá los datos.
            ListComponent ? <ListComponent {...ListComponentProps} /> : <div>No se proporcionó un componente de lista.</div>
          }
          closeModal={changeListIsOpen}
        />
      )}
    </div>
  );
}

export default ShowListModal