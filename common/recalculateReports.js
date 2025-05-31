export const recalculateSupervisorReport = (supervisorReport) => {

  const { verifiedCash, verifiedDeposits, cash, deposits, extraOutgoings, terminalIncomes } = supervisorReport
  const balance = verifiedCash + verifiedDeposits - cash - deposits + extraOutgoings - terminalIncomes

  return { ...supervisorReport, balance }
}

export const recalculateBranchReport = (branchReport) => {
  const { initialStock, inputs, outputs, outgoings, finalStock, incomes, providerInputs } = branchReport
  const newBalance = (outgoings + finalStock + outputs + incomes) - (initialStock + inputs + providerInputs)

  return { ...branchReport, balance: newBalance }
}

export const recalculateCustomerReport = (customerReport) => {
  const { previousBalance, sales, returns, payments } = customerReport
  const newBalance = previousBalance + sales - returns - payments

  return { ...customerReport, balance: newBalance }
}