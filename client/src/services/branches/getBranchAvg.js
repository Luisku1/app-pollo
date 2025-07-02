export const getBranchAvg = async ({branchId}) => {

  const res = await fetch('/api/branch/get-branch-avg/' + branchId)
  const data = await res.json()

  if(data.success === false) {

    return 0
  }

  return data.branchAvg
}