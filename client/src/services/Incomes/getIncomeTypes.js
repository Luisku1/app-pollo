export const getIncomeTypes = async () => {

  const res = await fetch('/api/income/types/get')
  const data = await res.json()

  if(data.success === false) {

    throw new Error("No se encontraron tipos de ingresos");

  }

  const incomeTypes = data.incomeTypes.map((incomeType) => {

    const {_id: value, name: label, ...rest} = incomeType
    const newIncomeType = {value, label, ...rest}

    return newIncomeType
  })

  return incomeTypes
}