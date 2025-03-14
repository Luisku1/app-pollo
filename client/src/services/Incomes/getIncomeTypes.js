export const getIncomeTypes = async () => {

  const res = await fetch('/api/income/types/get')
  const data = await res.json()

  if(data.success === false) {

    throw new Error("No se encontraron tipos de ingresos");

  }

  return data.incomeTypes
}