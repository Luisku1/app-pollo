import { useEffect, useMemo, useState } from "react"
import { getEmployeesNameList } from "../../services/employees/employeesNameList"
import { getAllEmployees } from "../../services/employees/getAllEmployees"
import { changeActiveStatus } from "../../services/employees/changeActiveStatus"
import { ToastSuccess } from "../../helpers/toastify"
import { getEmployeeFullName } from "../../helpers/Functions"
import { useUpdateEmployee } from "./useUpdateEmployee"

export const useEmployees = ({ companyId, date, onlyActiveEmployees = true }) => {

  const [employees, setEmployees] = useState([])
  const { updateEmployee, loading: updating } = useUpdateEmployee()
  const [loading, setLoading] = useState(false)
  const [filterString, setFilterString] = useState('')
  const [error, setError] = useState(null)

  const changeEmployeeActiveStatus = ({ employee }) => {

    ToastSuccess(`Se ${employee.active ? 'suspendió' : 'restauró'} a ${getEmployeeFullName(employee)}`)

    changeActiveStatus({ employeeId: employee._id, newStatus: !employee.active }).then((updatedEmployee) => {

      setEmployees((prevEmployees) =>

        prevEmployees.map((employee) => {

          return employee._id == updatedEmployee._id ? updatedEmployee : employee
        })
      )
    }).catch((error) => {

      setError(error)
    })
  }

  const spliceEmployee = ({ employeeId }) => {

    setEmployees((prevEmployees) =>

      prevEmployees.filter((employee) =>

        employee._id != employeeId
      )
    )
  }

  const onUpdateEmployee = async (employee) => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((prevEmployee) =>
        prevEmployee._id === employee._id ? employee : prevEmployee
      )
    );
    try {

      updateEmployee(employee);

    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const filteredEmployees = useMemo(() => {

    return employees.filter((employee) =>
      getEmployeeFullName(employee).toLowerCase().includes(filterString.toLowerCase())
    )
  }
    , [employees, filterString])

  useEffect(() => {

    if (!companyId) return

    setLoading(true)

    if (onlyActiveEmployees) {

      getEmployeesNameList({ companyId, date }).then((response) => {

        setEmployees(response)

      }).catch((error) => {

        setError(error)
      })

    } else {

      getAllEmployees({ companyId, date }).then((response) => {

        setEmployees(response)

      }).catch((error) => {

        setError(error)
      })
    }

    setLoading(false)

  }, [companyId, onlyActiveEmployees, date])

  return { employees: filteredEmployees, spliceEmployee, onUpdateEmployee, setFilterString, changeEmployeeActiveStatus, loading, updating, error }
}