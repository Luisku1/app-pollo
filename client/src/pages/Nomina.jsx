import { useEffect, useState } from "react"
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom';
import FechaDePagina from "../components/FechaDePagina";
import { formatDate } from "../helpers/DatePickerFunctions";
import { useEmployeesPayroll } from "../hooks/Employees/useEmployeesPayroll";
import EmployeePaymentsList from "../components/EmployeePaymentsList";
import { getEmployeeFullName, currency } from "../helpers/Functions";
import { useRoles } from "../context/RolesContext";
import ShowListModal from "../components/Modals/ShowListModal";
import Amount from "../components/Incomes/Amount";
import TarjetaCuenta from "../components/TarjetaCuenta";
import SupervisorReportList from "../components/SupervisorReportList";
import Modal from "../components/Modals/Modal";
import BranchReportCard from "../components/BranchReportCard";
import SupervisorReportCard from "../components/SupervisorReportCard";

export default function Nomina() {

  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const { company, currentUser } = useSelector((state) => state.user)
  const { employeesPayroll, replaceReport, replaceSupervisorReport } = useEmployeesPayroll({ companyId: company._id, date: stringDatePickerValue })
  const { roles, isManager } = useRoles()
  const navigate = useNavigate()
  const [branchReportCard, setBranchReportCard] = useState(null)
  const [supervisorReportCard, setSupervisorReportCard] = useState(null)

  const changeDatePickerValue = (e) => {

    stringDatePickerValue = (e.target.value + 'T06:00:00.000Z')

    navigate('/nomina/' + stringDatePickerValue)

  }

  const changeDay = (date) => {

    navigate('/nomina/' + date)

  }

  useEffect(() => {

    document.title = 'Nómina (' + new Date(stringDatePickerValue).toLocaleDateString() + ')'
  })

  return (

    <main className="p-3 max-w-lg mx-auto">

      {branchReportCard &&
        <Modal
          closeModal={() => setBranchReportCard(null)}
          content={
            <BranchReportCard
              reportData={branchReportCard}
              replaceReport={replaceReport}
              externalIndex={branchReportCard.externalIndex}
              selfChange={setBranchReportCard}
            />
          }
        />
      }
      {supervisorReportCard &&
        <Modal
          closeModal={() => setSupervisorReportCard(null)}
          content={
            <SupervisorReportCard
              supervisorReport={supervisorReportCard}
              replaceReport={replaceSupervisorReport}
              externalIndex={supervisorReportCard.externalIndex}
              selfChange={setSupervisorReportCard}
            />
          }
        />
      }
      {roles && isManager(currentUser.role) ?

        <FechaDePagina changeDay={changeDay} stringDatePickerValue={stringDatePickerValue} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>

        : ''}

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Nómina
      </h1>

      <div className='border bg-white p-3 mt-4'>

        {roles && isManager(currentUser.role) && employeesPayroll && employeesPayroll.length > 0 && employeesPayroll.map((employeePayroll, index) => {

          const { previousWeekBalance, employeeDailyBalances, employee, branchReports, accountBalance, employeePayments, foodDiscount, supervisorReports, missingWorkDiscount, supervisorBalance, employeePaymentsAmount } = employeePayroll
          const salary = employee?.salary ?? 0
          const totalToPay = accountBalance + supervisorBalance + foodDiscount + missingWorkDiscount - employeePaymentsAmount + salary

          return (

            <div key={employeePayroll._id} className='items-center border border-black rounded-lg shadow-sm my-2'>
              <div id='list-element' className=' p-2'>
                <div id="header" className="w-full mt-1 mb-2 border-b border-black shadow-sm text-center">
                  <div className="w-full">
                    <div className="w-full">
                      <button className="w-fit text-2xl font-semibold my-4 p-2 shadow-sm text-white rounded-lg bg-slate-500 flex" onClick={() => { navigate(`/perfil/${employee._id}`) }}>{`${employee.name} ${employee.lastName}`}</button>

                      <div className="">
                        < div className=" text-lg mx-4 mt-2">
                          <div className="grid grid-cols-2 text-left justify-self-end">
                            <p className="font-semibold">Salario: </p>
                            <p className={' my-auto'}>{Amount({ amount: (salary ?? 0) })}</p>
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
                            <p className={(accountBalance < 0 ? 'text-red-500' : '') + ' text-xs my-auto'}>{employeePayroll.accountBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                          </div>
                          <div className="col-span-2 text-center">
                            <p className="text-xs  text-center">Cuenta</p>
                            <p className="text-xs truncate text-center">Supervisor</p>
                            <p className={(supervisorBalance < 0 ? 'text-red-500' : '') + ' text-xs my-auto'}>{employeePayroll.supervisorBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                          </div>
                          <div className="col-span-1">
                            <p className="text-xs">R</p>
                            <p className={(foodDiscount < 0 ? 'text-red-500 ' : ' ') + 'text-xs my-auto'}>{employeePayroll.foodDiscount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
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
                    </div>
                  </div>
                </div>

                {Array.from({ length: 7 }).map((_, i) => {

                  const date = new Date(datePickerValue);
                  date.setDate(date.getDate() - (i + 1));
                  const dailyBalance = employeeDailyBalances.find((balance) => formatDate(balance.createdAt) === formatDate(date)) || null;
                  const branchReport = branchReports.find((report) => formatDate(report.createdAt) === formatDate(date)) || null;
                  const supervisorReport = supervisorReports.find((report) => formatDate(report.createdAt) === formatDate(date)) || null;
                  const { foodDiscount = false, restDay = false, dayDiscount = true } = dailyBalance || {};
                  const { balance: branchBalance = 0 } = branchReport || {};
                  const { balance: supervisorBalance = 0 } = supervisorReport || {};

                  return (
                    <div
                      className={`grid col-span-12 grid-cols-12 p-1 mt-1 ${branchBalance < 0 || supervisorBalance < 0 || foodDiscount || dayDiscount ? 'bg-pastel-pink' : ''}`}
                      key={date.toDateString()}
                    >
                      <p className="text-sm col-span-5 truncate">{date.toLocaleDateString('es-mx', { weekday: 'long', month: '2-digit', day: '2-digit' })}</p>
                      <button onClick={() => { setBranchReportCard({...branchReport, externalIndex: index}) }} disabled={branchReport == null} className={`border border-black text-center col-span-2 ${branchBalance < 0 ? 'text-red-500' : ''}`}>
                        {currency({ amount: branchBalance })}
                      </button>
                      <button onClick={() => { setSupervisorReportCard({...supervisorReport, externalIndex: index}) }} disabled={supervisorReport == null} className={`border border-black text-center col-span-2 ${supervisorBalance < 0 ? 'text-red-500' : ''}`}>
                        {currency({ amount: supervisorBalance })}
                      </button>
                      <input className='col-span-1' type="checkbox" name="foodDiscount" id="foodDiscount" defaultChecked={foodDiscount} />
                      <input className='col-span-1' type="checkbox" name="restDay" id="restDay" defaultChecked={restDay} />
                      <input className='col-span-1' type="checkbox" name="dayDiscount" id="dayDiscount" defaultChecked={dayDiscount} />
                    </div>
                  );
                })}
                <div className="col-span-12 mt-4 p-2 bg-button text-white rounded-lg mx-2">
                  <button className="w-full">Liberar nómina</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main >
  )
}
