export default function PayrollResume({employeePayroll, replaceReport, replaceSupervisorReport, index = -1}) {

  const { previousWeekBalance, employeeDailyBalances, employee, branchReports, employeePayments, lateDiscount, supervisorReports, missingWorkDiscount, employeePaymentsAmount, balanceAdjustments = [], adjustments = 0 } = employeePayroll

  return (
    <div className="">
      < div className=" text-lg mx-4 mt-2">
        <div className="grid grid-cols-2 text-left justify-self-end">
          <p className="font-semibold">Salario: </p>
          <p className={' my-auto'}>{Amount({ amount: (salary ?? 0) })}</p>
        </div>
        <div className="grid grid-cols-2 text-left justify-self-end">
          <p className="font-semibold">Deuda total: </p>
          <p className={' my-auto'}>{Amount({ amount: (employee.balance ?? 0) })}</p>
        </div>
        <div className="grid grid-cols-2 text-left">
          <p className="font-semibold">Saldo previo: </p>
          <p className={(previousWeekBalance < 0 ? 'text-red-500 ' : ' ') + ' my-auto font-bold w-fit'}>{previousWeekBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
        </div>
        <div className="grid grid-cols-2 text-left items-center">
          <p className="font-semibold">Semana en pollería: </p>
          <ShowListModal
            title={`Reportes de ${getEmployeeFullName(employee, (employee) => employee.name + ' ' + employee.lastName)}`}
            ListComponent={TarjetaCuenta}
            ListComponentProps={{ reportArray: branchReports, replaceReport: replaceReport, payrollIndex: index }}
            clickableComponent={<p className={(accountBalance < 0 ? 'text-red-500' : '') + ' my-auto font-bold border border-black shadow-sm rounded-lg w-fit'}>{accountBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>}
          />
        </div>
        <div className="grid grid-cols-2 text-left items-center">
          <p className="font-semibold">Semana en supervisión: </p>
          <ShowListModal
            title={`Reportes de ${getEmployeeFullName(employee, (employee) => employee.name + ' ' + employee.lastName)}`}
            ListComponent={SupervisorReportList}
            ListComponentProps={{ supervisorReports: supervisorReports, replaceReport: replaceSupervisorReport, payrollIndex: index }}
            clickableComponent={<p className={(supervisorBalance < 0 ? 'text-red-500' : '') + ' my-auto font-bold border border-black shadow-sm rounded-lg w-fit'}>{supervisorBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>}
          />
        </div>
        <div className="grid grid-cols-2 text-left items-center">
          <p className="font-semibold">Pagos en la semana: </p>
          <ShowListModal
            data={employeePayments}
            title={`Pagos a ${getEmployeeFullName(employee)}`}
            ListComponent={EmployeePaymentsList}
            ListComponentProps={{ payments: employeePayments, total: employeePaymentsAmount }}
            clickableComponent={<p className="font-bold border border-black text-red-500 rounded-lg shadow-sm w-fit">{currency({ amount: employeePayroll.employeePaymentsAmount })}</p>}
          />
        </div>
        <div className="grid grid-cols-2 text-left items-center">
          <p>Pago Esperado: </p>
          <p className=" border border-black w-fit rounded-lg px-1">
            {Amount({ amount: totalToPay })}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-12 row-span-1 mt-3 text-center border-black">
        <p className="col-span-5 font-semibold">Fecha</p>
        <div className="col-span-2">
          <p className="text-xs">Cuenta en pollería</p>
          <p className={(accountBalance < 0 ? 'text-red-500' : '') + ' text-xs my-auto'}>{accountBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
        </div>
        <div className="col-span-2 text-center">
          <p className="text-xs  text-center">Cuenta</p>
          <p className="text-xs truncate text-center">Supervisor</p>
          <p className={(supervisorBalance < 0 ? 'text-red-500' : '') + ' text-xs my-auto'}>{employeePayroll.supervisorBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
        </div>
        <div className="col-span-1">
          <p className="text-xs">R</p>
          <p className={(lateDiscount < 0 ? 'text-red-500 ' : ' ') + 'text-xs my-auto'}>{employeePayroll.lateDiscount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
        </div>
        <div className="col-span-1">
          <p className="text-xs">D</p>
          <p className="text-xs">{employeePayroll.didEmployeeRest || 'No'}</p>
        </div>
        <div className="col-span-1">
          <p className="text-xs">F</p>
          <p className={(missingWorkDiscount < 0 ? 'text-red-500' : '') + ' text-xs my-auto'}>{(employeePayroll?.missingWorkDiscount ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
        </div>
      </div>
    </div>
  )
}