export const getEmployeesDailyBalancesFetch = async ({ companyId, date }) => {

  const res = await fetch('/api/employee/get-employees-daily-balances/' + companyId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);
  }

  return { employeesDailyBalances: data }
}