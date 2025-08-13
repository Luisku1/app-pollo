import { useMemo, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { getCustomersReports } from '../../services/customers/getCustomersReports';
import { formatDate } from "../../../../common/dateOps";

export const useCustomersReports = ({ companyId = null, date = null, reports = [], onlyNegativeBalances = false }) => {
  // Si se pasan reports por parámetro, se usan directamente; si no, usa React Query
  const {
    data,
    isLoading,
    refetch: refetchCustomerReports,
  } = useQuery({
    queryKey: ['customerReports', companyId, date],
    queryFn: () => getCustomersReports({ companyId, date }),
    enabled: !!companyId && !!date && reports.length === 0,
    select: (data) => data?.customersReports || [],
  });

  // customerReports: si hay reports por prop, usa esos; si no, usa data de useQuery
  const customerReports = useMemo(() => {
    if (reports.length > 0) return reports;
    return data || [];
  }, [reports, data]);

  const replaceReport = (report) => {
    // Optimistic update solo para UI local, no muta cache de React Query
    // Si usas reports por prop, deberías mutar el estado en el padre
    // Si usas data de useQuery, deberías usar un mutation + invalidate
  };

  const sortedReports = useMemo(() => {
    return [...customerReports].sort((a, b) => a.customer.name.localeCompare(b.customer.name));
  }, [customerReports]);

  // Filtrado por balances negativos
  const filteredReports = useMemo(() => {
    if (!onlyNegativeBalances) return sortedReports;
    return sortedReports.filter(report => report.balance < 0);
  }, [sortedReports, onlyNegativeBalances]);

  // Totales deben calcularse sobre el array filtrado
  const totalSales = useMemo(() => {
    return filteredReports.reduce((total, report) => total + report.sales, 0);
  }, [filteredReports]);

  const totalReturns = useMemo(() => {
    return filteredReports.reduce((total, report) => total + report.returns, 0);
  }, [filteredReports]);

  const totalPayments = useMemo(() => {
    return filteredReports.reduce((total, report) => total + report.payments, 0);
  }, [filteredReports]);

  const totalBalance = useMemo(() => {
    return filteredReports.reduce((total, report) => total + report.balance, 0);
  }, [filteredReports]);

  // Refetch cuando cambia la fecha o companyId
  useEffect(() => {
    if (companyId && date && reports.length === 0) {
      refetchCustomerReports();
    }
  }, [companyId, date]);

  return {
    customerReports: filteredReports,
    replaceReport, // (no-op, sólo para compatibilidad)
    setReports: () => { }, // (no-op, sólo para compatibilidad)
    totalSales,
    totalReturns,
    totalPayments,
    totalBalance,
    loading: isLoading,
    refetchCustomerReports
  };
};