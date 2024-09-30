import { ToastWarning } from "../../helpers/toastify";

export const deleteEmployeeFetch = async ({ employeeId }) => {

  const res = await fetch('/api/employee/delete/' + employeeId, {
    method: 'DELETE'
  })
  const data = res.json()

  if (data.success === false) {

    ToastWarning('No se ha podido eliminar al empleado');

    throw new Error("No se ha podido eliminar al empleado");

  }

}