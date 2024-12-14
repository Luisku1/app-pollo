import { useEffect, useState } from "react"
import { getSupervisorsInfoReportFetch } from "../../services/Supervisors/getSupervisorsReportInfo"
import { ToastDanger } from "../../helpers/toastify"

export const useSupervisorsReportInfo = ({ companyId, date }) => {

  const [supervisorsInfo, setSupervisorsInfo] = useState([])
  const [grossCash, setGrossCash] = useState()
  const [deposits, setDeposits] = useState()
  const [netIncomes, setNetIncomes] = useState()
  const [missingIncomes, setMissingIncomes] = useState()
  const [extraOutgoings, setExtraOutgoings] = useState()
  const [extraOutgoingsArray, setExtraOutgoingsArray] = useState()
  const [verifiedCash, setVerifiedCash] = useState()
  const [cashArray, setCashArray] = useState()
  const [verifiedDeposits, setVerifiedDeposits] = useState()
  const [depositsArray, setDepositsArray] = useState()
  const [terminalIncomes, setTerminalIncomes] = useState()
  const [terminalIncomesArray, setTerminalIncomesArray] = useState()
  const [verifiedIncomes, setVerifiedIncomes] = useState()

  const getSupervisorsInfo = ({ companyId, date }) => {

    getSupervisorsInfoReportFetch({ companyId, date }).then((response) => {

      setSupervisorsInfo(response.supervisors)
      setDeposits(response.deposits)
      setExtraOutgoingsArray(response.extraOutgoingsArray)
      setExtraOutgoings(response.extraOutgoings)
      setGrossCash(response.grossCash)
      setMissingIncomes(response.missingIncomes)
      setNetIncomes(response.netIncomes)
      setVerifiedIncomes(response.verifiedIncomes)
      setCashArray(response.cashArray)
      setVerifiedCash(response.verifiedCash)
      setDepositsArray(response.depositsArray)
      setVerifiedDeposits(response.verifiedDeposits)
      setTerminalIncomesArray(response.terminalIncomesArray)
      setTerminalIncomes(response.terminalIncomes)

    }).catch((error) => {

      ToastDanger(error.message)
    })
  }

  useEffect(() => {

    if (!(companyId && date)) return

    getSupervisorsInfo({ companyId, date })

  }, [companyId, date])

  return {
    supervisorsInfo,
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