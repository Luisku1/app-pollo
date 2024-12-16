/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import IncomesList from './IncomesList';
import Modal from '../Modals/Modal';

const ShowIncomesModal = ({ incomes, title, clickableComponent = null, toggleComponent = null, modalIsOpen = null, extraInformation = null }) => {

  const [listIsOpen, setListIsOpen] = useState(false)

  const changeListIsOpen = () => {
    if (toggleComponent) {
      toggleComponent()
    } else {
      setListIsOpen(prev => !prev)
    }
  }

  const sortedIncomes = useMemo(() => {

    const clientsIncomes = incomes.filter((income) => !income.branch)
    const branchesIncomes = incomes
      .filter((income) => income.branch)
      .sort((a, b) => a.branch.position - b.branch.position)

    return [...branchesIncomes, ...clientsIncomes]

  }, [incomes])

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
            <IncomesList
              incomesData={sortedIncomes}
            />
          }
          closeModal={changeListIsOpen} />
      )}
    </div>
  )
}

export default ShowIncomesModal