export const getOutgoings = async ({ branchId, date }) => {

  const res = await fetch('/api/outgoing/branch-outgoings/' + branchId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    console.log(data.message)
    return {outgoings: [], outgoingsTotal: 0}
  }

  return {outgoings: data.outgoings, outgoingsTotal: data.outgoingsTotal}
}