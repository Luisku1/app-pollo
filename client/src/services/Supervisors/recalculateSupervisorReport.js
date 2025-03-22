export const recalculateSupervisorReport = async (supervisorReportId) => {

  const res = await fetch('/api/employee/supervisor-report-recalculate/' + supervisorReportId, {

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