import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getEmployeesDailyBalancesFetch } from "../../services/employees/getEmployeesDailyBalances"
import { getDayRange } from "../../helpers/DatePickerFunctions"
import { dateFromYYYYMMDD } from "../../../../common/dateOps"

export const useEmployeesDailyBalances = ({ companyId, date }) => {
  const [filterText, setFilterText] = useState("")

  const enabled = Boolean(companyId && date) && getDayRange(dateFromYYYYMMDD(date)).bottomDate <= getDayRange(new Date()).bottomDate

  const {
    data: employeesDailyBalances = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ["employeesDailyBalances", companyId, date],
    queryFn: () => getEmployeesDailyBalancesFetch({ companyId, date }).then(res => res.employeesDailyBalances),
    enabled,
    staleTime: 1000 * 60 * 3
  })

  const filteredAndSorted = useMemo(() => {
    return employeesDailyBalances
      .filter(db => {
        if (!filterText) return true
        const name = db.employee ? `${db.employee.name} ${db.employee.lastName}`.toLowerCase() : ""
        return name.includes(filterText.toLowerCase())
      })
      .sort((a, b) => a.employee.name.localeCompare(b.employee.name))
  }, [employeesDailyBalances, filterText])

  return {
    employeesDailyBalances: filteredAndSorted,
    loading,
    error,
    filterText,
    setFilterText
  }
}