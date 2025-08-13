export const getIncomesFetch = async (companyId, date) => {

  try {


    const res = await fetch(`/api/income/get/${companyId}/${date}`)
    const data = await res.json()

    if (data.success === false) {

      return { incomes: [] }

    }

    return { incomes: data.incomes }

  } catch (error) {
    return { incomes: [] }
  }
}