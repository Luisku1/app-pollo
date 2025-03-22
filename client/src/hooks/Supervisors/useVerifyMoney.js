import { useState } from "react"
import { verifyMoneyFetch } from "../../services/Supervisors/verifyMoney"

export const useVerifyMoney = () => {

  const [loading, setLoading] = useState(false)

  const verifyMoney = async ({ typeField, supervisorReportId, companyId, amount, date }) => {

    setLoading(true)

    try {

      const updatedSupervisorReport = await verifyMoneyFetch({ typeField, supervisorReportId, companyId, amount, date })

      return updatedSupervisorReport

    } catch (error) {

      console.log(error)
    }

    setLoading(false)
  }

  return { verifyMoney, loading }
}