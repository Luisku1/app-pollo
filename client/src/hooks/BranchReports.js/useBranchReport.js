import { useEffect, useMemo, useState } from "react"
import { getBranchReport } from "../../services/BranchReports/getBranchReport"
import { useOutgoings } from "../Outgoings/useOutgoings"
import { useIncomes } from "../Incomes/useIncomes"
import { useStock } from "../Stock/useStock"
import { useInitialStock } from "../Stock/useInitialStock"
import { useOutput } from "../Outputs/useOutput"
import { useInputs } from "../Inputs/useInputs"
import { useProviderInputs } from "../ProviderInputs/useProviderInputs"
import { useBranchPrices } from "../Prices/useBranchPrices"
import { useMidDayStock } from "../Stock/useMidDayStock"
import { Types } from "mongoose"
import { updateReportEmployees } from "../../services/BranchReports/updateReportsEmployee"

export const useBranchReport = ({ branchId = null, date = null }) => {
  // State
  const [branchReport, setBranchReport] = useState({})
  const [loading, setLoading] = useState(false)

  // Hooks for each report section
  const {
    incomes,
    payments,
    noPayments,
    incomesTotal,
    loading: incomesLoading
  } = useIncomes({ initialIncomes: branchReport?.incomesArray || null, isReport: true })

  const {
    stock,
    stockAmount,
    stockWeight,
    onAddStock,
    onDeleteStock,
    loading: stockLoading
  } = useStock({ initialStock: branchReport?.finalStockArray || null })

  const {
    initialStock,
    initialStockWeight,
    initialStockAmount
  } = useInitialStock({ initialArray: branchReport?.initialStockArray || null })

  const {
    midDayStock,
    midDayStockAmount,
    midDayStockWeight,
    onDeleteStock: onDeleteMidStock,
    onAddStock: onAddMidStock
  } = useMidDayStock({ initialArray: branchReport?.midDayStockArray || null })

  // Outputs
  const outputs = useMemo(() => branchReport?.outputsArray || [], [branchReport])
  const { outputsAmount, outputsWeight } = useMemo(() => {
    const amount = outputs.reduce((acc, output) => acc + output.amount, 0)
    const weight = outputs.reduce((acc, output) => acc + output.weight, 0)
    return { outputsAmount: amount, outputsWeight: weight }
  }, [branchReport])

  // Output actions
  const {
    onDeleteOutput,
    loading: loadingDeleteOutput,
    error: errorDeleteOutput
  } = useOutput({ branchId, date, isReport: true })

  // Inputs
  const {
    inputs,
    totalWeight: inputsWeight,
    totalAmount: inputsAmount,
    loading: inputsLoading
  } = useInputs({ initialInputs: branchReport?.inputsArray || null, isReport: true })

  // Provider Inputs
  const {
    providerInputs,
    providerInputsWeight,
    providerInputsAmount,
    loading: providerLoading
  } = useProviderInputs({ initialInputs: branchReport?.providerInputsArray || null })

  // Prices
  const { prices, onChangePrices } = useBranchPrices({
    branchId: (branchId) || null,
    date: (date) || null
  })

  // Balance modifier
  const modifyBalance = (amount, operation) => {
    setBranchReport((prevBranchReport) => {
      const newBranchReport = { ...prevBranchReport }
      newBranchReport.balance = operation === 'add'
        ? newBranchReport.balance + parseFloat(amount)
        : newBranchReport.balance - parseFloat(amount) || 0
      return newBranchReport
    })
  }

  // --- OUTGOINGS: Optimistic update centralizado ---
  const { addOutgoing, deleteOutgoing } = useOutgoings()

  const outgoings = useMemo(() => branchReport?.outgoingsArray || [], [branchReport])
  const outgoingsTotal = useMemo(() => outgoings.reduce((acc, o) => acc + o.amount, 0), [outgoings])

  const onAddOutgoing = async (outgoing, modifyBalance) => {
    const tempId = new Types.ObjectId().toHexString()
    const tempOutgoing = { ...outgoing, _id: tempId }
    setBranchReport(prev => ({
      ...prev,
      outgoingsArray: [tempOutgoing, ...(prev?.outgoingsArray || [])]
    }))
    if (modifyBalance) modifyBalance(tempOutgoing.amount, 'add')
    try {
      addOutgoing({
        _id: tempOutgoing._id || null,
        company: tempOutgoing.company,
        employee: tempOutgoing?.employee?._id ? tempOutgoing.employee._id : outgoing.employee,
        concept: tempOutgoing.concept,
        amount: tempOutgoing.amount,
        date: tempOutgoing.date,
        branch: tempOutgoing?.branch?._id ? tempOutgoing.branch._id : tempOutgoing.branch,
        createdAt: tempOutgoing.createdAt,
      })
    } catch (error) {
      setBranchReport(prev => ({
        ...prev,
        outgoingsArray: prev.outgoingsArray.filter(o => o._id !== tempId)
      }))
      if (modifyBalance) modifyBalance(tempOutgoing.amount, 'subtract')
      console.log(error)
    }
  }

  const onDeleteOutgoing = async (outgoing, modifyBalance) => {
    const prevOutgoings = branchReport?.outgoingsArray || []
    setBranchReport(prev => ({
      ...prev,
      outgoingsArray: prev.outgoingsArray.filter(o => o._id !== outgoing._id)
    }))
    if (modifyBalance) modifyBalance(outgoing.amount, 'subtract')
    try {
      deleteOutgoing(outgoing)
    } catch (error) {
      setBranchReport(prev => ({
        ...prev,
        outgoingsArray: prevOutgoings
      }))
      if (modifyBalance) modifyBalance(outgoing.amount, 'add')
      console.log(error)
    }
  }

  const updateEmployees = async ({ employee, assistants }) => {

    setBranchReport(prev => {
      const newReport = { ...prev }
      if (employee) {
        newReport.employee = { ...employee }
      }
      if (assistants) {
        newReport.assistant = assistants.map(a => ({ ...a }))
      }
      return newReport
    })

    await updateReportEmployees({ reportId: branchReport._id, employeeId: employee?._id || null, assistants: assistants?.map(a => a._id) || [], branchId, date })
  }

  // Fetch branch report from API SOLO cuando branchId y date cambian y NO hay _branchReport
  useEffect(() => {
    if (!branchId || !date) return;
    setLoading(true);
    getBranchReport({ branchId, date })
      .then(setBranchReport)
      .catch(() => {
        setBranchReport({})
      })
      .finally(() => setLoading(false));
  }, [branchId, date]);

  // Si necesitas forzar un refetch, puedes exponer una función refreshBranchReport:
  const refreshBranchReport = async () => {
    if (!branchId || !date) return;
    setLoading(true);
    try {
      const response = await getBranchReport({ branchId, date });
      setBranchReport(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Return API
  return {
    branchReport,
    employee: branchReport?.employee || null,
    assistants: branchReport?.assistant || [],
    updateReportEmployees: updateEmployees,
    setBranchReport,
    onUpdateBranchReport: refreshBranchReport,
    outgoings,
    outgoingsTotal,
    onAddOutgoing,
    onDeleteOutgoing,
    incomes,
    payments,
    noPayments,
    incomesTotal,
    stock,
    stockAmount,
    stockWeight,
    midDayStock,
    midDayStockAmount,
    midDayStockWeight,
    onAddMidStock,
    onDeleteMidStock,
    initialStock,
    initialStockWeight,
    initialStockAmount,
    outputs,
    outputsAmount,
    outputsWeight,
    inputs,
    inputsAmount,
    inputsWeight,
    providerInputs,
    providerInputsWeight,
    providerInputsAmount,
    onAddStock,
    modifyBalance,
    prices,
    onChangePrices,
    onDeleteStock,
    onDeleteOutput,
    loading: loading || incomesLoading || stockLoading || loadingDeleteOutput || inputsLoading || providerLoading,
    errorDeleteOutput,
  }
}