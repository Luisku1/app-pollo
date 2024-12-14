/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import ShowListButton from '../Buttons/ShowListButton';
import IncomesList from './IncomesList';
import { useRoles } from '../../context/RolesContext';

const ShowOrderedIncomesButton = ({ incomes, title }) => {
  const {roles} = useRoles()

  const sortedIncomes = useMemo(() => {

    const clientsIncomes = incomes.filter((income) => income.branch === undefined)
    const branchesIncomes = incomes.filter((income) => income.branch !== undefined).sort((a, b) => a.branch.position - b.branch.position)

    return [...branchesIncomes, ...clientsIncomes]

  }, [incomes])

  return (
    <ShowListButton
      listTitle={title}
      ListComponent={
        <IncomesList
          incomesData={sortedIncomes}
          roles={roles}
        />
      }
    />
  )
}

export default ShowOrderedIncomesButton