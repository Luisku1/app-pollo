import { useEffect, useState } from "react"
import { getSupervisorsInfoReportFetch } from "../../services/Supervisors/getSupervisorsReportInfo"

export const useSupervisorsReportInfo = ({ companyId, date }) => {

  const [supervisorsInfo, setSupervisorsInfo] = useState([])
  const [loading, setLoading] = useState(false)
  const [grossCash, setGrossCash] = useState(0)
  const [deposits, setDeposits] = useState(0)
  const [netIncomes, setNetIncomes] = useState(0)
  const [missingIncomes, setMissingIncomes] = useState(0)
  const [extraOutgoings, setExtraOutgoings] = useState(0)
  const [extraOutgoingsArray, setExtraOutgoingsArray] = useState(0)
  const [verifiedCash, setVerifiedCash] = useState(0)
  const [cashArray, setCashArray] = useState(0)
  const [verifiedDeposits, setVerifiedDeposits] = useState(0)
  const [depositsArray, setDepositsArray] = useState(0)
  const [terminalIncomes, setTerminalIncomes] = useState(0)
  const [terminalIncomesArray, setTerminalIncomesArray] = useState(0)
  const [verifiedIncomes, setVerifiedIncomes] = useState(0)

  const initializeInfo = () => {

    setSupervisorsInfo([])
    setDeposits(0)
    setExtraOutgoings(0)
    setExtraOutgoingsArray(0)
    setGrossCash(0)
    setMissingIncomes(0)
    setNetIncomes(0)
    setVerifiedIncomes(0)
    setCashArray(0)
    setVerifiedCash(0)
    setDepositsArray(0)
    setVerifiedDeposits(0)
    setTerminalIncomesArray(0)
    setTerminalIncomes(0)
  }


  const getSupervisorsInfo = ({ companyId, date }) => {

    setLoading(true)
    getSupervisorsInfoReportFetch({ companyId, date }).then((response) => {

      setSupervisorsInfo(response.reports)
      setDeposits(response.deposits)
      setExtraOutgoingsArray(response.extraOutgoingsArray)
      setExtraOutgoings(response.extraOutgoings)
      setGrossCash(response.cash)
      setMissingIncomes(response.missingIncomes)
      setNetIncomes(response.netIncomes)
      setVerifiedIncomes(response.verifiedIncomes)
      setCashArray(response.cashArray)
      setVerifiedCash(response.verifiedCash)
      setDepositsArray(response.depositsArray)
      setVerifiedDeposits(response.verifiedDeposits)
      setTerminalIncomesArray(response.terminalIncomesArray)
      setTerminalIncomes(response.terminalIncomes)

      setLoading(false)
    })
  }

  useEffect(() => {

    if (!(companyId && date)) return


    initializeInfo()
    getSupervisorsInfo({ companyId, date })


  }, [companyId, date])

  return {
    supervisorsInfo,
    loading,
    deposits,
    setDeposits,
    extraOutgoings,
    extraOutgoingsArray,
    grossCash,
    setGrossCash,
    missingIncomes,
    setMissingIncomes,
    netIncomes,
    setNetIncomes,
    verifiedIncomes,
    setVerifiedIncomes,
    terminalIncomes,
    terminalIncomesArray,
    setTerminalIncomes,
    getSupervisorsInfo,
    verifiedCash,
    cashArray,
    setVerifiedCash,
    verifiedDeposits,
    depositsArray,
    setVerifiedDeposits
  }
}