export const updateBranchReport = async (branchReport) => {

  const res = await fetch('/api/branch/report/update/', {

    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(branchReport)
  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);
  }
}

export const recalculateBranchReport = async (branchReport) => {

  const res = await fetch('/api/branch/report/recalculate/', {

    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(branchReport)
  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error(data.message);
  }

  return data.data
}