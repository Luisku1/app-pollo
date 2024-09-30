export const getExtraOutgoingsAvg = async ({companyId}) => {

  const res = await fetch(`api/outgoing/extra-outgoing/get-avg/${companyId}`)
  const data = await res.json()

  if(data.success === false) {

    throw new Error("No se encontraron datos para obtener el promedio de gastos");

  }

  return {extraOutgoingsAvg: data.extraOutgoingsAvg}

}