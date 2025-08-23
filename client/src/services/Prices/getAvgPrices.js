export const getAvgPrices = async ({ companyId, residuals = false } = {}) => {
  const params = new URLSearchParams();
  if (companyId) params.set('companyId', companyId);
  if (residuals) params.set('residuals', 'true');
  const res = await fetch(`/api/product/price/prices-avg?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudieron obtener los precios promedio');
  const json = await res.json();
  return json.data || [];
};
