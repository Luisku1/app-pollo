export const changeCompanyFetch = async ({ companyId, userId }) => {
  const res = await fetch('/api/auth/change-company', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyId, userId })
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    const message = data?.message || 'No se pudo cambiar la compañía';
    throw new Error(message);
  }
  // API devuelve { employee } según refactor backend
  return data.employee;
};
