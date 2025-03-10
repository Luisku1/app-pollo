import { useEffect, useMemo, useState } from "react"
import { getBranchReportsFetch } from "../../services/BranchReports/getBranchReports"

export const useBranchReports = ({ companyId, date }) => {

  const [branchReports, setBranchReports] = useState([])
  const [loading, setLoading] = useState(false)

  const getBranchReports = ({ companyId, date }) => {

    setLoading(true)

    getBranchReportsFetch({ companyId, date }).then((response) => {

      setBranchReports(response.branchReports)
      setLoading(false)
    })
  }

  const replaceReport = (report) => {

    console.log(report)
    setBranchReports((prevReports) => prevReports.map((prevReport) => prevReport._id === report._id ? report : prevReport))
  }

  const initializeInfo = () => {

    setBranchReports([])
  }

  useEffect(() => {

    if (!companyId || !date) return

    setLoading(true)

    initializeInfo()

    getBranchReportsFetch({ companyId, date }).then((response) => {

      setBranchReports(response.branchReports)
    })

    setLoading(false)

  }, [companyId, date])

  const totalOutgoings = useMemo(() => {

    return branchReports.reduce((total, report) => total + report.outgoings, 0)

  }, [branchReports])

  const totalStock = useMemo(() => {

    return branchReports.reduce((total, report) => total + report.finalStock, 0)

  }, [branchReports])

  const totalBalance = useMemo(() => {

    return branchReports.reduce((total, report) => total + report.balance, 0)

  }, [branchReports])

  const totalIncomes = useMemo(() => {

    return branchReports.reduce((total, report) => total + report.incomes, 0)

  }, [branchReports])

  const sortedReports = useMemo(() => {

    return branchReports.sort((a, b) => a.branch.position - b.branch.position)

  }, [branchReports])

  return {
    branchReports: sortedReports,
    replaceReport,
    getBranchReports,
    totalIncomes,
    totalOutgoings,
    totalStock,
    totalBalance,
    loading
  }
}