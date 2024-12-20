import { useEffect, useState } from "react"
import { getEmployeesNameList } from "../../services/employees/employeesNameList"
import { getAllEmployees } from "../../services/employees/getAllEmployees"
import { changeActiveStatus } from "../../services/employees/changeActiveStatus"
import { ToastSuccess } from "../../helpers/toastify"
import { getEmployeeFullName } from "../../helpers/Functions"

export const useEmployees = ({ companyId, onlyActiveEmployees = true }) => {

  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const filterEmployees = (filterString = '') => {

    if (filterString != '') {

      const filteredList = employees.filter((employee) =>

        getEmployeeFullName(employee).toLowerCase().includes(filterString.toLowerCase())
      )

      setFilteredEmployees(filteredList)

    } else {

      setFilteredEmployees(employees)
    }
  }

  const changeEmployeeActiveStatus = ({ employee }) => {

    ToastSuccess(`Se ${employee.active ? 'suspendió' : 'restauró'} a ${getEmployeeFullName(employee)}`)

    changeActiveStatus({ employeeId: employee._id, newStatus: !employee.active }).then((updatedEmployee) => {

      setEmployees((prevEmployees) =>

        prevEmployees.map((employee) => {

          return employee._id == updatedEmployee._id ? updatedEmployee : employee
        })
      )

      setFilteredEmployees((prevEmployees) =>

        prevEmployees.map((employee) => {

          return employee._id == updatedEmployee._id ? updatedEmployee : employee
        })
      )

    }).catch((error) => {

      setError(error)
    })
  }

  const spliceEmployee = ({ employeeId }) => {


    setFilteredEmployees((prevEmployees) =>

      prevEmployees.filter((employee) =>

        employee._id != employeeId
      )
    )

    setEmployees((prevEmployees) =>

      prevEmployees.filter((employee) =>

        employee._id != employeeId
      )
    )
  }

  useEffect(() => {

    if (!companyId) return

    setLoading(true)

    if (onlyActiveEmployees) {

      getEmployeesNameList({ companyId }).then((response) => {

        setEmployees(response)
        setFilteredEmployees(response)

      }).catch((error) => {

        setError(error)
      })

    } else {

      getAllEmployees({ companyId }).then((response) => {

        setEmployees(response)
        setFilteredEmployees(response)

      }).catch((error) => {

        setError(error)
      })
    }

    setLoading(false)

  }, [companyId, onlyActiveEmployees])

  return { employees: filteredEmployees, spliceEmployee, filterEmployees, changeEmployeeActiveStatus, loading, error }
}