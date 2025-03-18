export const getSupervisorReportsFetch = async ({ supervisorId }) => {

  const res = await fetch('/api/employee/get-supervisor-reports/' + supervisorId)
  const data = await res.json()

  if (data.success === false) {

    throw new Error("Este empleado no tiene reportes de supervisor esta semana");
  }

  console.log(data.data)

  return data.data
}