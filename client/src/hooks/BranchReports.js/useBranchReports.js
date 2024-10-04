import { useCallback, useEffect, useState } from "react"
import { getBranchReportsFetch } from "../../services/BranchReports/getBranchReports"

export const useBranchReports = ({ companyId, date }) => {

  const [branchReports, setBranchReports] = useState([])
  const [incomesTotal, setIncomesTotal] = useState(0.0)
  const [outgoingsTotal, setOutgoingsTotal] = useState(0.0)
  const [stockTotal, setStockTotal] = useState(0.0)
  const [balanceTotal, setBalanceTotal] = useState(0.0)
  const [loading, setLoading] = useState(false)

  const getBranchReports = useCallback( async () => {

    setLoading(true)

    getBranchReportsFetch({ companyId, date }).then((response) => {

      setBranchReports(response.branchReports)
      setIncomesTotal(response.incomesTotal)
      setOutgoingsTotal(response.outgoingsTotal)
      setStockTotal(response.stockTotal)
      setBalanceTotal(response.balanceTotal)
    })

    setLoading(false)

  }, [companyId, date])

  useEffect(() => {

    if (!companyId || !date) return

    setLoading(true)

    getBranchReports(companyId, date)

    setLoading(false)

  }, [companyId, date, getBranchReports])

  return {
    branchReports,
    incomesTotal,
    outgoingsTotal,
    stockTotal,
    balanceTotal,
    loading
  }
}