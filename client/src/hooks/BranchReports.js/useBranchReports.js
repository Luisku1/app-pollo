import { useEffect, useMemo, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { getBranchReportsFetch } from "../../services/BranchReports/getBranchReports";

export const useBranchReports = ({ companyId = null, date = null, reports = [], profile = false, onlyNegativeBalances = false }) => {

  const [branchReports, setBranchReports] = useState([]);

  const {
    data: branchReportsData,
    isLoading: loading,
    refetch: refetchBranchReports,
  } = useQuery({
    queryKey: ["branchReports", companyId, date],
    queryFn: () => getBranchReportsFetch({ companyId, date }).then(res => res.branchReports),
    enabled: !!companyId && !!date && !profile,
    staleTime: 1000 * 60 * 3
  });

  // Mantén el estado local solo si necesitas replaceReport
  useEffect(() => {
    if (branchReportsData) setBranchReports(branchReportsData);
  }, [branchReportsData]);

  // Replace a single report in the list
  const replaceReport = (report) => {
    setBranchReports((prevReports) =>
      prevReports.map((prevReport) => prevReport._id === report._id ? report : prevReport)
    );
  };

  // Set reports if provided as prop
  useEffect(() => {
    if (reports.length > 0) {
      setBranchReports(reports);
    }
  }, [reports]);

  // Refetch cuando cambia la fecha o companyId
  useEffect(() => {
    if (companyId && date && reports.length === 0 && !profile) {
      refetchBranchReports();
    }
  }, [companyId, date]);

  const sortedReports = useMemo(() => {
    if (profile)
      return branchReports.sort((a, b) => b.createdAt - a.createdAt)
    return branchReports.sort((a, b) => a.branch.position - b.branch.position)
  }, [branchReports, profile])

  // Filtrado por balances negativos
  const filteredBranchReports = useMemo(() => {
    if (!onlyNegativeBalances) return sortedReports;
    return sortedReports.filter(r => r.balance < 0);
  }, [sortedReports, onlyNegativeBalances]);

  // Totales deben calcularse sobre el array filtrado
  const totalOutgoings = useMemo(() => filteredBranchReports.reduce((total, report) => total + report.outgoings, 0), [filteredBranchReports]);
  const totalInitialStock = useMemo(() => filteredBranchReports.reduce((total, report) => total + report.initialStock, 0), [filteredBranchReports]);
  const totalStock = useMemo(() => filteredBranchReports.reduce((total, report) => total + report.finalStock, 0), [filteredBranchReports]);
  const totalInputs = useMemo(() => filteredBranchReports.reduce((total, report) => total + report.inputs, 0), [filteredBranchReports]);
  const totalOutputs = useMemo(() => filteredBranchReports.reduce((total, report) => total + report.outputs, 0), [filteredBranchReports]);
  const { totalProviderInputs } = useMemo(() => filteredBranchReports.reduce((total, report) =>
  ({
    totalProviderInputs: total.totalProviderInputs + report.providerInputs
  })
    , { totalProviderInputs: 0 }), [filteredBranchReports]);

  const totalBalance = useMemo(() => filteredBranchReports.reduce((total, report) => total + report.balance, 0), [filteredBranchReports]);
  const totalIncomes = useMemo(() => filteredBranchReports.reduce((total, report) => total + report.incomes, 0), [filteredBranchReports]);
  const outputsArray = useMemo(() => branchReports.flatMap((report) => report.outputsArray), [branchReports]);
  const providerInputsArray = useMemo(() => branchReports.flatMap((report) => report.providerInputsArray), [branchReports]);
  const totalProviderInputsWeight = useMemo(() => providerInputsArray.reduce((total, input) => total + input.weight, 0), [providerInputsArray]);
  const outgoingsArray = useMemo(() => branchReports.flatMap((report) => report.outgoingsArray), [branchReports]);
  // Agrupa y suma por producto para initialStockArray
  const initialStockArray = useMemo(() => branchReports.flatMap((report) => report.initialStockArray), [branchReports])
  const inputsArray = useMemo(() => {
    return branchReports.flatMap((report) => report.inputsArray)
  }
    , [branchReports])
  const finalStockArray = useMemo(() => {
    return branchReports.flatMap((report) => report.finalStockArray)
  }
    , [branchReports])
  const incomesArray = useMemo(() => {
    return branchReports.flatMap((report) => report.incomesArray)
  }
    , [branchReports])


  return {
    branchReports: filteredBranchReports,
    replaceReport,
    setReports: setBranchReports,
    refetchBranchReports,
    incomesArray,
    outputsArray,
    providerInputsArray,
    outgoingsArray,
    initialStockArray,
    finalStockArray,
    inputsArray,
    totalProviderInputs,
    totalProviderInputsWeight,
    totalInitialStock,
    totalInputs,
    totalOutputs,
    totalIncomes,
    totalOutgoings,
    totalStock,
    totalBalance,
    loading
  };
};