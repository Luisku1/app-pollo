export const setSupervisorReportOnZero = async (reportId) => {

  const res = await fetch(`/api/employee/set-supervisor-report-on-zero/${reportId}`, {

    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);
  }

  return data.data
}