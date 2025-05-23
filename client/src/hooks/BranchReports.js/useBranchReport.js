import { useEffect, useState } from "react"
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

export const useBranchReport = ({ branchId = null, date = null, _branchReport = null }) => {

  const [branchReport, setBranchReport] = useState()
  const { outgoings, outgoingsTotal, onAddOutgoing, onDeleteOutgoing, loading: outgoingsLoading } = useOutgoings({ initialOutgoings: branchReport?.outgoingsArray || null })
  const { incomes, payments, noPayments, incomesTotal, loading: incomesLoading } = useIncomes({ initialIncomes: branchReport?.incomesArray || null })
  const { stock , stockAmount, stockWeight, onAddStock, onDeleteStock, loading: stockLoading } = useStock({ initialStock: branchReport?.finalStockArray || null })
  const { initialStock, initialStockWeight, initialStockAmount } = useInitialStock({ initialArray: branchReport?.initialStockArray || null })
  const { midDayStock, midDayStockAmount, midDayStockWeight, onDeleteStock: onDeleteMidStock, onAddStock: onAddMidStock } = useMidDayStock({ initialArray: branchReport?.midDayStockArray || null })
  const { outputs , totalWeight: outputsWeight, totalAmount: outputsAmount, loading: outputsLoading } = useOutput({ initialOutputs: branchReport?.outputsArray || null})
  const { inputs, totalWeight: inputsWeight, totalAmount: inputsAmount, loading: inputsLoading } = useInputs({ initialInputs: branchReport?.inputsArray || null })
  const { providerInputs , providerInputsWeight, providerInputsAmount, loading: providerLoading } = useProviderInputs({ initialInputs: branchReport?.providerInputsArray || null })
  const [loading, setLoading] = useState(false)
  const [shouldFetchBranchReport, setShouldFetchBranchReport] = useState(false)
  const { prices, onChangePrices } = useBranchPrices({ branchId: (branchId || _branchReport?.branch._id) || null, date: (date || _branchReport?.createdAt) || null })

  const onUpdateBranchReport = async () => {
    try {
      setShouldFetchBranchReport(true)
    } catch (error) {
      console.log(error)
    }
  }

  const modifyBalance = (amount, operation) => {
    setBranchReport((prevBranchReport) => {
      const newBranchReport = { ...prevBranchReport }
      newBranchReport.balance = operation === 'add' ? newBranchReport.balance + parseFloat(amount) : newBranchReport.balance - parseFloat(amount) || 0
      return newBranchReport
    })
  }

  useEffect(() => {

    if (_branchReport) {

      setBranchReport(_branchReport)
    }

  }, [_branchReport])

  useEffect(() => {

    if (!branchId || _branchReport) return
    if ((!branchId || !date || _branchReport) && !shouldFetchBranchReport) return

    setBranchReport({
      initialStockArray: [],
      finalStockArray: [],
      outgoingsArray: [],
      incomesArray: [],
      outputsArray: [],
      inputsArray: [],
      providerInputsArray: [],
    })

    setShouldFetchBranchReport(false)

    const fetchBranchReport = async () => {
      setLoading(true)
      try {
        const response = await getBranchReport({ branchId, date })
        setBranchReport(response)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchBranchReport()

  }, [branchId, date, _branchReport, shouldFetchBranchReport])

  return {
    branchReport,
    setBranchReport,
    onUpdateBranchReport,
    outgoings,
    outgoingsTotal,
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
    onAddOutgoing,
    onDeleteOutgoing,
    onAddStock,
    modifyBalance,
    prices,
    onChangePrices,
    onDeleteStock,
    loading: loading || outgoingsLoading || incomesLoading || stockLoading || outputsLoading || inputsLoading || providerLoading,
  }
}