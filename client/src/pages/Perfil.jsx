import { FaEdit } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux'
import { signOutFailiure, signOutStart, signOutSuccess } from '../redux/user/userSlice'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { weekDays } from '../helpers/Constants'
import { useLoading } from '../hooks/loading'
import { useSignOut } from '../hooks/Auth/useSignOut'
import { formatDate } from '../helpers/DatePickerFunctions'
import EmployeePaymentsList from '../components/EmployeePaymentsList'
import { getEmployeeFullName, currency } from '../helpers/Functions'
import { useRoles } from '../context/RolesContext'
import RegistroEmpleadoNuevo from "./RegistroEmpleado";
import Modal from "../components/Modals/Modal";
import ShowListModal from "../components/Modals/ShowListModal";
import { useEmployeesPayments } from "../hooks/Employees/useEmployeesPayments";
import { useEmployeeDailyBalance } from '../hooks/Employees/useEmployeeDailyBalance'
import PhoneLinks from "../components/PhoneLinks";
import { useEmployeePayroll } from '../hooks/Employees/useEmployeePayroll'
import PayrollResume from "../components/Payroll/PayrollResume";

export default function Perfil() {

  const { currentUser } = useSelector((state) => state.user)
  const { employeeId } = useParams()
  const [employee, setEmployee] = useState(null)
  const [editEmployee, setEditEmployee] = useState(false)
  const { employeeDailyBalance, handleDailyBalanceInputs, loading } = useEmployeeDailyBalance(employeeId)
  const { payments, total } = useEmployeesPayments({ employeeId, date: formatDate(new Date()) })
  const { roles, isManager } = useRoles()
  const { isLoading } = useLoading(loading)
  const { signOut } = useSignOut()
  const dispatch = useDispatch()
  const isAuthorizedToEdit = isManager(currentUser.role)

  const {
    payroll: employeePayroll,
    loading: payrollLoading,
    error: payrollError,
    date: payrollDate,
    updateBranchReport,
    updateSupervisorReport,
    goToPreviousWeek,
    goToNextWeek,
  } = useEmployeePayroll({ employee })

  const handleSignOut = async () => {

    try {

      dispatch(signOutStart())

      signOut()

      dispatch(signOutSuccess())

    } catch (error) {

      dispatch(signOutFailiure())
    }
  }

  useEffect(() => {

    const fetchEmployee = async () => {

      try {

        const res = await fetch('/api/employee/get-employee/' + employeeId)
        const data = await res.json()

        if (data.success === false) {

          console.log(data.message)
        }

        setEmployee(data.employee)

      } catch (error) {

        console.log(error)
      }
    }

    fetchEmployee()

  }, [employeeId])

  useEffect(() => {

    if (employee) {

      document.title = getEmployeeFullName(employee) + ' - Perfil'
    }
  }, [employee])

  const toggleEditEmployee = () => {

    setEditEmployee((prev) => !prev)
  }

  return (
    <main className="p-3 max-w-lg mx-auto">
      {!isLoading && (
        <div>
          {employee && roles ?
            <div id='personal-info' className="my-4 bg-white p-4" key={employee._id}>
              <div className="flex gap-3 text-3xl font-bold text-center justify-self-center">
                <h1 className="text-button">{employee.name + ' ' + employee.lastName}</h1>
                {isAuthorizedToEdit && (
                  <button className="" onClick={toggleEditEmployee}>
                    <FaEdit className="text-blue-500" />
                  </button>
                )}
                {editEmployee && (
                  <Modal
                    content={<RegistroEmpleadoNuevo setEmployee={setEmployee} employee={employee} />}
                    closeModal={toggleEditEmployee}
                    ableToClose={true}
                  />
                )}
              </div>
              {isManager(currentUser.role) || currentUser._id == employee._id ?
                <div className='p-3'>
                  <div className='flex flex-row-reverse gap-2 items-center'>
                    <div className="flex gap-2 text-center text-lg">
                      <p className="text-red-700 font-semibold">Pagos esta semana:</p>
                      <ShowListModal
                        title={`Pagos a ${getEmployeeFullName(employee)}`}
                        ListComponent={EmployeePaymentsList}
                        ListComponentProps={{ payments }}
                        clickableComponent={<p className="border border-black rounded-lg">{currency({ amount: total })}</p>}
                        sortFunction={(a, b) => b.amount - a.amount}
                      />
                    </div>
                  </div>
                </div>
                : ''}
              <div className="p-3">
                <div className="flex gap-2">
                  <p className="text-lg">Balance: </p>
                  <p className={employee.balance < 0 ? 'text-red-700 font-bold' : '' + 'text-lg font-bold'}>{parseFloat(employee.balance).toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                </div>
                <p className="text-lg">{'Rol: ' + employee.role.name}</p>
                {employee.salary ?
                  <p className="text-lg">{'Sueldo: ' + parseFloat(employee.salary).toLocaleString("es-Mx", { style: 'currency', currency: 'MXN' })}</p>
                  : ''}
                {employee.payDay > -1 ?
                  <p className="text-lg">{'Día de cobro: ' + weekDays[employee.payDay]}</p>
                  : ''}
                <div className="flex gap-2 items-center flex-wrap">
                  <p className="text-lg">
                    Teléfono:
                  </p>
                  <PhoneLinks phoneNumber={employee.phoneNumber} name={employee.name} />
                </div>
              </div>

              <div className='bg-white shadow-md my-4'>
                {employeeDailyBalance ?
                  <div className='p-3'>
                    <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold'>
                      <p className='p-3 rounded-lg col-span-4 text-sm text-center'>Retardo</p>
                      <p className='p-3 rounded-lg col-span-4 text-sm text-center'>Descanso</p>
                      <p className='p-3 rounded-lg col-span-4 text-sm text-center'>Falta</p>
                    </div>
                    <div key={employeeDailyBalance._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 rounded-lg shadow-sm mt-2'>
                      <div id='list-element' className='flex col-span-12 items-center justify-around py-3'>
                        <input className='w-4/12' type="checkbox" name="lateDiscount" id="lateDiscount" disabled={currentUser.role == roles.seller} defaultChecked={employeeDailyBalance.lateDiscount} onChange={(e) => handleDailyBalanceInputs(e, employeeDailyBalance._id)} />
                        <input className='w-4/12' type="checkbox" name="restDay" id="restDay" disabled={currentUser.role == roles.seller} defaultChecked={employeeDailyBalance.restDay} onChange={(e) => handleDailyBalanceInputs(e, employeeDailyBalance._id)} />
                        <input className='w-4/12' type="checkbox" name="dayDiscount" id="dayDiscount" disabled={currentUser.role == roles.seller} defaultChecked={employeeDailyBalance.dayDiscount} onChange={(e) => handleDailyBalanceInputs(e, employeeDailyBalance._id)} />
                      </div>
                    </div>
                  </div>
                  : ''}
              </div>

              {/* Payroll week navigation and summary */}
              <div className="my-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <button onClick={goToPreviousWeek} className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300">Semana anterior</button>
                  <div className="text-center">
                    <p className="font-semibold">Nómina</p>
                    <p className="font-bold">{payrollDate}</p>
                  </div>
                  <button onClick={goToNextWeek} className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300">Semana siguiente</button>
                </div>
                {payrollLoading ? (
                  <p>Cargando nómina...</p>
                ) : payrollError ? (
                  <p className="text-red-600">{'No se encontraron datos de esta semana.'}</p>
                ) : employeePayroll ? (
                  <PayrollResume
                    employeePayroll={employeePayroll}
                    updateBranchReportSingle={updateBranchReport}
                    updateSupervisorReportSingle={updateSupervisorReport}
                    employeeId={employeeId}
                  />
                ) : (
                  <p>No hay nómina para esta semana.</p>
                )}
              </div>
              {employeeId == currentUser._id &&
                <div className='mt-8 grid grid-1'>
                  <button className='shadow-lg rounded-full p-2 flex-col-reverse justify-self-end border bg-red-700'>
                    <span onClick={handleSignOut} className='text-white cursor-pointer font-semibold text-lg'>Cerrar Sesión</span>
                  </button>
                </div>
              }
            </div >
            : ''}
        </div>
      )}
    </main >
  )
}
