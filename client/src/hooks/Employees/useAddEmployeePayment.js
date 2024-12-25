import { useState } from "react";
import { getEmployeeFullName, stringToCurrency } from "../../helpers/Functions";
import { ToastSuccess, ToastError } from "../../helpers/toastify";
import { addEmployeePaymentFetch } from "../../services/employees/addEmployeePayment";

export const useAddEmployeePayment = () => {
  const [loading, setLoading] = useState(false);

  const addEmployeePayment = async (employeePayment) => {
    setLoading(true);

    try {
      ToastSuccess(`Se registró el pago a ${getEmployeeFullName(employeePayment)} por ${stringToCurrency({ amount: employeePayment.amount })}`);

      const response = await addEmployeePaymentFetch(
        {
          amount: employeePayment.amount,
          detail: employeePayment.detail,
          company: employeePayment.company,
          branch: employeePayment.branch?.value ?? null,
          employee: employeePayment.employee._id,
          supervisor: employeePayment.supervisor._id,
          createdAt: employeePayment.createdAt
        }
      );

      let createdIncome = null;
      if (response.income) {
        createdIncome = {
          ...response.income,
          employee: employeePayment.supervisor,
          branch: employeePayment.branch,
        };
      }

      const createdExtraOutgoing = {
        ...response.extraOutgoing,
        employee: employeePayment.supervisor,
      };

      return { income: createdIncome, extraOutgoing: createdExtraOutgoing };

    } catch (error) {
      console.log(error);
      ToastError(`No se registró el pago a ${employeePayment.employee.label} por ${stringToCurrency({ amount: employeePayment.amount })}`);
      throw new Error("No se registró el pago");
    } finally {
      setLoading(false);
    }
  };

  return { addEmployeePayment, loading };
};