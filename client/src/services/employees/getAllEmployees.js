export const getAllEmployees = async ({ companyId }) => {
  const res = await fetch('/api/employee/get-all-employees/' + companyId);

  const data = await res.json();

  // Manejar errores de lógica de la API
  if (data.success === false) {
    throw new Error(data.message || 'No se encontraron empleados');
  }

  return data.employees;
};