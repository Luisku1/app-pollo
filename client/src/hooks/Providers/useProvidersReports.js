import { useEffect, useMemo, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import getProvidersReportsFetch from "../../services/Providers/getProvidersReports";
// Ajusta la ruta según tu estructura real de servicios

export const useProvidersReports = ({ companyId = null, date = null, reports = [], profile = false, onlyNegativeBalances = false }) => {
  const [providersReports, setProvidersReports] = useState([]);

  const {
    data: providersReportsData,
    isLoading: loading,
    refetch: refetchProvidersReports,
  } = useQuery({
    queryKey: ["providersReports", companyId, date],
    queryFn: () => getProvidersReportsFetch({ companyId, date }).then(res => res.data),
    enabled: !!companyId && !!date,
    staleTime: 1000 * 60 * 3
  });

  useEffect(() => {
    if (Array.isArray(providersReportsData)) setProvidersReports(providersReportsData);
    else if (providersReportsData == null) setProvidersReports([]);
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

  // Refetch cuando cambia la fecha o companyId
  useEffect(() => {
    if (companyId && date) {
      refetchProvidersReports();
    }
  }, [companyId, date]);

  // Filtrado por balances negativos
  const filteredProvidersReports = useMemo(() => {
    if (!onlyNegativeBalances) return providersReports;
    return providersReports.filter(r => (r.balance ?? 0) < 0);
  }, [providersReports, onlyNegativeBalances]);

  // Totales deben calcularse sobre el array filtrado
  const totalMovements = useMemo(() => filteredProvidersReports.reduce((total, report) => total + (report.movements || 0), 0), [filteredProvidersReports]);
  const totalReturns = useMemo(() => filteredProvidersReports.reduce((total, report) => total + (report.returns || 0), 0), [filteredProvidersReports]);
  const totalPayments = useMemo(() => filteredProvidersReports.reduce((total, report) => total + (report.payments || 0), 0), [filteredProvidersReports]);
  const totalBalance = useMemo(() => filteredProvidersReports.reduce((total, report) => total + (report.balance || 0), 0), [filteredProvidersReports]);
  const totalPreviousBalance = useMemo(() => filteredProvidersReports.reduce((total, report) => total + (report.previousBalance || 0), 0), [filteredProvidersReports]);

  const movementsArray = useMemo(() => (providersReports || []).flatMap((report) => report.movementsArray || []), [providersReports]);
  const purchasesArray = useMemo(() => (providersReports || []).flatMap((report) => report.movementsArray?.filter(movement => !movement.isReturn) || []), [providersReports]);
  const returnsArray = useMemo(() => (providersReports || []).flatMap((report) => report.returnsArray || []), [providersReports]);
  const paymentsArray = useMemo(() => (providersReports || []).flatMap((report) => report.paymentsArray || []), [providersReports]);

  return {
    providersReports: filteredProvidersReports || [],
    replaceReport,
    setReports: setProvidersReports,
    refetchProvidersReports,
    movementsArray,
    returnsArray,
    paymentsArray,
    purchasesArray,
    totalMovements,
    totalReturns,
    totalPayments,
    totalBalance,
    totalPreviousBalance,
    loading
  };
};
