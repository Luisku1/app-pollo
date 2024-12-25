/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import { useIncomes } from "../../hooks/Incomes/useIncomes";
import Incomes from "../Incomes/Incomes";
import ExtraOutgoings from "../Outgoings/ExtraOutgoings";
import { useDayExtraOutgoings } from "../../hooks/ExtraOutgoings/useDayExtraOutgoings";
import { useEmployeesPayments } from "../../hooks/Employees/useEmployeesPayments";

export default function IncomesAndOutgoings({ date, companyId, branchAndCustomerSelectOptions, employees, branches }) {

  const { currentUser } = useSelector((state) => state.user)
  const { incomes, incomesTotal, pushIncome, spliceIncome, spliceIncomeById, updateLastIncomeId } = useIncomes({ companyId, date })
  const { extraOutgoings, totalExtraOutgoings, pushExtraOutgoing, spliceExtraOutgoingById, updateLastExtraOutgoingId } = useDayExtraOutgoings({ companyId, date })
  const { employeesPayments, totalEmployeesPayments } = useEmployeesPayments({ companyId, date })

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
