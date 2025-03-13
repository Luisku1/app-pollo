import { FaEdit } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux'
import { signOutFailiure, signOutStart, signOutSuccess } from '../redux/user/userSlice'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { weekDays } from '../helpers/Constants'
import TarjetaCuenta from '../components/TarjetaCuenta'
import { useLoading } from '../hooks/loading'
import { useSignOut } from '../hooks/Auth/useSignOut'
import { formatDate } from '../helpers/DatePickerFunctions'
import { useSupervisorReports } from '../hooks/Supervisors/useSupervisorReports'
import SupervisorReports from '../components/SupervisorReports'
import SupervisorReport from '../components/SupervisorReportComp'
import EmployeePaymentsList from '../components/EmployeePaymentsList'
import { getEmployeeFullName, currency } from '../helpers/Functions'
import { useRoles } from '../context/RolesContext'
import RegistroEmpleadoNuevo from "./RegistroEmpleado";
import Modal from "../components/Modals/Modal";
import ShowListModal from "../components/Modals/ShowListModal";
import { useEmployeesPayments } from "../hooks/Employees/useEmployeesPayments";
import { useBranchReports } from "../hooks/BranchReports.js/useBranchReports";
import { useEmployeeDailyBalance } from '../hooks/Employees/useEmployeeDailyBalance'

export default function Perfil() {

  const { error, currentUser } = useSelector((state) => state.user)
  const { employeeId } = useParams()
  const [employee, setEmployee] = useState(null)
  const [editEmployee, setEditEmployee] = useState(false)
  const [lastSupervisorReport, setLastSupervisorReport] = useState(null)
  const [employeeBranchReports, setEmployeeBranchReports] = useState([])
  const { supervisorReports } = useSupervisorReports({ supervisorId: employeeId })
  const { employeeDailyBalance, handleDailyBalanceInputs, loading } = useEmployeeDailyBalance(employeeId)
  const [lastBranchReport, setLastBranchReport] = useState(null)
  const { payments, total } = useEmployeesPayments({ employeeId, date: formatDate(new Date()) })
  const { branchReports, replaceReport } = useBranchReports({ reports: employeeBranchReports })
  const { roles, isManager } = useRoles()
  const { isLoading } = useLoading(loading)
  const { signOut } = useSignOut()
  const dispatch = useDispatch()
  const isAuthorizedToEdit = currentUser.role == roles?.manager._id

  useEffect(() => {

    if (!(branchReports && branchReports.length > 0)) return

    setLastBranchReport(branchReports[0])

  }, [branchReports])

  useEffect(() => {

    if (!(supervisorReports && supervisorReports.length > 0)) return

    setLastSupervisorReport(supervisorReports[0])

  }, [supervisorReports])

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

    setEmployeeBranchReports([])

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

    const fetchEmployeeReports = async () => {

      try {

        const res = await fetch('/api/employee/get-employee-reports/' + employeeId + '/' + currentUser.role)
        const data = await res.json()

        if (data.success === false) {

          console.log(data.message)
          return
        }

        setEmployeeBranchReports(data.employeeBranchReports)

      } catch (error) {

        console.log(error.message)
      }
    }

    fetchEmployee()
    fetchEmployeeReports()


  }, [employeeId, currentUser])

  useEffect(() => {

    if (employee) {

      document.title = employee.name + ' ' + employee.lastName
    }
  }, [employee])

  const toggleEditEmployee = () => {

    setEditEmployee((prev) => !prev)
  }

  return (

    <main className="p-3 max-w-lg mx-auto">
      {error ? <p>{error}</p> : ''}
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
              {isManager(currentUser.role)|| currentUser._id == employee._id ?
                <div className='p-3'>
                  <div className='flex flex-row-reverse gap-2 items-center'>
                    <div className="flex gap-2 text-center text-lg">
                      <p className="text-red-700 font-semibold">Pagos:</p>
                      <ShowListModal
                        data={payments}
                        title={`Pagos a ${getEmployeeFullName(employee)}`}
                        ListComponent={EmployeePaymentsList}
                        clickableComponent={<p>{currency({ amount: total })}</p>}
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
                <p className="text-lg">Teléfono: {employee.phoneNumber ? employee.phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3') : ''}</p>
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
                        <input className='w-4/12' type="checkbox" name="foodDiscount" id="foodDiscount" disabled={currentUser.role == roles.seller} defaultChecked={employeeDailyBalance.foodDiscount} onChange={(e) => handleDailyBalanceInputs(e, employeeDailyBalance._id)} />
                        <input className='w-4/12' type="checkbox" name="restDay" id="restDay" disabled={currentUser.role == roles.seller} defaultChecked={employeeDailyBalance.restDay} onChange={(e) => handleDailyBalanceInputs(e, employeeDailyBalance._id)} />
                        <input className='w-4/12' type="checkbox" name="dayDiscount" id="dayDiscount" disabled={currentUser.role == roles.seller} defaultChecked={employeeDailyBalance.dayDiscount} onChange={(e) => handleDailyBalanceInputs(e, employeeDailyBalance._id)} />
                      </div>
                    </div>
                  </div>
                  : ''}
              </div>

              {supervisorReports && supervisorReports.length > 0 && (currentUser._id == employeeId || roles.manager._id == currentUser.role) && (

                <ShowListModal
                  title={`Reportes de ${employee.name}`}
                  className={'w-full'}
                  ListComponent={SupervisorReports}
                  ListComponentProps={{ supervisorReports }}
                  clickableComponent={<p className='w-full text-lg font-semibold text-center p-1 border border-header rounded-md'>{`${supervisorReports.length == 0 || supervisorReports.length > 1 ? 'Reportes de Supervisión' : 'Reporte de Supervisión'} (${supervisorReports.length})`}</p>}
                />
              )}

              {roles.seller._id != employee.role._id && (employee._id == currentUser._id || isManager(currentUser.role)) ?
                <div className=''>
                  {lastSupervisorReport && (
                    <div>
                      <SupervisorReport supervisorReport={lastSupervisorReport}></SupervisorReport>
                    </div>
                  )}
                </div>
                : ''}

              {branchReports && branchReports.length > 0 && (
                <ShowListModal
                  className={'mt-4 w-full'}
                  title={`Cuentas de ${employee.name}`}
                  ListComponent={TarjetaCuenta}
                  ListComponentProps={{ reportArray: branchReports, replaceReport: replaceReport }}
                  clickableComponent={<p className='mt-4 w-full text-lg font-semibold text-center p-1 border border-header rounded-md'>{`${branchReports.length == 0 || branchReports.length > 1 ? 'Reportes en Pollería' : 'Reporte en Pollería'} (${branchReports.length})`}</p>}
                />
              )}

              {lastBranchReport && (
                <div className='mt-1'>
                  <TarjetaCuenta reportArray={[lastBranchReport]} replaceReport={replaceReport} currentUser={currentUser} />
                </div>
              )}

              {employeeId == currentUser._id ?
                <div className='mt-8 grid grid-1'>
                  <button className='shadow-lg rounded-full p-2 flex-col-reverse justify-self-end border bg-red-700'>
                    <span onClick={handleSignOut} className='text-white cursor-pointer font-semibold text-lg'>Cerrar Sesión</span>
                  </button>
                  <span>{error ? ' Error al fetch' : ''}</span>
                </div>
                : ''
              }
            </div >
            : ''}
        </div>
      )}
    </main >
  )
}
