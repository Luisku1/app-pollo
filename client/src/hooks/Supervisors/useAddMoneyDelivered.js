import { useState } from "react"
import { addMoneyDeliveredFetch } from "../../services/Supervisors/addMoneyDelivered"

export const useAddMoneyDelivered = () => {

  const [loading, setLoading] = useState(false)

  const addMoneyDelivered = ({ supervisorId, companyId, amount, date, supervisorReport, updateSupervisorReport, updateReportedIncomes }) => {

    setLoading(true)

    const balance = supervisorReport.balance + (parseFloat(amount) - supervisorReport.moneyDelivered)

    const pivotSupervisorReport = {
      ...supervisorReport,
      moneyDelivered: parseFloat(amount),
      balance: balance
    }

    updateSupervisorReport({updatedSupervisorReport: pivotSupervisorReport})

    updateReportedIncomes({reportedIncome: amount, prevReportedIncome: supervisorReport.moneyDelivered})

    addMoneyDeliveredFetch({ supervisorId, companyId, amount, date }).then((response) => {

      updateSupervisorReport({updatedSupervisorReport: response.updatedSupervisorReport})

    }).catch((error) => {

      updateSupervisorReport({updatedSupervisorReport: supervisorReport})
      updateReportedIncomes({reportedIncome: supervisorReport.moneyDelivered, prevReportedIncome: amount})
      console.log(error)
    })

    setLoading(false)
  }

  return { addMoneyDelivered, loading }
}