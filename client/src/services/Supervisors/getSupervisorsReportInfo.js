export const getSupervisorsInfoReportFetch = async ({ companyId, date }) => {

  const res = await fetch('/api/report/get-supervisors-info/' + companyId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message)
  }

  return data
}