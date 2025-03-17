export const addIncomeFetch = async (income, prevOwnerIncome, group) => {
  const body = prevOwnerIncome ? { prevIncome: prevOwnerIncome, income } : income;

  const res = await fetch(`/api/income/${group === 'prevOwner' ? 'transfer' : group}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (data.success === false) {
    throw new Error(data.message);
  }

  return data.income;
}