export const getBranchReportsFetch = async ({ companyId, date }) => {

  const res = await fetch('/api/report/get-branches-reports/' + companyId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);

  }

  return { branchReports: data.branchReports, totalIncomes: data.totalIncomes, totalStock: data.totalStock, totalOutgoings: data.totalOutgoings, totalBalance: data.totalBalance }
}