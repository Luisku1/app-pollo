// Servicio para obtener reports de proveedores por companyId y fecha
// Siempre retorna { data: [] } aunque no haya resultados (404 => [])
export const getProvidersReportsFetch = async ({ companyId, date }) => {
  if (!companyId) throw new Error('companyId es requerido');
  if (!date) throw new Error('date es requerido');

  // Normalizar fecha: aceptar Date, ISO, o YYYY-MM-DD y enviar sólo YYYY-MM-DD
  let dateParam = date;
  if (date instanceof Date) dateParam = date.toISOString().slice(0, 10);
  else if (typeof date === 'string' && date.length >= 10) dateParam = date.slice(0, 10); // recorta si viene con tiempo

  const url = `/api/provider/get-providers-reports/${companyId}?date=${dateParam}`;

  let json = null;
  let res = null;
  try {
    res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    json = await res.json();
  } catch (e) {
    throw new Error('Error de red al obtener reports de proveedores');
  }

  // 404 lo tratamos como lista vacía para no romper UI
  if (res.status === 404) {
    return { data: [] };
  }
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || 'No se pudieron obtener los reports de proveedores');
  }
  // Estructura esperada: { providerReports: [...] }
  const data = Array.isArray(json.providerReports) ? json.providerReports : [];
  return { data };
};

export default getProvidersReportsFetch;
