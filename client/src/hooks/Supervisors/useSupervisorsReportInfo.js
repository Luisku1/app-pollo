import { useMemo, useState, useEffect } from "react"
import { useQuery } from '@tanstack/react-query';
import { getSupervisorsInfoReportFetch } from "../../services/Supervisors/getSupervisorsReportInfo"
import { formatDate } from "../../../../common/dateOps";

export const useSupervisorsReportInfo = ({ companyId, date, onlyNegativeBalances = false }) => {

  const {
    data: supervisorsInfoData,
    isLoading: loading,
    refetch: refetchSupervisorsInfo,
  } = useQuery({
    queryKey: ["supervisorsReportInfo", companyId, formatDate(date)],
    queryFn: () => getSupervisorsInfoReportFetch({ companyId, date }).then(res => res.reports),
    enabled: !!companyId && !!date,
    staleTime: 1000 * 60 * 3
  });

  // Estado local para permitir replaceSupervisorReport
  const [supervisorsInfo, setSupervisorsInfo] = useState([]);

  // Sincroniza el estado local con la data de React Query
  useEffect(() => {
    if (supervisorsInfoData) setSupervisorsInfo(supervisorsInfoData);
  }, [supervisorsInfoData]);

  // Refetch cuando cambia la fecha o companyId
  useEffect(() => {
    if (companyId && date) {
      refetchSupervisorsInfo();
    }
  }, [companyId, date]);

  const deposits = useMemo(() => supervisorsInfo.reduce((acc, report) => acc + report.deposits, 0), [supervisorsInfo]);
  const terminalIncomes = useMemo(() => supervisorsInfo.reduce((acc, report) => acc + report.terminalIncomes, 0), [supervisorsInfo]);
  const grossCash = useMemo(() => supervisorsInfo.reduce((acc, report) => acc + report.cash, 0), [supervisorsInfo]);
  const extraOutgoings = useMemo(() => supervisorsInfo.reduce((acc, report) => acc + report.extraOutgoings, 0), [supervisorsInfo]);
  const netIncomes = useMemo(() => grossCash + deposits + terminalIncomes - extraOutgoings, [grossCash, extraOutgoings, deposits, terminalIncomes]);
  const verifiedDeposits = useMemo(() => supervisorsInfo.reduce((acc, report) => acc + report.verifiedDeposits, 0), [supervisorsInfo]);
  const verifiedCash = useMemo(() => supervisorsInfo.reduce((acc, report) => acc + report.verifiedCash, 0), [supervisorsInfo]);
  const missingIncomes = useMemo(() => grossCash - extraOutgoings - verifiedCash, [grossCash, extraOutgoings, verifiedCash, supervisorsInfo]);
  const verifiedIncomes = useMemo(() => verifiedDeposits + verifiedCash, [verifiedCash, verifiedDeposits]);
  const extraOutgoingsArray = useMemo(() => supervisorsInfo.flatMap(report => report.extraOutgoingsArray), [supervisorsInfo]);
  const cashArray = useMemo(() => supervisorsInfo.flatMap(report => report.cashArray), [supervisorsInfo]);
  const depositsArray = useMemo(() => supervisorsInfo.flatMap(report => report.depositsArray), [supervisorsInfo]);
  const terminalIncomesArray = useMemo(() => supervisorsInfo.flatMap(report => report.terminalIncomesArray), [supervisorsInfo]);
  const totalBalance = useMemo(() => supervisorsInfo.reduce((acc, report) => acc + report.balance, 0), [supervisorsInfo]);
  const grossIncomes = useMemo(() => grossCash + deposits + terminalIncomes, [grossCash, deposits, terminalIncomes]);

  // Filtrado por balances negativos
  const filteredSupervisorsInfo = useMemo(() => {
    if (!onlyNegativeBalances) return supervisorsInfo;
    return supervisorsInfo.filter(report => report.balance < 0);
  }, [supervisorsInfo, onlyNegativeBalances]);

  // Reemplaza un reporte en el estado local
  const replaceSupervisorReport = (report) => {
    setSupervisorsInfo(prev => prev.map(r => r._id === report._id ? report : r));
  };

  return {
    supervisorsInfo: filteredSupervisorsInfo,
    replaceSupervisorReport,
    loading,
    deposits,
    extraOutgoings,
    grossCash,
    missingIncomes,
    netIncomes,
    verifiedIncomes,
    cashArray,
    verifiedCash,
    grossIncomes,
    totalBalance,
    depositsArray,
    extraOutgoingsArray,
    verifiedDeposits,
    terminalIncomesArray,
    terminalIncomes,
    refetchSupervisorsInfo,
  };
};