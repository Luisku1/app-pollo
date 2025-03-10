import { useEffect } from "react"
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

export default function Nomina() {

  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const { company, currentUser } = useSelector((state) => state.user)
  const { employeesPayroll } = useEmployeesPayroll({ companyId: company._id, date: stringDatePickerValue })
  const { roles } = useRoles()
  const navigate = useNavigate()

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

      {roles && roles.managerRole._id == currentUser.role ?

        <FechaDePagina changeDay={changeDay} stringDatePickerValue={stringDatePickerValue} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>

        : ''}

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Nómina
      </h1>

      <div className='border bg-white p-3 mt-4'>

        {roles && currentUser.role == roles.managerRole._id && employeesPayroll && employeesPayroll.length > 0 && employeesPayroll.map((employeePayroll) => (

          <div key={employeePayroll._id} className='items-center border border-black rounded-lg shadow-sm my-2'>
            <div id='list-element' className=' p-2'>
              <div id="header" className="w-full mt-1 mb-2 border-b border-black shadow-sm text-center">
                <div className="w-full">
                  <div className="w-full">
                    <button className="w-fit text-2xl font-semibold my-4 p-2 shadow-sm text-white rounded-lg bg-slate-500 flex" onClick={() => { navigate(`/perfil/${employeePayroll.employee._id}`) }}>{`${employeePayroll.employee.name} ${employeePayroll.employee.lastName}`}</button>

                    <div className="">
                      < div className=" text-lg mx-4 mt-2">
                        <div className="grid grid-cols-2 text-left justify-self-end">
                          <p className="font-semibold">Salario: </p>
                          <p className={' my-auto'}>{Amount({ amount: (employeePayroll?.employee?.salary ?? 0) })}</p>
                        </div>
                        <div className="grid grid-cols-2 text-left">
                          <p className="font-semibold">Saldo previo: </p>
                          <p className={(employeePayroll.previousWeekBalance < 0 ? 'text-red-500 ' : ' ') + ' my-auto font-bold w-fit'}>{employeePayroll.previousWeekBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                        </div>
                        <div className="grid grid-cols-2 text-left items-center">
                          <p className="font-semibold">Saldo en la semana: </p>
                          <ShowListModal
                            title={`Reportes de ${getEmployeeFullName(employeePayroll.employee, (employee) => employee.name + ' ' + employee.lastName)}`}
                            ListComponent={TarjetaCuenta}
                            ListComponentProps={{ reportArray: employeePayroll.branchReports, currentUser }}
                            clickableComponent={<p className={(employeePayroll.balance < 0 ? 'text-red-500' : '') + ' my-auto font-bold border border-black shadow-sm rounded-lg w-fit'}>{employeePayroll.balance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>}
                          />
                        </div>
                        <div className="grid grid-cols-2 text-left items-center">
                          <p className="font-semibold">Pagos en la semana: </p>
                          <ShowListModal
                            data={employeePayroll.employeePaymentsArray}
                            title={`Pagos a ${getEmployeeFullName(employeePayroll.employee)}`}
                            ListComponent={EmployeePaymentsList}
                            ListComponentProps={{ payments: employeePayroll.employeePaymentsArray, total: employeePayroll.employeePaymentsAmount }}
                            clickableComponent={<p className="font-bold border border-black rounded-lg shadow-sm w-fit">{currency({ amount: employeePayroll.employeePaymentsAmount })}</p>}
                            sortFunction={(a, b) => b.amount - a.amount}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 row-span-1 mt-3 text-center border-black">
                        <p className="col-span-5 font-semibold">Fecha</p>
                        <div className="col-span-2">
                          <p className="text-xs">Cuenta en pollería</p>
                          <p className={(employeePayroll.accountBalance < 0 ? 'text-red-500' : '') + ' text-xs my-auto'}>{employeePayroll.accountBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                        </div>
                        <div className="col-span-2 text-center">
                          <p className="text-xs  text-center">Cuenta</p>
                          <p className="text-xs truncate text-center">Supervisor</p>

                          <p className={(employeePayroll.supervisorBalance < 0 ? 'text-red-500' : '') + ' text-xs my-auto'}>{employeePayroll.supervisorBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-xs">R</p>
                          <p className={(employeePayroll.foodDiscount < 0 ? 'text-red-500 ' : ' ') + 'text-xs my-auto'}>{employeePayroll.foodDiscount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-xs">D</p>
                          <p className="text-xs">{employeePayroll.didEmployeeRest || 'No'}</p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-xs">F</p>
                          <p className={(employeePayroll?.missingWorkDiscount < 0 ? 'text-red-500' : '') + ' text-xs my-auto'}>{(employeePayroll?.missingWorkDiscount ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {employeePayroll.employeeDailyBalancesArray && employeePayroll.employeeDailyBalancesArray.length > 0 && employeePayroll.employeeDailyBalancesArray.map((dailyBalance) => (
                <div
                  className={`grid col-span-12 grid-cols-12 p-1 mt-1 ${dailyBalance.accountBalance < 0 || dailyBalance.supervisorBalance < 0 ? 'bg-pastel-pink' : ''}`}
                  key={dailyBalance._id}
                >

                  <p className="text-sm col-span-5 truncate">{(new Date(dailyBalance.createdAt)).toLocaleDateString('es-mx', { weekday: 'long', month: '2-digit', day: '2-digit' })}</p>

                  <p
                    className={`border border-black text-center col-span-2 ${dailyBalance.accountBalance < 0 ? 'text-red-500' : ''}`}
                  >
                    {dailyBalance.accountBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </p>
                  <p
                    className={`border border-black text-center col-span-2 ${dailyBalance.supervisorBalance < 0 ? 'text-red-500' : ''}`}
                  >
                    {dailyBalance.supervisorBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </p>
                  <input className='col-span-1' type="checkbox" name="foodDiscount" id="foodDiscount" defaultChecked={dailyBalance.foodDiscount} />
                  <input className='col-span-1' type="checkbox" name="restDay" id="restDay" defaultChecked={dailyBalance.restDay} />
                  <input className='col-span-1' type="checkbox" name="dayDiscount" id="dayDiscount" defaultChecked={dailyBalance.dayDiscount} />
                </div>

              ))}
              <div className="col-span-12 mt-4 p-2 bg-button text-white rounded-lg mx-2">
                <button className="w-full">Liberar nómina</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main >
  )
}
