import { useEffect, useMemo, useState } from "react"
import { getSupervisorsInfoReportFetch } from "../../services/Supervisors/getSupervisorsReportInfo"

export const useSupervisorsReportInfo = ({ companyId, date }) => {

  const [supervisorsInfo, setSupervisorsInfo] = useState([]);
  const [loading, setLoading] = useState(false);

  const initializeInfo = () => {
    setSupervisorsInfo([]);
  };

  const getSupervisorsInfo = async ({ companyId, date }) => {
    setLoading(true);
    try {
      const response = await getSupervisorsInfoReportFetch({ companyId, date });
      setSupervisorsInfo(response.reports);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!(companyId && date)) return;
    initializeInfo();
    getSupervisorsInfo({ companyId, date });
  }, [companyId, date]);

  const deposits = useMemo(() => supervisorsInfo.reduce((acc, report) => acc + report.deposits, 0), [supervisorsInfo]);
  const grossCash = useMemo(() => supervisorsInfo.reduce((acc, report) => acc + report.cash, 0), [supervisorsInfo]);
  const extraOutgoings = useMemo(() => supervisorsInfo.reduce((acc, report) => acc + report.extraOutgoings, 0), [supervisorsInfo]);
  const netIncomes = useMemo(() => grossCash - extraOutgoings, [grossCash, extraOutgoings]);
  const missingIncomes = useMemo(() => supervisorsInfo.reduce((acc, report) => acc + report.balance, 0), [supervisorsInfo]);
  const verifiedDeposits = useMemo(() => supervisorsInfo.reduce((acc, report) => acc + report.verifiedDeposits, 0), [supervisorsInfo]);
  const verifiedCash = useMemo(() => supervisorsInfo.reduce((acc, report) => acc + report.verifiedCash, 0), [supervisorsInfo]);
  const verifiedIncomes = useMemo(() => verifiedDeposits + verifiedCash, [verifiedCash, verifiedDeposits]);
  const cashArray = useMemo(() => supervisorsInfo.flatMap(report => report.cashArray), [supervisorsInfo]);
  const depositsArray = useMemo(() => supervisorsInfo.flatMap(report => report.depositsArray), [supervisorsInfo]);
  const terminalIncomesArray = useMemo(() => supervisorsInfo.flatMap(report => report.terminalIncomesArray), [supervisorsInfo]);
  const terminalIncomes = useMemo(() => supervisorsInfo.reduce((acc, report) => acc + report.terminalIncomes, 0), [supervisorsInfo]);

  return {
    supervisorsInfo,
    replaceSupervisorReport: (report) => {
      setSupervisorsInfo((prevReports) => prevReports.map((prevReport) => prevReport._id === report._id ? report : prevReport));
    },
    loading,
    deposits,
    extraOutgoings,
    grossCash,
    missingIncomes,
    netIncomes,
    verifiedIncomes,
    cashArray,
    verifiedCash,
    depositsArray,
    verifiedDeposits,
    terminalIncomesArray,
    terminalIncomes,
    getSupervisorsInfo,
  };
};