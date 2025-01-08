export const getBranchReport = async ({ branchId, date }) => {

  const res = await fetch('/api/branch/report/get-branch-report/' + branchId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message)
  }

  return data.branchReport
}