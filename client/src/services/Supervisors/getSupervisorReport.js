export const getSupervisorReportFetch = async ({supervisorId, date}) => {

  const res = await fetch(`/api/employee/get-supervisor-report/${supervisorId}/${date}`)

  const data = await res.json()

  if(data.success === false) {

    throw new Error(data.message);

  }

  return {supervisorReport: data.supervisorReport}
}