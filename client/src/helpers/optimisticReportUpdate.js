// Utilidad para actualización optimista y rollback de reportes (branch, supervisor, cliente, proveedor, etc.)

export function optimisticUpdateReport({
  queryClient,
  queryKey,
  matchFn,         // (report, item) => boolean
  updateFn,        // (report, item) => report actualizado
  item
}) {
  const prevReports = queryClient.getQueryData(queryKey);
  let found = false;
  queryClient.setQueryData(queryKey, (oldReports) => {
    if (!oldReports) return oldReports; // condicional que verifica si oldReports existe, si no existe retorna oldReports
    const updated = oldReports.map(report => {
      if (matchFn(report, item)) {

        found = true;
        return updateFn(report, item);
      }
      return report;
    });
    return updated;
  });
  if (!found) {
    // Si no se encontró el reporte, forzar refetch
    queryClient.invalidateQueries({ queryKey });
  }
  return prevReports; // Para rollback
}

export function rollbackReport({ queryClient, queryKey, prevReports }) {
  if (prevReports) {
    queryClient.setQueryData(queryKey, prevReports);
  }
}
