export const getBranchAvg = async ({branchId}) => {

  const res = await fetch('/api/branch/get-branch-avg/' + branchId)
  const data = await res.json()

  if(data.success === false) {

    console.log(data.message)
    return 0
  }

  return data.branchAvg
}