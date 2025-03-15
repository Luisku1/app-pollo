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
    throw new Error(`No se registró el efectivo de ${income.amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}`);
  }

  return data.income;
}