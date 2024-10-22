export const getPendingEmployeesRestsFetch = async ({companyId}) => {

  const res = await fetch('/api/employee/get-pending-employees-rests/' + companyId)
  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message)
  }

  return { pendingEmployeesRests: data.pendingEmployeesRests }
}
