/* eslint-disable react/prop-types */
import Modal from '../Modals/Modal'

export default function ListModal({ ListComponent, listTitle, changeStatus, listIsOpen }) {

  const changeListIsOpen = () => {

    changeStatus((prev) => !prev)
  }

  return (
    <div>
      {listIsOpen && (
        <Modal title={listTitle} content={ListComponent} closeModal={changeListIsOpen}></Modal>
      )}
    </div>
  )
}
