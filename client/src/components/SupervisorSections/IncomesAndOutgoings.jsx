/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import { useIncomes } from "../../hooks/Incomes/useIncomes";
import Incomes from "../Incomes/Incomes";
import ExtraOutgoings from "../Outgoings/ExtraOutgoings";
import { useDate } from "../../context/DateContext";

export default function IncomesAndOutgoings({ companyId, branchAndCustomerSelectOptions, employees, branches }) {

  const { currentDate } = useDate()

  console.log('currentDate', currentDate)

  const { currentUser } = useSelector((state) => state.user)
  const { incomes, incomesTotal, onAddIncome, pushIncome, spliceIncomeById, onDeleteIncome } = useIncomes({ companyId, date: currentDate })

  return (
    <div>
      <Incomes
        incomes={incomes}
        incomesTotal={incomesTotal}
        onDeleteIncome={onDeleteIncome}
        onAddIncome={onAddIncome}
        branchAndCustomerSelectOptions={branchAndCustomerSelectOptions}
        date={currentDate}
        companyId={companyId}
        currentUser={currentUser}
      />

      <ExtraOutgoings
        currentUser={currentUser}
        companyId={companyId}
        date={currentDate}
        pushIncome={pushIncome}
        employees={employees}
        branches={branches}
        spliceIncomeById={spliceIncomeById}
      />

    </div>
  )
}
