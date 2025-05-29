import { currency, getEmployeeFullName } from "../../helpers/Functions"
import EmployeePaymentsList from "../EmployeePaymentsList"
import Amount from "../Incomes/Amount"
import ShowListModal from "../Modals/ShowListModal"
import SupervisorReportList from "../SupervisorReportList"
import TarjetaCuenta from "../TarjetaCuenta"

export default function PayrollResume({ employeePayroll, replaceReport, replaceSupervisorReport, index = -1 }) {

  const { previousWeekBalance, employeeDailyBalances, employee, branchReports, employeePayments, lateDiscount, supervisorReports, missingWorkDiscount, employeePaymentsAmount, balanceAdjustments = [], adjustments = 0 } = employeePayroll

  const accountBalance = branchReports.reduce((acc, report) => acc + (report.balance ?? 0), 0)
  const supervisorBalance = supervisorReports.reduce((acc, report) => acc + (report.balance ?? 0), 0)
  const salary = employee?.salary ?? 0
  const totalToPay = accountBalance + supervisorBalance + lateDiscount + missingWorkDiscount - employeePaymentsAmount + adjustments + salary

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
    </div>
  )
}