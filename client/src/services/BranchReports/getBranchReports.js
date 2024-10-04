export const getBranchReportsFetch = async ({ companyId, date }) => {

  const res = await fetch('/api/report/get-branches-reports/' + companyId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);

  }

  return { branchReports: data.branchReports, incomesTotal: data.incomesTotal, stockTotal: data.stockTotal, outgoingsTotal: data.outgoingsTotal, balanceTotal: data.balanceTotal }
}