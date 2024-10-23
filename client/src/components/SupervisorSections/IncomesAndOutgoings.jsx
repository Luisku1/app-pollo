/* eslint-disable react/prop-types */
import { useIncomes } from "../../hooks/Incomes/useIncomes";
import Incomes from "../Incomes/Incomes";
import ExtraOutgoings from "../Outgoings/ExtraOutgoings";

export default function IncomesAndOutgoings({date, companyId, currentUser, roles, branchAndCustomerSelectOptions, employees, branches}) {

  const { incomes, incomesTotal, pushIncome, spliceIncome, spliceIncomeById, updateLastIncomeId } = useIncomes({ companyId, date })

  return (
    <div>
      <Incomes
        incomes={incomes}
        incomesTotal={incomesTotal}
        pushIncome={pushIncome}
        spliceIncome={spliceIncome}
        updateLastIncomeId={updateLastIncomeId}
        branchAndCustomerSelectOptions={branchAndCustomerSelectOptions}
        date={date}
        companyId={companyId}
        currentUser={currentUser}
        roles={roles}
      />

      <ExtraOutgoings
        currentUser={currentUser}
        companyId={companyId}
        date={date}
        pushIncome={pushIncome}
        roles={roles}
        employees={employees}
        branches={branches}
        spliceIncomeById={spliceIncomeById}
      />

    </div>
  )
}
