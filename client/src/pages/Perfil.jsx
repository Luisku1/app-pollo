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
import ShowListButton from '../components/Buttons/ShowListButton'
import { useSupervisorReports } from '../hooks/Supervisors/useSupervisorReports'
import SupervisorReports from '../components/SupervisorReports'
import SupervisorReport from '../components/SupervisorReportComp'
import EmployeePaymentsList from '../components/EmployeePaymentsList'
import { useEmployeePayments } from '../hooks/Employees/useEmployeePayments'
import { useDeleteEmployeePayment } from '../hooks/Employees/useDeleteEmployeePayment'
import { getEmployeeFullName, stringToCurrency } from '../helpers/Functions'
import { useRoles } from '../context/RolesContext'
import RegistroEmpleadoNuevo from "./RegistroEmpleado";
import Modal from "../components/Modals/Modal";
import ShowListModal from "../components/Modals/ShowListModal";

export default function Perfil() {

  const { error, currentUser } = useSelector((state) => state.user)
  const { employeeId } = useParams()
  const [employee, setEmployee] = useState(null)
  const [editEmployee, setEditEmployee] = useState(false)
  const [employeeDayInfo, setEmployeeDayInfo] = useState(null)
  const [lastSupervisorReport, setLastSupervisorReport] = useState(null)
  const [employeeBranchReports, setEmployeeBranchReports] = useState([])
  const { supervisorReports } = useSupervisorReports({ supervisorId: employeeId })
  const [lastBranchReport, setLastBranchReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const { payments, total } = useEmployeePayments({ employeeId, date: formatDate(new Date()) })
  const { roles } = useRoles()
  const { isLoading } = useLoading(loading)
  const { signOut } = useSignOut()
  const dispatch = useDispatch()
  const isAuthorizedToEdit = currentUser.role == roles?.managerRole._id

  useEffect(() => {

    if (!(employeeBranchReports && employeeBranchReports.length > 0)) return

    setLastBranchReport(employeeBranchReports[0])

  }, [employeeBranchReports])

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

    const fetchEmployeeDayInformation = async () => {

      setLoading(true)

      try {

        const res = await fetch('/api/employee/get-employee-day-information/' + employeeId)
        const data = await res.json()

        if (data.success === false) {

          console.log(data.message)
          setLoading(false)
          return
        }

        setEmployeeDayInfo(data.employeeDayInfo)
        setLoading(false)

      } catch (error) {

        setLoading(false)
        console.log(error.message)
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
    fetchEmployeeDayInformation()
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
                <h1 className="">{employee.name + ' ' + employee.lastName}</h1>
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

              {roles.managerRole._id == currentUser.role || currentUser._id == employee._id ?
                <div className='p-3'>
                  <div className='flex flex-row-reverse gap-2 items-center'>
                    <div className="flex gap-2 text-center text-lg">
                      <p className="text-red-700 font-semibold">Pagos:</p>
                      <ShowListModal
                        data={payments}
                        title={`Pagos a ${getEmployeeFullName(employee)}`}
                        ListComponent={EmployeePaymentsList}
                        clickableComponent={<p>{stringToCurrency({ amount: total })}</p>}
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

              <div className='border bg-white shadow-lg p-3 my-4'>
                {employeeDayInfo ?
                  <div className='p-3'>
                    <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold'>
                      <p className='p-3 rounded-lg col-span-4 text-sm text-center'>Retardo</p>
                      <p className='p-3 rounded-lg col-span-4 text-sm text-center'>Descanso</p>
                      <p className='p-3 rounded-lg col-span-4 text-sm text-center'>Falta</p>
                    </div>
                    <div key={employeeDayInfo._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 rounded-lg shadow-sm mt-2'>
                      <div id='list-element' className='flex col-span-12 items-center justify-around py-3'>
                        <input className='w-4/12' type="checkbox" name="foodDiscount" id="foodDiscount" checked={employeeDayInfo.foodDiscount} />
                        <input className='w-4/12' type="checkbox" name="restDay" id="restDay" checked={employeeDayInfo.restDay} />
                        <input className='w-4/12' type="checkbox" name="dayDiscount" id="dayDiscount" checked={employeeDayInfo.dayDiscount} />
                      </div>
                    </div>
                  </div>
                  : ''}
              </div>

              {roles.sellerRole._id != employee.role._id && (employee._id == currentUser._id || currentUser.role == roles.managerRole._id) ?
                <div className=''>
                  {lastSupervisorReport && (
                    <div>
                      <p className='text-center text-lg font-semibold'>Última cuenta de supervisión</p>
                      <SupervisorReport supervisorReport={lastSupervisorReport}></SupervisorReport>
                    </div>
                  )}
                </div>
                : ''}

              {lastBranchReport && (

                <div className='mt-4'>
                  <p className='text-center text-lg font-semibold'>Última cuenta de pollería</p>
                  <TarjetaCuenta reportArray={[lastBranchReport]} currentUser={currentUser} />
                </div>
              )}

              {employeeBranchReports && employeeBranchReports.length > 0 ?
                <div className='flex gap-4 mt-4 items-center justify-self-center'>
                  <h3 className='text-2xl font-bold'>Cuentas en pollería</h3>
                  <div className=''>
                    <ShowListButton
                      ListComponent={
                        <TarjetaCuenta reportArray={employeeBranchReports} currentUser={currentUser} />
                      }
                    />
                  </div>
                </div>
                : ''
              }

              {supervisorReports && supervisorReports.length > 0 && (currentUser._id == employeeId || roles.managerRole._id == currentUser.role) ?

                <div className='flex gap-4 mt-4 items-center justify-self-center'>

                  <h3 className='text-2xl font-bold'>Cuentas de supervisor</h3>
                  <div className=''>
                    <ShowListButton
                      ListComponent={
                        <SupervisorReports supervisorReports={supervisorReports} />
                      }
                    />
                  </div>
                </div>
                : ''
              }

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
