/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import Modal from '../Modals/Modal';
import ExtraOutgoingsList from './ExtraOutgoingsList';

const ShowExtraOutgoingsModal = ({ extraOutgoings, title, clickableComponent = null, toggleComponent = null, modalIsOpen = null, extraInformation = null }) => {

  const [listIsOpen, setListIsOpen] = useState(false)

  const changeListIsOpen = () => {
    if (toggleComponent) {
      toggleComponent()
    } else {
      setListIsOpen(prev => !prev)
    }
  }

  const sortedExtraOutgoings = useMemo(() => {

    const sortedExtraOutgoings = extraOutgoings.length > 0 ? extraOutgoings.sort((a, b) => b.amount - a.amount) : []

    return sortedExtraOutgoings

  }, [extraOutgoings])

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
              initialExtraOutgoings={sortedExtraOutgoings}
            />
          }
          closeModal={changeListIsOpen} />
      )}
    </div>
  )
}

export default ShowExtraOutgoingsModal