import { useState } from "react"
import { verifyMoneyFetch } from "../../services/Supervisors/verifyMoney"

export const useVerifyMoney = () => {

  const [loading, setLoading] = useState(false)

  const verifyMoney = ({ typeField, supervisorId, companyId, amount, date, supervisorReport, updateSupervisorReport, updateReportedCash, updateReportedDeposits }) => {

    setLoading(true)


    const balance = supervisorReport.balance +
      (parseFloat(amount) +
        (typeField == 'verifiedCash' ? supervisorReport.verifiedDeposits : supervisorReport.verifiedCash) -
        (supervisorReport.verifiedCash + supervisorReport.verifiedDeposits))

    const pivotSupervisorReport = {
      ...supervisorReport,
      [typeField]: parseFloat(amount),
      balance: balance
    }

    updateSupervisorReport({ updatedSupervisorReport: pivotSupervisorReport })

    if(typeField == 'verifiedCash') {

      updateReportedCash({ reportedCash: amount, prevReportedCash: supervisorReport.verifiedCash, prevReportedIncomes: (supervisorReport.verifiedCash + supervisorReport.verifiedDeposits) })

    } else {

      updateReportedDeposits({ reportedDeposits: amount, prevReportedDeposits: supervisorReport.verifiedDeposits, prevReportedIncomes: (supervisorReport.verifiedCash + supervisorReport.verifiedDeposits) })
    }


    verifyMoneyFetch({ typeField, supervisorId, companyId, amount, date }).then((response) => {

      updateSupervisorReport({ updatedSupervisorReport: response.updatedSupervisorReport })

    }).catch((error) => {

      updateSupervisorReport({ updatedSupervisorReport: supervisorReport })

      if(typeField == 'verifiedCash') {

      updateReportedCash({ reportedCash: supervisorReport.verifiedCash, prevReportedCash: amount, prevReportedIncomes: (supervisorReport.verifiedCash + supervisorReport.verifiedDeposits) })

    } else {

      updateReportedDeposits({ reportedDeposits: supervisorReport.verifiedDeposits, prevReportedDeposits: amount, prevReportedIncomes: (supervisorReport.verifiedCash + supervisorReport.verifiedDeposits) })
    }
      console.log(error)
    })

    setLoading(false)
  }

  return { verifyMoney, loading }
}