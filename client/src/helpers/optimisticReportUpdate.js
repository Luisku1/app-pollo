// Utilidad para actualización optimista y rollback de reportes (branch, supervisor, cliente, proveedor, etc.)

export function optimisticUpdateReport({
  queryClient,
  queryKey,
  matchFn,         // (report, item) => boolean
  updateFn,        // (report, item) => report actualizado
  item
}) {
  const prevReports = queryClient.getQueryData(queryKey);
  queryClient.setQueryData(queryKey, (oldReports) => {
    if (!oldReports) return oldReports;
    return oldReports.map(report =>
      matchFn(report, item) ? updateFn(report, item) : report
    );
  });
  return prevReports; // Para rollback
}

export function rollbackReport({ queryClient, queryKey, prevReports }) {
  if (prevReports) {
    queryClient.setQueryData(queryKey, prevReports);
  }
}
