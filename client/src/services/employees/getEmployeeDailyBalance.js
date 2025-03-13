export const getEmployeeDailyBalanceFetch = async (employeeId) => {

  const res = await fetch('/api/employee/get-employee-day-information/' + employeeId)
  const data = await res.json()

  if (data.success === false) {

    throw new Error("No se encontró la información del día del empleado");

  }

  return data.data
}