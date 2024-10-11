export const getDayExtraOutgoingsFetch = async ({ companyId, date }) => {

  const res = await fetch('/api/outgoing/get-extra-outgoings/' + companyId + '/' + date)
  const data = await res.json()

  if (data.success === false) {

    throw new Error("No se encontraron gastos fuera de cuentas");

  }

  return {extraOutgoings: data.extraOutgoings, totalExtraOutgoings: data.totalExtraOutgoings}
}