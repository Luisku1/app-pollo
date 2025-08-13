export const getSupervisorsInfoReportFetch = async ({ companyId, date }) => {

  try {

    const res = await fetch('/api/report/get-supervisors-info/' + companyId + '/' + date)
    const data = await res.json()

    if (data.success === false) {

      return []
    }

    return data
  } catch (error) {

    throw new Error('Error fetching supervisors report info')
  }
}