export const addIncomeFetch = async (income, group) => {

  const res = await fetch(`/api/income/${group}/create`, {

    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(income)

  })

  const data = await res.json()

  if (data.success === false) {

    throw new Error(`No se registró el efectivo de ${income.amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}`);

  }

  return data.income
}