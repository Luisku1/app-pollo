/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import { useIncomes } from "../../hooks/Incomes/useIncomes";
import Incomes from "../Incomes/Incomes";
import ExtraOutgoings from "../Outgoings/ExtraOutgoings";

export default function IncomesAndOutgoings({ date, companyId, branchAndCustomerSelectOptions, employees, branches }) {

  const { currentUser } = useSelector((state) => state.user)

  return (
    <div>
      <Incomes
        incomes={incomes}
        incomesTotal={incomesTotal}
        onDeleteIncome={onDeleteIncome}
        onAddIncome={onAddIncome}
        branchAndCustomerSelectOptions={branchAndCustomerSelectOptions}
        date={date}
        companyId={companyId}
        currentUser={currentUser}
      />

      <ExtraOutgoings
        currentUser={currentUser}
        companyId={companyId}
        date={date}
        pushIncome={pushIncome}
        employees={employees}
        branches={branches}
        spliceIncomeById={spliceIncomeById}
      />

    </div>
  )
}
