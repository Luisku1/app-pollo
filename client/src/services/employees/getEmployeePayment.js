export const getEmployeePaymentFetch = async (incomeId) => {
  try {
    const response = await fetch(`/api/employee/${incomeId}/payment`);
    const resData = await response.json();
    if (resData.success === false) {
      throw new Error('Hay un error con el pago del empleado');
    }
    return resData.data;
  } catch (error) {
    throw new Error('Hay un error con el pago del empleado');
  }
};
