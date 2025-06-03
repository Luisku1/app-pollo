/* eslint-disable react/prop-types */
import { useState } from 'react';
import Modal from './Modal'

const ShowListModal = ({
  title,
  clickableComponent = null,
  toggleComponent = null,
  modalIsOpen = null,
  extraInformation = null,
  ListComponent = null,
  className,
  loading = false,
  ListComponentProps = {},
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
        <button className={className} onClick={(e) => { changeListIsOpen(), e.stopPropagation() }}>
          {clickableComponent}
        </button>
      )}

      {(modalIsOpen || listIsOpen) && (
        <Modal
          title={title}
          extraInformation={extraInformation}
          loading={loading}
          content={
            // Usamos un componente de lista genérico que recibirá los datos.
            ListComponent ? <ListComponent {...ListComponentProps} /> : <div>No se proporcionó un componente de lista.</div>
          }
          closeModal={changeListIsOpen}
          closeOnEsc={true}
          closeOnClickOutside={true}
        />
      )}
    </div>
  );
}

export default ShowListModal