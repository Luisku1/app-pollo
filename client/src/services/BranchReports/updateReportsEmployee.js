export const updateReportEmployees = async ({ reportId, employeeId = null, assistants = [] }) => {

  const response = await fetch(`/api/branch/report/update-report-employees/${reportId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ employeeId, assistants })
  })

  if (!response.ok) {
    throw new Error('Error updating employee')
  }

  return await response.json()
}