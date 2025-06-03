// Servicio para obtener proveedores por companyId
export const getProviders = async (companyId) => {
  const res = await fetch(`/api/provider/get-providers/${companyId}`);
  const data = await res.json();
  if (data.success === false) {
    throw new Error(data.message || 'No se pudieron obtener los proveedores');
  }
  return data.providers;
};
