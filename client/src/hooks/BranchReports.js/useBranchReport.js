import { useEffect, useState } from "react"
import { getBranchReport } from "../../services/BranchReports/getBranchReport"
import { useOutgoings } from "../Outgoings/useOutgoings"
import { useIncomes } from "../Incomes/useIncomes"
import { useStock } from "../Stock/useStock"
import { useInitialStock } from "../Stock/useInitialStock"
import { useOutput } from "../Outputs/useOutput"
import { useInputs } from "../Inputs/useInputs"
import { useProviderInputs } from "../ProviderInputs/useProviderInputs"
import { updateBranchReport } from "../../services/BranchReports/updateBranchReport"

export const useBranchReport = ({ branchId, date }) => {

  const [branchReport, setBranchReport] = useState({})
  const { outgoings, outgoingsTotal, onAddOutgoing, onDeleteOutgoing, loading: outgoingsLoading } = useOutgoings({ initialOutgoings: branchReport.outgoings })
  const { incomes, incomesTotal, loading: incomesLoading } = useIncomes({ initialIncomes: branchReport.incomes })
  const { stock, totalStock, onAddStock, onDeleteStock, loading: stockLoading } = useStock({ initialStock: branchReport.stock })
  const { initialStock, initialStockTotal } = useInitialStock({ initialArray: branchReport.initialStock })
  const { outputs, totalWeight: outputsWeight, totalAmount: outputsAmount, loading: outputsLoading } = useOutput({ initialOutputs: branchReport.outputs })
  const { inputs, totalWeight: inputsWeight, totalAmount: inputsAmount, loading: inputsLoading } = useInputs({ initialInputs: branchReport.inputs })
  const { providerInputs, providerInputsWeight, providerInputsAmount, loading: providerLoading } = useProviderInputs({ initialProviderInputs: branchReport.providerInputs })
  const [loading, setLoading] = useState(false)

  const onUpdateBranchReport = async (branchReport) => {
    try {
      await updateBranchReport(branchReport)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {

    if (!branchId || !date) return

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

  }, [branchId, date])

  return {
    branchReport,
    onUpdateBranchReport,
    outgoings,
    outgoingsTotal,
    incomes,
    incomesTotal,
    stock,
    totalStock,
    initialStock,
    initialStockTotal,
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
    onDeleteStock,
    loading: loading || outgoingsLoading || incomesLoading || stockLoading || outputsLoading || inputsLoading || providerLoading,
  }
}