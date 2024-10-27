import { useEffect } from "react"
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom';
import FechaDePagina from "../components/FechaDePagina";
import { formatDate } from "../helpers/DatePickerFunctions";
import { useEmployeesPayroll } from "../hooks/Employees/useEmployeesPayroll";
import { useRoles } from "../hooks/useRoles";
import { useDeleteEmployeePayment } from "../hooks/Employees/useDeleteEmployeePayment";
import EmployeePaymentsList from "../components/EmployeePaymentsList";
import ShowListButton from "../components/Buttons/ShowListButton";
import { stringToCurrency } from "../helpers/Functions";


export default function Nomina() {

  let paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const { company, currentUser } = useSelector((state) => state.user)
  const { employeesPayroll } = useEmployeesPayroll({ companyId: company._id, date: stringDatePickerValue })
  const { roles } = useRoles()
  const { deleteEmployeePayment } = useDeleteEmployeePayment()
  const navigate = useNavigate()

  console.log(employeesPayroll)

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
                      <div className=" text-lg mx-4 my-2">
                        <div className="flex gap-2 justify-self-end">
                          <p className="font-semibold">Salario: </p>
                          <p className={(employeePayroll.employee.salary < 0 ? 'text-red-500 ' : ' ') + ' my-auto'}>{employeePayroll.employee.salary.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <p className="font-semibold">Pagos recibidos: </p>
                          <p className="font-bold">{stringToCurrency({ amount: employeePayroll.employeePaymentsAmount })}</p>
                          <ShowListButton
                            listTitle={`Pagos a ${employeePayroll.employee.name} ${employeePayroll.employee.lastName}`}
                            ListComponent={
                              <EmployeePaymentsList
                                roles={roles}
                                deleteEmployeePayment={deleteEmployeePayment}
                                employeePayments={employeePayroll.employeePaymentsArray}
                              />
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <p className="font-semibold">Semana anterior: </p>
                          <p className={(employeePayroll.previousWeekBalance < 0 ? 'text-red-500 ' : ' ') + ' my-auto font-bold'}>{employeePayroll.previousWeekBalance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                        </div>
                        <div className="flex gap-2">
                          <p className="font-semibold">Semana actual: </p>
                          <p className={(employeePayroll.balance < 0 ? 'text-red-500' : '') + ' my-auto font-bold'}>{employeePayroll.balance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
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
                          <p className={(employeePayroll.missingWorkDiscount < 0 ? 'text-red-500' : '') + ' text-xs my-auto'}>{employeePayroll.missingWorkDiscount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {employeePayroll.employeeDailyBalancesArray && employeePayroll.employeeDailyBalancesArray.length > 0 && employeePayroll.employeeDailyBalancesArray.map((dailyBalance) => (

                <div className="grid col-span-12 grid-cols-12 p-1" key={dailyBalance._id}>

                  <p className="text-sm col-span-5 truncate">{(new Date(dailyBalance.createdAt)).toLocaleDateString('es-mx', { weekday: 'long', month: '2-digit', day: '2-digit' })}</p>

                  <input className="border border-black text-center col-span-2" type="number" name="" id="" defaultValue={dailyBalance.accountBalance} />
                  <input className="col-span-2 border border-black text-center" type="number" name="" id="" defaultValue={dailyBalance.supervisorBalance} />
                  <input className='col-span-1' type="checkbox" name="foodDiscount" id="foodDiscount" defaultChecked={dailyBalance.foodDiscount} />
                  <input className='col-span-1' type="checkbox" name="restDay" id="restDay" defaultChecked={dailyBalance.restDay} />
                  <input className='col-span-1' type="checkbox" name="dayDiscount" id="dayDiscount" defaultChecked={dailyBalance.dayDiscount} />
                </div>

              ))}

              <div className="col-span-12 mt-4 p-2 bg-slate-600 text-white rounded-lg mx-2">
                <button className="w-full">Liberar nómina</button>
              </div>
            </div>
          </div>

        ))}

      </div>

    </main>
  )
}
