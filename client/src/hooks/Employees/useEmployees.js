import { useEffect, useMemo, useState } from "react"
import { getAllEmployees } from "../../services/employees/getAllEmployees"
import { changeActiveStatus } from "../../services/employees/changeActiveStatus"
import { ToastInfo, ToastSuccess } from "../../helpers/toastify"
import { getEmployeeFullName, normalizeText } from "../../helpers/Functions"
import { useUpdateEmployee } from "./useUpdateEmployee"
import { useQuery } from "@tanstack/react-query"

export const useEmployees = ({ companyId }) => {

  const [employees, setEmployees] = useState([])
  const { updateEmployee, loading: updating } = useUpdateEmployee()
  const [error, setError] = useState(null)
  const [filterString, setFilterString] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["employees", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      return await getAllEmployees({ companyId });
    },
    enabled: !!companyId,
    onError: (error) => {
      setError(error);
      ToastInfo(error);
    },
    onSuccess: () => {
      setError(null);
    },
    retry: false,
  });

  useEffect(() => {
    if (data) setEmployees(data);
  }, [data]);

  const loading = isLoading;

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

  const { activeEmployees, inactiveEmployees } = useMemo(() => {

    const activeEmployees = employees.filter((employee) => !filterString ? employee.active : employee.active && normalizeText(getEmployeeFullName(employee))
      .toLowerCase()
      .includes(normalizeText(filterString).toLowerCase()) ||
      (employee.phoneNumber && employee.phoneNumber.includes(filterString.replace('-', ''))))
    const inactiveEmployees = employees.filter((employee) => !filterString ? !employee.active : !employee.active && normalizeText(getEmployeeFullName(employee))
      .toLowerCase()
      .includes(normalizeText(filterString).toLowerCase()) ||
      (employee.phoneNumber && employee.phoneNumber.includes(filterString.replace('-', ''))))

    return { activeEmployees, inactiveEmployees }

  }, [employees, filterString])

  return {
    employees: filteredEmployees, activeEmployees, inactiveEmployees, refetch,
    spliceEmployee, onUpdateEmployee, setFilterString, changeEmployeeActiveStatus, loading, updating, error
  }
}