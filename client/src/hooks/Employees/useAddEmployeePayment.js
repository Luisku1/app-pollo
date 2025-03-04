import { useState } from "react";
import { getEmployeeFullName, currency } from "../../helpers/Functions";
import { ToastSuccess, ToastDanger } from "../../helpers/toastify";
import { addEmployeePaymentFetch } from "../../services/employees/addEmployeePayment";

export const useAddEmployeePayment = () => {
  const [loading, setLoading] = useState(false);

  const addEmployeePayment = async (employeePayment) => {

    setLoading(true);

    try {
      ToastSuccess(`Se registró el pago a ${getEmployeeFullName(employeePayment)} por ${currency({ amount: employeePayment.amount })}`);

      await addEmployeePaymentFetch(
        {
          _id: employeePayment._id || null,
          amount: employeePayment.amount,
          detail: employeePayment.detail,
          company: employeePayment.company,
          branch: employeePayment.branch?.value ?? null,
          employee: employeePayment.employee._id,
          supervisor: employeePayment.supervisor._id,
          createdAt: employeePayment.createdAt,
          income: employeePayment.income,
          extraOutgoing: employeePayment.extraOutgoing,
        }
      );

    } catch (error) {
      console.log(error);
      ToastDanger(`No se registró el pago a ${employeePayment.employee.label} por ${currency({ amount: employeePayment.amount })}`);
      throw new Error("No se registró el pago");
    } finally {
      setLoading(false);
    }
  };

  return { addEmployeePayment, loading };
};