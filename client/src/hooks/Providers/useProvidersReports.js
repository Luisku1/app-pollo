import { useEffect, useMemo, useState } from "react";
import { useQuery } from '@tanstack/react-query';
// Ajusta la ruta según tu estructura real de servicios

export const useProvidersReports = ({ companyId = null, date = null, reports = [], profile = false, onlyNegativeBalances = false }) => {
  const [providersReports, setProvidersReports] = useState([]);

  const {
    data: providersReportsData,
    isLoading: loading,
    refetch: refetchProvidersReports,
  } = useQuery({
    queryKey: ["providersReports", companyId, date],
    queryFn: () => getProvidersReportsFetch({ companyId, date }).then(res => res.providersReports),
    enabled: !!companyId && !!date,
    staleTime: 1000 * 60 * 3
  });

  useEffect(() => {
    if (providersReportsData) setProvidersReports(providersReportsData);
  }, [providersReportsData]);

  // Replace a single report in the list
  const replaceReport = (report) => {
    setProvidersReports((prevReports) =>
      prevReports.map((prevReport) => prevReport._id === report._id ? report : prevReport)
    );
  };

  // Set reports if provided as prop
  useEffect(() => {
    if (reports.length > 0) {
      setProvidersReports(reports);
    }
  }, [reports]);

  const sortedReports = useMemo(() => {
    if (profile)
      return providersReports.sort((a, b) => b.createdAt - a.createdAt)
    return providersReports.sort((a, b) => a.provider?.position - b.provider?.position)
  }, [providersReports, profile])

  // Filtrado por balances negativos
  const filteredProvidersReports = useMemo(() => {
    if (!onlyNegativeBalances) return sortedReports;
    return sortedReports.filter(r => r.balance < 0);
  }, [sortedReports, onlyNegativeBalances]);

  // Totales deben calcularse sobre el array filtrado
  const totalPurchases = useMemo(() => filteredProvidersReports.reduce((total, report) => total + (report.purchases || 0), 0), [filteredProvidersReports]);
  const totalReturns = useMemo(() => filteredProvidersReports.reduce((total, report) => total + (report.returns || 0), 0), [filteredProvidersReports]);
  const totalPayments = useMemo(() => filteredProvidersReports.reduce((total, report) => total + (report.payments || 0), 0), [filteredProvidersReports]);
  const totalBalance = useMemo(() => filteredProvidersReports.reduce((total, report) => total + (report.balance || 0), 0), [filteredProvidersReports]);
  const totalPreviousBalance = useMemo(() => filteredProvidersReports.reduce((total, report) => total + (report.previousBalance || 0), 0), [filteredProvidersReports]);

  const purchasesArray = useMemo(() => providersReports.flatMap((report) => report.purchasesArray || []), [providersReports]);
  const returnsArray = useMemo(() => providersReports.flatMap((report) => report.returnsArray || []), [providersReports]);
  const paymentsArray = useMemo(() => providersReports.flatMap((report) => report.paymentsArray || []), [providersReports]);

  return {
    providersReports: filteredProvidersReports,
    replaceReport,
    setReports: setProvidersReports,
    getProvidersReports: refetchProvidersReports,
    purchasesArray,
    returnsArray,
    paymentsArray,
    totalPurchases,
    totalReturns,
    totalPayments,
    totalBalance,
    totalPreviousBalance,
    loading
  };
};
