export const getIncomesFetch = async (companyId, date) => {

  const res = await fetch(`/api/income/get/${companyId}/${date}`)
  const data = await res.json()

  if (data.success === false) {

    throw new Error("No se encontraron efectivos");

  }


  return {incomes: data.incomes, total: data.total}
}