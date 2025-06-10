export const getProvidersMovements = async ({ companyId, date }) => {

  const res = await fetch(`/api/providers/providers-movements?companyId=${companyId}&date=${date}`, {
    method: 'GET'
  });

  const data = await res.json();

  if (data.success === false) {
    throw new Error(data.message);
  }

  return data.movements;
}
