import { useEffect, useState } from "react"
import { getBranchReportsFetch } from "../../services/BranchReports/getBranchReports"

export const useBranchReports = ({ companyId, date }) => {

  const [branchReports, setBranchReports] = useState([])
  const [totalIncomes, setTotalIncomes] = useState(0.0)
  const [totalOutgoings, setTotalOutgoings] = useState(0.0)
  const [totalStock, setTotalStock] = useState(0.0)
  const [totalBalance, setTotalBalance] = useState(0.0)
  const [loading, setLoading] = useState(false)

  const getBranchReports = ({ companyId, date }) => {

    setLoading(true)

    getBranchReportsFetch({ companyId, date }).then((response) => {

      setBranchReports(response.branchReports)
      setTotalIncomes(response.totalIncomes)
      setTotalOutgoings(response.totalOutgoings)
      setTotalStock(response.totalStock)
      setTotalBalance(response.totalBalance)
    })

    setLoading(false)

  }

  useEffect(() => {

    if (!companyId || !date) return

    setLoading(true)

    getBranchReportsFetch({ companyId, date }).then((response) => {

      setBranchReports(response.branchReports)
      setTotalIncomes(response.totalIncomes)
      setTotalOutgoings(response.totalOutgoings)
      setTotalStock(response.totalStock)
      setTotalBalance(response.totalBalance)
    })

    setLoading(false)

  }, [companyId, date])

  return {
    branchReports,
    getBranchReports,
    totalIncomes,
    totalOutgoings,
    totalStock,
    totalBalance,
    loading
  }
}