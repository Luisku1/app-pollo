import { useState } from "react"
import { verifyMoneyFetch } from "../../services/Supervisors/verifyMoney"

export const useVerifyMoney = () => {

  const [loading, setLoading] = useState(false)

  const verifyMoney = async ({ typeField, supervisorReportId, companyId, amount, date }) => {

    setLoading(true)

    try {

      const updatedSupervisorReport = await verifyMoneyFetch({ typeField, supervisorReportId, companyId, amount, date })

      setLoading(false)
      return updatedSupervisorReport

    } catch (error) {

      setLoading(false)
      console.log(error)
      throw error
    }

  }

  return { verifyMoney, loading }
}