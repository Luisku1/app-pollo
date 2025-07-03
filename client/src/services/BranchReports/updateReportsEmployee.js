export const updateReportEmployees = async ({ reportId, employeeId = null, assistants = [], branchId, date }) => {

  const response = await fetch(`/api/branch/report/update-report-employees/${reportId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ employeeId, assistants, branchId, date })
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error('Error updating employee')
  }

  console.log(data)

  return data
}