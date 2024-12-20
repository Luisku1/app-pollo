/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import Modal from '../Modals/Modal';
import ExtraOutgoingsList from './ExtraOutgoingsList';

const ShowExtraOutgoingsModal = ({ data, title, clickableComponent = null, toggleComponent = null, modalIsOpen = null, extraInformation = null }) => {

  const [listIsOpen, setListIsOpen] = useState(false)

  const changeListIsOpen = () => {
    if (toggleComponent) {
      toggleComponent()
    } else {
      setListIsOpen(prev => !prev)
    }
  }

  const sortedExtraOutgoings = useMemo(() => {

    const sortedExtraOutgoings = data.length > 0 ? data.sort((a, b) => b.amount - a.amount) : []

    return sortedExtraOutgoings

  }, [data])

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
            <ExtraOutgoingsList
              data={sortedExtraOutgoings}
            />
          }
          closeModal={changeListIsOpen} />
      )}
    </div>
  )
}

export default ShowExtraOutgoingsModal