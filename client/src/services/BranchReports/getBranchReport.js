export const getBranchReport = async ({branchId, date}) => {

  const res = await fetch('/api/branch/report/get-branch-report/' + branchId + '/' + date)
  const data = await res.json()

  if(data.success === false) {

    return {}
  }

  return data.branchReport
}