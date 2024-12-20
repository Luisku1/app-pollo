/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react'
import Modal from './Modal'

const ShowListModal = ({
  data,
  title,
  clickableComponent = null,
  toggleComponent = null,
  modalIsOpen = null,
  extraInformation = null,
  sortFunction = null,
  ListComponent = null
}) => {

  const [listIsOpen, setListIsOpen] = useState(false);

  const changeListIsOpen = () => {
    if (toggleComponent) {
      toggleComponent()
    } else {
      setListIsOpen(prev => !prev)
    }
  }

  const sortedData = useMemo(() => {
    if (sortFunction) {
      return [...data].sort(sortFunction)
    }
    return data;
  }, [data, sortFunction])

  console.log(sortedData, sortFunction, data)

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
            ListComponent ? <ListComponent data={sortedData} /> : <div>No se proporcionó un componente de lista.</div>
          }
          closeModal={changeListIsOpen}
        />
      )}
    </div>
  );
}

export default ShowListModal