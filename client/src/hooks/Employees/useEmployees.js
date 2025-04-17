import { useEffect, useMemo, useState } from "react"
import { getEmployeesNameList } from "../../services/employees/employeesNameList"
import { getAllEmployees } from "../../services/employees/getAllEmployees"
import { changeActiveStatus } from "../../services/employees/changeActiveStatus"
import { ToastSuccess } from "../../helpers/toastify"
import { getEmployeeFullName, normalizeText } from "../../helpers/Functions"
import { useUpdateEmployee } from "./useUpdateEmployee"

export const useEmployees = ({ companyId, date, onlyActiveEmployees = true }) => {

  const [employees, setEmployees] = useState([])
  const { updateEmployee, loading: updating } = useUpdateEmployee()
  const [loading, setLoading] = useState(false)
  const [filterString, setFilterString] = useState('')
  const [error, setError] = useState(null)

  const changeEmployeeActiveStatus = ({ employee }) => {

    ToastSuccess(`Se ${employee.active ? 'suspendió' : 'restauró'} a ${getEmployeeFullName(employee)}`)

    setEmployees((prevEmployees) =>
      prevEmployees.map((prevEmployee) => {
        return prevEmployee._id == employee._id ? { ...employee, active: employee.active ? false : true } : prevEmployee
      })
    )

    changeActiveStatus({ employeeId: employee._id, newStatus: !employee.active }).then(() => {

    }).catch((error) => {

      setEmployees((prevEmployees) =>
        prevEmployees.map((prevEmployee) =>
          prevEmployee._id === employee._id ? employee : prevEmployee
        ))

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
    return employees.filter((employee) => {
      return (
        normalizeText(getEmployeeFullName(employee))
          .toLowerCase()
          .includes(normalizeText(filterString).toLowerCase()) ||
        (employee.phoneNumber && employee.phoneNumber.includes(filterString.replace('-', '')))
      );
    });
  }, [employees, filterString]);

  useEffect(() => {

    if (!companyId) return

    setLoading(true)

    if (onlyActiveEmployees) {

      getEmployeesNameList({ companyId }).then((response) => {

        setEmployees(response)

      }).catch((error) => {

        setError(error)
      })

    } else {

      getAllEmployees({ companyId }).then((response) => {

        setEmployees(response)

      }).catch((error) => {

        setError(error)
      })
    }

    setLoading(false)

  }, [companyId, onlyActiveEmployees, date])

  const { activeEmployees, inactiveEmployees } = useMemo(() => {

    const activeEmployees = employees.filter((employee) => employee.active && normalizeText(getEmployeeFullName(employee))
      .toLowerCase()
      .includes(normalizeText(filterString).toLowerCase()) ||
      (employee.phoneNumber && employee.phoneNumber.includes(filterString.replace('-', ''))))
    const inactiveEmployees = employees.filter((employee) => !employee.active && normalizeText(getEmployeeFullName(employee))
      .toLowerCase()
      .includes(normalizeText(filterString).toLowerCase()) ||
      (employee.phoneNumber && employee.phoneNumber.includes(filterString.replace('-', ''))))

    return { activeEmployees, inactiveEmployees }

  }, [employees, filterString])

  return {
    employees: filteredEmployees, activeEmployees, inactiveEmployees,
    spliceEmployee, onUpdateEmployee, setFilterString, changeEmployeeActiveStatus, loading, updating, error
  }
}